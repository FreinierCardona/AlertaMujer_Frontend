// @ts-nocheck -- ejecutado por el intérprete TypeScript de Node.
import assert from 'node:assert/strict';
import test from 'node:test';
import { apiErrorMessage } from '../src/core/api/apiErrorMessage.ts';

test('unknown server errors never expose internal codes', () => {
  assert.equal(apiErrorMessage('SQL_INTERNAL_FAILURE', 500, '/profile'), 'El servicio no está disponible en este momento. Inténtalo de nuevo más tarde.');
  assert.equal(apiErrorMessage('UNKNOWN_SECRET', 418, '/profile'), 'No fue posible completar la operación. Inténtalo de nuevo.');
});
test('gives instructions appropriate to the current flow', () => {
  assert.match(apiErrorMessage('RULE_VIOLATION', 422, '/contacts/one'), /contacto cambió/);
  assert.match(apiErrorMessage('STATE_CONFLICT', 409, '/emergencies/one'), /alerta cambió/);
  assert.match(apiErrorMessage('UNAUTHENTICATED', 401, '/auth/login'), /contraseña/);
  assert.match(apiErrorMessage('UNAUTHENTICATED', 401, '/profile'), /Inicia sesión/);
  assert.match(apiErrorMessage('RULE_VIOLATION', 422, '/verification'), /código/);
  assert.match(apiErrorMessage('REGISTRATION_DUPLICATE', 422, '/registration'), /registrado/);
});
