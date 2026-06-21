import { useLocale } from '../context/LocaleContext.jsx';

export default function GuestBanner({ onLogin }) {
  const { t } = useLocale();

  return (
    <div className="guest-banner">
      <p>{t('guest.text')}</p>
      <button type="button" className="btn-primary" onClick={onLogin}>
        {t('auth.login')}
      </button>
    </div>
  );
}
