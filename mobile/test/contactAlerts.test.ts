// @ts-nocheck -- ejecutado por el intérprete TypeScript de Node; la aplicación Expo no incluye tipos de pruebas de Node.
import assert from 'node:assert/strict';
import test from 'node:test';
import { authorizedOpenAlerts } from '../src/modules/notifications/application/contactAlerts.ts';

test('keeps one authorized open alert per emergency id', () => {
  const alerts = authorizedOpenAlerts([
    { emergencyId: 'one', status: 'ACTIVE' },
    { emergencyId: 'one', status: 'IN_PROGRESS' },
    { emergencyId: 'two', status: 'OFFLINE' },
  ]);
  assert.deepEqual(alerts.map((alert) => alert.emergencyId), ['one', 'two']);
});

test('does not create alerts from an empty or finalized response', () => {
  assert.deepEqual(authorizedOpenAlerts([]), []);
  assert.deepEqual(
    authorizedOpenAlerts([{ emergencyId: 'closed', status: 'FINALIZED' }]),
    [],
  );
});
