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
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
export default function CaptureEvidenceScreen() {
  const router = useRouter();
  const { activeEmergency, requirements, addEvidence } = useAppState();
  const { t } = useI18n();
  const { spacing } = useAppTheme();
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<
    'permission' | 'capture' | 'offline' | null
  >(null);
  const capture = async () => {
    setError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('permission');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setUri(result.assets[0].uri);
  };
  const save = () => {
    if (!uri) return;
    if (!addEvidence(uri)) {
      setError('offline');
      return;
    }
    router.back();
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
          title={t(
            error === 'permission'
              ? 'evidence.permission'
              : error === 'offline'
                ? 'evidence.offline'
                : 'common.error',
          )}
        />
      ) : null}
      {uri ? (
        <>
          <StatusBanner
            tone="info"
            title={t('evidence.review')}
          />
          <Image
            source={{ uri }}
            style={styles.preview}
          />
          <View style={[styles.actions, { marginTop: spacing.md }]}>
            <AppButton
              title={t('evidence.retake')}
              onPress={() => void capture()}
              variant="outline"
              style={styles.button}
            />
            <AppButton
              title={t('evidence.send')}
              onPress={save}
              disabled={!requirements.connection}
              style={styles.button}
            />
          </View>
          {!requirements.connection ? (
            <StatusBanner
              tone="warning"
              title={t('evidence.offline')}
            />
          ) : null}
        </>
      ) : (
        <>
          <StatusBanner title={t('evidence.permission')} />
          <View style={{ height: spacing.lg }} />
          <AppButton
            title={t('evidence.capture')}
            onPress={() => void capture()}
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
