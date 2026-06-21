import { useCallback, useEffect, useState } from 'react';
import { useLocale } from '../../context/LocaleContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatBest, getBest, saveScore } from '../../utils/gameScores.js';
import { LANG_ICONS } from '../../constants/langIcons.js';

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDeck() {
  const pairs = shuffle(LANG_ICONS).slice(0, 6);
  return shuffle(
    [...pairs, ...pairs].map((icon, id) => ({
      id,
      iconId: icon.id,
      src: icon.src,
      label: icon.label,
      key: `${icon.id}-${id}`,
    }))
  );
}

export default function MemoryGame({ onScoreSaved }) {
  const { t } = useLocale();
  const { user } = useAuth();
  const playerName = user?.username ?? 'Guest';

  const [cards, setCards] = useState(buildDeck);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [bestRecord, setBestRecord] = useState(() => getBest('memory'));

  const won = matched.length === cards.length;

  const refreshBest = useCallback(() => {
    setBestRecord(getBest('memory'));
    onScoreSaved?.();
  }, [onScoreSaved]);

  useEffect(() => {
    if (!won) return;
    saveScore('memory', moves, playerName);
    refreshBest();
  }, [won, moves, playerName, refreshBest]);

  useEffect(() => {
    if (flipped.length !== 2) return undefined;
    setLock(true);
    const [a, b] = flipped;
    const timer = setTimeout(() => {
      if (cards[a].iconId === cards[b].iconId) {
        setMatched((m) => [...m, a, b]);
      }
      setFlipped([]);
      setLock(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [flipped, cards]);

  function flip(index) {
    if (lock || won || flipped.includes(index) || matched.includes(index)) return;
    const next = [...flipped, index];
    setFlipped(next);
    if (next.length === 2) setMoves((m) => m + 1);
  }

  function reset() {
    setCards(buildDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setLock(false);
  }

  return (
    <div className="game-box">
      <div className="best-record-bar">
        <span>
          {t('games.bestRecord')}: <strong>{formatBest('memory', bestRecord, t)}</strong>
        </span>
      </div>
      <div className="game-hud">
        <span>
          {t('games.memory.moves')}: <strong>{moves}</strong>
        </span>
        {won && <span className="win-label">{t('games.memory.win')}</span>}
        <button type="button" className="btn-outline game-btn" onClick={reset}>
          {t('games.restart')}
        </button>
      </div>
      <div className="memory-grid">
        {cards.map((card, index) => {
          const open = flipped.includes(index) || matched.includes(index);
          return (
            <button
              key={card.key}
              type="button"
              className={`memory-card ${open ? 'open' : ''} ${matched.includes(index) ? 'matched' : ''}`}
              onClick={() => flip(index)}
            >
              <span className="memory-front">?</span>
              <span className="memory-back">
                <img src={card.src} alt={card.label} className="memory-lang-icon" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
