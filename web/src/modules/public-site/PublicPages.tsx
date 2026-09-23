// Presenta inicio, funciones, seguridad y disponibilidad de la aplicación Android.
import { Link, useNavigation } from '../../app/navigation';
import { usePreferences } from '../../shared/preferences/PreferencesContext';
import { Button, Notice, StatePanel } from '../../shared/ui/components';
import { Icon, type IconName } from '../../shared/ui/Icon';

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: IconName;
  title: string;
  text: string;
}) {
  return (
    <article className="feature-card">
      <span className="feature-card__icon">
        <Icon name={icon} />
      </span>
      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  );
}

const featureItems: {
  icon: IconName;
  title:
    | 'androidOnly'
    | 'location'
    | 'trustedContacts'
    | 'photoEvidence'
    | 'emergencyChat'
    | 'authorityCall';
  text:
    | 'androidOnlyText'
    | 'locationText'
    | 'contactsText'
    | 'evidenceText'
    | 'chatText'
    | 'authorityText';
}[] = [
  { icon: 'alert', title: 'androidOnly', text: 'androidOnlyText' },
  { icon: 'mapPin', title: 'location', text: 'locationText' },
  { icon: 'users', title: 'trustedContacts', text: 'contactsText' },
  { icon: 'camera', title: 'photoEvidence', text: 'evidenceText' },
  { icon: 'chat', title: 'emergencyChat', text: 'chatText' },
  { icon: 'phone', title: 'authorityCall', text: 'authorityText' },
];

const emergencyFlow: { icon: IconName; label: Parameters<ReturnType<typeof usePreferences>['t']>[0] }[] = [
  { icon: 'alert', label: 'flowActivate' },
  { icon: 'users', label: 'flowContacts' },
  { icon: 'shield', label: 'flowAdmin' },
  { icon: 'mapPin', label: 'flowLocation' },
  { icon: 'camera', label: 'flowEvidence' },
  { icon: 'chat', label: 'flowChat' },
  { icon: 'eye', label: 'flowResponse' },
  { icon: 'check', label: 'flowFinish' },
];

