import { Platform } from 'react-native';
import { ApiError, deviceTokenApi } from '@core/api';
import { canUseRemotePush } from '@core/config/appConfig';

export type DeviceTokenRegistration =
  | 'registered'
  | 'unavailable'
  | 'conflict';

/** Registers the native FCM token without logging or storing it in application state. */
export async function registerDeviceToken(): Promise<DeviceTokenRegistration> {
  if (Platform.OS !== 'android' || !canUseRemotePush) return 'unavailable';

  try {
    const Notifications = await import('expo-notifications');
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) return 'unavailable';

    const token = await Notifications.getDevicePushTokenAsync();
    if (token.type !== 'fcm' || !token.data.trim()) return 'unavailable';

    await deviceTokenApi.register(token.data);
    return 'registered';
  } catch (error) {
    if (error instanceof ApiError && error.code === 'STATE_CONFLICT') {
      return 'conflict';
    }
    return 'unavailable';
  }
}
