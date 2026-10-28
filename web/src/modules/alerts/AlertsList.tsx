import { useCallback, useEffect, useState } from 'react';
import { useVisibleRefresh } from '../../shared/hooks/useVisibleRefresh';
import { useNavigation } from '../../app/navigation';
import { ApiError } from '../../shared/api/client';
import { adminEmergencyApi } from '../../shared/api/emergencyApi';
import type { RemoteEmergency, RemoteEmergencyStatus } from '../../shared/api/emergencyApi';
import { useWebState } from '../../shared/data/WebStateContext';
import { usePreferences } from '../../shared/preferences/PreferencesContext';
import type { AlertStatus } from '../../shared/types/models';
import { Button, PageHeader, Pagination, StatePanel, StatusBadge } from '../../shared/ui/components';
import { formatDateTime } from '../../shared/utils/format';

const PAGE_SIZE = 20;
const statusMap: Record<RemoteEmergencyStatus, AlertStatus> = {
  ACTIVE: 'active', IN_PROGRESS: 'inProgress', OFFLINE: 'offline', FINALIZED: 'finished',
};
const toStatus = (status: RemoteEmergencyStatus): AlertStatus => statusMap[status];

/** El listado administrativo de emergencias consume únicamente los campos expuestos por su contrato. */
export function AlertsList() {
  const { t, language } = usePreferences();
  const { filters, setFilters } = useWebState();
  const { navigate } = useNavigation();
  const [items, setItems] = useState<RemoteEmergency[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'denied' | 'error' | null>(null);
  const status = filters.alertStatus === 'all' ? undefined : ({
    active: 'ACTIVE', inProgress: 'IN_PROGRESS', offline: 'OFFLINE', finished: 'FINALIZED',
  }[filters.alertStatus] as RemoteEmergencyStatus);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await adminEmergencyApi.list(filters.alertPage - 1, PAGE_SIZE, status);
      setItems(page.items);
      setTotal(page.total);
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 403 ? 'denied' : 'error');
    } finally {
      setLoading(false);
    }
  }, [filters.alertPage, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const refreshVisible = useCallback(async (current: () => boolean) => {
    try { const next = await adminEmergencyApi.list(filters.alertPage - 1, PAGE_SIZE, status); if (current()) { setItems(next.items); setTotal(next.total); setError(null); } }
    catch (cause) { if (current() && cause instanceof ApiError && cause.status === 403) { setItems([]); setTotal(0); setError('denied'); } }
  }, [filters.alertPage, status]);
  useVisibleRefresh(refreshVisible);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return <div>
    <PageHeader eyebrow={t('operationalSummary')} title={t('alerts')} description={t('lastUpdate')} />
    <section className="filter-bar" aria-label={t('filters')}>
      <label><span>{t('filterStatus')}</span>
        <select value={filters.alertStatus} onChange={(event) => setFilters({ alertStatus: event.target.value as AlertStatus | 'all', alertPage: 1 })}>
          <option value="all">{t('allStatuses')}</option><option value="active">{t('active')}</option>
          <option value="inProgress">{t('inProgress')}</option><option value="offline">{t('offline')}</option>
          <option value="finished">{t('finished')}</option>
        </select>
      </label>
      <Button variant="secondary" onClick={() => setFilters({ alertStatus: 'all', alertPage: 1 })} disabled={filters.alertStatus === 'all'}>{t('clearFilters')}</Button>
    </section>
    {loading ? <StatePanel kind="loading" message={t('loading')} /> : null}
    {error === 'denied' ? <StatePanel kind="denied" title={t('accessDenied')} message={t('accessDeniedText')} /> : null}
    {error === 'error' ? <StatePanel kind="error" title={t('error')} message={t('alertsError')} action={<Button icon="refresh" onClick={() => void load()}>{t('retry')}</Button>} /> : null}
    {!loading && !error && (items.length === 0 ? <StatePanel kind="empty" message={t('noAlerts')} /> : (
      <section className="panel-card table-card"><div className="responsive-table"><table><thead><tr>
        <th>{t('status')}</th><th>Titular</th><th>{t('startDate')}</th><th>{t('actions')}</th>
      </tr></thead><tbody>{items.map((item) => <tr key={item.emergencyId}>
        <td data-label={t('status')}><StatusBadge status={toStatus(item.status)} /></td>
        <td data-label="Titular"><strong>{item.displayName || 'Alerta de emergencia'}</strong><br />{item.username}</td>
        <td data-label={t('startDate')}>{formatDateTime(item.startedAt, language)}</td>
        <td data-label={t('actions')}><Button variant="secondary" icon="eye" onClick={() => navigate(`/admin/alertas/${item.emergencyId}`)}>{t('viewDetail')}</Button></td>
      </tr>)}</tbody></table></div>
      <Pagination page={filters.alertPage} totalPages={totalPages} onChange={(page) => setFilters({ alertPage: page })} />
      </section>
    ))}
  </div>;
}
