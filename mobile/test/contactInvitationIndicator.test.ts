// @ts-nocheck -- ejecutado por Node; Expo no incluye tipos de pruebas de Node.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { hasUnseenInvitations, pendingInvitationKeys } from '../src/modules/contacts/application/invitationIndicator.ts';

const invitation = { contactId: 'one', direction: 'RECEIVED', status: 'PENDING', expiresAt: '2026-10-29T00:00:00Z' };

test('only pending invitations received by this user generate an indicator', () => {
  const keys = pendingInvitationKeys([invitation, { ...invitation, contactId: 'two', direction: 'SENT' }, { ...invitation, contactId: 'three', status: 'ACCEPTED' }]);
  assert.equal(keys.length, 1);
  assert.equal(hasUnseenInvitations(keys, []), true);
});

test('opening contacts acknowledges pending invitations without changing their status', () => {
  const keys = pendingInvitationKeys([invitation]);
  assert.equal(hasUnseenInvitations(keys, keys), false);
  assert.equal(invitation.status, 'PENDING');
});

test('a new invitation or a reinvitation triggers a new indicator', () => {
  const seen = pendingInvitationKeys([invitation]);
  assert.equal(hasUnseenInvitations(pendingInvitationKeys([{ ...invitation, expiresAt: '2026-11-02T00:00:00Z' }]), seen), true);
  assert.equal(hasUnseenInvitations(pendingInvitationKeys([invitation, { ...invitation, contactId: 'two' }]), seen), true);
});

test('expired or accepted invitations do not retain an indicator', () => {
  assert.equal(hasUnseenInvitations(pendingInvitationKeys([{ ...invitation, status: 'EXPIRED' }, { ...invitation, status: 'ACCEPTED' }]), []), false);
});
