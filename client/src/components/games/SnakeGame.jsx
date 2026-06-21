import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '../../context/LocaleContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatBest, getBest, saveScore } from '../../utils/gameScores.js';

const SIZE = 16;
const TICK = 140;

const KEY_MAP = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

export default function SnakeGame({ onScoreSaved }) {
  const { t } = useLocale();
  const { user } = useAuth();
  const playerName = user?.username ?? 'Guest';

  const [snake, setSnake] = useState([[8, 8]]);
  const [food, setFood] = useState([4, 4]);
  const [dir, setDir] = useState([1, 0]);
  const [score, setScore] = useState(0);
  const [alive, setAlive] = useState(true);
  const [bestRecord, setBestRecord] = useState(() => getBest('snake'));
  const dirRef = useRef(dir);
  const scoreRef = useRef(0);

  useEffect(() => {
    dirRef.current = dir;
  }, [dir]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const refreshBest = useCallback(() => {
    setBestRecord(getBest('snake'));
    onScoreSaved?.();
  }, [onScoreSaved]);

  const spawnFood = useCallback((body) => {
    let spot;
    do {
      spot = [Math.floor(Math.random() * SIZE), Math.floor(Math.random() * SIZE)];
    } while (body.some(([x, y]) => x === spot[0] && y === spot[1]));
    return spot;
  }, []);

  const reset = useCallback(() => {
    const start = [[8, 8]];
    setSnake(start);
    setFood(spawnFood(start));
    setDir([1, 0]);
    dirRef.current = [1, 0];
    setScore(0);
    scoreRef.current = 0;
    setAlive(true);
  }, [spawnFood]);

  useEffect(() => {
    if (alive) return undefined;

    const finalScore = scoreRef.current;
    if (finalScore > 0) {
      saveScore('snake', finalScore, playerName);
      refreshBest();
    }
  }, [alive, playerName, refreshBest]);

  useEffect(() => {
    if (!alive) return undefined;

    const id = setInterval(() => {
      setSnake((prev) => {
        const [dx, dy] = dirRef.current;
        const head = prev[0];
        const next = [head[0] + dx, head[1] + dy];

        if (
          next[0] < 0 ||
          next[0] >= SIZE ||
          next[1] < 0 ||
          next[1] >= SIZE ||
          prev.some(([x, y]) => x === next[0] && y === next[1])
        ) {
          setAlive(false);
          return prev;
        }

        const ate = next[0] === food[0] && next[1] === food[1];
        const body = [next, ...prev];
        if (!ate) body.pop();
        else {
          setScore((s) => {
            const nextScore = s + 10;
            scoreRef.current = nextScore;
            const updated = saveScore('snake', nextScore, playerName);
            if (updated) setBestRecord(updated);
            onScoreSaved?.();
            return nextScore;
          });
          setFood(spawnFood(body));
        }
        return body;
      });
    }, TICK);

    return () => clearInterval(id);
  }, [alive, food, spawnFood, playerName, onScoreSaved]);

  useEffect(() => {
    function onKey(e) {
      const next = KEY_MAP[e.key];
      if (!next) return;
      e.preventDefault();
      const [dx, dy] = dirRef.current;
      if (next[0] === -dx && next[1] === -dy) return;
      setDir(next);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function turn(next) {
    const [dx, dy] = dirRef.current;
    if (next[0] === -dx && next[1] === -dy) return;
    setDir(next);
  }

  const cells = [];
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const isHead = snake[0]?.[0] === x && snake[0]?.[1] === y;
      const isBody = snake.some(([sx, sy], i) => i > 0 && sx === x && sy === y);
      const isFood = food[0] === x && food[1] === y;
      let cls = 'snake-cell';
      if (isHead) cls += ' head';
      else if (isBody) cls += ' body';
      else if (isFood) cls += ' food';
      cells.push(<div key={`${x}-${y}`} className={cls} />);
    }
  }

  return (
    <div className="game-box">
      <div className="best-record-bar">
        <span>
          {t('games.bestRecord')}: <strong>{formatBest('snake', bestRecord, t)}</strong>
        </span>
      </div>
      <div className="game-hud">
        <span>
          {t('games.snake.score')}: <strong>{score}</strong>
        </span>
        {!alive && <span className="game-over-label">{t('games.snake.gameOver')}</span>}
        <button type="button" className="btn-outline game-btn" onClick={reset}>
          {t('games.restart')}
        </button>
      </div>
      <div className="snake-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {cells}
      </div>
      <p className="game-hint">{t('games.snake.controls')}</p>
      <div className="dpad">
        <button type="button" aria-label="up" onClick={() => turn([0, -1])}>
          ↑
        </button>
        <div className="dpad-row">
          <button type="button" aria-label="left" onClick={() => turn([-1, 0])}>
            ←
          </button>
          <button type="button" aria-label="down" onClick={() => turn([0, 1])}>
            ↓
          </button>
          <button type="button" aria-label="right" onClick={() => turn([1, 0])}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}
