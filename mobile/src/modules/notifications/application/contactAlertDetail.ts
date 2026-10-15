export interface ContactAlertMapLocation {
  latitude: number;
  longitude: number;
}

export function isContactAlertAccessRevoked(status?: number) {
  return status === 403 || status === 404;
}

/** Returns a Google Maps URL only for coordinates safe to render as a location. */
export function contactAlertMapsUrl(location: ContactAlertMapLocation | null) {
  if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
    return null;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.latitude},${location.longitude}`)}`;
}
