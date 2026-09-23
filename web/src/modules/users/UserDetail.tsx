// Presenta información de cuenta, historial relacionado y cambios de estado permitidos.
import { useState } from 'react';
import { useNavigation } from '../../app/navigation';
import { useWebState } from '../../shared/data/WebStateContext';
import { usePreferences } from '../../shared/preferences/PreferencesContext';
import {
  Button,
  Modal,
  Notice,
  PageHeader,
  StatePanel,
  StatusBadge,
} from '../../shared/ui/components';
import { Icon } from '../../shared/ui/Icon';
import { formatDate, formatDateTime } from '../../shared/utils/format';

export function UserDetail({ userId }: { userId: string }) {
  const { t, language } = usePreferences();
  const { users, alerts, changeUserStatus } = useWebState();
  const { navigate } = useNavigation();
  const user = users.find((item) => item.id === userId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<'success' | 'notAllowed' | null>(null);

  if (!user)
    return (
      <>
        <PageHeader
          title={t('userDetail')}
          actions={
            <Button
              variant="secondary"
              icon="arrowLeft"
              onClick={() => navigate('/admin/usuarias')}
            >
              {t('back')}
            </Button>
          }
        />
        <StatePanel
          kind="error"
          message={t('usersError')}
        />
      </>
    );
  const userAlerts = alerts.filter((alert) => alert.userId === user.id);
  const confirmChange = async () => {
    setBusy(true);
    const mutation = await changeUserStatus(user.id);
    setBusy(false);
    setConfirmOpen(false);
    setResult(mutation === 'success' ? 'success' : 'notAllowed');
  };

  return (
    <div>
      <PageHeader
        eyebrow={user.id}
        title={t('userDetail')}
        actions={
          <>
            <Button
              variant="secondary"
              icon="arrowLeft"
              onClick={() => navigate('/admin/usuarias')}
            >
              {t('back')}
            </Button>
            {user.status !== 'deleted' && (
              <Button
                variant={user.status === 'enabled' ? 'danger' : 'primary'}
                onClick={() => {
                  setResult(null);
                  setConfirmOpen(true);
                }}
              >
                {user.status === 'enabled'
                  ? t('disableAccount')
                  : t('enableAccount')}
              </Button>
            )}
          </>
        }
      />
      {result === 'success' && (
        <Notice kind="success">{t('accountChanged')}</Notice>
      )}
      {result === 'notAllowed' && (
        <Notice kind="warning">{t('disableNotAllowed')}</Notice>
      )}
      <section className="user-profile-card panel-card">
        <div className="user-profile-card__identity">
          <span className="avatar avatar--xl">
            {user.firstName[0]}
            {user.lastName[0]}
          </span>
          <div>
            <h2>
              {user.firstName} {user.lastName}
            </h2>
            <StatusBadge status={user.status} />
          </div>
        </div>
        <dl>
          <div>
            <dt>{t('email')}</dt>
            <dd>
              <Icon
                name="mail"
                size={17}
              />
              {user.email}
            </dd>
          </div>
          <div>
            <dt>{t('phone')}</dt>
            <dd>
              <Icon
                name="phone"
                size={17}
              />
              {user.phone}
            </dd>
          </div>
          <div>
            <dt>{t('registrationDate')}</dt>
            <dd>{formatDate(user.registeredAt, language)}</dd>
          </div>
          <div>
            <dt>{t('lastActivity')}</dt>
            <dd>{formatDateTime(user.lastActivityAt, language)}</dd>
          </div>
        </dl>
      </section>
      <section className="panel-card">
        <header className="panel-card__header">
          <div>
            <p className="eyebrow">{t('alerts')}</p>
            <h2>{t('recentAlerts')}</h2>
          </div>
        </header>
        {userAlerts.length === 0 ? (
          <StatePanel
            kind="empty"
            message={t('noAlerts')}
          />
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>{t('status')}</th>
                  <th>{t('startDate')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {userAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <StatusBadge status={alert.status} />
                    </td>
                    <td>
                      <strong>{alert.id}</strong>
                      <span className="cell-meta">
                        {formatDateTime(alert.startedAt, language)}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        icon="eye"
                        onClick={() => navigate(`/admin/alertas/${alert.id}`)}
                      >
                        {t('viewDetail')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!busy) setConfirmOpen(false);
        }}
        title={t('accountChangeTitle')}
        description={
          user.status === 'enabled' ? t('disableAccount') : t('enableAccount')
        }
      >
        <div className="status-transition">
          <StatusBadge status={user.status} />
          <Icon name="chevronRight" />
          <StatusBadge
            status={user.status === 'enabled' ? 'disabled' : 'enabled'}
          />
        </div>
        <div className="modal__actions">
          <Button
            variant="secondary"
            onClick={() => setConfirmOpen(false)}
            disabled={busy}
          >
            {t('cancel')}
          </Button>
          <Button
            variant={user.status === 'enabled' ? 'danger' : 'primary'}
            onClick={confirmChange}
            disabled={busy}
          >
            {busy ? t('processing') : t('confirm')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
