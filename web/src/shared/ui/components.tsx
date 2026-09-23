// Reúne controles visuales realmente compartidos por formularios, estados, tablas y modales.
import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { usePreferences } from '../preferences/PreferencesContext';
import type { AccountStatus, AlertStatus, ResultStatus } from '../types/models';
import { Icon, type IconName } from './Icon';

export function Button({
  children,
  variant = 'primary',
  icon,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
}) {
  return (
    <button
      className={`button button--${variant} ${className}`}
      {...props}
    >
      {icon && (
        <Icon
          name={icon}
          size={18}
        />
      )}
      <span>{children}</span>
    </button>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  const { t } = usePreferences();
  return (
    <span className="brand">
      <img
        src="/logo-alertamujer.png"
        alt=""
      />
      <span>{compact ? t('adminBrand') : t('brand')}</span>
    </span>
  );
}

export function PreferenceControls({ compact = false }: { compact?: boolean }) {
  const { language, theme, setLanguage, setTheme, t } = usePreferences();
  return (
    <div className={`preferences ${compact ? 'preferences--compact' : ''}`}>
      <label className="select-control">
        <Icon
          name="globe"
          size={17}
        />
        <span className="sr-only">{t('language')}</span>
        <select
          aria-label={t('language')}
          value={language}
          onChange={(event) =>
            setLanguage(event.target.value as 'es' | 'en' | 'pt' | 'fr')
          }
        >
          <option value="es">ES</option>
          <option value="en">EN</option>
          <option value="pt">PT</option>
          <option value="fr">FR</option>
        </select>
      </label>
      <button
        className="theme-toggle"
        type="button"
        aria-label={`${t('appearance')}: ${theme === 'light' ? t('light') : t('dark')}`}
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        <Icon
          name={theme === 'light' ? 'moon' : 'sun'}
          size={18}
        />
        <span>{theme === 'light' ? t('dark') : t('light')}</span>
      </button>
    </div>
  );
}

const statusIcons: Record<
  AlertStatus | AccountStatus | ResultStatus,
  IconName
> = {
  active: 'alert',
  inProgress: 'spark',
  offline: 'warning',
  finished: 'check',
  enabled: 'check',
  disabled: 'warning',
  deleted: 'error',
  success: 'check',
  failed: 'error',
};

export function StatusBadge({
  status,
}: {
  status: AlertStatus | AccountStatus | ResultStatus;
}) {
  const { t } = usePreferences();
  const labels = {
    active: t('active'),
    inProgress: t('inProgress'),
    offline: t('offline'),
    finished: t('finished'),
    enabled: t('enabled'),
    disabled: t('disabled'),
    deleted: t('deleted'),
    success: t('successful'),
    failed: t('failed'),
  };
  return (
    <span className={`status status--${status}`}>
      <Icon
        name={statusIcons[status]}
        size={14}
      />
      {labels[status]}
    </span>
  );
}

export function StatePanel({
  kind,
  title,
  message,
  action,
}: {
  kind: 'loading' | 'empty' | 'error' | 'warning' | 'denied';
  title?: string;
  message: string;
  action?: ReactNode;
}) {
  const icon: IconName =
    kind === 'loading'
      ? 'refresh'
      : kind === 'error' || kind === 'denied'
        ? 'error'
        : kind === 'warning'
          ? 'warning'
          : 'info';
  return (
    <section
      className={`state-panel state-panel--${kind}`}
      aria-live="polite"
      aria-busy={kind === 'loading'}
    >
      <span className={`state-panel__icon ${kind === 'loading' ? 'spin' : ''}`}>
        <Icon
          name={icon}
          size={26}
        />
      </span>
      {title && <h2>{title}</h2>}
      <p>{message}</p>
      {action && <div className="state-panel__action">{action}</div>}
    </section>
  );
}

export function Notice({
  kind = 'info',
  children,
}: {
  kind?: 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
}) {
  const icons: Record<typeof kind, IconName> = {
    success: 'check',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };
  return (
    <div
      className={`notice notice--${kind}`}
      role={kind === 'error' ? 'alert' : 'status'}
    >
      <Icon
        name={icons[kind]}
        size={19}
      />
      <div>{children}</div>
    </div>
  );
}

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
  size = 'normal',
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  size?: 'normal' | 'wide' | 'viewer';
}) {
  const { t } = usePreferences();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelector<HTMLElement>(
      'button, input, select, textarea, a[href]',
    );
    focusable?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialog) return;
      const items = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]',
        ),
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.classList.remove('modal-open');
      previousFocus.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        ref={dialogRef}
      >
        <button
          type="button"
          className="icon-button modal__close"
          onClick={onClose}
          aria-label={t('close')}
        >
          <Icon name="close" />
        </button>
        <header className="modal__header">
          <h2 id={titleId}>{title}</h2>
          {description && <p id={descriptionId}>{description}</p>}
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const { t } = usePreferences();
  if (totalPages <= 1) return null;
  return (
    <nav
      className="pagination"
      aria-label={`${t('page')} ${page} ${t('of')} ${totalPages}`}
    >
      <button
        type="button"
        className="icon-button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label={t('previous')}
      >
        <Icon name="chevronLeft" />
      </button>
      <span>
        {t('page')} <strong>{page}</strong> {t('of')} {totalPages}
      </span>
      <button
        type="button"
        className="icon-button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label={t('next')}
      >
        <Icon name="chevronRight" />
      </button>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
