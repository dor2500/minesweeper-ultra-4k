import React, { useState } from 'react';

export default function NewRecordModal({ difficulty, seconds, onSave }) {
  const [name, setName] = useState('Player 1');

  function handleSubmit(e) {
    e.preventDefault();
    onSave(name.trim() || 'Anonymous');
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
          width: 250,
          boxShadow: '2px 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        <div className="title-bar">
          <div className="title-bar-text">New High Score!</div>
        </div>
        <form onSubmit={handleSubmit} className="window-body" style={{ margin: 12, fontSize: 11 }}>
          <p style={{ margin: '0 0 10px 0', textAlign: 'center' }}>
            🎉 You have the fastest time for <b>{difficulty}</b> level!
            <br />
            Time: <b>{seconds} seconds</b>
          </p>
          <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label>Please enter your name:</label>
            <input
              type="text"
              maxLength={20}
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="submit" style={{ minWidth: 70, height: 23 }}>
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

