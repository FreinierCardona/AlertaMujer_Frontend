// Mantiene una única captura automática en curso mientras la alerta está visible y activa.
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ApiError, evidenceApi } from '@core/api';
import { convertCaptureToWebp, EvidenceConversionError } from '@modules/evidence/application/webpEvidence';
import StatusBanner from '@shared/ui/StatusBanner';
import { useAppTheme } from '@shared/theme';

const CAPTURE_INTERVAL_MS = 10_000;

type Props = { emergencyId: string; enabled: boolean; onError: (message: string) => void };

// Expo mantiene la cámara disponible solo con la aplicación activa y CameraView montado.
// Al pasar a segundo plano se pausa el intervalo para no intentar una captura no permitida por Android/iOS.
export default function AutomaticEvidenceCapture({ emergencyId, enabled, onError }: Props) {
  const { colors } = useAppTheme();
  const camera = useRef<CameraView>(null);
  const captureInFlight = useRef(false);
  const requestedPermission = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [appIsActive, setAppIsActive] = useState(AppState.currentState === 'active');
  const [stopped, setStopped] = useState(false);
  const [uploadState, setUploadState] = useState<'waiting' | 'sending' | 'sent' | 'failed'>('waiting');
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => setAppIsActive(nextState === 'active'));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!enabled) {
      setStopped(false);
      setCameraReady(false);
      setCameraError(false);
      setUploadState('waiting');
      requestedPermission.current = false;
      return;
    }
    if (!permission?.granted && !requestedPermission.current) {
      requestedPermission.current = true;
      void requestPermission();
    }
  }, [enabled, permission?.granted, requestPermission]);

  const capture = useCallback(async () => {
    if (captureInFlight.current || !camera.current) return;
    captureInFlight.current = true;
    setUploadState('sending');
    try {
      const photo = await camera.current.takePictureAsync({ quality: 0.8 });
      const evidence = await convertCaptureToWebp(photo);
      await evidenceApi.upload(emergencyId, evidence);
      setLastSentAt(new Date().toLocaleTimeString());
      setUploadState('sent');
    } catch (cause) {
      setUploadState('failed');
      if (cause instanceof ApiError && [403, 404, 422].includes(cause.status ?? 0)) {
        setStopped(true);
      }
      if (cause instanceof EvidenceConversionError) {
        onError(cause.code === 'SIZE_LIMIT'
          ? 'La captura automática superó el límite de 500 KB y no se envió.'
          : 'No fue posible convertir una captura automática a WebP.');
      } else if (cause instanceof ApiError) {
        onError(cause.message);
      } else {
        onError('No fue posible enviar una captura automática. Se intentará con la siguiente fotografía.');
      }
    } finally {
      captureInFlight.current = false;
    }
  }, [emergencyId, onError]);

  const canCapture = enabled && permission?.granted === true && cameraReady && appIsActive && !stopped;
  useEffect(() => {
    if (!canCapture) return;
    const timer = setInterval(() => void capture(), CAPTURE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [canCapture, capture]);

  if (!enabled) return null;
  if (!permission?.granted) {
    return <StatusBanner tone="warning" title="Captura automática detenida" message="Autoriza el uso de la cámara para enviar evidencia cada 10 segundos durante la alerta." />;
  }
  return <View style={styles.container}>
    <CameraView ref={camera} style={styles.preview} facing="back" onCameraReady={() => { setCameraError(false); setCameraReady(true); }} onMountError={() => { setCameraReady(false); setCameraError(true); onError('No fue posible iniciar la cámara automática.'); }} />
    <View style={styles.copy}>
      <Text style={[styles.title, { color: colors.textDark }]}>Captura automática</Text>
      <Text style={{ color: colors.textMedium, fontSize: 12 }}>{stopped
        ? 'Se detuvo la captura. Revisa el mensaje de error.'
        : !appIsActive ? 'Se reanudará al volver a abrir la aplicación.'
        : cameraError ? 'No se pudo iniciar la cámara.'
        : !cameraReady ? 'Preparando la cámara.'
        : uploadState === 'sending' ? 'Enviando fotografía…'
        : uploadState === 'failed' ? 'No se confirmó el envío. Se intentará con otra fotografía.'
        : lastSentAt ? `Última fotografía guardada: ${lastSentAt}.`
        : 'Cámara lista. Se intentará una fotografía cada 10 segundos.'}</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  preview: { width: 80, height: 60, borderRadius: 10, overflow: 'hidden' },
  copy: { flex: 1 },
  title: { fontWeight: '700' },
});
