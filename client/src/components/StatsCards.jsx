import { useLocale } from '../context/LocaleContext.jsx';

export default function StatsCards({ stats }) {
  const { t } = useLocale();

  const items = [
    { label: t('stats.participants'), value: stats?.participantsCount ?? 0 },
    { label: t('stats.users'), value: stats?.usersCount ?? 0 },
    { label: t('stats.teams'), value: stats?.teamsCount ?? 0 },
    { label: t('stats.projects'), value: stats?.projectsCount ?? 0 },
  ];

  return (
    <section className="stats-grid">
      {items.map((item) => (
        <article key={item.label} className="stat-card">
          <span className="stat-value">{item.value}</span>
          <span className="stat-label">{item.label}</span>
        </article>
      ))}
    </section>
  );
}
