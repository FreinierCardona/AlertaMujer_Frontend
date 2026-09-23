// Usa la API compatible de notificaciones únicamente cuando Metro genera la aplicación iOS.
import * as Notifications from 'expo-notifications';

export async function inspectNotificationPermission() {
  const permission = await Notifications.getPermissionsAsync();
  return { granted: permission.granted };
}

export async function requestNotificationPermission() {
  const permission = await Notifications.requestPermissionsAsync();
  return { granted: permission.granted };
}
