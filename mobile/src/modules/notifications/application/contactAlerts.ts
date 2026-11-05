import type { ContactAlertSummary } from '@core/api/contactAlertsApi';

const openStatuses = new Set<ContactAlertSummary['status']>([
  'ACTIVE',
  'IN_PROGRESS',
  'OFFLINE',
]);

// El Backend sigue siendo la fuente de verdad; se eliminan duplicados de respuesta.
export function authorizedOpenAlerts(alerts: ContactAlertSummary[]) {
  const seen = new Set<string>();
  return alerts.filter((alert) => {
    if (!openStatuses.has(alert.status) || seen.has(alert.emergencyId)) return false;
    seen.add(alert.emergencyId);
    return true;
  });
}
