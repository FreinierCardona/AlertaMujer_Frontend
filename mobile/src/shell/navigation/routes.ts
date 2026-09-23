// Centraliza rutas declarativas usadas por pantallas y guardas de navegación.
const Routes = {
  login: '/auth/login',
  registerStep1: '/auth/register',
  registerStep2: '/auth/register-step2',
  forgotPassword: '/auth/forgot-password',
  verifyCode: '/auth/verify-code',
  resetPassword: '/auth/reset-password',
  home: '/tabs/home',
  contacts: '/tabs/contacts',
  history: '/tabs/history',
  profile: '/tabs/profile',
  contactForm: '/contacts/form',
  activeEmergency: '/emergency/active',
  editProfile: '/profile/edit',
  helpMessage: '/profile/help-message',
  language: '/profile/language',
  appearance: '/profile/appearance',
  profileVerify: '/profile/verify',
  evidenceCapture: '/evidence/capture',
} as const;
export default Routes;
