// High Scores and Statistics Manager

const STORAGE_KEY = 'minesweeper_xp_stats';

const defaultStats = {
  bestTimes: {
    Beginner: { time: 999, name: 'Anonymous' },
    Intermediate: { time: 999, name: 'Anonymous' },
    Expert: { time: 999, name: 'Anonymous' },
  },
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  bestStreak: 0,
};

export function getStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultStats,
        ...parsed,
        bestTimes: { ...defaultStats.bestTimes, ...(parsed.bestTimes || {}) },
      };
    }
  } catch (e) {}
  return defaultStats;
}

export function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {}
}

export function recordGameResult(won, difficulty, seconds) {
  const stats = getStats();
  stats.gamesPlayed += 1;

  let isNewBestTime = false;
  if (won) {
    stats.gamesWon += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.bestStreak) {
      stats.bestStreak = stats.currentStreak;
    }

    if (stats.bestTimes[difficulty] && seconds < stats.bestTimes[difficulty].time) {
      isNewBestTime = true;
    }
  } else {
    stats.currentStreak = 0;
  }

  saveStats(stats);
  return { stats, isNewBestTime };
}

export function updateBestTime(difficulty, seconds, playerName) {
  const stats = getStats();
  stats.bestTimes[difficulty] = {
    time: seconds,
    name: playerName || 'Anonymous',
  };
  saveStats(stats);
  return stats;
}

export function resetStats() {
  saveStats(defaultStats);
  return defaultStats;
}

