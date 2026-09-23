// Resuelve rutas públicas y protegidas, incluida la recuperación segura de sesión.
import { useEffect } from 'react';
import { useNavigation } from './navigation';
import { useWebState } from '../shared/data/WebStateContext';
import { usePreferences } from '../shared/preferences/PreferencesContext';
import { PublicShell } from '../shell/PublicShell';
import { AdminShell } from '../shell/AdminShell';
import {
  PublicHome,
  FeaturesPage,
  SecurityPage,
  DownloadPage,
} from '../modules/public-site/PublicPages';
import { AdminLogin } from '../modules/authentication/AdminLogin';
import { Dashboard } from '../modules/dashboard/Dashboard';
import { AlertsList } from '../modules/alerts/AlertsList';
import { AlertDetail } from '../modules/alerts/AlertDetail';
import { UsersList } from '../modules/users/UsersList';
import { UserDetail } from '../modules/users/UserDetail';
import { AuditPage } from '../modules/audit/AuditPage';
import { Button, PageHeader, StatePanel } from '../shared/ui/components';

function Redirect({ to }: { to: string }) {
  const { navigate } = useNavigation();
  useEffect(() => navigate(to, { replace: true }), [navigate, to]);
  return null;
}

function ExpireSession() {
  const { expireSession } = useWebState();
  const { navigate } = useNavigation();
  useEffect(() => {
    expireSession();
    navigate('/admin/login?notice=expired', { replace: true });
  }, [expireSession, navigate]);
  return null;
}

export function Router() {
  const { path } = useNavigation();
  const { session } = useWebState();
  const { t } = usePreferences();

  if (path === '/')
    return (
      <PublicShell>
        <PublicHome />
      </PublicShell>
    );
  if (path === '/funciones')
    return (
      <PublicShell>
        <FeaturesPage />
      </PublicShell>
    );
  if (path === '/seguridad')
    return (
      <PublicShell>
        <SecurityPage />
      </PublicShell>
    );
  if (path === '/descargar')
    return (
      <PublicShell>
        <DownloadPage />
      </PublicShell>
    );
  if (path === '/admin/login')
    return session ? <Redirect to="/admin/dashboard" /> : <AdminLogin />;

  if (path.startsWith('/admin')) {
    if (path === '/admin/sesion-expirada') {
      return <ExpireSession />;
    }
    if (!session) {
      window.sessionStorage.setItem(
        'am.requestedPath',
        `${window.location.pathname}${window.location.search}`,
      );
      return <Redirect to="/admin/login" />;
    }
    if (path === '/admin' || path === '/admin/')
      return <Redirect to="/admin/dashboard" />;
    if (path === '/admin/dashboard')
      return (
        <AdminShell>
          <Dashboard />
        </AdminShell>
      );
    if (path === '/admin/alertas')
      return (
        <AdminShell>
          <AlertsList />
        </AdminShell>
      );
    const alertMatch = path.match(/^\/admin\/alertas\/([^/]+)$/);
    if (alertMatch)
      return (
        <AdminShell>
          <AlertDetail alertId={decodeURIComponent(alertMatch[1])} />
        </AdminShell>
      );
    if (path === '/admin/usuarias')
      return (
        <AdminShell>
          <UsersList />
        </AdminShell>
      );
    const userMatch = path.match(/^\/admin\/usuarias\/([^/]+)$/);
    if (userMatch)
      return (
        <AdminShell>
          <UserDetail userId={decodeURIComponent(userMatch[1])} />
        </AdminShell>
      );
    if (path === '/admin/auditoria')
      return (
        <AdminShell>
          <AuditPage />
        </AdminShell>
      );
    if (path === '/admin/denegado')
      return (
        <AdminShell>
          <>
            <PageHeader title={t('accessDenied')} />
            <StatePanel
              kind="denied"
              message={t('accessDeniedText')}
              action={
                <Button onClick={() => window.history.back()}>
                  {t('back')}
                </Button>
              }
            />
          </>
        </AdminShell>
      );
    return (
      <AdminShell>
        <>
          <PageHeader title={t('error')} />
          <StatePanel
            kind="error"
            message={t('unavailable')}
          />
        </>
      </AdminShell>
    );
  }

  return (
    <PublicShell>
      <section className="section-wrap inner-page">
        <StatePanel
          kind="error"
          title={t('error')}
          message={t('unavailable')}
        />
      </section>
    </PublicShell>
  );
}
