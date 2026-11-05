// @ts-nocheck -- ejecutado por el intérprete TypeScript de Node; la aplicación Expo no incluye tipos de pruebas de Node.
import assert from 'node:assert/strict';
import test from 'node:test';
import { phoneFirstRegistrationSimulator } from '../src/modules/identity/application/phoneFirstRegistrationSimulator.ts';

test('keeps the simulated phone code only for the active registration request', () => {
  phoneFirstRegistrationSimulator.clear();
  phoneFirstRegistrationSimulator.set('request-one', '123456');

  assert.equal(phoneFirstRegistrationSimulator.get('request-one'), '123456');
  assert.equal(phoneFirstRegistrationSimulator.get('another-request'), null);
});

test('clears the simulated code after the phone stage', () => {
  phoneFirstRegistrationSimulator.set('request-one', '123456');
  phoneFirstRegistrationSimulator.clear();

  assert.equal(phoneFirstRegistrationSimulator.get('request-one'), null);
});
