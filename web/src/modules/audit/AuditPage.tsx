// Presenta únicamente los campos auditables que el contrato confirma.
import { useCallback, useEffect, useState } from 'react';
import { adminUsersApi, type AuditLog, type PageResponse } from '../../shared/api/adminUsersApi';
import { ApiError } from '../../shared/api/client';
import { usePreferences } from '../../shared/preferences/PreferencesContext';
import { Button, PageHeader, Pagination, StatePanel } from '../../shared/ui/components';
import { formatDateTime } from '../../shared/utils/format';

const PAGE_SIZE = 20;

export function AuditPage() {
  const { t, language } = usePreferences();
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<PageResponse<AuditLog> | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await adminUsersApi.auditLogs(page, PAGE_SIZE));
    } catch (cause) {
      setResult(null);
      setError(cause instanceof ApiError ? cause : new ApiError(t('auditError'), 'UNKNOWN'));
    } finally {
      setLoading(false);
    }
  }, [page, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const denied = error?.status === 403;
  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.size)) : 1;
  return (
    <div>
      <PageHeader eyebrow={t('readOnly')} title={t('auditTitle')} description={t('auditIntro')} />
      {loading ? (
        <StatePanel kind="loading" message={t('loading')} />
      ) : denied ? (
        <StatePanel kind="denied" title={t('accessDenied')} message={t('accessDeniedText')} />
      ) : error ? (
        <StatePanel
          kind="error"
          title={t('error')}
          message={error.message || t('auditError')}
          action={<Button icon="refresh" onClick={() => void load()}>{t('retry')}</Button>}
        />
      ) : !result || result.items.length === 0 ? (
        <StatePanel kind="empty" message={t('auditEmpty')} />
      ) : (
        <section className="panel-card table-card">
          <div className="responsive-table">
            <table>
              <thead><tr><th>Identificador</th><th>{t('action')}</th><th>{t('dateTime')}</th></tr></thead>
              <tbody>
                {result.items.map((event) => (
                  <tr key={event.auditLogId}>
                    <td data-label="Identificador"><code>{event.auditLogId}</code></td>
                    <td data-label={t('action')}><strong>{event.action}</strong></td>
                    <td data-label={t('dateTime')}>{formatDateTime(event.createdAt, language)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={result.page + 1} totalPages={totalPages} onChange={(nextPage) => setPage(nextPage - 1)} />
        </section>
      )}
    </div>
  );
}