export function PublicHome() {
  const { t } = usePreferences();
  return (
    <>
      <section className="hero section-wrap">
        <div className="hero__content">
          <p className="eyebrow">{t('publicEyebrow')}</p>
          <h1>
            <span>{t('heroTitleA')}</span>
            <br />
            {t('heroTitleB')}
          </h1>
          <p className="hero__lead">{t('heroText')}</p>
          <div className="hero__actions">
            <Link
              to="/funciones"
              className="button button--primary"
            >
              <Icon
                name="spark"
                size={18}
              />
              <span>{t('exploreFeatures')}</span>
            </Link>
            <Link
              to="/descargar"
              className="button button--secondary"
            >
              <Icon
                name="download"
                size={18}
              />
              <span>{t('download')}</span>
            </Link>
          </div>
        </div>
        <div
          className="hero__visual"
          aria-hidden="true"
        >
          <div className="halo halo--one" />
          <div className="halo halo--two" />
          <div className="phone-mock">
            <div className="phone-mock__bar" />
            <div className="mini-map">
              <span className="mini-map__road mini-map__road--a" />
              <span className="mini-map__road mini-map__road--b" />
              <Icon
                name="mapPin"
                size={28}
              />
            </div>
            <div className="sos-orb">SOS</div>
            <div className="phone-mock__caption">
              <Icon
                name="shield"
                size={16}
              />{' '}
              AlertaMujer
            </div>
          </div>
          <div className="floating-card">
            <span>
              <Icon
                name="check"
                size={16}
              />
            </span>
            <div>
              <strong>{t('connected')}</strong>
              <small>{t('confirmedLocation')}</small>
            </div>
          </div>
        </div>
      </section>
      <section className="project-band">
        <div className="section-wrap project-band__grid">
          <div>
            <p className="eyebrow">ALERTAMUJER</p>
            <h2>{t('projectTitle')}</h2>
          </div>
          <p>{t('projectText')}</p>
        </div>
      </section>
      <section className="section-wrap emergency-flow" aria-labelledby="emergency-flow-title">
        <header className="section-heading emergency-flow__heading">
          <p className="eyebrow">{t('flowEyebrow')}</p>
          <h2 id="emergency-flow-title">{t('flowTitle')}</h2>
          <p>{t('flowIntro')}</p>
        </header>
        <div className="emergency-flow__journey">
          <ol className="emergency-flow__track">
            {emergencyFlow.map((step, index) => (
              <li
                className={`emergency-flow__step emergency-flow__step--${index + 1}`}
                key={step.label}
              >
                <span className="emergency-flow__number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="emergency-flow__icon" aria-hidden="true">
                  <Icon name={step.icon} size={24} />
                </span>
                <strong>{t(step.label)}</strong>
                {index < emergencyFlow.length - 1 && (
                  <span className="emergency-flow__arrow" aria-hidden="true">
                    <Icon name="chevronRight" size={18} />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="section-wrap home-features">
        <div className="section-heading">
          <p className="eyebrow">{t('features')}</p>
          <h2>{t('designedFor')}</h2>
        </div>
        <div className="feature-grid feature-grid--three">
          {featureItems.slice(0, 3).map((item) => (
            <FeatureCard
              key={item.title}
              icon={item.icon}
              title={t(item.title)}
              text={t(item.text)}
            />
          ))}
        </div>
      </section>
      <section className="section-wrap public-callout">
        <div>
          <p className="eyebrow">ANDROID</p>
          <h2>{t('downloadTitle')}</h2>
          <p>{t('downloadIntro')}</p>
        </div>
        <Link
          to="/descargar"
          className="button button--primary"
        >
          <Icon
            name="download"
            size={18}
          />
          <span>{t('download')}</span>
        </Link>
      </section>
    </>
  );
}

export function FeaturesPage() {
  const { t } = usePreferences();
  return (
    <section className="section-wrap inner-page">
      <header className="inner-hero">
        <p className="eyebrow">{t('features')}</p>
        <h1>{t('designedFor')}</h1>
        <p>{t('heroText')}</p>
      </header>
      <div className="feature-grid">
        {featureItems.map((item) => (
          <FeatureCard
            key={item.title}
            icon={item.icon}
            title={t(item.title)}
            text={t(item.text)}
          />
        ))}
      </div>
      <Notice kind="warning">
        <strong>{t('limitsTitle')}</strong>
        <p>{t('limitsText')}</p>
      </Notice>
      <div className="center-action">
        <Link
          to="/descargar"
          className="button button--primary"
        >
          <Icon
            name="download"
            size={18}
          />
          <span>{t('download')}</span>
        </Link>
      </div>
    </section>
  );
}

export function SecurityPage() {
  const { t } = usePreferences();
  const cards: {
    icon: IconName;
    title:
      | 'passwordSecurity'
      | 'roleSecurity'
      | 'secureTransport'
      | 'retention';
    text:
      | 'passwordSecurityText'
      | 'roleSecurityText'
      | 'secureTransportText'
      | 'retentionText';
  }[] = [
    { icon: 'lock', title: 'passwordSecurity', text: 'passwordSecurityText' },
    { icon: 'shield', title: 'roleSecurity', text: 'roleSecurityText' },
    { icon: 'spark', title: 'secureTransport', text: 'secureTransportText' },
    { icon: 'eye', title: 'retention', text: 'retentionText' },
  ];
  return (
    <section className="section-wrap inner-page">
      <header className="inner-hero inner-hero--split">
        <div>
          <p className="eyebrow">{t('securityEyebrow')}</p>
          <h1>{t('securityTitle')}</h1>
          <p>{t('securityIntro')}</p>
        </div>
        <div
          className="security-visual"
          aria-hidden="true"
        >
          <div className="security-shield">
            <Icon
              name="shield"
              size={86}
            />
            <span>
              <Icon
                name="lock"
                size={32}
              />
            </span>
          </div>
        </div>
      </header>
      <div className="feature-grid feature-grid--four">
        {cards.map((item) => (
          <FeatureCard
            key={item.title}
            icon={item.icon}
            title={t(item.title)}
            text={t(item.text)}
          />
        ))}
      </div>
      <Notice kind="warning">
        <strong>{t('privacyNotice')}</strong>
        <p>{t('privacyNoticeText')}</p>
      </Notice>
    </section>
  );
}

export function DownloadPage() {
  const { t } = usePreferences();
  const { search, navigate } = useNavigation();
  const requested = new URLSearchParams(search).get('state');
  const state =
    requested === 'available' ||
    requested === 'unavailable' ||
    requested === 'error'
      ? requested
      : 'preparing';

  const retry = () => navigate('/descargar?state=preparing', { replace: true });
  return (
    <section className="section-wrap inner-page download-page">
      <header className="inner-hero">
        <p className="eyebrow">{t('downloadEyebrow')}</p>
        <h1>{t('downloadTitle')}</h1>
        <p>{t('downloadIntro')}</p>
      </header>
      <div className="download-grid">
        <article className="apk-card">
          <div className="apk-card__brand">
            <img
              src="/logo-alertamujer.png"
              alt=""
            />
            <div>
              <strong>AlertaMujer Android</strong>
              <span className={`availability availability--${state}`}>
                <Icon
                  name={
                    state === 'available'
                      ? 'check'
                      : state === 'error'
                        ? 'error'
                        : 'info'
                  }
                  size={14}
                />
                {t(
                  state === 'available'
                    ? 'apkAvailable'
                    : state === 'unavailable'
                      ? 'apkUnavailable'
                      : state === 'error'
                        ? 'apkError'
                        : 'apkPreparing',
                )}
              </span>
            </div>
          </div>
          {state === 'available' && (
            <>
              <p>{t('apkAvailableText')}</p>
              <Button
                icon="download"
                disabled
                title={t('unavailable')}
              >
                {t('downloadNow')}
              </Button>
            </>
          )}
          {state === 'preparing' && (
            <StatePanel
              kind="loading"
              message={t('apkPreparingText')}
            />
          )}
          {state === 'unavailable' && (
            <StatePanel
              kind="empty"
              message={t('apkUnavailableText')}
            />
          )}
          {state === 'error' && (
            <StatePanel
              kind="error"
              message={t('apkErrorText')}
              action={
                <Button
                  variant="secondary"
                  icon="refresh"
                  onClick={retry}
                >
                  {t('checkAgain')}
                </Button>
              }
            />
          )}
        </article>
        <aside className="install-steps">
          <h2>{t('installTitle')}</h2>
          {[t('installOne'), t('installTwo'), t('installThree')].map(
            (step, index) => (
              <div key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ),
          )}
        </aside>
      </div>
    </section>
  );
}
