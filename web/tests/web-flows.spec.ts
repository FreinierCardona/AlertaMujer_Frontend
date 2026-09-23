// Valida navegación, preferencias, flujos administrativos, estados y respuesta visual del frontend web.
import { expect, test, type Page } from '@playwright/test';

const runtimeErrors = new WeakMap<Page, string[]>();

async function reset(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

async function login(page: Page) {
  await page.goto('/admin/login');
  await page
    .getByLabel('Correo electrónico')
    .fill('cardonafreinier@gmail.com');
  await page.getByLabel('Contraseña', { exact: true }).fill('29052009Fs.');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await reset(page);
});

test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page) ?? []).toEqual([]);
});

test('conserva modo oscuro e idioma al navegar por público y acceso', async ({
  page,
}) => {
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('link', { name: 'Funciones', exact: true }).click();
  await expect(
    page.getByRole('heading', {
      name: 'Diseñada para acompañar el momento crítico',
    }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Seguridad', exact: true }).click();
  await page.getByRole('link', { name: 'Descargar APK', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('.select-control select').selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.getByRole('heading', { name: 'Take AlertaMujer with you' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Administrative access' }).click();
  await expect(
    page.getByRole('heading', { name: 'Administrative sign in' }),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('muestra validaciones y estados de acceso antes del login correcto', async ({
  page,
}) => {
  await page.goto('/admin/login');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByText('Ingresa un correo válido.')).toBeVisible();
  await expect(
    page.getByText('La contraseña debe tener al menos 8 caracteres.'),
  ).toBeVisible();
  await page.getByLabel('Correo electrónico').fill('persona@gmail.com');
  await page.getByLabel('Contraseña', { exact: true }).fill('Contraseña1');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(
    page.getByText('No fue posible iniciar sesión con esas credenciales.'),
  ).toBeVisible();
  await page
    .getByLabel('Correo electrónico')
    .fill('inhabilitada@alertamujer.org');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(
    page.getByText('La cuenta se encuentra inhabilitada.'),
  ).toBeVisible();
  await page.getByLabel('Correo electrónico').fill('usuaria@alertamujer.org');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(
    page.getByText('Esta cuenta no tiene autorización para ingresar al panel.'),
  ).toBeVisible();
  await page.getByLabel('Correo electrónico').fill('error@alertamujer.org');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(
    page.getByText('El servicio no está disponible. Intenta nuevamente.'),
  ).toBeVisible();
  await page
    .getByLabel('Correo electrónico')
    .fill('cardonafreinier@gmail.com');
  await page.getByLabel('Contraseña', { exact: true }).fill('29052009Fs.');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
});

test('recorre dashboard, filtros, atención, evidencias y chat sin perder preferencias', async ({
  page,
}) => {
  await login(page);
  await page.locator('.theme-toggle').click();
  await page.locator('.select-control select').selectOption('en');
  for (const label of [
    'Active',
    'In progress',
    'No internet connection',
    'Finished',
  ])
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  await page.getByRole('link', { name: 'Alerts' }).click();
  await page.getByLabel('Filter by status').selectOption('active');
  await page
    .getByRole('button', { name: /View details/ })
    .first()
    .click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: 'Start response' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Confirm response start' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Active', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Start response' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(
    page.getByText('The response started successfully.'),
  ).toBeVisible();
  await page.getByRole('button', { name: /Photo 1/ }).click();
  await expect(page.getByRole('dialog', { name: 'Photo 1' })).toBeVisible();
  await page.getByRole('button', { name: 'Next photo' }).click();
  await page.getByRole('button', { name: 'Close viewer' }).click();
  await page
    .getByPlaceholder('Write a message')
    .fill('Continúo atenta a tu ubicación.');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText('Continúo atenta a tu ubicación.')).toBeVisible();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByLabel('Filter by status')).toHaveValue('active');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('gestiona creación y estado de usuarias y refleja auditoría', async ({
  page,
}) => {
  await login(page);
  await page.getByRole('link', { name: 'Usuarias' }).click();
  await page.getByRole('button', { name: 'Crear usuaria' }).click();
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  await expect(
    page.getByText('Este campo es obligatorio.').first(),
  ).toBeVisible();
  await page.getByLabel('Nombres').fill('Valentina');
  await page.getByLabel('Apellidos').fill('Morales');
  await page
    .getByLabel('Correo electrónico')
    .fill('valentina.morales@example.com');
  await page.getByLabel('Teléfono').fill('+57 312 555 0199');
  await page.getByLabel('Contraseña', { exact: true }).fill('Alerta2026');
  await page.getByLabel('Confirmar contraseña').fill('Alerta2026');
  await page.getByLabel('Confirmo que los datos fueron verificados').check();
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  await expect(
    page.getByText('La usuaria fue creada correctamente.'),
  ).toBeVisible();
  await page.getByPlaceholder('Buscar por nombre o correo').fill('Paola');
  await page.getByRole('button', { name: /Ver detalle/ }).click();
  await page.getByRole('button', { name: 'Inhabilitar cuenta' }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await expect(
    page.getByText('El estado de la cuenta se actualizó correctamente.'),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Auditoría' }).click();
  await expect(
    page.getByRole('cell', { name: 'Inhabilitación de cuenta', exact: true }),
  ).toBeVisible();
});

test('expone estados compartidos y sesión expirada sin perder contexto sensible', async ({
  page,
}) => {
  await login(page);
  for (const value of ['loading', 'empty', 'error', 'partial', 'denied']) {
    await page.goto(`/admin/alertas?view=${value}`);
    await expect(page.locator('#admin-content')).toBeVisible();
  }
  await page.goto(
    '/admin/alertas/A-1031?chat=offline&evidence=empty&map=error',
  );
  await expect(page.getByText('Conversación sin conexión')).toBeVisible();
  await expect(
    page.getByText('No se han recibido fotografías para esta alerta.'),
  ).toBeVisible();
  await expect(
    page.getByText(
      'El mapa no está disponible. La dirección y las coordenadas confirmadas siguen visibles.',
    ),
  ).toBeVisible();
  await page.goto('/admin/sesion-expirada');
  await expect(page).toHaveURL(/\/admin\/login\?notice=expired$/);
  await expect(
    page.getByText('Tu sesión expiró. Inicia sesión nuevamente.'),
  ).toBeVisible();
});

test('resuelve guarda de ruta, conflicto, fallo de chat y regla de inactividad', async ({
  page,
}) => {
  await page.goto('/admin/alertas');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page
    .getByLabel('Correo electrónico')
    .fill('cardonafreinier@gmail.com');
  await page.getByLabel('Contraseña', { exact: true }).fill('29052009Fs.');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/admin\/alertas$/);
  await page.goto('/admin/alertas/A-1044');
  await page.getByRole('button', { name: 'Iniciar atención' }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await expect(page.getByText('El estado de la alerta cambió')).toBeVisible();
  await expect(
    page.getByText('En proceso', { exact: true }).first(),
  ).toBeVisible();
  await page.goto('/admin/alertas/A-1038?send=error');
  await page
    .getByPlaceholder('Escribe un mensaje')
    .fill('Confirmo que sigo en contacto.');
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.getByText('El mensaje no se envió.')).toBeVisible();
  await expect(page.getByPlaceholder('Escribe un mensaje')).toHaveValue(
    'Confirmo que sigo en contacto.',
  );
  await page.goto('/admin/usuarias/U-1024');
  await page.getByRole('button', { name: 'Inhabilitar cuenta' }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await expect(
    page.getByText(
      'La cuenta aún no completa dos meses de inactividad y no puede inhabilitarse.',
    ),
  ).toBeVisible();
});

test('presenta las cuatro variantes de disponibilidad Android', async ({
  page,
}) => {
  const expected = {
    preparing: 'Publicación en preparación',
    unavailable: 'APK no disponible',
    error: 'No pudimos consultar la publicación',
    available: 'APK disponible',
  };
  for (const [state, label] of Object.entries(expected)) {
    await page.goto(`/descargar?state=${state}`);
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(
    page.getByRole('button', { name: 'Descargar APK' }),
  ).toBeDisabled();
});

test('mantiene navegación y formularios utilizables en ancho reducido', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await expect(
    page.getByRole('link', { name: 'Funciones', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Acceso administrativo' }).click();
  await page
    .getByLabel('Correo electrónico')
    .fill('cardonafreinier@gmail.com');
  await page.getByLabel('Contraseña', { exact: true }).fill('29052009Fs.');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page.getByRole('link', { name: 'Usuarias' }).click();
  await page.getByRole('button', { name: 'Crear usuaria' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Crear usuaria' }),
  ).toBeVisible();
  const box = await page.getByRole('dialog').boundingBox();
  expect(box?.width).toBeLessThanOrEqual(390);
});

test('captura las vistas clave para revisión visual', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.screenshot({
    path: testInfo.outputPath('public-home-desktop.png'),
    fullPage: true,
  });
  await login(page);
  await page.locator('.theme-toggle').click();
  await page.screenshot({
    path: testInfo.outputPath('dashboard-dark-desktop.png'),
    fullPage: true,
  });
  await page.goto('/admin/alertas/A-1042');
  await page.screenshot({
    path: testInfo.outputPath('alert-detail-dark-desktop.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.screenshot({
    path: testInfo.outputPath('public-home-mobile.png'),
    fullPage: true,
  });
});
