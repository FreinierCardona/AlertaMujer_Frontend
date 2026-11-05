import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, useRouter } from 'expo-router';
import Routes from '@shell/navigation/routes';
import AppScreen from '@shared/ui/AppScreen';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import useAppState from '@shell/providers/useAppState';
import { evidenceApi } from '@core/api';
import { convertCaptureToWebp, type WebpEvidence } from '@modules/evidence/application/webpEvidence';

export default function CaptureEvidenceScreen() {
  const router = useRouter();
  const { activeEmergency } = useAppState();
  const [asset, setAsset] = useState<WebpEvidence | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const started = useRef(false);
  const inFlight = useRef(false);
  const emergencyId = activeEmergency?.id;
  const save = useCallback(async (photo: WebpEvidence) => {
    if (!emergencyId) return;
    await evidenceApi.upload(emergencyId, photo);
    setAsset(null);
    router.back();
  }, [emergencyId, router]);
  const capture = useCallback(async () => {
    if (inFlight.current || !emergencyId) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) throw new Error('Habilita la cámara en ajustes para tomar una fotografía.');
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.8 });
      if (result.canceled || !result.assets[0]) { router.back(); return; }
      const photo = await convertCaptureToWebp(result.assets[0]);
      setAsset(photo);
      await save(photo);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible guardar la fotografía. Inténtalo de nuevo.');
    } finally { inFlight.current = false; setBusy(false); }
  }, [emergencyId, router, save]);
  useEffect(() => {
    if (!started.current && emergencyId) { started.current = true; void capture(); }
  }, [capture, emergencyId]);
  const retry = async () => {
    if (!asset || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError(null);
    try { await save(asset); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No fue posible guardar la fotografía.'); }
    finally { inFlight.current = false; setBusy(false); }
  };
  if (!activeEmergency) return <Redirect href={Routes.home} />;
  return <AppScreen>
    <ScreenHeader title="Evidencia fotográfica" canGoBack={!busy} />
    {busy ? <ActivityIndicator accessibilityLabel="Guardando fotografía" /> : null}
    {error ? <StatusBanner tone="danger" title="No se confirmó el guardado" message={error} /> : null}
    {asset ? <Image source={{ uri: asset.uri }} style={{ width: '100%', aspectRatio: 3 / 4, borderRadius: 18, marginVertical: 16 }} /> : null}
    {error && asset ? <AppButton title="Reintentar envío" disabled={busy} onPress={() => void retry()} /> : null}
    {error ? <AppButton title="Tomar otra fotografía" disabled={busy} onPress={() => void capture()} variant="outline" style={{ marginTop: 12 }} /> : null}
  </AppScreen>;
}
