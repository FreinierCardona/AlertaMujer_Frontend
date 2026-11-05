export function apiErrorMessage(code: string, status: number, path: string): string {
  if (status >= 500) return 'El servicio no está disponible en este momento. Inténtalo de nuevo más tarde.';
  if (status === 429) return 'Has realizado varios intentos. Espera un momento antes de volver a intentar.';
  if (code === 'REGISTRATION_DUPLICATE') return 'Uno de estos datos ya está registrado. Revisa tus datos o inicia sesión.';
  if (status === 401) return path.includes('/login')
    ? 'Revisa tu usuario o correo y contraseña e inténtalo de nuevo.'
    : 'Tu sesión no está disponible. Inicia sesión de nuevo.';
  if (status === 403) return 'No tienes permiso para realizar esta acción.';
  if (status === 404) return 'La información solicitada ya no está disponible. Actualiza la pantalla.';
  if (path.includes('/verify') || path.includes('/verification') || path.includes('/codes')) {
    return 'No pudimos confirmar el código. Revísalo o solicita uno nuevo.';
  }
  if (path.includes('/password')) return 'No pudimos actualizar la contraseña. Revisa los datos e inténtalo de nuevo.';
  if (status === 409 || status === 422) {
    if (path.includes('/contacts')) return 'La invitación o el contacto cambió. Actualiza la lista antes de continuar.';
    if (path.includes('/emergencies')) return 'El estado de la alerta cambió. Actualízala antes de continuar.';
    if (path.includes('/users')) return 'La cuenta no permite esta acción en su estado actual. Actualiza sus datos y revisa las condiciones.';
    return 'No fue posible guardar estos datos. Revisa la información y vuelve a intentarlo.';
  }
  if (status === 400) return 'Revisa los datos ingresados y vuelve a intentarlo.';
  return 'No fue posible completar la operación. Inténtalo de nuevo.';
}
