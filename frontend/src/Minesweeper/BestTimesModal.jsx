import React, { useState } from 'react';
import { getStats, resetStats } from './scores';

export default function BestTimesModal({ onClose }) {
  const [stats, setStats] = useState(getStats());

  function handleReset() {
    setStats(resetStats());
  }

  const { bestTimes, gamesPlayed, gamesWon, currentStreak, bestStreak } = stats;
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="window active"
        style={{
          width: 250,
          boxShadow: '2px 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        <div className="title-bar">
          <div className="title-bar-text">Fastest Mine Sweepers</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body" style={{ margin: 10 }}>
          <div style={{ marginBottom: 12, fontSize: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #ccc' }}>
              <span><b>Beginner:</b></span>
              <span>{bestTimes.Beginner.time}s ({bestTimes.Beginner.name})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #ccc' }}>
              <span><b>Intermediate:</b></span>
              <span>{bestTimes.Intermediate.time}s ({bestTimes.Intermediate.name})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #ccc' }}>
              <span><b>Expert:</b></span>
              <span>{bestTimes.Expert.time}s ({bestTimes.Expert.name})</span>
            </div>
          </div>

          <div style={{ background: '#f5f5f5', padding: 6, borderRadius: 2, marginBottom: 12, fontSize: 11, border: '1px inset #ccc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Games Played:</span>
              <span>{gamesPlayed}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Games Won:</span>
              <span>{gamesWon} ({winRate}%)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Win Streak:</span>
              <span>{currentStreak} (Best: {bestStreak})</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" onClick={handleReset} style={{ minWidth: 85, height: 23 }}>
              Reset Scores
            </button>
            <button type="button" onClick={onClose} style={{ minWidth: 65, height: 23 }}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

