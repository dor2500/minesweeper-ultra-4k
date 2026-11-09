import React from 'react';

export default function AboutModal({ onClose }) {
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
          width: 280,
          boxShadow: '2px 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        <div className="title-bar">
          <div className="title-bar-text">About Minesweeper XP Enhanced</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body" style={{ margin: 12, fontSize: 11, lineHeight: 1.4 }}>
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: 14 }}>Minesweeper XP Pro</h3>
            <p style={{ margin: 0, color: '#555' }}>Enhanced Edition 2026</p>
          </div>

          <div style={{ background: '#fff', border: '1px solid #999', padding: 8, marginBottom: 12, maxHeight: 130, overflowY: 'auto' }}>
            <b style={{ display: 'block', marginBottom: 4 }}>Enhanced Features:</b>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li>🔊 <b>Synthesized Sound System:</b> Clicks, flags, explosions & victory fanfares!</li>
              <li>🧠 <b>Smart AI Solver (H):</b> Suggests 100% safe moves or highlights mines.</li>
              <li>⚡ <b>X-Ray Radar (X):</b> Peek at hidden mines.</li>
              <li>🛡️ <b>Undo / Second Chance (Ctrl+Z):</b> Save yourself from accidental clicks!</li>
              <li>📐 <b>Custom Board Dimensions:</b> Play any board size.</li>
              <li>🏆 <b>High Scores & Stats:</b> Best times and win streaks saved.</li>
              <li>🎯 <b>Guaranteed Clean First Click:</b> Never start on an isolated number again.</li>
              <li>🌓 <b>Themes:</b> XP Luna, Win 98, Win 3.1 & Royale Noir.</li>
            </ul>
          </div>

          <p style={{ margin: '0 0 10px 0', fontSize: 10, color: '#777', textAlign: 'center' }}>
            Based on Minesweeper XP by Akshay Kalose.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="button" onClick={onClose} style={{ minWidth: 75, height: 23 }}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

