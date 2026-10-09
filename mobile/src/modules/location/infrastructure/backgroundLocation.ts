// Define en ámbito global la tarea de ubicación y controla su servicio Android durante una alerta.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { apiClient, emergencyApi, identityApi } from '@core/api';
import { tokenStorage } from '@core/api/tokenStorage';

export interface ConfirmedLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: string;
}

export const BACKGROUND_LOCATION_TASK = 'alertamujer-background-location';
const ACTIVE_EMERGENCY_KEY = '@alertamujer/active-emergency-id';

let locationSyncListener:
  | ((result: { location?: ConfirmedLocation; confirmed: boolean }) => void)
  | null = null;

export function setLocationSyncListener(
  listener: typeof locationSyncListener,
) {
  locationSyncListener = listener;
}

if (!TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK)) {
  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error || !data) return;
    const locations = (data as { locations?: Location.LocationObject[] })
      .locations;
    const latest = locations?.at(-1);
    if (!latest) return;
    const emergencyId = await AsyncStorage.getItem(ACTIVE_EMERGENCY_KEY);
    if (!emergencyId) return;
    const location: ConfirmedLocation = {
      latitude: latest.coords.latitude,
      longitude: latest.coords.longitude,
      accuracy: latest.coords.accuracy,
      capturedAt: new Date(latest.timestamp).toISOString(),
    };
    try {
      if (!apiClient.hasAccessToken()) {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error('missing-background-session');
        const session = await identityApi.refresh(refreshToken);
        apiClient.setAccessToken(session.accessToken);
        await tokenStorage.setRefreshToken(session.refreshToken);
      }
      await emergencyApi.heartbeat(emergencyId, {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracyMeters: location.accuracy,
        capturedAt: location.capturedAt,
      });
      locationSyncListener?.({ location, confirmed: true });
    } catch {
      locationSyncListener?.({ confirmed: false });
    }
  });
}

export async function startBackgroundLocation(
  emergencyId: string,
  title: string,
  body: string,
) {
  await AsyncStorage.setItem(ACTIVE_EMERGENCY_KEY, emergencyId);
  const available = await Location.isBackgroundLocationAvailableAsync();
  if (!available) throw new Error('background-location-unavailable');
  const started = await Location.hasStartedLocationUpdatesAsync(
    BACKGROUND_LOCATION_TASK,
  );
  if (started) return;
  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 50,
    timeInterval: 60_000,
    pausesUpdatesAutomatically: false,
    foregroundService: {
      notificationTitle: title,
      notificationBody: body,
      killServiceOnDestroy: false,
    },
  });
}

export async function stopBackgroundLocation() {
  if (await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK))
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  await AsyncStorage.removeItem(ACTIVE_EMERGENCY_KEY);
}
