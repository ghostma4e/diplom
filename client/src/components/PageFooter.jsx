import { useLocale } from '../context/LocaleContext.jsx';

export default function PageFooter() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="page-footer">
      <div className="footer-glow" aria-hidden="true" />
      <p>{t('footer.tagline')}</p>
      <p className="footer-kvptk">{t('footer.kvptk')}</p>
      <span className="footer-copy">Hackathon Panel · {year}</span>
    </footer>
  );
}
