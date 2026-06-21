const STORAGE_KEY = 'hackathon-minigame-records';

const HIGHER_BETTER = new Set(['snake']);
const LOWER_BETTER = new Set(['memory', 'reaction']);

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function isBetter(game, next, prev) {
  if (prev === null || prev === undefined) return true;
  if (HIGHER_BETTER.has(game)) return next > prev;
  if (LOWER_BETTER.has(game)) return next < prev;
  return false;
}

export function getBest(game) {
  return readStore().bests?.[game] ?? null;
}

export function getAllBests() {
  return readStore().bests ?? {};
}

export function getOverallRanking() {
  const store = readStore();
  const players = store.players ?? {};
  return Object.values(players)
    .map((p) => ({ ...p, total: calcTotal(p) }))
    .sort((a, b) => b.total - a.total);
}

export function calcTotal(stats) {
  const snakePts = stats.snake ?? 0;
  const memoryPts = stats.memory != null ? Math.max(0, (24 - stats.memory) * 15) : 0;
  const reactionPts =
    stats.reaction != null ? Math.max(0, Math.round((600 - stats.reaction) / 2)) : 0;
  return snakePts + memoryPts + reactionPts;
}

export function saveScore(game, value, playerName = 'Guest') {
  if (value === null || value === undefined || Number.isNaN(value)) return null;

  const store = readStore();
  store.bests = store.bests ?? {};
  store.players = store.players ?? {};

  const currentBest = store.bests[game];
  if (!currentBest || isBetter(game, value, currentBest.value)) {
    store.bests[game] = {
      value,
      playerName,
      updatedAt: new Date().toISOString(),
    };
  }

  const key = playerName.trim() || 'Guest';
  const player = store.players[key] ?? { name: key, snake: null, memory: null, reaction: null };
  const prevVal = player[game];
  if (prevVal === null || prevVal === undefined || isBetter(game, value, prevVal)) {
    player[game] = value;
  }
  store.players[key] = player;

  writeStore(store);
  return store.bests[game];
}

export function formatBest(game, record, t) {
  if (!record) return t('games.noRecord');
  if (game === 'reaction') return `${record.value} ms`;
  if (game === 'memory') return `${record.value} ${t('games.memory.movesShort')}`;
  return String(record.value);
}
