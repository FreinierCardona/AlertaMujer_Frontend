import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('HU-AM-029 removes FCM registration and SOS push gating', async () => {
  const [packageJson, provider, home, requirements, background] = await Promise.all([
    read('../package.json'),
    read('../src/shell/providers/AppStateProvider.tsx'),
    read('../src/modules/emergency/presentation/screens/HomeEmergencyScreen.tsx'),
    read('../src/modules/location/infrastructure/deviceRequirements.ts'),
    read('../src/modules/location/infrastructure/backgroundLocation.ts'),
  ]);

  assert.doesNotMatch(packageJson, /expo-notifications/);
  assert.doesNotMatch(provider, /deviceToken|registerDeviceToken|canUseRemotePush/);
  assert.doesNotMatch(home, /key: 'notifications'|canUseRemotePush|registerDeviceToken/);
  assert.doesNotMatch(requirements, /notifications|NotificationPermission/);
  assert.match(background, /foregroundService/);
  assert.match(background, /notificationTitle/);
});
