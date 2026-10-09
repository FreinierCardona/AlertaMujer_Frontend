import { expect, test, type Page } from '@playwright/test';

const session = {
  accessToken: 'access-027',
  refreshToken: 'refresh-027',
  termsPending: false,
  user: {
    userId: '00000000-0000-0000-0000-000000000027',
    username: '@admin027',
    firstNames: 'Admin',
    lastNames: 'Prueba',
    email: 'admin027@example.test',
    role: 'ENTITY_ADMIN',
    accountStatus: 'ENABLED',
  },
};

const user = {
  userId: '10000000-0000-0000-0000-000000000027',
  username: '@user027',
  firstNames: 'Valentina',
  lastNames: 'Morales',
  email: 'valentina027@example.test',
  phone: '3125550027',
  role: 'USER',
  accountStatus: 'ENABLED',
};

async function reset(page: Page) {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
}

async function mockApi(page: Page) {
  let deleted = false;
  const calls = { users: 0, detail: 0, status: 0, deletion: 0, audit: 0 };
  await page.route('**/api/v1/auth/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/login') || path.endsWith('/refresh')) {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(session) });
      return;
    }
    if (path.endsWith('/logout')) { await route.fulfill({ status: 204 }); return; }
    await route.fallback();
  });
  await page.route('**/api/v1/admin/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith('/dashboard')) {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ activeCount: 0, inProgressCount: 0, offlineCount: 0 }) });
      return;
    }
    if (url.pathname.endsWith('/users') && request.method() === 'GET') {
      calls.users += 1;
      const pageNumber = Number(url.searchParams.get('page') ?? '0');
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ items: deleted ? [] : [user], page: pageNumber, size: 20, total: deleted ? 0 : 21 }) });
      return;
    }
    if (url.pathname.endsWith(`/users/${user.userId}`) && request.method() === 'GET') {
      calls.detail += 1;
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(user) });
      return;
    }
    if (url.pathname.endsWith(`/users/${user.userId}/status`) && request.method() === 'PATCH') {
      calls.status += 1;
      expect(request.postDataJSON()).toEqual({ status: 'DISABLED' });
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ...user, accountStatus: 'DISABLED' }) });
      return;
    }
    if (url.pathname.endsWith(`/users/${user.userId}/deletion`) && request.method() === 'DELETE') {
      calls.deletion += 1;
      deleted = true;
      await route.fulfill({ status: 204 });
      return;
    }
    if (url.pathname.endsWith('/audit-logs') && request.method() === 'GET') {
      calls.audit += 1;
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({
        items: [{ auditLogId: '20000000-0000-0000-0000-000000000027', action: 'ACCOUNT_STATUS_CHANGED', createdAt: '2026-10-09T12:00:00Z' }],
        page: 0, size: 20, total: 1,
      }) });
      return;
    }
    await route.fallback();
  });
  return calls;
}

async function login(page: Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Usuario o correo electrónico').fill('@admin027');
  await page.getByLabel('Contraseña', { exact: true }).fill('Password027!');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
}

test.beforeEach(async ({ page }) => { await reset(page); });

test('HU-AM-027 integra cuentas y auditoría sin datos mock ni filtros locales', async ({ page }) => {
  const calls = await mockApi(page);
  await login(page);
  await page.getByRole('link', { name: 'Usuarias' }).click();
  await expect(page.getByText('@user027')).toBeVisible();
  await expect(page.getByText('Valentina Morales')).toBeVisible();
  await expect(page.getByText('falta la ruta Backend y el traspaso verificable')).toBeVisible();
  await expect(page.getByLabel('Filtros')).toHaveCount(0);
  await page.getByRole('button', { name: 'Siguiente' }).click();
  expect(calls.users).toBeGreaterThanOrEqual(2);

  await page.getByRole('link', { name: 'Ver detalle' }).click();
  await expect(page.getByText('No se presentan ubicación ni historial de alertas')).toBeVisible();
  await page.getByRole('button', { name: 'Inhabilitar cuenta' }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await expect(page.getByText('El estado mostrado corresponde a la respuesta confirmada por el Backend.')).toBeVisible();
  expect(calls.status).toBe(1);

  await page.getByRole('button', { name: 'Eliminar cuenta' }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await expect(page).toHaveURL(/\/admin\/usuarias$/);
  await expect(page.getByText('No hay usuarias para mostrar.')).toBeVisible();
  expect(calls.deletion).toBe(1);

  await page.getByRole('link', { name: 'Auditoría' }).click();
  await expect(page.getByText('ACCOUNT_STATUS_CHANGED')).toBeVisible();
  await expect(page.getByText('Actor', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Detalles', { exact: true })).toHaveCount(0);
  expect(calls.audit).toBe(1);
  expect(calls.detail).toBe(1);
});
