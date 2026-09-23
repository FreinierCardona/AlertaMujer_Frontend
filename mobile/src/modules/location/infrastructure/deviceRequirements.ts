// Consulta y solicita las capacidades reales del dispositivo necesarias para el SOS.
import { Linking, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import {
  inspectNotificationPermission,
  requestNotificationPermission,
} from './notificationPermission';

export type DeviceRequirementKey =
  | 'foreground'
  | 'background'
  | 'notifications'
  | 'gps'
  | 'connection';
export interface DeviceRequirements {
  foreground: boolean;
  background: boolean;
  notifications: boolean;
  gps: boolean;
  connection: boolean;
  checking: boolean;
}
export const initialDeviceRequirements: DeviceRequirements = {
  foreground: false,
  background: false,
  notifications: false,
  gps: false,
  connection: false,
  checking: true,
};

export async function inspectDeviceRequirements(): Promise<DeviceRequirements> {
  const [foreground, background, notifications, gps, network] =
    await Promise.all([
      Location.getForegroundPermissionsAsync(),
      Location.getBackgroundPermissionsAsync(),
      inspectNotificationPermission(),
      Location.hasServicesEnabledAsync(),
      NetInfo.fetch(),
    ]);
  return {
    foreground: foreground.granted,
    background: background.granted,
    notifications: notifications.granted,
    gps,
    connection: Boolean(
      network.isConnected && network.isInternetReachable !== false,
    ),
    checking: false,
  };
}

export async function requestDeviceRequirement(key: DeviceRequirementKey) {
  if (key === 'foreground') await Location.requestForegroundPermissionsAsync();
  if (key === 'background') {
    const foreground = await Location.getForegroundPermissionsAsync();
    if (!foreground.granted) await Location.requestForegroundPermissionsAsync();
    await Location.requestBackgroundPermissionsAsync();
  }
  if (key === 'notifications') await requestNotificationPermission();
  if (key === 'gps') {
    if (Platform.OS === 'android') await Location.enableNetworkProviderAsync();
    else await Linking.openSettings();
  }
  return inspectDeviceRequirements();
}

export async function getCurrentCoordinates() {
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy,
    capturedAt: new Date(location.timestamp).toISOString(),
  };
}
