import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`finalized card filters the existing list and language options have contrast in ${theme}`, async ({ page }) => {
    await page.addInitScript((value) => {
      sessionStorage.setItem('am.refresh-token', 'mock-session');
      localStorage.setItem('am.theme', value);
    }, theme);
    let requestedStatus: string | null = null;
    await page.route((url) => url.pathname.startsWith('/api/'), async (route) => {
      const url = new URL(route.request().url());
      let body: unknown = {};
      if (url.pathname.endsWith('/auth/refresh')) body = { accessToken: 'mock-access', refreshToken: 'mock-session', termsPending: false,
        user: { userId: 'admin', username: '@admin', firstNames: 'Admin', lastNames: 'Prueba', email: 'admin@example.test', role: 'ENTITY_ADMIN', accountStatus: 'ENABLED' } };
      else if (url.pathname.endsWith('/dashboard')) body = { activeCount: 2, inProgressCount: 3, offlineCount: 1, finalizedCount: 7 };
      else if (url.pathname.endsWith('/emergencies')) {
        requestedStatus = url.searchParams.get('status');
        body = { items: [], total: 0, page: 0, size: 20 };
      }
      await route.fulfill({ json: body });
    });
    await page.goto('/admin/dashboard');
    await expect(page.locator('.summary-card')).toHaveCount(4);
    const card = page.locator('.summary-card--finished');
    await expect(card.locator('.summary-card__number')).toHaveText('7');
    const option = page.locator('.select-control option').first();
    const contrast = await option.evaluate((element) => {
      const style = getComputedStyle(element);
      const luminance = (color: string) => {
        const values = color.match(/\d+/g)!.slice(0, 3).map(Number).map((n) => {
          const s = n / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
        return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
      };
      const foreground = luminance(style.color);
      const background = luminance(style.backgroundColor);
      return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
    await page.screenshot({ path: test.info().outputPath(`dashboard-${theme}.png`) });
    await card.click();
    await expect(page).toHaveURL(/\/admin\/alertas$/);
    await expect.poll(() => requestedStatus).toBe('FINALIZED');
  });
}

test('user detail omits technical notice and translates backend errors', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('am.refresh-token', 'mock-session'));
  let fail = false;
  await page.route((url) => url.pathname.startsWith('/api/'), async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/refresh')) {
      await route.fulfill({ json: { accessToken: 'mock-access', refreshToken: 'mock-session', termsPending: false,
        user: { userId: 'admin', username: '@admin', firstNames: 'Admin', lastNames: 'Prueba', role: 'ENTITY_ADMIN', accountStatus: 'ENABLED' } } });
    } else if (fail) {
      await route.fulfill({ status: 500, json: { code: 'INTERNAL_ERROR', message: 'SQL internal stack trace secret', fields: [{ field: 'email', message: 'internal field detail' }] } });
    } else {
      await route.fulfill({ json: { userId: 'one', username: '@ana', firstNames: 'Ana', lastNames: 'Prueba', email: 'ana@example.test', phone: '3001234567', role: 'USER', accountStatus: 'ENABLED' } });
    }
  });
  await page.goto('/admin/usuarias/one');
  await expect(page.getByRole('heading', { name: 'Ana Prueba' })).toBeVisible();
  await expect(page.getByText('No se presentan ubicación', { exact: false })).toHaveCount(0);
  fail = true;
  await page.reload();
  await expect(page.getByText('El servicio no está disponible en este momento. Inténtalo de nuevo más tarde.')).toBeVisible();
  await expect(page.getByText('SQL internal', { exact: false })).toHaveCount(0);
});
