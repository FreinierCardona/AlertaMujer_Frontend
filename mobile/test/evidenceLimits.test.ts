// @ts-nocheck -- executed by Node's TypeScript runner; the Expo app has no Node test typings.
import assert from 'node:assert/strict';
import test from 'node:test';
import { isAcceptedEvidenceSize, MAX_EVIDENCE_BYTES } from '../src/modules/evidence/application/evidenceLimits.ts';

test('accepts a WebP at the documented 500 KB boundary', () => {
  assert.equal(isAcceptedEvidenceSize(MAX_EVIDENCE_BYTES), true);
});

test('rejects a WebP one byte above the documented 500 KB boundary', () => {
  assert.equal(isAcceptedEvidenceSize(MAX_EVIDENCE_BYTES + 1), false);
});

test('rejects empty and non-integral file sizes', () => {
  assert.equal(isAcceptedEvidenceSize(0), false);
  assert.equal(isAcceptedEvidenceSize(12.5), false);
});
