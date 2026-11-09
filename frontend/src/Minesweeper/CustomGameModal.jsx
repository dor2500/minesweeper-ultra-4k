import React, { useState } from 'react';

export default function CustomGameModal({ initialConfig, onConfirm, onCancel }) {
  const [rows, setRows] = useState(initialConfig.rows || 16);
  const [columns, setColumns] = useState(initialConfig.columns || 30);
  const [mines, setMines] = useState(initialConfig.mines || 99);

  function handleConfirm(e) {
    e.preventDefault();
    const r = Math.max(8, Math.min(30, parseInt(rows, 10) || 9));
    const c = Math.max(8, Math.min(36, parseInt(columns, 10) || 9));
    const maxMines = Math.floor(r * c * 0.85);
    const m = Math.max(1, Math.min(maxMines, parseInt(mines, 10) || 10));

    onConfirm({ rows: r, columns: c, mines: m, ceils: r * c });
  }

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
          width: 220,
          boxShadow: '2px 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        <div className="title-bar">
          <div className="title-bar-text">Custom Field</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onCancel} />
          </div>
        </div>
        <form onSubmit={handleConfirm} className="window-body" style={{ margin: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Height (8-30):</label>
              <input
                type="number"
                min="8"
                max="30"
                value={rows}
                onChange={e => setRows(e.target.value)}
                style={{ width: 55, textAlign: 'center' }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Width (8-36):</label>
              <input
                type="number"
                min="8"
                max="36"
                value={columns}
                onChange={e => setColumns(e.target.value)}
                style={{ width: 55, textAlign: 'center' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Mines:</label>
              <input
                type="number"
                min="1"
                max={Math.floor(rows * columns * 0.85) || 99}
                value={mines}
                onChange={e => setMines(e.target.value)}
                style={{ width: 55, textAlign: 'center' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            <button type="submit" style={{ minWidth: 65, height: 23 }}>
              OK
            </button>
            <button type="button" onClick={onCancel} style={{ minWidth: 65, height: 23 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

