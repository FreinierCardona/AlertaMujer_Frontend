// Implementa la consulta inmutable de eventos administrativos con filtros y paginación.
import { useMemo } from 'react';
import { useNavigation } from '../../app/navigation';
import { useWebState } from '../../shared/data/WebStateContext';
import { usePreferences } from '../../shared/preferences/PreferencesContext';
import type { AuditEvent, ResultStatus } from '../../shared/types/models';
import {
  Button,
  PageHeader,
  Pagination,
  StatePanel,
  StatusBadge,
} from '../../shared/ui/components';
import { Icon } from '../../shared/ui/Icon';
import { formatDateTime } from '../../shared/utils/format';

const PAGE_SIZE = 5;

export function AuditPage() {
  const { t, language } = usePreferences();
  const { audit, filters, setFilters } = useWebState();
  const { navigate, search } = useNavigation();
  const view = new URLSearchParams(search).get('view');
  const filtered = useMemo(
    () =>
      audit.filter((event) => {
        const actionMatches =
          filters.auditAction === 'all' || event.action === filters.auditAction;
        const resultMatches =
          filters.auditResult === 'all' || event.result === filters.auditResult;
        const dateMatches =
          !filters.auditDate ||
          event.occurredAt.slice(0, 10) === filters.auditDate;
        return actionMatches && resultMatches && dateMatches;
      }),
    [audit, filters.auditAction, filters.auditResult, filters.auditDate],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(filters.auditPage, totalPages);
  const rows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const hasFilters =
    filters.auditAction !== 'all' ||
    filters.auditResult !== 'all' ||
    Boolean(filters.auditDate);
  const reset = () =>
    setFilters({
      auditAction: 'all',
      auditResult: 'all',
      auditDate: '',
      auditPage: 1,
    });
  const actionLabel = (action: AuditEvent['action']) =>
    t(
      (
        {
          login: 'actionLogin',
          startAttention: 'actionStartAttention',
          createUser: 'actionCreateUser',
          disableUser: 'actionDisableUser',
          enableUser: 'actionEnableUser',
        } as const
      )[action],
    );

  return (
    <div>
      <PageHeader
        eyebrow={t('readOnly')}
        title={t('auditTitle')}
        description={t('auditIntro')}
      />
      <section
        className="filter-bar filter-bar--audit"
        aria-label={t('filters')}
      >
        <label>
          <span>{t('action')}</span>
          <select
            value={filters.auditAction}
            onChange={(event) =>
              setFilters({
                auditAction: event.target.value as AuditEvent['action'] | 'all',
                auditPage: 1,
              })
            }
          >
            <option value="all">{t('allActions')}</option>
            <option value="login">{t('actionLogin')}</option>
            <option value="startAttention">{t('actionStartAttention')}</option>
            <option value="createUser">{t('actionCreateUser')}</option>
            <option value="disableUser">{t('actionDisableUser')}</option>
            <option value="enableUser">{t('actionEnableUser')}</option>
          </select>
        </label>
        <label>
          <span>{t('result')}</span>
          <select
            value={filters.auditResult}
            onChange={(event) =>
              setFilters({
                auditResult: event.target.value as ResultStatus | 'all',
                auditPage: 1,
              })
            }
          >
            <option value="all">{t('allResults')}</option>
            <option value="success">{t('successful')}</option>
            <option value="failed">{t('failed')}</option>
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
              value={filters.auditDate}
              onChange={(event) =>
                setFilters({ auditDate: event.target.value, auditPage: 1 })
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
          message={t('auditError')}
          action={
            <Button
              icon="refresh"
              onClick={() => navigate('/admin/auditoria', { replace: true })}
            >
              {t('retry')}
            </Button>
          }
        />
      )}
      {!['loading', 'error'].includes(view ?? '') &&
        (view === 'empty' || rows.length === 0 ? (
          <StatePanel
            kind="empty"
            message={hasFilters ? t('noResults') : t('auditEmpty')}
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
                    <th>{t('dateTime')}</th>
                    <th>{t('actor')}</th>
                    <th>{t('action')}</th>
                    <th>{t('entity')}</th>
                    <th>{t('result')}</th>
                    <th>{t('detail')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((event) => (
                    <tr key={event.id}>
                      <td data-label={t('dateTime')}>
                        {formatDateTime(event.occurredAt, language)}
                        <span className="cell-meta">{event.id}</span>
                      </td>
                      <td data-label={t('actor')}>{event.actor}</td>
                      <td data-label={t('action')}>
                        <strong>{actionLabel(event.action)}</strong>
                      </td>
                      <td data-label={t('entity')}>{event.entity}</td>
                      <td data-label={t('result')}>
                        <StatusBadge status={event.result} />
                      </td>
                      <td data-label={t('detail')}>{event.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChange={(page) => setFilters({ auditPage: page })}
            />
          </section>
        ))}
    </div>
  );
}
