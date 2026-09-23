// Implementa listado, filtros documentados, paginación y estados de consulta de alertas.
import { useMemo } from 'react';
import { useNavigation } from '../../app/navigation';
import { useWebState } from '../../shared/data/WebStateContext';
import { usePreferences } from '../../shared/preferences/PreferencesContext';
import type { AlertStatus } from '../../shared/types/models';
import {
  Button,
  PageHeader,
  Pagination,
  StatePanel,
  StatusBadge,
} from '../../shared/ui/components';
import { Icon } from '../../shared/ui/Icon';
import { formatDateTime } from '../../shared/utils/format';

const PAGE_SIZE = 4;

export function AlertsList() {
  const { t, language } = usePreferences();
  const { alerts, filters, setFilters } = useWebState();
  const { navigate, search } = useNavigation();
  const view = new URLSearchParams(search).get('view');
  const filtered = useMemo(
    () =>
      alerts.filter((alert) => {
        const statusMatches =
          filters.alertStatus === 'all' || alert.status === filters.alertStatus;
        const dateMatches =
          !filters.alertDate ||
          alert.startedAt.slice(0, 10) === filters.alertDate;
        return statusMatches && dateMatches;
      }),
    [alerts, filters.alertStatus, filters.alertDate],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(filters.alertPage, totalPages);
  const rows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const hasFilters =
    filters.alertStatus !== 'all' || Boolean(filters.alertDate);
  const reset = () =>
    setFilters({ alertStatus: 'all', alertDate: '', alertPage: 1 });

  return (
    <div>
      <PageHeader
        eyebrow={t('operationalSummary')}
        title={t('alerts')}
        description={t('lastUpdate')}
      />
      <section
        className="filter-bar"
        aria-label={t('filters')}
      >
        <label>
          <span>{t('filterStatus')}</span>
          <select
            value={filters.alertStatus}
            onChange={(event) =>
              setFilters({
                alertStatus: event.target.value as AlertStatus | 'all',
                alertPage: 1,
              })
            }
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="active">{t('active')}</option>
            <option value="inProgress">{t('inProgress')}</option>
            <option value="offline">{t('offline')}</option>
            <option value="finished">{t('finished')}</option>
          </select>
        </label>
        <label>
          <span>{t('filterDate')}</span>
          <span className="input-wrap">
            <Icon
              name="calendar"
              size={18}
            />
            <input
              type="date"
              value={filters.alertDate}
              onChange={(event) =>
                setFilters({ alertDate: event.target.value, alertPage: 1 })
              }
            />
          </span>
        </label>
        <Button
          variant="secondary"
          onClick={reset}
          disabled={!hasFilters}
        >
          {t('clearFilters')}
        </Button>
      </section>
      {view === 'partial' && (
        <StatePanel
          kind="warning"
          message={t('partialData')}
        />
      )}
      {view === 'loading' && (
        <StatePanel
          kind="loading"
          message={t('loading')}
        />
      )}
      {view === 'error' && (
        <StatePanel
          kind="error"
          title={t('error')}
          message={t('alertsError')}
          action={
            <Button
              icon="refresh"
              onClick={() => navigate('/admin/alertas', { replace: true })}
            >
              {t('retry')}
            </Button>
          }
        />
      )}
      {view === 'denied' && (
        <StatePanel
          kind="denied"
          title={t('accessDenied')}
          message={t('accessDeniedText')}
          action={
            <Button onClick={() => navigate('/admin/dashboard')}>
              {t('goDashboard')}
            </Button>
          }
        />
      )}
      {!['loading', 'error', 'denied'].includes(view ?? '') &&
        (view === 'empty' || rows.length === 0 ? (
          <StatePanel
            kind="empty"
            message={hasFilters ? t('noResults') : t('noAlerts')}
            action={
              hasFilters ? (
                <Button
                  variant="secondary"
                  onClick={reset}
                >
                  {t('clearFilters')}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <section className="panel-card table-card">
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>{t('status')}</th>
                    <th>{t('user')}</th>
                    <th>{t('startDate')}</th>
                    <th>{t('lastLocation')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((alert) => (
                    <tr key={alert.id}>
                      <td data-label={t('status')}>
                        <StatusBadge status={alert.status} />
                      </td>
                      <td data-label={t('user')}>
                        <strong>{alert.userName}</strong>
                        <span className="cell-meta">{alert.id}</span>
                      </td>
                      <td data-label={t('startDate')}>
                        {formatDateTime(alert.startedAt, language)}
                      </td>
                      <td data-label={t('lastLocation')}>
                        <span className="location-cell">
                          <Icon
                            name="mapPin"
                            size={17}
                          />
                          {alert.locationLabel}
                        </span>
                      </td>
                      <td data-label={t('actions')}>
                        <Button
                          variant="secondary"
                          icon="eye"
                          onClick={() => navigate(`/admin/alertas/${alert.id}`)}
                        >
                          {t('viewDetail')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChange={(page) => setFilters({ alertPage: page })}
            />
          </section>
        ))}
    </div>
  );
}
