// Ofrece un fallback seguro para plataformas sin una implementación móvil específica.
export async function inspectNotificationPermission() {
  return { granted: false };
}

export async function requestNotificationPermission() {
  return { granted: false };
}
