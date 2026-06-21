import StatsCards from '../components/StatsCards.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function HomePage({ stats, leaderboard }) {
  const { t } = useLocale();

  return (
    <div className="page home-page">
      <header className="page-hero">
        <p className="eyebrow">{t('home.eyebrow')}</p>
        <h1>{t('home.title')}</h1>
        <p className="hero-text">{t('home.hero')}</p>
      </header>

      <StatsCards stats={stats} />

      <section className="home-grid">
        <article className="info-card">
          <h3>{t('home.howItWorks')}</h3>
          <ol>
            <li>{t('home.step1')}</li>
            <li>{t('home.step2')}</li>
            <li>{t('home.step3')}</li>
            <li>{t('home.step4')}</li>
          </ol>
        </article>

        <article className="info-card highlight">
          <h3>{t('home.liveNow')}</h3>
          <p className="live-dot">{t('badge.live')}</p>
          <p>{t('home.liveText')}</p>
        </article>
      </section>

      <Leaderboard leaderboard={leaderboard?.slice(0, 5)} />
    </div>
  );
}
