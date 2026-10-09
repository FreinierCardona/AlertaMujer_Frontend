// Resume los cuatro estados de alerta y ofrece acceso directo a registros recientes.
import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '../../app/navigation';
import { ApiError } from '../../shared/api/client';
import { adminEmergencyApi, type RemoteDashboard } from '../../shared/api/emergencyApi';
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
const cards: { status: AlertStatus; icon: IconName; count: keyof RemoteDashboard }[] = [
  { status: 'active', icon: 'alert', count: 'activeCount' },
  { status: 'inProgress', icon: 'spark', count: 'inProgressCount' },
  { status: 'offline', icon: 'warning', count: 'offlineCount' },
];

export function Dashboard() {
  const { t } = usePreferences();
  const { setFilters } = useWebState();
  const { navigate } = useNavigation();
  const [summary, setSummary] = useState<RemoteDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'denied' | 'error' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await adminEmergencyApi.dashboard());
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 403 ? 'denied' : 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openStatus = (status: AlertStatus) => {
    setFilters({ alertStatus: status, alertPage: 1 });
    navigate('/admin/alertas');
  };
  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow={t('operationalSummary')}
        title={t('dashboard')}
        description={t('lastUpdate')}
      />
      {loading ? <StatePanel kind="loading" message={t('loading')} /> : null}
      {error === 'denied' ? <StatePanel kind="denied" title={t('accessDenied')} message={t('accessDeniedText')} /> : null}
      {error === 'error' ? <StatePanel kind="error" title={t('error')} message={t('alertsError')} action={<Button icon="refresh" onClick={() => void load()}>{t('retry')}</Button>} /> : null}
      {summary ? <section className="summary-grid" aria-label={t('operationalSummary')}>
        {cards.map((card) => <button type="button" key={card.status} className={`summary-card summary-card--${card.status}`} onClick={() => openStatus(card.status)}>
          <span className="summary-card__icon"><Icon name={card.icon} /></span>
          <span className="summary-card__number">{summary[card.count]}</span>
          <span className="summary-card__label"><StatusBadge status={card.status} /></span>
          <Icon name="chevronRight" size={18} />
        </button>)}
      </section> : null}
    </div>
  );
}
