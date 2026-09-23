// Compone la navegación, preferencias y pie de página del sitio web público.
import { useState, type ReactNode } from 'react';
import { Link, useNavigation } from '../app/navigation';
import { usePreferences } from '../shared/preferences/PreferencesContext';
import { Icon } from '../shared/ui/Icon';
import { Logo, PreferenceControls } from '../shared/ui/components';

const items = [
  { path: '/', key: 'home' as const },
  { path: '/funciones', key: 'features' as const },
  { path: '/seguridad', key: 'security' as const },
  { path: '/descargar', key: 'download' as const },
];

export function PublicShell({ children }: { children: ReactNode }) {
  const { path } = useNavigation();
  const { t } = usePreferences();
  const [open, setOpen] = useState(false);

  return (
    <div className="public-shell">
      <a
        className="skip-link"
        href="#main-content"
      >
        {t('skip')}
      </a>
      <header className="public-header">
        <Link
          to="/"
          className="brand-link"
          aria-label={t('home')}
        >
          <Logo />
        </Link>
        <button
          type="button"
          className="icon-button public-menu-button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="public-navigation"
          aria-label={open ? t('closeMenu') : t('menu')}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
        <nav
          id="public-navigation"
          className={`public-navigation ${open ? 'is-open' : ''}`}
          aria-label="Principal"
        >
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={path === item.path ? 'is-active' : ''}
              aria-current={path === item.path ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className={`public-actions ${open ? 'is-open' : ''}`}>
          <PreferenceControls compact />
          <Link
            to="/admin/login"
            className="admin-link"
          >
            <Icon
              name="lock"
              size={16}
            />
            {t('adminAccess')}
          </Link>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="public-footer">
        <div>
          <Logo />
          <p>{t('limitsText')}</p>
        </div>
        <p>© 2026 AlertaMujer</p>
      </footer>
    </div>
  );
}
