import { expect, test } from '@playwright/test';

test('preserves a chat draft across reconnect and shows protected evidence and owner', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('am.refresh-token', 'mock-session'));
  await page.route((url) => url.pathname.startsWith('/api/'), async (route) => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown = {};
    if (path.endsWith('/auth/refresh')) body = { accessToken: 'mock-access', refreshToken: 'mock-session', termsPending: false,
      user: { userId: 'admin', username: '@admin', firstNames: 'Admin', lastNames: 'Prueba', email: 'admin@example.test', role: 'ENTITY_ADMIN', accountStatus: 'ENABLED' } };
    else if (path.endsWith('/messages')) {
      const after = Number(new URL(route.request().url()).searchParams.get('after'));
      body = after === 0 ? Array.from({ length: 50 }, (_, index) => ({ messageId: index + 1, clientMessageId: `old-${index}`,
        senderUserId: 'user', senderRole: 'USER', content: `Historial ${index + 1}`, sentAt: '2026-10-26T12:00:00Z' }))
        : after === 50 ? [{ messageId: 51, clientMessageId: 'last', senderUserId: 'user', senderRole: 'USER', content: 'Última página recuperada', sentAt: '2026-10-26T12:01:00Z' }] : [];
    }
    else if (path.endsWith('/evidences')) body = [{ evidenceId: 'photo', receivedAt: '2026-10-26T12:00:00Z', mimeType: 'image/webp', sizeBytes: 40 }];
    else if (path.endsWith('/content')) {
      await route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="purple"/></svg>' }); return;
    } else if (path.endsWith('/emergencies/alert')) body = { emergencyId: 'alert', status: 'ACTIVE', startedAt: '2026-10-26T12:00:00Z', messageSnapshot: 'Ayuda', lastConfirmedLocation: null,
      owner: { username: '@ana', firstNames: 'Ana', lastNames: 'Prueba', phone: '3000000001', email: 'ana@example.test' } };
    await route.fulfill({ json: body });
  });
  let disconnect: (() => void) | undefined;
  await page.routeWebSocket('**/ws', (socket) => {
    disconnect = () => socket.close({ code: 1012 });
    socket.onMessage((message) => { if (String(message).startsWith('CONNECT')) socket.send('CONNECTED\nversion:1.2\n\n\0'); });
  });
  await page.goto('/admin/alertas/alert');
  await expect(page.getByRole('heading', { name: 'Titular de la alerta' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'ana@example.test' })).toBeVisible();
  await expect(page.getByAltText('Evidencia fotográfica')).toBeVisible();
  await expect(page.getByText('Última página recuperada', { exact: true })).toBeVisible();
  const draft = page.locator('#chat-message');
  await draft.fill('Sigo aquí, necesito ayuda');
  await expect.poll(() => Boolean(disconnect)).toBe(true);
  disconnect?.();
  await expect(draft).toBeVisible();
  await expect(draft).toHaveValue('Sigo aquí, necesito ayuda');
  await expect(page.getByRole('button', { name: 'Enviar', exact: true })).toBeEnabled();
  await expect(draft).toHaveValue('Sigo aquí, necesito ayuda');
});
