import { expect, test } from '@playwright/test';

// Las respuestas controladas verifican la interfaz; no sustituyen una prueba del Backend real.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('am.refresh-token', 'test-refresh');
    localStorage.setItem('am.language', 'es');
  });
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/refresh')) await route.fulfill({ json: {
      accessToken: 'test-access', refreshToken: 'test-refresh', termsPending: false,
      user: { userId: 'test-admin', username: '@admin', firstNames: 'Administradora', lastNames: 'Prueba', email: 'admin@example.test', role: 'ENTITY_ADMIN', accountStatus: 'ENABLED' },
    } });
    else if (path.endsWith('/admin/users')) await route.fulfill({ json: { items: [], total: 0, page: 0, size: 20 } });
    else await route.fulfill({ status: 404, json: { code: 'NOT_FOUND' } });
  });
  await page.goto('/admin/usuarias');
  await page.getByRole('button', { name: 'Crear usuaria', exact: true }).click();
});

test('valida al salir o enviar, protege datos y restaura el foco', async ({ page }) => {
  const dialog = page.getByRole('dialog');
  const names = page.getByLabel('Nombres', { exact: false });
  await expect(names).toBeFocused();
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(names).toBeFocused();
  await expect(names).toHaveAttribute('aria-invalid', 'true');
  await names.fill('Ana');
  await expect(names).toHaveAttribute('aria-invalid', 'false');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.getByText('¿Descartar los datos?')).toBeVisible();
  await page.getByRole('button', { name: 'Seguir completando' }).click();
  await expect(names).toHaveValue('Ana');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Descartar y cerrar' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Crear usuaria', exact: true })).toBeFocused();
});

test('crea una cuenta activa sin acciones ni solicitudes de verificación', async ({ page }) => {
  let creates = 0;
  await page.route('**/api/v1/admin/users', async route => {
    if (route.request().method() !== 'POST') return route.fallback();
    creates++;
    expect(route.request().postDataJSON()).toEqual({ firstNames: 'Ana', lastNames: 'Pérez', email: 'ana@example.test', phone: '3001234567', username: '@ana_perez', password: 'ClaveInicial12!' });
    await route.fulfill({ json: { registrationRequestId: 'request-test', status: 'COMPLETED' } });
  });
  const otpRequests: string[] = [];
  page.on('request', request => { if (request.url().includes('verification-codes')) otpRequests.push(request.url()); });
  await page.getByLabel('Nombres', { exact: false }).fill('Ana');
  await page.getByLabel('Apellidos', { exact: false }).fill('Pérez');
  await page.getByLabel('Correo electrónico', { exact: false }).fill('ANA@example.test');
  await page.getByLabel('Teléfono celular', { exact: false }).fill('3001234567');
  await page.locator('input[name=username]').fill('@Ana_Perez');
  await page.getByLabel('Contraseña inicial', { exact: false }).fill('ClaveInicial12!');
  await page.getByRole('button', { name: 'Mostrar contraseña' }).click();
  await expect(page.locator('input[name=password]')).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.getByText('Usuaria creada · Cuenta activa')).toBeVisible();
  expect(creates).toBe(1);
  await expect(page.getByRole('button', { name: 'Enviar código al correo', exact: true })).toHaveCount(0);
  await expect(page.locator('a[href*="verify-code"]')).toHaveCount(0);
  expect(otpRequests).toEqual([]);
  await page.getByRole('button', { name: 'Crear otra usuaria' }).click();
  await expect(page.getByLabel('Nombres', { exact: false })).toBeFocused();
  await expect(page.locator('input[name=password]')).toHaveValue('');
});

test('panel adaptable y navegación de teclado sin salir al fondo', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const panel = page.getByRole('dialog');
    await expect(panel).toBeVisible();
    expect(await panel.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.getByRole('button', { name: 'Crear cuenta', exact: true }).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Cerrar formulario' })).toBeFocused();
    await page.screenshot({ path: `test-results/create-user-${width}.png` });
  }
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.screenshot({ path: 'test-results/create-user-dark.png', animations: 'disabled' });
});

test('un error de servidor conserva los datos y permite corregir el campo', async ({ page }) => {
  await page.route('**/api/v1/admin/users', route => route.fulfill({ status: 409, json: {
    code: 'REGISTRATION_DUPLICATE', fields: [{ field: 'email', message: 'Correo no disponible' }],
  } }));
  for (const [field, value] of Object.entries({ firstNames: 'Ana', lastNames: 'Pérez', email: 'ana@example.test', phone: '3001234567', username: '@ana_perez', password: 'ClaveInicial12!' })) {
    await page.locator(`input[name=${field}]`).fill(value);
  }
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.locator('input[name=email]')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('input[name=email]')).toBeFocused();
  await expect(page.locator('input[name=password]')).toHaveValue('ClaveInicial12!');
  await expect(page.getByRole('button', { name: 'Crear cuenta', exact: true })).toBeEnabled();
});

for (const [language, title, submit, required] of [
  ['es', 'Crear usuaria', 'Crear cuenta', 'Completa este campo.'],
  ['en', 'Create user', 'Create account', 'Complete this field.'],
  ['pt', 'Criar usuária', 'Criar conta', 'Preencha este campo.'],
  ['fr', 'Créer une utilisatrice', 'Créer le compte', 'Remplissez ce champ.'],
]) {
  test(`modal centrado y traducido: ${language}`, async ({ page }) => {
    await page.keyboard.press('Escape');
    await page.locator('.select-control select').selectOption(language);
    await page.getByRole('button', { name: title, exact: true }).click();
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    const box = await page.getByRole('dialog').boundingBox();
    const viewport = page.viewportSize()!;
    expect(Math.abs(box!.x + box!.width / 2 - viewport.width / 2)).toBeLessThan(2);
    expect(Math.abs(box!.y + box!.height / 2 - viewport.height / 2)).toBeLessThan(2);
    await page.getByRole('button', { name: submit, exact: true }).click();
    await expect(page.locator('#create-firstNames-status')).toHaveText(required);
    await page.screenshot({ path: `test-results/create-user-centered-${language}.png`, animations: 'disabled' });
  });
}
