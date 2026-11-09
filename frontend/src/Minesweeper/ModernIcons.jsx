import React from 'react';

export const SvgFlag = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
    <path d="M4 22V2" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M4 3H18C19.5 3 20 4.5 19 6L17.5 8.5L19 11C20 12.5 19.5 14 18 14H4V3Z" fill="#ef4444" stroke="#dc2626" strokeWidth="1.5" />
    <path d="M2 22H10" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const SvgMine = ({ isDeath, isGhost }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    style={{
      opacity: isGhost ? 0.45 : 1,
      filter: isDeath
        ? 'drop-shadow(0 0 6px #ff0000)'
        : isGhost
        ? 'drop-shadow(0 0 4px #00f0ff)'
        : 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
    }}
  >
    <circle cx="12" cy="12" r="6" fill={isDeath ? '#dc2626' : '#1e293b'} stroke={isDeath ? '#fee2e2' : '#94a3b8'} strokeWidth="1.5" />
    {/* Spikes */}
    <line x1="12" y1="2" x2="12" y2="6" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="18" x2="12" y2="22" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
    <line x1="2" y1="12" x2="6" y2="12" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="12" x2="22" y2="12" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" />
    {/* Center Core */}
    <circle cx="10" cy="10" r="1.5" fill="#f8fafc" />
  </svg>
);

export const SvgQuestion = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <text x="12" y="17" textAnchor="middle" fill="#00e5ff" fontSize="16" fontWeight="bold" fontFamily="monospace">
      ?
    </text>
  </svg>
);

export const VectorNumber = ({ num }) => {
  if (!num || num <= 0) return null;
  return <span className={`vector-digit num-${num}`}>{num}</span>;
};
