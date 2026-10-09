import { expect, test, type Page } from '@playwright/test';

const adminSession = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  termsPending: false,
  user: {
    userId: '00000000-0000-0000-0000-000000000025',
    username: '@admin025',
    firstNames: 'Admin',
    lastNames: 'Prueba',
    email: 'admin025@example.test',
    role: 'ENTITY_ADMIN',
    accountStatus: 'ENABLED',
  },
};

async function reset(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
}

async function mockAuthentication(page: Page) {
  const calls = { login: 0, refresh: 0, logout: 0 };
  await page.route('http://127.0.0.1:8080/api/v1/auth/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/login')) {
      calls.login += 1;
      const { identifier } = route.request().postDataJSON() as { identifier: string };
      if (identifier === 'invalid') {
        await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ code: 'UNAUTHENTICATED', message: 'Authentication is required.', requestId: 'rq-invalid' }) });
        return;
      }
      if (identifier === 'user') {
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ...adminSession, user: { ...adminSession.user, role: 'USER' } }) });
        return;
      }
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(adminSession) });
      return;
    }
    if (path.endsWith('/refresh')) {
      calls.refresh += 1;
      // Keep the first renewal pending long enough to prove StrictMode or
      // concurrent callers share it instead of rotating the token twice.
      await new Promise((resolve) => setTimeout(resolve, 40));
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(adminSession) });
      return;
    }
    if (path.endsWith('/logout')) {
      calls.logout += 1;
      await route.fulfill({ status: 204 });
      return;
    }
    await route.fallback();
  });
  return calls;
}

async function submit(page: Page, identifier: string) {
  await page.getByLabel('Usuario o correo electrónico').fill(identifier);
  await page.getByLabel('Contraseña', { exact: true }).fill('any-password');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
}

test.beforeEach(async ({ page }) => {
  await reset(page);
});

test('HU-AM-025 protege la ruta, autentica por identifier y recupera la sesión solo en la pestaña', async ({ page }) => {
  const calls = await mockAuthentication(page);
  await page.goto('/admin/alertas?status=ACTIVE');
  await expect(page).toHaveURL(/\/admin\/login$/);

  await submit(page, '@admin025');
  await expect(page).toHaveURL(/\/admin\/alertas\?status=ACTIVE$/);
  await expect(page.locator('#admin-content')).toBeVisible();
  await expect(page.locator('#login-password')).toHaveCount(0);
  await expect(page.evaluate(() => localStorage.getItem('am.refresh-token'))).resolves.toBeNull();
  await expect(page.evaluate(() => sessionStorage.getItem('am.refresh-token'))).resolves.toBe('refresh-token');
  expect(calls.login).toBe(1);

  await page.reload();
  await expect(page.locator('#admin-content')).toBeVisible();
  expect(calls.refresh).toBeGreaterThan(0);
});

test('HU-AM-025 no monta el panel ante credenciales rechazadas ni rol USER', async ({ page }) => {
  await mockAuthentication(page);
  await page.goto('/admin/login');
  await submit(page, 'invalid');
  await expect(page.getByText('No fue posible iniciar sesión con esas credenciales.')).toBeVisible();
  await expect(page.getByLabel('Usuario o correo electrónico')).toHaveValue('invalid');
  await expect(page.getByLabel('Contraseña', { exact: true })).toHaveValue('');

  await submit(page, 'user');
  await expect(page.getByText('Esta cuenta no tiene autorización para ingresar al panel.')).toBeVisible();
  await expect(page.locator('.admin-shell')).toHaveCount(0);
});

test('HU-AM-025 llama logout y elimina la sesión incluso antes de navegar', async ({ page }) => {
  const calls = await mockAuthentication(page);
  await page.goto('/admin/login');
  await submit(page, 'admin');
  await expect(page.locator('.admin-shell')).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/admin\/login\?notice=logout$/);
  await expect(page.getByText('La sesión se cerró correctamente.')).toBeVisible();
  await expect(page.evaluate(() => sessionStorage.getItem('am.refresh-token'))).resolves.toBeNull();
  expect(calls.logout).toBe(1);
});
