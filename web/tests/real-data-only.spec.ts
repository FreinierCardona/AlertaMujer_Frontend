import { expect, test } from '@playwright/test';

// Las respuestas controladas pertenecen solo a la prueba; la aplicación siempre debe consultar la API.
for (const mode of ['empty', 'error'] as const) {
  for (const resource of [
    { route: '/admin/alertas', endpoint: '/api/v1/admin/emergencies' },
    { route: '/admin/usuarias', endpoint: '/api/v1/admin/users' },
    { route: '/admin/auditoria', endpoint: '/api/v1/admin/audit-logs' },
  ]) {
    test(`${resource.route}: ${mode} no recupera datos simulados del navegador`, async ({ page }) => {
      await page.addInitScript(() => {
        sessionStorage.setItem('am.refresh-token', 'test-refresh');
        localStorage.setItem('am.language', 'es');
        for (const key of ['am.alerts', 'am.users', 'am.audit']) {
          localStorage.setItem(key, JSON.stringify([{ id: 'legacy-demo', userName: 'Registro simulado heredado' }]));
        }
      });
      const requests: string[] = [];
      await page.route((url) => url.pathname.startsWith('/api/'), async (route) => {
        const url = new URL(route.request().url());
        requests.push(url.pathname);
        if (url.pathname === '/api/v1/auth/refresh') {
          await route.fulfill({ json: {
            accessToken: 'test-access', refreshToken: 'test-refresh', termsPending: false,
            user: { userId: 'test-admin', username: '@testadmin', firstNames: 'Administrador', lastNames: 'Prueba',
              email: 'admin@example.test', role: 'ENTITY_ADMIN', accountStatus: 'ENABLED' },
          } });
        } else if (url.pathname === resource.endpoint) {
          if (mode === 'empty') await route.fulfill({ json: { items: [], total: 0, page: 0, size: 20 } });
          else await route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } });
        } else {
          await route.fulfill({ status: 404, json: { code: 'NOT_FOUND' } });
        }
      });
      await page.goto(resource.route);
      await expect(page.locator(`.state-panel--${mode}`)).toBeVisible();
      expect(requests).toContain(resource.endpoint);
      await expect(page.locator('tbody tr')).toHaveCount(0);
      await expect(page.getByText('Registro simulado heredado')).toHaveCount(0);
      expect(await page.evaluate(() => ['am.alerts', 'am.users', 'am.audit'].map(key => localStorage.getItem(key))))
        .toEqual([null, null, null]);
      if (mode === 'error') {
        const beforeRetry = requests.filter(path => path === resource.endpoint).length;
        await page.locator('.state-panel--error button').click();
        await expect.poll(() => requests.filter(path => path === resource.endpoint).length).toBeGreaterThan(beforeRetry);
      }
    });
  }
}
