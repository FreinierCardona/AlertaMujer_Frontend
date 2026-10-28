type Invitation = { contactId: string; direction: string; status: string; expiresAt: string | null };

// La fecha distingue un reenvío de una invitación ya vista para la misma relación.
export function pendingInvitationKeys(contacts: Invitation[]): string[] {
  return contacts.filter((contact) => contact.direction === 'RECEIVED' && contact.status === 'PENDING')
    .map((contact) => JSON.stringify([contact.contactId, contact.expiresAt]));
}

export function hasUnseenInvitations(pending: string[], seen: string[]): boolean {
  const acknowledged = new Set(seen);
  return pending.some((key) => !acknowledged.has(key));
}
