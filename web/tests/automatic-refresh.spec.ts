import { expect, test } from '@playwright/test';

test('dashboard shows a remote change without navigation or reload', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('am.refresh-token', 'mock-session'));
  let active = 1;
  let calls = 0;
  await page.route((url) => url.pathname.startsWith('/api/'), async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/refresh')) {
      await route.fulfill({ json: { accessToken: 'mock-access', refreshToken: 'mock-session', termsPending: false,
        user: { userId: 'admin', username: '@admin', firstNames: 'Admin', lastNames: 'Prueba', role: 'ENTITY_ADMIN', accountStatus: 'ENABLED' } } });
    } else if (path.endsWith('/dashboard')) {
      calls += 1;
      await route.fulfill({ json: { activeCount: active, inProgressCount: 0, offlineCount: 0, finalizedCount: 0 } });
    } else await route.fulfill({ json: {} });
  });
  await page.goto('/admin/dashboard');
  const card = page.locator('.summary-card--active .summary-card__number');
  await expect(card).toHaveText('1');
  active = 4;
  await expect(card).toHaveText('4', { timeout: 15000 });
  expect(calls).toBeGreaterThanOrEqual(2);
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
});
