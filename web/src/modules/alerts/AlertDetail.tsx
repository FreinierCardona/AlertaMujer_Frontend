// Reúne seguimiento, atención, mapa, fotografías y conversación de una alerta seleccionada.
import { useMemo, useState, type FormEvent } from 'react';
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
import { coordinates, formatDateTime } from '../../shared/utils/format';

export function AlertDetail({ alertId }: { alertId: string }) {
  const { t, language } = usePreferences();
  const { alerts, startAttention, sendMessage, retryMessage } = useWebState();
  const { navigate, search } = useNavigation();
  const alert = alerts.find((item) => item.id === alertId);
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const [attentionOpen, setAttentionOpen] = useState(false);
  const [attentionBusy, setAttentionBusy] = useState(false);
  const [attentionResult, setAttentionResult] = useState<
    'success' | 'conflict' | 'error' | null
  >(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);

  if (!alert)
    return (
      <>
        <PageHeader
          title={t('alertDetail')}
          actions={
            <Button
              variant="secondary"
              icon="arrowLeft"
              onClick={() => navigate('/admin/alertas')}
            >
              {t('back')}
            </Button>
          }
        />
        <StatePanel
          kind="error"
          title={t('error')}
          message={t('alertsError')}
        />
      </>
    );

  const confirmAttention = async () => {
    setAttentionBusy(true);
    const result = await startAttention(alert.id);
    setAttentionBusy(false);
    setAttentionOpen(false);
    setAttentionResult(result);
  };

  const submitMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    setSendError(false);
    if (params.get('send') === 'error') {
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      setSending(false);
      setSendError(true);
      return;
    }
    const result = await sendMessage(alert.id, message);
    setSending(false);
    if (result === 'success') setMessage('');
    else setSendError(true);
  };

  const evidenceState = params.get('evidence');
  const chatState = params.get('chat');
  const visibleEvidence = evidenceState === 'empty' ? [] : alert.evidence;
  const chatClosed = alert.status === 'finished';
  const chatOffline = alert.status === 'offline' || chatState === 'offline';
  const messages = chatState === 'empty' ? [] : alert.messages;
  const selectedEvidence =
    viewerIndex !== null ? visibleEvidence[viewerIndex] : null;

  return (
    <div className="alert-detail-page">
      <PageHeader
        eyebrow={alert.id}
        title={t('alertDetail')}
        description={`${t('startDate')}: ${formatDateTime(alert.startedAt, language)}`}
        actions={
          <>
            <Button
              variant="secondary"
              icon="arrowLeft"
              onClick={() => navigate('/admin/alertas')}
            >
              {t('back')}
            </Button>
            {alert.status === 'active' && (
              <Button
                icon="spark"
                onClick={() => {
                  setAttentionResult(null);
                  setAttentionOpen(true);
                }}
              >
                {t('startAttention')}
              </Button>
            )}
          </>
        }
      />
      <div className="detail-status-row">
        <StatusBadge status={alert.status} />
        <span>
          {t('lastUpdate')}: {formatDateTime(alert.updatedAt, language)}
        </span>
      </div>
      {attentionResult === 'success' && (
        <Notice kind="success">{t('attentionStarted')}</Notice>
      )}
      {attentionResult === 'conflict' && (
        <Notice kind="warning">
          <strong>{t('conflictTitle')}</strong>
          <p>{t('conflictText')}</p>
        </Notice>
      )}
      {attentionResult === 'error' && (
        <Notice kind="error">{t('serviceError')}</Notice>
      )}

      <section className="detail-grid detail-grid--identity">
        <article className="panel-card detail-card">
          <header>
            <span className="card-icon">
              <Icon name="user" />
            </span>
            <h2>{t('userInformation')}</h2>
          </header>
          <div className="identity-block">
            <span className="avatar avatar--large">
              {alert.userName
                .split(' ')
                .slice(0, 2)
                .map((part) => part[0])
                .join('')}
            </span>
            <div>
              <h3>{alert.userName}</h3>
              <p>
                <Icon
                  name="mail"
                  size={16}
                />
                {alert.userEmail}
              </p>
              <p>
                <Icon
                  name="phone"
                  size={16}
                />
                {alert.userPhone}
              </p>
            </div>
          </div>
        </article>
        <article className="panel-card detail-card message-card">
          <header>
            <span className="card-icon">
              <Icon name="chat" />
            </span>
            <h2>{t('originalMessage')}</h2>
          </header>
          <blockquote>“{alert.message}”</blockquote>
        </article>
      </section>

      <section className="panel-card location-card">
        <header className="panel-card__header">
          <div>
            <p className="eyebrow">{t('location')}</p>
            <h2>{t('confirmedLocation')}</h2>
            <p>
              {alert.locationLabel} ·{' '}
              {coordinates(alert.latitude, alert.longitude)}
            </p>
          </div>
          <a
            className="button button--secondary"
            href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            <Icon
              name="mapPin"
              size={18}
            />
            <span>{t('openMaps')}</span>
          </a>
        </header>
        {params.get('map') === 'error' ? (
          <StatePanel
            kind="error"
            message={t('mapUnavailable')}
          />
        ) : (
          <div
            className="map-visual"
            role="img"
            aria-label={`${t('confirmedLocation')}: ${alert.locationLabel}`}
          >
            <span className="map-road map-road--one" />
            <span className="map-road map-road--two" />
            <span className="map-road map-road--three" />
            <div className="map-pin">
              <Icon
                name="mapPin"
                size={31}
              />
              <span>{alert.locationLabel}</span>
            </div>
          </div>
        )}
      </section>

      <div className="detail-grid detail-grid--context">
        <section className="panel-card evidence-card">
          <header className="panel-card__header">
            <div>
              <p className="eyebrow">{t('photoEvidence')}</p>
              <h2>{t('evidence')}</h2>
            </div>
            <span className="count-chip">{visibleEvidence.length}</span>
          </header>
          {evidenceState === 'loading' && (
            <StatePanel
              kind="loading"
              message={t('loading')}
            />
          )}
          {evidenceState === 'denied' && (
            <StatePanel
              kind="denied"
              message={t('evidenceDenied')}
            />
          )}
          {evidenceState !== 'loading' &&
            evidenceState !== 'denied' &&
            visibleEvidence.length === 0 && (
              <StatePanel
                kind="empty"
                message={t('noEvidence')}
              />
            )}
          {evidenceState !== 'loading' &&
            evidenceState !== 'denied' &&
            visibleEvidence.length > 0 && (
              <div className="evidence-grid">
                {visibleEvidence.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className="evidence-thumb"
                    onClick={() => setViewerIndex(index)}
                  >
                    <span className="evidence-thumb__image">
                      {failedImages.includes(item.id) ||
                      evidenceState === 'error' ? (
                        <span className="image-fallback">
                          <Icon name="error" />
                          {t('imageUnavailable')}
                        </span>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.alt}
                          onError={() =>
                            setFailedImages((current) => [...current, item.id])
                          }
                        />
                      )}
                    </span>
                    <span>
                      {t('photo')} {index + 1}
                      <small>{formatDateTime(item.capturedAt, language)}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
        </section>

        <section className="panel-card chat-card">
          <header className="panel-card__header">
            <div>
              <p className="eyebrow">{alert.id}</p>
              <h2>{t('conversation')}</h2>
            </div>
            <span
              className={`connection-chip ${chatOffline ? 'is-offline' : ''}`}
            >
              <span />
              {chatClosed
                ? t('closedChat')
                : chatState === 'connecting'
                  ? t('connecting')
                  : chatOffline
                    ? t('disconnected')
                    : t('connected')}
            </span>
          </header>
          <div
            className="messages"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <StatePanel
                kind="empty"
                message={t('noMessages')}
              />
            ) : (
              messages.map((item) => (
                <article
                  key={item.id}
                  className={`message message--${item.author}`}
                >
                  <header>
                    <strong>{item.authorName}</strong>
                    <time>{formatDateTime(item.sentAt, language)}</time>
                  </header>
                  <p>{item.body}</p>
                  {item.delivery === 'failed' && (
                    <Button
                      variant="ghost"
                      onClick={() => retryMessage(alert.id, item.id)}
                    >
                      {t('retrySend')}
                    </Button>
                  )}
                </article>
              ))
            )}
          </div>
          {sendError && <Notice kind="error">{t('sendFailed')}</Notice>}
          {!chatClosed && (
            <form
              className="chat-compose"
              onSubmit={submitMessage}
            >
              <label
                className="sr-only"
                htmlFor="chat-message"
              >
                {t('messagePlaceholder')}
              </label>
              <textarea
                id="chat-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t('messagePlaceholder')}
                disabled={chatOffline || sending}
                rows={2}
              />
              <Button
                type="submit"
                icon="send"
                disabled={chatOffline || sending || !message.trim()}
              >
                {sending ? t('sending') : t('send')}
              </Button>
            </form>
          )}
        </section>
      </div>

      <Modal
        open={attentionOpen}
        title={t('startAttentionTitle')}
        description={t('startAttentionText')}
        onClose={() => {
          if (!attentionBusy) setAttentionOpen(false);
        }}
      >
        <div className="status-transition">
          <StatusBadge status="active" />
          <Icon name="chevronRight" />
          <StatusBadge status="inProgress" />
        </div>
        <div className="modal__actions">
          <Button
            variant="secondary"
            onClick={() => setAttentionOpen(false)}
            disabled={attentionBusy}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={confirmAttention}
            disabled={attentionBusy}
          >
            {attentionBusy ? t('processing') : t('confirm')}
          </Button>
        </div>
      </Modal>

      <Modal
        open={viewerIndex !== null}
        title={
          selectedEvidence ? `${t('photo')} ${viewerIndex! + 1}` : t('evidence')
        }
        description={
          selectedEvidence
            ? formatDateTime(selectedEvidence.capturedAt, language)
            : undefined
        }
        onClose={() => setViewerIndex(null)}
        size="viewer"
      >
        {selectedEvidence && (
          <div className="evidence-viewer">
            {failedImages.includes(selectedEvidence.id) ? (
              <StatePanel
                kind="error"
                message={t('imageUnavailable')}
              />
            ) : (
              <img
                src={selectedEvidence.url}
                alt={selectedEvidence.alt}
                onError={() =>
                  setFailedImages((current) => [
                    ...current,
                    selectedEvidence.id,
                  ])
                }
              />
            )}
            <div className="viewer-controls">
              <Button
                variant="secondary"
                icon="chevronLeft"
                disabled={viewerIndex === 0}
                onClick={() =>
                  setViewerIndex((current) =>
                    current === null ? null : current - 1,
                  )
                }
              >
                {t('previousPhoto')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setViewerIndex(null)}
              >
                {t('closeViewer')}
              </Button>
              <Button
                variant="secondary"
                icon="chevronRight"
                disabled={viewerIndex === visibleEvidence.length - 1}
                onClick={() =>
                  setViewerIndex((current) =>
                    current === null ? null : current + 1,
                  )
                }
              >
                {t('nextPhoto')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
