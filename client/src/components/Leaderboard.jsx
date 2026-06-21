import { useLocale } from '../context/LocaleContext.jsx';

export default function Leaderboard({ leaderboard }) {
  const { t } = useLocale();

  return (
    <section className="panel">
      <h2>{t('leaderboard.title')}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>{t('leaderboard.team')}</th>
              <th>{t('leaderboard.score')}</th>
              <th>{t('leaderboard.projects')}</th>
              <th>{t('leaderboard.members')}</th>
            </tr>
          </thead>
          <tbody>
            {(leaderboard || []).map((row) => (
              <tr key={row.id}>
                <td>{row.rank}</td>
                <td>{row.teamName}</td>
                <td>{row.score}</td>
                <td>{row.projectsCount}</td>
                <td>{row.membersCount}</td>
              </tr>
            ))}
            {!leaderboard?.length && (
              <tr>
                <td colSpan={5} className="muted">
                  {t('leaderboard.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
