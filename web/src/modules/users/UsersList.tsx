// Implementa consulta, búsqueda, filtros, creación y paginación de cuentas de usuarias.
import { useMemo, useState, type FormEvent } from 'react';
import { useNavigation } from '../../app/navigation';
import { useWebState } from '../../shared/data/WebStateContext';
import { usePreferences } from '../../shared/preferences/PreferencesContext';
import type { AccountStatus } from '../../shared/types/models';
import {
  Button,
  Modal,
  Notice,
  PageHeader,
  Pagination,
  StatePanel,
  StatusBadge,
} from '../../shared/ui/components';
import { Icon } from '../../shared/ui/Icon';
import { formatDate } from '../../shared/utils/format';

const PAGE_SIZE = 5;
type Fields =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'password'
  | 'confirmPassword'
  | 'accepted';

export function UsersList() {
  const { t, language } = usePreferences();
  const { users, filters, setFilters, createUser } = useWebState();
  const { navigate, search } = useNavigation();
  const view = new URLSearchParams(search).get('view');
  const [createOpen, setCreateOpen] = useState(false);
  const [created, setCreated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accepted: false,
  });
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const term = filters.userSearch.trim().toLowerCase();
        const searchMatches =
          !term ||
          `${user.firstName} ${user.lastName} ${user.email}`
            .toLowerCase()
            .includes(term);
        return (
          searchMatches &&
          (filters.userStatus === 'all' || user.status === filters.userStatus)
        );
      }),
    [users, filters.userSearch, filters.userStatus],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(filters.userPage, totalPages);
  const rows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const hasFilters =
    Boolean(filters.userSearch) || filters.userStatus !== 'all';

  const closeCreate = () => {
    if (!submitting) {
      setCreateOpen(false);
      setErrors({});
    }
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<Record<Fields, string>> = {};
    if (!form.firstName.trim()) nextErrors.firstName = t('requiredField');
    if (!form.lastName.trim()) nextErrors.lastName = t('requiredField');
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      nextErrors.email = t('emailRequired');
    if (!form.phone.trim()) nextErrors.phone = t('requiredField');
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password))
      nextErrors.password = t('passwordRule');
    if (form.password !== form.confirmPassword)
      nextErrors.confirmPassword = t('passwordMismatch');
    if (!form.accepted) nextErrors.accepted = t('requiredField');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    const result = await createUser(form);
    setSubmitting(false);
    if (result === 'duplicate') {
      setErrors({ email: t('duplicateEmail') });
      return;
    }
    setCreateOpen(false);
    setCreated(true);
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      accepted: false,
    });
  };

  const reset = () =>
    setFilters({ userSearch: '', userStatus: 'all', userPage: 1 });

  return (
    <div>
      <PageHeader
        eyebrow={t('users')}
        title={t('usersTitle')}
        description={t('usersIntro')}
        actions={
          <Button
            icon="plus"
            onClick={() => {
              setCreated(false);
              setCreateOpen(true);
            }}
          >
            {t('addUser')}
          </Button>
        }
      />
      {created && <Notice kind="success">{t('userCreated')}</Notice>}
      <section
        className="filter-bar filter-bar--search"
        aria-label={t('filters')}
      >
        <label>
          <span>{t('searchUsers')}</span>
          <span className="input-wrap">
            <Icon
              name="search"
              size={18}
            />
            <input
              type="search"
              value={filters.userSearch}
              onChange={(event) =>
                setFilters({ userSearch: event.target.value, userPage: 1 })
              }
              placeholder={t('searchUsers')}
            />
          </span>
        </label>
        <label>
          <span>{t('filterStatus')}</span>
          <select
            value={filters.userStatus}
            onChange={(event) =>
              setFilters({
                userStatus: event.target.value as AccountStatus | 'all',
                userPage: 1,
              })
            }
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="enabled">{t('enabled')}</option>
            <option value="disabled">{t('disabled')}</option>
            <option value="deleted">{t('deleted')}</option>
          </select>
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
          message={t('usersError')}
          action={
            <Button
              icon="refresh"
              onClick={() => navigate('/admin/usuarias', { replace: true })}
            >
              {t('retry')}
            </Button>
          }
        />
      )}
      {view === 'denied' && (
        <StatePanel
          kind="denied"
          title={t('accessDenied')}
          message={t('accessDeniedText')}
        />
      )}
      {!['loading', 'error', 'denied'].includes(view ?? '') &&
        (view === 'empty' || rows.length === 0 ? (
          <StatePanel
            kind="empty"
            message={hasFilters ? t('noResults') : t('noUsers')}
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
                    <th>{t('user')}</th>
                    <th>{t('email')}</th>
                    <th>{t('phone')}</th>
                    <th>{t('status')}</th>
                    <th>{t('registrationDate')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((user) => (
                    <tr key={user.id}>
                      <td data-label={t('user')}>
                        <span className="user-cell">
                          <span className="avatar">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </span>
                          <span>
                            <strong>
                              {user.firstName} {user.lastName}
                            </strong>
                            <small>{user.id}</small>
                          </span>
                        </span>
                      </td>
                      <td data-label={t('email')}>{user.email}</td>
                      <td data-label={t('phone')}>{user.phone}</td>
                      <td data-label={t('status')}>
                        <StatusBadge status={user.status} />
                      </td>
                      <td data-label={t('registrationDate')}>
                        {formatDate(user.registeredAt, language)}
                      </td>
                      <td data-label={t('actions')}>
                        <Button
                          variant="secondary"
                          icon="eye"
                          onClick={() => navigate(`/admin/usuarias/${user.id}`)}
                        >
                          {t('viewDetail')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChange={(page) => setFilters({ userPage: page })}
            />
          </section>
        ))}

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title={t('createUserTitle')}
        description={t('usersIntro')}
        size="wide"
      >
        <form
          className="form-grid"
          onSubmit={submit}
          noValidate
        >
          <Field
            id="new-first-name"
            label={t('firstName')}
            error={errors.firstName}
          >
            <input
              id="new-first-name"
              value={form.firstName}
              onChange={(event) =>
                setForm({ ...form, firstName: event.target.value })
              }
              autoComplete="given-name"
            />
          </Field>
          <Field
            id="new-last-name"
            label={t('lastName')}
            error={errors.lastName}
          >
            <input
              id="new-last-name"
              value={form.lastName}
              onChange={(event) =>
                setForm({ ...form, lastName: event.target.value })
              }
              autoComplete="family-name"
            />
          </Field>
          <Field
            id="new-email"
            label={t('email')}
            error={errors.email}
          >
            <input
              id="new-email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              autoComplete="off"
              inputMode="email"
            />
          </Field>
          <Field
            id="new-phone"
            label={t('phone')}
            error={errors.phone}
          >
            <input
              id="new-phone"
              value={form.phone}
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
              autoComplete="off"
              inputMode="tel"
            />
          </Field>
          <Field
            id="new-password"
            label={t('password')}
            error={errors.password}
          >
            <input
              id="new-password"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              autoComplete="new-password"
            />
          </Field>
          <Field
            id="new-confirm-password"
            label={t('confirmPassword')}
            error={errors.confirmPassword}
          >
            <input
              id="new-confirm-password"
              type="password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm({ ...form, confirmPassword: event.target.value })
              }
              autoComplete="new-password"
            />
          </Field>
          <label className="checkbox-field form-grid__full">
            <input
              type="checkbox"
              checked={form.accepted}
              onChange={(event) =>
                setForm({ ...form, accepted: event.target.checked })
              }
            />
            <span>{t('acceptTerms')}</span>
            {errors.accepted && (
              <span className="field-error">{errors.accepted}</span>
            )}
          </label>
          <div className="modal__actions form-grid__full">
            <Button
              type="button"
              variant="secondary"
              onClick={closeCreate}
              disabled={submitting}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? t('creating') : t('create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
