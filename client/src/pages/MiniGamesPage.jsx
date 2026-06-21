import { useState } from 'react';
import { useLocale } from '../context/LocaleContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import SnakeGame from '../components/games/SnakeGame.jsx';
import MemoryGame from '../components/games/MemoryGame.jsx';
import ReactionGame from '../components/games/ReactionGame.jsx';
import MiniGameRanking from '../components/MiniGameRanking.jsx';
import { formatBest, getBest } from '../utils/gameScores.js';

const GAME_LIST = [
  { id: 'snake', nameKey: 'games.snake.name', descKey: 'games.snake.desc', badgeKey: 'badge.new' },
  { id: 'memory', nameKey: 'games.memory.name', descKey: 'games.memory.desc', badgeKey: 'badge.live' },
  { id: 'reaction', nameKey: 'games.reaction.name', descKey: 'games.reaction.desc', badgeKey: 'badge.new' },
];

const GAME_COMPONENTS = {
  snake: SnakeGame,
  memory: MemoryGame,
  reaction: ReactionGame,
};

export default function MiniGamesPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const playerName = user?.username ?? 'Guest';
  const [activeGame, setActiveGame] = useState(null);
  const [rankTick, setRankTick] = useState(0);

  const ActiveComponent = activeGame ? GAME_COMPONENTS[activeGame] : null;
  const onScoreSaved = () => setRankTick((n) => n + 1);

  return (
    <div className="page minigames-page">
      <header className="page-header">
        <h1>{t('minigames.title')}</h1>
        <p>{t('minigames.subtitle')}</p>
      </header>

      <MiniGameRanking key={rankTick} playerName={playerName} />

      {!activeGame ? (
        <div className="minigames-grid">
          {GAME_LIST.map((g) => {
            const best = getBest(g.id);
            return (
              <article key={g.id} className="minigame-card playable">
                <span className="nav-badge">{t(g.badgeKey)}</span>
                <h3>{t(g.nameKey)}</h3>
                <p>{t(g.descKey)}</p>
                <p className="card-best">
                  {t('games.bestRecord')}: <strong>{formatBest(g.id, best, t)}</strong>
                </p>
                <button type="button" className="btn-primary game-play-btn" onClick={() => setActiveGame(g.id)}>
                  {t('games.play')}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="game-stage">
          <button type="button" className="btn-outline back-btn" onClick={() => setActiveGame(null)}>
            ← {t('games.back')}
          </button>
          <h2 className="game-title">{t(GAME_LIST.find((g) => g.id === activeGame).nameKey)}</h2>
          {ActiveComponent && <ActiveComponent onScoreSaved={onScoreSaved} />}
        </div>
      )}
    </div>
  );
}
