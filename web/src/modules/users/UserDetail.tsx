// Obtiene y modifica el perfil administrativo sin reconstruir datos no expuestos por la API.
import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '../../app/navigation';
import { adminUsersApi, type AdminUser, type RemoteAccountStatus } from '../../shared/api/adminUsersApi';
import { ApiError } from '../../shared/api/client';
import { usePreferences } from '../../shared/preferences/PreferencesContext';
import { Button, Modal, Notice, PageHeader, StatePanel, StatusBadge } from '../../shared/ui/components';
import { Icon } from '../../shared/ui/Icon';

const accountStatus = (status: AdminUser['accountStatus']) => status === 'ENABLED' ? 'enabled' as const : 'disabled' as const;

function restrictionMessage(error: ApiError) {
  if (error.status === 403) return 'No tienes autorización para cambiar esta cuenta.';
  if (error.status === 409 || error.status === 422) return error.message || 'La cuenta no cumple las condiciones requeridas por el Backend.';
  return error.message || 'No fue posible completar la operación.';
}

export function UserDetail({ userId }: { userId: string }) {
  const { t } = usePreferences();
  const { navigate } = useNavigation();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deletionOpen, setDeletionOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setUser(await adminUsersApi.get(userId)); }
    catch (cause) { setUser(null); setError(cause instanceof ApiError ? cause : new ApiError(t('usersError'), 'UNKNOWN')); }
    finally { setLoading(false); }
  }, [t, userId]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const changeStatus = async () => {
    if (!user) return;
    setBusy(true); setNotice(null);
    const nextStatus: RemoteAccountStatus = user.accountStatus === 'ENABLED' ? 'DISABLED' : 'ENABLED';
    try {
      setUser(await adminUsersApi.changeStatus(user.userId, nextStatus));
      setStatusOpen(false);
      setNotice({ kind: 'success', text: 'El estado mostrado corresponde a la respuesta confirmada por el Backend.' });
    } catch (cause) {
      setNotice({ kind: 'error', text: restrictionMessage(cause instanceof ApiError ? cause : new ApiError('', 'UNKNOWN')) });
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!user) return;
    setBusy(true); setNotice(null);
    try {
      await adminUsersApi.remove(user.userId);
      setDeletionOpen(false);
      navigate('/admin/usuarias', { replace: true });
    } catch (cause) {
      setNotice({ kind: 'error', text: restrictionMessage(cause instanceof ApiError ? cause : new ApiError('', 'UNKNOWN')) });
      setDeletionOpen(false);
    } finally { setBusy(false); }
  };

  const back = <Button variant="secondary" icon="arrowLeft" onClick={() => navigate('/admin/usuarias')}>{t('back')}</Button>;

  if (loading) return <><PageHeader title={t('userDetail')} actions={back} /><StatePanel kind="loading" message={t('loading')} /></>;
  if (error?.status === 403) return <><PageHeader title={t('userDetail')} actions={back} /><StatePanel kind="denied" title={t('accessDenied')} message={t('accessDeniedText')} /></>;
  if (!user) return <><PageHeader title={t('userDetail')} actions={back} /><StatePanel kind="error" message={error?.message || t('usersError')} action={<Button icon="refresh" onClick={() => void load()}>{t('retry')}</Button>} /></>;

  const targetIsUser = user.role === 'USER';
  const canDelete = targetIsUser && user.accountStatus === 'DISABLED';
  const actionLabel = user.accountStatus === 'ENABLED' ? t('disableAccount') : t('enableAccount');

  return (
    <div>
      <PageHeader
        eyebrow={user.username}
        title={t('userDetail')}
        actions={<>{back}{targetIsUser && <Button variant={user.accountStatus === 'ENABLED' ? 'danger' : 'primary'} onClick={() => { setNotice(null); setStatusOpen(true); }}>{actionLabel}</Button>}{canDelete && <Button variant="danger" onClick={() => { setNotice(null); setDeletionOpen(true); }}>Eliminar cuenta</Button>}</>}
      />
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      {!targetIsUser && <Notice kind="warning">Solo las cuentas con rol USER están dentro de la gestión de esta historia.</Notice>}
      <section className="user-profile-card panel-card">
        <div className="user-profile-card__identity">
          <span className="avatar avatar--xl">{user.firstNames[0]}{user.lastNames[0]}</span>
          <div><h2>{user.firstNames} {user.lastNames}</h2><StatusBadge status={accountStatus(user.accountStatus)} /></div>
        </div>
        <dl>
          <div><dt>Username</dt><dd>{user.username}</dd></div>
          <div><dt>{t('email')}</dt><dd><Icon name="mail" size={17} />{user.email}</dd></div>
          <div><dt>{t('phone')}</dt><dd><Icon name="phone" size={17} />{user.phone}</dd></div>
          <div><dt>Rol</dt><dd>{user.role}</dd></div>
          <div><dt>{t('status')}</dt><dd>{user.accountStatus}</dd></div>
        </dl>
      </section>
      <Notice kind="info">El detalle muestra solamente el perfil retornado. No se presentan ubicación ni historial de alertas porque no existe un endpoint autorizado para esos datos.</Notice>

      <Modal open={statusOpen} onClose={() => { if (!busy) setStatusOpen(false); }} title={t('accountChangeTitle')} description={`El Backend decidirá si puede cambiarse a ${user.accountStatus === 'ENABLED' ? 'DISABLED' : 'ENABLED'}.`}>
        <div className="modal__actions"><Button variant="secondary" onClick={() => setStatusOpen(false)} disabled={busy}>{t('cancel')}</Button><Button variant="danger" onClick={() => void changeStatus()} disabled={busy}>{busy ? t('processing') : t('confirm')}</Button></div>
      </Modal>
      <Modal open={deletionOpen} onClose={() => { if (!busy) setDeletionOpen(false); }} title="Confirmar eliminación" description="La eliminación es irreversible. El Backend validará la antigüedad de la inhabilitación y que no existan SOS abiertos.">
        <div className="modal__actions"><Button variant="secondary" onClick={() => setDeletionOpen(false)} disabled={busy}>{t('cancel')}</Button><Button variant="danger" onClick={() => void remove()} disabled={busy}>{busy ? t('processing') : t('confirm')}</Button></div>
      </Modal>
    </div>
  );
}
