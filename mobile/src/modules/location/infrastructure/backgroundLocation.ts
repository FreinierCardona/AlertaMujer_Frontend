// Define en ámbito global la tarea de ubicación y controla su servicio Android durante una alerta.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

export const BACKGROUND_LOCATION_TASK = 'alertamujer-background-location';
export const LAST_BACKGROUND_LOCATION_KEY =
  '@alertamujer/last-background-location';

if (!TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK)) {
  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error || !data) return;
    const locations = (data as { locations?: Location.LocationObject[] })
      .locations;
    const latest = locations?.at(-1);
    if (latest)
      await AsyncStorage.setItem(
        LAST_BACKGROUND_LOCATION_KEY,
        JSON.stringify(latest),
      );
  });
}

export async function startBackgroundLocation(title: string, body: string) {
  const available = await Location.isBackgroundLocationAvailableAsync();
  if (!available) throw new Error('background-location-unavailable');
  const started = await Location.hasStartedLocationUpdatesAsync(
    BACKGROUND_LOCATION_TASK,
  );
  if (started) return;
  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 50,
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
}
