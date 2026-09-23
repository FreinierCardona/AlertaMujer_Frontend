// Proporciona el layout protegido, responsivo y consistente del panel administrativo.
import { useState, type ReactNode } from 'react';
import { Link, useNavigation } from '../app/navigation';
import { usePreferences } from '../shared/preferences/PreferencesContext';
import { useWebState } from '../shared/data/WebStateContext';
import { Icon, type IconName } from '../shared/ui/Icon';
import { Logo, PreferenceControls } from '../shared/ui/components';

const items: {
  path: string;
  label: 'dashboard' | 'alerts' | 'users' | 'audit';
  icon: IconName;
}[] = [
  { path: '/admin/dashboard', label: 'dashboard', icon: 'dashboard' },
  { path: '/admin/alertas', label: 'alerts', icon: 'alert' },
  { path: '/admin/usuarias', label: 'users', icon: 'users' },
  { path: '/admin/auditoria', label: 'audit', icon: 'audit' },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { path, navigate } = useNavigation();
  const { t } = usePreferences();
  const { session, logout } = useWebState();
  const [open, setOpen] = useState(false);

  const isActive = (itemPath: string) =>
    path === itemPath ||
    (itemPath !== '/admin/dashboard' && path.startsWith(`${itemPath}/`));
  const signOut = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      <a
        className="skip-link"
        href="#admin-content"
      >
        {t('skip')}
      </a>
      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <div className="admin-sidebar__head">
          <Link
            to="/admin/dashboard"
            aria-label={t('dashboard')}
          >
            <Logo compact />
          </Link>
          <button
            type="button"
            className="icon-button sidebar-close"
            onClick={() => setOpen(false)}
            aria-label={t('closeMenu')}
          >
            <Icon name="close" />
          </button>
        </div>
        <nav aria-label="Administración">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={isActive(item.path) ? 'is-active' : ''}
              aria-current={isActive(item.path) ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              <Icon name={item.icon} />
              <span>{t(item.label)}</span>
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="sidebar-logout"
          onClick={signOut}
        >
          <Icon name="logout" />
          <span>{t('logout')}</span>
        </button>
      </aside>
      {open && (
        <button
          type="button"
          className="sidebar-scrim"
          aria-label={t('closeMenu')}
          onClick={() => setOpen(false)}
        />
      )}
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="icon-button sidebar-open"
            onClick={() => setOpen(true)}
            aria-label={t('menu')}
          >
            <Icon name="menu" />
          </button>
          <div className="connection-label">
            <span className="pulse-dot" />
            {t('connectionConfirmed')}
          </div>
          <div className="admin-topbar__actions">
            <PreferenceControls compact />
            <div className="admin-profile">
              <span className="avatar">FC</span>
              <div>
                <strong>{session?.name}</strong>
                <span>{t('adminRole')}</span>
              </div>
            </div>
          </div>
        </header>
        <main
          id="admin-content"
          className="admin-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
