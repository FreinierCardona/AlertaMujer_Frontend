// Rutas principales de la app.
// Tenerlas en un solo lugar evita escribir varias veces los mismos textos de navegacion.
const Routes = {
  // Ruta inicial del flujo de autenticacion.
  login: '/(auth)/login',

  // Rutas del registro de usuaria.
  registerStep1: '/(auth)/register-step1',
  registerStep2: '/(auth)/register-step2',

  // Rutas de recuperacion de contrasena.
  forgotPassword: '/(auth)/forgot-password',
  verifyCode: '/(auth)/verify-code',
  resetPassword: '/(auth)/reset-password',

  // Ruta principal despues de iniciar sesion o confirmar registro.
  home: '/home',
} as const;

export default Routes;
