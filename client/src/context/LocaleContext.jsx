import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { translate, LANGS } from '../i18n/translations.js';

const LocaleContext = createContext(null);
const STORAGE_KEY = 'hackathon-locale';

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return LANGS.some((l) => l.code === saved) ? saved : 'ru';
  });

  const setLocale = useCallback((code) => {
    setLocaleState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = translate(locale, 'app.title');
  }, [locale]);

  const t = useCallback((key, vars) => translate(locale, key, vars), [locale]);

  const value = useMemo(() => ({ locale, setLocale, t, langs: LANGS }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
