import { useLocale } from '../context/LocaleContext.jsx';

export default function LanguageSwitcher() {
  const { locale, setLocale, langs } = useLocale();

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      {langs.map((lang) => (
        <button
          key={lang.code}
          type="button"
          className={`lang-btn ${locale === lang.code ? 'active' : ''}`}
          onClick={() => setLocale(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
