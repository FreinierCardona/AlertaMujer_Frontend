export interface ContactAlertMapLocation {
  latitude: number;
  longitude: number;
}

// Trata la denegación y la ausencia del recurso como pérdida de acceso al detalle.
export function isContactAlertAccessRevoked(status?: number) {
  return status === 403 || status === 404;
}

/** Construye el enlace de Maps cuando ambas coordenadas son números finitos. */
export function contactAlertMapsUrl(location: ContactAlertMapLocation | null) {
  if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
    return null;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.latitude},${location.longitude}`)}`;
}
