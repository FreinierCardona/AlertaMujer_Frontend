import { canUseRemotePush } from '@core/config/appConfig';

export async function inspectNotificationPermission() {
  if (!canUseRemotePush) return { granted: false };

  const Notifications = await import('expo-notifications');
  const permission = await Notifications.getPermissionsAsync();
  return { granted: permission.granted };
}

export async function requestNotificationPermission() {
  if (!canUseRemotePush) return { granted: false };

  const Notifications = await import('expo-notifications');
  const permission = await Notifications.requestPermissionsAsync();
  return { granted: permission.granted };
}
