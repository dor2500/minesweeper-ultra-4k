import React from 'react';

export default function ArcadeBar({
  shields,
  droneScans,
  onUseDrone,
  onHint,
  onUndo,
  canUndo,
  onToggleFullscreen,
  isFullscreen,
  safeRemaining,
  totalSafe,
  scale,
  onScaleChange,
}) {
  const percentCleared = totalSafe > 0 ? Math.round(((totalSafe - safeRemaining) / totalSafe) * 100) : 0;

  return (
    <div className="arcade-action-bar">
      {/* Power-ups */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          type="button"
          className="arcade-btn"
          title="Shield absorbs accidental mine hits (automatic)"
          style={{
            borderColor: shields > 0 ? '#38bdf8' : '#64748b',
            color: shields > 0 ? '#38bdf8' : '#94a3b8',
          }}
        >
          🛡️ Shield: <b>{shields}</b>
        </button>

        <button
          type="button"
          className="arcade-btn"
          onClick={onUseDrone}
          disabled={droneScans <= 0}
          title="Sonar Drone reveals safe tiles in 3x3 zone"
          style={{
            borderColor: droneScans > 0 ? '#4ade80' : '#64748b',
            color: droneScans > 0 ? '#4ade80' : '#94a3b8',
          }}
        >
          📡 Drone: <b>{droneScans}</b>
        </button>

        <button
          type="button"
          className="arcade-btn"
          onClick={onHint}
          title="Smart AI Hint (H)"
          style={{ borderColor: '#facc15', color: '#facc15' }}
        >
          💡 Hint
        </button>

        {canUndo && (
          <button
            type="button"
            className="arcade-btn"
            onClick={onUndo}
            title="Undo Move (Ctrl+Z)"
            style={{ borderColor: '#f43f5e', color: '#f43f5e' }}
          >
            ↩️ Undo
          </button>
        )}
      </div>

      {/* Progress & 4K Zoom */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
          {percentCleared}%
          <div
            style={{
              width: 50,
              height: 4,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              overflow: 'hidden',
              marginTop: 2,
            }}
          >
            <div
              style={{
                width: `${percentCleared}%`,
                height: '100%',
                backgroundColor: percentCleared === 100 ? '#4ade80' : '#00e5ff',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        <button
          type="button"
          className="arcade-btn"
          onClick={onToggleFullscreen}
          title="Toggle Fullscreen (F11)"
        >
          {isFullscreen ? '🗗' : '⛶'} 4K
        </button>
      </div>
    </div>
  );
}

