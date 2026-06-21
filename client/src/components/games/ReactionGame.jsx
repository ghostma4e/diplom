import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '../../context/LocaleContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatBest, getBest, saveScore } from '../../utils/gameScores.js';

const STATES = { idle: 'idle', wait: 'wait', ready: 'ready', early: 'early', result: 'result' };

export default function ReactionGame({ onScoreSaved }) {
  const { t } = useLocale();
  const { user } = useAuth();
  const playerName = user?.username ?? 'Guest';

  const [state, setState] = useState(STATES.idle);
  const [message, setMessage] = useState('');
  const [lastMs, setLastMs] = useState(null);
  const [bestRecord, setBestRecord] = useState(() => getBest('reaction'));
  const startRef = useRef(null);
  const timerRef = useRef(null);

  const refreshBest = useCallback(() => {
    setBestRecord(getBest('reaction'));
    onScoreSaved?.();
  }, [onScoreSaved]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function startRound() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState(STATES.wait);
    setMessage(t('games.reaction.wait'));
    setLastMs(null);
    const delay = 1200 + Math.random() * 2800;
    timerRef.current = setTimeout(() => {
      startRef.current = Date.now();
      setState(STATES.ready);
      setMessage(t('games.reaction.click'));
    }, delay);
  }

  function handleClick() {
    if (state === STATES.idle || state === STATES.early || state === STATES.result) {
      startRound();
      return;
    }
    if (state === STATES.wait) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState(STATES.early);
      setMessage(t('games.reaction.tooEarly'));
      return;
    }
    if (state === STATES.ready) {
      const ms = Date.now() - startRef.current;
      setLastMs(ms);
      saveScore('reaction', ms, playerName);
      refreshBest();
      setState(STATES.result);
      setMessage(t('games.reaction.result', { ms }));
    }
  }

  const zoneClass = [
    'reaction-zone',
    state === STATES.ready ? 'ready' : '',
    state === STATES.wait ? 'wait' : '',
    state === STATES.early ? 'early' : '',
    state === STATES.result ? 'result' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="game-box">
      <div className="best-record-bar">
        <span>
          {t('games.bestRecord')}: <strong>{formatBest('reaction', bestRecord, t)}</strong>
        </span>
      </div>
      <div className="game-hud">
        {lastMs !== null && state === STATES.result && (
          <span>
            {t('games.reaction.last')}: <strong>{lastMs} ms</strong>
          </span>
        )}
      </div>
      <button type="button" className={zoneClass} onClick={handleClick}>
        <span className="reaction-msg">{message || t('games.reaction.start')}</span>
      </button>
      <p className="game-hint">{t('games.reaction.hint')}</p>
    </div>
  );
}
