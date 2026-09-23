// Consulta el permiso nativo de Android sin cargar expo-notifications dentro de Expo Go.
import { PermissionsAndroid, Platform } from 'react-native';

const notificationsPermission =
  PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;

function doesAndroidRequireRuntimePermission() {
  return typeof Platform.Version === 'number' && Platform.Version >= 33;
}

export async function inspectNotificationPermission() {
  if (!doesAndroidRequireRuntimePermission()) return { granted: true };

  return {
    granted: await PermissionsAndroid.check(notificationsPermission),
  };
}

export async function requestNotificationPermission() {
  if (!doesAndroidRequireRuntimePermission()) return { granted: true };

  const status = await PermissionsAndroid.request(notificationsPermission);
  return { granted: status === PermissionsAndroid.RESULTS.GRANTED };
}
