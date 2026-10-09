// Consulta cuentas administrativas directamente desde la página paginada del Backend.
import { useCallback, useEffect, useState } from 'react';
import { Link } from '../../app/navigation';
import { adminUsersApi, type AdminUser, type PageResponse } from '../../shared/api/adminUsersApi';
import { ApiError } from '../../shared/api/client';
import { usePreferences } from '../../shared/preferences/PreferencesContext';
import { Button, Notice, PageHeader, Pagination, StatePanel, StatusBadge } from '../../shared/ui/components';

const PAGE_SIZE = 20;

const accountStatus = (status: AdminUser['accountStatus']) =>
  status === 'ENABLED' ? 'enabled' as const : 'disabled' as const;

export function UsersList() {
  const { t } = usePreferences();
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<PageResponse<AdminUser> | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await adminUsersApi.list(page, PAGE_SIZE));
    } catch (cause) {
      setResult(null);
      setError(cause instanceof ApiError ? cause : new ApiError(t('usersError'), 'UNKNOWN'));
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
      <PageHeader eyebrow={t('users')} title={t('usersTitle')} description={t('usersIntro')} />
      <Notice kind="warning">
        El alta administrativa permanece deshabilitada: falta la ruta Backend y el traspaso verificable de la solicitud pendiente (B-04). No se crean cuentas locales ni habilitadas de forma anticipada.
      </Notice>
      {loading ? (
        <StatePanel kind="loading" message={t('loading')} />
      ) : denied ? (
        <StatePanel kind="denied" title={t('accessDenied')} message={t('accessDeniedText')} />
      ) : error ? (
        <StatePanel
          kind="error"
          title={t('error')}
          message={error.message || t('usersError')}
          action={<Button icon="refresh" onClick={() => void load()}>{t('retry')}</Button>}
        />
      ) : !result || result.items.length === 0 ? (
        <StatePanel kind="empty" message={t('noUsers')} />
      ) : (
        <section className="panel-card table-card">
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>{t('user')}</th>
                  <th>{t('email')}</th>
                  <th>{t('phone')}</th>
                  <th>Rol</th>
                  <th>{t('status')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((user) => (
                  <tr key={user.userId}>
                    <td data-label="Username"><strong>{user.username}</strong></td>
                    <td data-label={t('user')}>{user.firstNames} {user.lastNames}</td>
                    <td data-label={t('email')}>{user.email}</td>
                    <td data-label={t('phone')}>{user.phone}</td>
                    <td data-label="Rol">{user.role}</td>
                    <td data-label={t('status')}><StatusBadge status={accountStatus(user.accountStatus)} /></td>
                    <td data-label={t('actions')}>
                      <Link className="button button--secondary" to={`/admin/usuarias/${encodeURIComponent(user.userId)}`}>
                        <span>{t('viewDetail')}</span>
                      </Link>
                    </td>
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
