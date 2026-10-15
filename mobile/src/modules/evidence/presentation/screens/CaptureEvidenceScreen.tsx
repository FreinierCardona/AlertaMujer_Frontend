// Solicita cámara en contexto, permite revisar la foto y la asocia localmente a la alerta.
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, useRouter } from 'expo-router';
import Routes from '@shell/navigation/routes';
import AppScreen from '@shared/ui/AppScreen';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import useAppState from '@shell/providers/useAppState';
import { ApiError, evidenceApi } from '@core/api';
import { convertCaptureToWebp, EvidenceConversionError, type WebpEvidence } from '@modules/evidence/application/webpEvidence';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
export default function CaptureEvidenceScreen() {
  const router = useRouter();
  const { activeEmergency } = useAppState();
  const { t } = useI18n();
  const { spacing } = useAppTheme();
  const [asset, setAsset] = useState<WebpEvidence | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [converting, setConverting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const capture = async () => {
    setError(null);
    setSuccess(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError(t('evidence.permission'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    setConverting(true);
    try {
      setAsset(await convertCaptureToWebp(result.assets[0]));
    } catch (cause) {
      setAsset(null);
      setError(cause instanceof EvidenceConversionError ? cause.message : 'No fue posible convertir la fotografia. Vuelve a capturarla.');
    } finally {
      setConverting(false);
    }
  };
  const save = async () => {
    if (!asset || !activeEmergency) return;
    if (activeEmergency.status === 'offline' || activeEmergency.status === 'finalized') {
      setError(t('evidence.offline'));
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await evidenceApi.upload(activeEmergency.id, asset);
      setAsset(null);
      setSuccess(true);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t('common.error'));
    } finally {
      setUploading(false);
    }
  };
  if (!activeEmergency) return <Redirect href={Routes.home} />;
  return (
    <AppScreen>
      <ScreenHeader
        canGoBack
        title={t('evidence.title')}
        subtitle={t('evidence.description')}
      />
      {error ? (
        <StatusBanner
          tone="danger"
          title={t('common.error')}
          message={error}
        />
      ) : null}
      {success ? <StatusBanner tone="success" title={t('common.success')} message={t('evidence.saved')} /> : null}
      {converting ? <StatusBanner title="Convirtiendo fotografia a WebP..." /> : null}
      {asset ? (
        <>
            <StatusBanner
              tone="info"
              title={t('evidence.review')}
              message={`WebP: ${formatBytes(asset.sizeBytes)}`}
          />
          <Image
            source={{ uri: asset.uri }}
            style={styles.preview}
          />
          <View style={[styles.actions, { marginTop: spacing.md }]}>
            <AppButton
              title={t('evidence.retake')}
              onPress={() => void capture()}
              variant="outline"
              style={styles.button}
              disabled={uploading}
            />
            <AppButton
              title={t('common.cancel')}
              onPress={() => setAsset(null)}
              variant="ghost"
              style={styles.button}
              disabled={uploading}
            />
            <AppButton
              title={t('evidence.send')}
              onPress={() => void save()}
              loading={uploading}
              style={styles.button}
            />
          </View>
        </>
      ) : (
        <>
          <StatusBanner title={t('evidence.permission')} />
          <View style={{ height: spacing.lg }} />
          <AppButton
            title={t('evidence.capture')}
            onPress={() => void capture()}
            disabled={converting}
          />
          <AppButton
            title={t('common.cancel')}
            onPress={() => router.back()}
            variant="ghost"
          />
        </>
      )}
    </AppScreen>
  );
}

function formatBytes(value: number) {
  return `${(value / 1000).toFixed(1)} KB`;
}
const styles = StyleSheet.create({
  preview: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 18,
    marginTop: 16,
  },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  button: { flex: 1 },
});
