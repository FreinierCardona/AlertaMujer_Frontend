import { expect, test, type Page } from '@playwright/test';

const emergencyId = '11111111-2222-3333-4444-555555555555';
const adminSession = {
  accessToken: 'access-token', refreshToken: 'refresh-token', termsPending: false,
  user: { userId: '00000000-0000-0000-0000-000000000026', username: '@admin026', firstNames: 'Admin', lastNames: 'Prueba', email: 'admin026@example.test', role: 'ENTITY_ADMIN', accountStatus: 'ENABLED' },
};

async function reset(page: Page) {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
}

async function mockEmergencyApi(page: Page, conflict = false) {
  let inProgress = false;
  const calls = { list: 0, detail: 0, attention: 0 };
  await page.route('http://127.0.0.1:8081/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (path === '/api/v1/auth/login') return route.fulfill({ contentType: 'application/json', body: JSON.stringify(adminSession) });
    if (path === '/api/v1/auth/refresh') return route.fulfill({ contentType: 'application/json', body: JSON.stringify(adminSession) });
    if (path === '/api/v1/admin/dashboard') return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ activeCount: 4, inProgressCount: 2, offlineCount: 1 }) });
    if (path === '/api/v1/admin/emergencies') {
      calls.list += 1;
      expect(url.searchParams.get('status')).toBe('ACTIVE');
      expect(url.searchParams.get('page')).toBe('0');
      expect(url.searchParams.get('size')).toBe('20');
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({
        items: [{ emergencyId, status: 'ACTIVE', previousOperationalStatus: null, startedAt: '2026-10-09T14:00:00Z', lastHeartbeatAt: '2026-10-09T14:02:00Z', finalizedAt: null }], page: 0, size: 20, total: 1,
      }) });
    }
    if (path === `/api/v1/emergencies/${emergencyId}`) {
      calls.detail += 1;
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({
        emergencyId, status: inProgress ? 'IN_PROGRESS' : 'ACTIVE', previousOperationalStatus: null,
        startedAt: '2026-10-09T14:00:00Z', lastHeartbeatAt: '2026-10-09T14:02:00Z', finalizedAt: null,
        messageSnapshot: 'Necesito ayuda en esta ubicación.',
        lastConfirmedLocation: { latitude: 2.9273, longitude: -75.2819, accuracyMeters: 7, capturedAt: '2026-10-09T14:01:00Z', receivedAt: '2026-10-09T14:01:02Z' },
      }) });
    }
    if (path === `/api/v1/admin/emergencies/${emergencyId}/attention`) {
      calls.attention += 1;
      if (conflict) { inProgress = true; return route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ code: 'STATE_CONFLICT', message: 'The emergency state changed.', requestId: 'rq-409' }) }); }
      inProgress = true;
      return route.fulfill({ status: 204 });
    }
    if (path === `/api/v1/emergencies/${emergencyId}/evidences`) return route.fulfill({ contentType: 'application/json', body: '[]' });
    if (path === `/api/v1/emergencies/${emergencyId}/messages`) return route.fulfill({ contentType: 'application/json', body: '[]' });
    return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ code: 'NOT_FOUND', message: 'Not found.' }) });
  });
  return calls;
}

async function login(page: Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Usuario o correo electrónico').fill('@admin026');
  await page.getByLabel('Contraseña', { exact: true }).fill('any-password');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
}

test.beforeEach(async ({ page }) => { await reset(page); });

test('HU-AM-026 consulta dashboard/lista/detalle reales e inicia atención con 204', async ({ page }) => {
  const calls = await mockEmergencyApi(page);
  await login(page);
  await expect(page.getByText('4', { exact: true })).toBeVisible();
  await expect(page.getByText('2', { exact: true })).toBeVisible();
  await expect(page.getByText('1', { exact: true })).toBeVisible();
  await expect(page.getByText('Finalizada', { exact: true })).toHaveCount(0);

  await page.getByText('Activa', { exact: true }).last().click();
  await expect(page).toHaveURL(/\/admin\/alertas$/);
  await page.getByRole('button', { name: 'Ver detalle' }).click();
  await expect(page.getByText('Necesito ayuda en esta ubicación.')).toBeVisible();
  await expect(page.getByTitle('Última ubicación confirmada')).toHaveAttribute('src', /google\.com\/maps/);
  await page.getByRole('button', { name: 'Iniciar atención' }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await expect(page.getByText('La atención comenzó correctamente.')).toBeVisible();
  await expect(page.getByText('En proceso', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Iniciar atención' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Volver' }).click();
  await expect(page.getByLabel('Filtrar por estado')).toHaveValue('active');
  expect(calls.list).toBeGreaterThanOrEqual(2);
  expect(calls.attention).toBe(1);
  expect(calls.detail).toBeGreaterThanOrEqual(2);
});

test('HU-AM-026 reconcilia un 409 sin forzar una transición local', async ({ page }) => {
  const calls = await mockEmergencyApi(page, true);
  await login(page);
  await page.getByText('Activa', { exact: true }).last().click();
  await page.getByRole('button', { name: 'Ver detalle' }).click();
  await page.getByRole('button', { name: 'Iniciar atención' }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await expect(page.getByText('El estado de la alerta cambió')).toBeVisible();
  await expect(page.getByText('En proceso', { exact: true }).first()).toBeVisible();
  expect(calls.attention).toBe(1);
  expect(calls.detail).toBeGreaterThanOrEqual(2);
});
