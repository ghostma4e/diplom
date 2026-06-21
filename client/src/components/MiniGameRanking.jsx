import { useLocale } from '../context/LocaleContext.jsx';
import { formatBest, getAllBests, getOverallRanking } from '../utils/gameScores.js';

export default function MiniGameRanking({ playerName }) {
  const { t } = useLocale();
  const bests = getAllBests();
  const ranking = getOverallRanking();

  const myRow = ranking.find((r) => r.name === playerName);

  return (
    <section className="panel minigame-ranking">
      <h2>{t('games.overallRanking')}</h2>
      <p className="ranking-hint">{t('games.rankingHint')}</p>

      <div className="ranking-bests">
        {['snake', 'memory', 'reaction'].map((game) => (
          <div key={game} className="ranking-best-item">
            <span className="ranking-game-label">{t(`games.${game}.name`)}</span>
            <strong>{formatBest(game, bests[game], t)}</strong>
          </div>
        ))}
        {myRow && (
          <div className="ranking-best-item total">
            <span className="ranking-game-label">{t('games.totalPoints')}</span>
            <strong>{myRow.total}</strong>
          </div>
        )}
      </div>

      <div className="table-wrap">
        <table className="ranking-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('games.player')}</th>
              <th>{t('games.snake.name')}</th>
              <th>{t('games.memory.name')}</th>
              <th>{t('games.reaction.name')}</th>
              <th>{t('games.totalPoints')}</th>
            </tr>
          </thead>
          <tbody>
            {ranking.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  {t('games.rankingEmpty')}
                </td>
              </tr>
            )}
            {ranking.map((row, i) => (
              <tr key={row.name} className={row.name === playerName ? 'highlight-row' : ''}>
                <td>{i + 1}</td>
                <td>{row.name}</td>
                <td>{row.snake ?? '—'}</td>
                <td>{row.memory ?? '—'}</td>
                <td>{row.reaction != null ? `${row.reaction} ms` : '—'}</td>
                <td>
                  <strong>{row.total}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
