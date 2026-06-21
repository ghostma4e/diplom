import Leaderboard from '../components/Leaderboard.jsx';
import StatsCards from '../components/StatsCards.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function RatingsPage({ stats, leaderboard }) {
  const { t } = useLocale();

  return (
    <div className="page">
      <header className="page-header">
        <h1>{t('ratings.title')}</h1>
        <p>{t('ratings.subtitle')}</p>
      </header>
      <StatsCards stats={stats} />
      <Leaderboard leaderboard={leaderboard} />
    </div>
  );
}
