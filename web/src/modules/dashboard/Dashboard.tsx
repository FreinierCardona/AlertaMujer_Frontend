// Resume los cuatro estados de alerta y ofrece acceso directo a registros recientes.
import { useNavigation } from '../../app/navigation';
import { useWebState } from '../../shared/data/WebStateContext';
import { usePreferences } from '../../shared/preferences/PreferencesContext';
import type { AlertStatus } from '../../shared/types/models';
import {
  Button,
  PageHeader,
  StatePanel,
  StatusBadge,
} from '../../shared/ui/components';
import { Icon, type IconName } from '../../shared/ui/Icon';
import { formatDateTime } from '../../shared/utils/format';

const cards: { status: AlertStatus; icon: IconName }[] = [
  { status: 'active', icon: 'alert' },
  { status: 'inProgress', icon: 'spark' },
  { status: 'offline', icon: 'warning' },
  { status: 'finished', icon: 'check' },
];

export function Dashboard() {
  const { t, language } = usePreferences();
  const { alerts, setFilters } = useWebState();
  const { navigate, search } = useNavigation();
  const view = new URLSearchParams(search).get('view');
  const latestUpdate = [...alerts].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  )[0]?.updatedAt;

  if (view === 'loading')
    return (
      <>
        <PageHeader title={t('dashboard')} />
        <StatePanel
          kind="loading"
          message={t('loading')}
        />
      </>
    );
  if (view === 'error')
    return (
      <>
        <PageHeader title={t('dashboard')} />
        <StatePanel
          kind="error"
          title={t('error')}
          message={t('alertsError')}
          action={
            <Button
              icon="refresh"
              onClick={() => navigate('/admin/dashboard', { replace: true })}
            >
              {t('retry')}
            </Button>
          }
        />
      </>
    );
  if (view === 'empty')
    return (
      <>
        <PageHeader title={t('dashboard')} />
        <StatePanel
          kind="empty"
          message={t('noAlerts')}
        />
      </>
    );

  const openStatus = (status: AlertStatus) => {
    setFilters({ alertStatus: status, alertPage: 1 });
    navigate('/admin/alertas');
  };
  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow={t('operationalSummary')}
        title={t('dashboard')}
        description={
          latestUpdate
            ? `${t('lastUpdate')}: ${formatDateTime(latestUpdate, language)}`
            : undefined
        }
      />
      {view === 'partial' && (
        <StatePanel
          kind="warning"
          message={t('partialData')}
        />
      )}
      <section
        className="summary-grid"
        aria-label={t('operationalSummary')}
      >
        {cards.map((card) => {
          const count = alerts.filter(
            (alert) => alert.status === card.status,
          ).length;
          return (
            <button
              type="button"
              key={card.status}
              className={`summary-card summary-card--${card.status}`}
              onClick={() => openStatus(card.status)}
            >
              <span className="summary-card__icon">
                <Icon name={card.icon} />
              </span>
              <span className="summary-card__number">{count}</span>
              <span className="summary-card__label">
                <StatusBadge status={card.status} />
              </span>
              <Icon
                name="chevronRight"
                size={18}
              />
            </button>
          );
        })}
      </section>
      <section className="panel-card">
        <header className="panel-card__header">
          <div>
            <p className="eyebrow">{t('alerts')}</p>
            <h2>{t('recentAlerts')}</h2>
          </div>
          <button
            type="button"
            className="text-button"
            onClick={() => navigate('/admin/alertas')}
          >
            {t('viewAll')}{' '}
            <Icon
              name="chevronRight"
              size={17}
            />
          </button>
        </header>
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>{t('status')}</th>
                <th>{t('user')}</th>
                <th>{t('startDate')}</th>
                <th>{t('lastLocation')}</th>
                <th>
                  <span className="sr-only">{t('actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {alerts.slice(0, 4).map((alert) => (
                <tr key={alert.id}>
                  <td>
                    <StatusBadge status={alert.status} />
                  </td>
                  <td>
                    <strong>{alert.userName}</strong>
                    <span className="cell-meta">{alert.id}</span>
                  </td>
                  <td>{formatDateTime(alert.startedAt, language)}</td>
                  <td>{alert.locationLabel}</td>
                  <td>
                    <button
                      type="button"
                      className="icon-button table-action"
                      onClick={() => navigate(`/admin/alertas/${alert.id}`)}
                      aria-label={`${t('viewDetail')} ${alert.id}`}
                    >
                      <Icon name="eye" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
