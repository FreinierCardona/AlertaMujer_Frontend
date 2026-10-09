// Implementa el acceso administrativo con validación, estados seguros y conservación del correo.
import { useState, type FormEvent } from 'react';
import { Link, useNavigation } from '../../app/navigation';
import { usePreferences } from '../../shared/preferences/PreferencesContext';
import { useWebState } from '../../shared/data/WebStateContext';
import {
  Button,
  Logo,
  Notice,
  PreferenceControls,
} from '../../shared/ui/components';
import { Icon } from '../../shared/ui/Icon';

type FormErrors = { identifier?: string; password?: string };
type AccessError =
  | 'invalidCredentials'
  | 'disabledAccount'
  | 'unauthorizedRole'
  | 'serviceError'
  | null;

export function AdminLogin() {
  const { t } = usePreferences();
  const { login } = useWebState();
  const { navigate, search } = useNavigation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [accessError, setAccessError] = useState<AccessError>(null);
  const [submitting, setSubmitting] = useState(false);
  const expired = new URLSearchParams(search).get('notice') === 'expired';
  const logoutNotice = new URLSearchParams(search).get('notice');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!identifier.trim()) nextErrors.identifier = t('identifierRequired');
    if (!password) nextErrors.password = t('passwordRequired');
    setErrors(nextErrors);
    setAccessError(null);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    const result = await login(identifier, password);
    setSubmitting(false);
    if (result === 'success') {
      const requested = window.sessionStorage.getItem('am.requestedPath');
      window.sessionStorage.removeItem('am.requestedPath');
      navigate(
        requested?.startsWith('/admin/') && requested !== '/admin/login'
          ? requested
          : '/admin/dashboard',
        { replace: true },
      );
      return;
    }
    setPassword('');
    const resultMessages = {
      invalid: 'invalidCredentials',
      disabled: 'disabledAccount',
      unauthorized: 'unauthorizedRole',
      error: 'serviceError',
    } as const;
    setAccessError(resultMessages[result]);
  };

  return (
    <div className="login-page">
      <header className="login-topbar">
        <Link
          to="/"
          aria-label={t('home')}
        >
          <Logo />
        </Link>
        <PreferenceControls compact />
      </header>
      <main className="login-main">
        <section className="login-context">
          <p className="eyebrow">{t('adminAccess')}</p>
          <h1>{t('designedFor')}</h1>
          <p>{t('projectText')}</p>
          <div className="login-context__mark">
            <Icon
              name="shield"
              size={96}
            />
            <span>
              <Icon
                name="lock"
                size={30}
              />
            </span>
          </div>
        </section>
        <section
          className="login-card"
          aria-labelledby="login-title"
        >
          <div className="login-card__icon">
            <Icon
              name="lock"
              size={28}
            />
          </div>
          <h2 id="login-title">{t('loginTitle')}</h2>
          <p>{t('loginIntro')}</p>
          {expired && <Notice kind="warning">{t('expiredSession')}</Notice>}
          {logoutNotice === 'logout' && (
            <Notice kind="success">{t('logoutConfirmed')}</Notice>
          )}
          {logoutNotice === 'logout-unconfirmed' && (
            <Notice kind="warning">{t('logoutUnconfirmed')}</Notice>
          )}
          {accessError && <Notice kind="error">{t(accessError)}</Notice>}
          <form
            onSubmit={submit}
            noValidate
          >
            <div className="form-control">
              <label htmlFor="login-email">{t('identifier')}</label>
              <span className="input-wrap">
                <Icon
                  name="mail"
                  size={18}
                />
                <input
                  id="login-email"
                  autoComplete="username"
                  inputMode="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  aria-invalid={Boolean(errors.identifier)}
                  aria-describedby={
                    errors.identifier ? 'login-email-error' : undefined
                  }
                />
              </span>
              {errors.identifier && (
                <span
                  className="field-error"
                  id="login-email-error"
                >
                  {errors.identifier}
                </span>
              )}
            </div>
            <div className="form-control">
              <label htmlFor="login-password">{t('password')}</label>
              <span className="input-wrap">
                <Icon
                  name="lock"
                  size={18}
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? 'login-password-error' : undefined
                  }
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? t('hidePassword') : t('showPassword')
                  }
                >
                  <Icon
                    name="eye"
                    size={18}
                  />
                </button>
              </span>
              {errors.password && (
                <span
                  className="field-error"
                  id="login-password-error"
                >
                  {errors.password}
                </span>
              )}
            </div>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? t('signingIn') : t('signIn')}
            </Button>
          </form>
          <Link
            to="/"
            className="login-back"
          >
            <Icon
              name="arrowLeft"
              size={17}
            />
            {t('returnPublic')}
          </Link>
        </section>
      </main>
    </div>
  );
}
