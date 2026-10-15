// @ts-nocheck -- executed by Node's TypeScript runner; the Expo app has no Node test typings.
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  contactAlertMapsUrl,
  isContactAlertAccessRevoked,
} from '../src/modules/notifications/application/contactAlertDetail.ts';
import { contactAlertPaths } from '../src/core/api/contactAlertPaths.ts';

test('recognizes only non-disclosing authorization responses as revoked access', () => {
  assert.equal(isContactAlertAccessRevoked(403), true);
  assert.equal(isContactAlertAccessRevoked(404), true);
  assert.equal(isContactAlertAccessRevoked(401), false);
  assert.equal(isContactAlertAccessRevoked(500), false);
});

test('creates a Google Maps link only from valid contact-alert coordinates', () => {
  assert.equal(
    contactAlertMapsUrl({ latitude: 4.60971, longitude: -74.08175 }),
    'https://www.google.com/maps/search/?api=1&query=4.60971%2C-74.08175',
  );
  assert.equal(contactAlertMapsUrl(null), null);
  assert.equal(contactAlertMapsUrl({ latitude: Number.NaN, longitude: -74.08175 }), null);
});

test('uses only the documented contact-alert routes for detail and protected WebP', () => {
  assert.equal(contactAlertPaths.detail('emergency-id'), '/api/v1/me/contact-alerts/emergency-id');
  assert.equal(contactAlertPaths.evidences('emergency-id'), '/api/v1/me/contact-alerts/emergency-id/evidences');
  assert.equal(
    contactAlertPaths.evidenceContent('emergency-id', 'evidence-id'),
    '/api/v1/me/contact-alerts/emergency-id/evidences/evidence-id/content',
  );
});
