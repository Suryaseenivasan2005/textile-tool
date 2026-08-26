import React, { useState } from 'react';
import { useDemo, DEMO_DURATION } from '../../context/DemoContext';

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const DemoTimer: React.FC = () => {
  const { timeLeft, resetDemo, endDemo } = useDemo();
  const [expanded, setExpanded] = useState(false);

  const percentage = (timeLeft / DEMO_DURATION) * 100;
  const isLow = timeLeft < 120;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;
  const color = isLow ? '#ef4444' : '#8b5cf6';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
      }}
    >
      {/* Expanded panel */}
      {expanded && (
        <div style={{
          marginBottom: '10px',
          background: 'rgba(15,12,41,0.95)',
          border: `1px solid ${isLow ? 'rgba(239,68,68,0.35)' : 'rgba(139,92,246,0.3)'}`,
          borderRadius: '12px',
          padding: '12px 14px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minWidth: '150px',
        }}>
          <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 500, textAlign: 'center' }}>
            Demo Session
          </div>
          <button
            id="demo-reset-btn"
            onClick={resetDemo}
            style={{
              background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
              color: '#fff',
              border: 'none',
              borderRadius: '7px',
              padding: '7px 0',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            ↺ Reset
          </button>
          <button
            id="demo-end-btn"
            onClick={endDemo}
            style={{
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: '7px',
              padding: '6px 0',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            ✕ Exit
          </button>
        </div>
      )}

      {/* Compact pill — always visible */}
      <button
        id="demo-timer-toggle"
        onClick={() => setExpanded(e => !e)}
        title="Demo timer — click to expand"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(15,12,41,0.92)',
          border: `1px solid ${isLow ? 'rgba(239,68,68,0.5)' : 'rgba(139,92,246,0.4)'}`,
          borderRadius: '100px',
          padding: '5px 12px 5px 6px',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          boxShadow: `0 2px 16px ${isLow ? 'rgba(239,68,68,0.2)' : 'rgba(139,92,246,0.15)'}`,
          transition: 'all 0.2s ease',
        }}
      >
        {/* Mini ring */}
        <svg width="28" height="28" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
          <circle cx="14" cy="14" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
          <circle
            cx="14" cy="14" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        <span style={{
          color: isLow ? '#f87171' : '#c4b5fd',
          fontSize: '12px',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.04em',
        }}>
          {formatTime(timeLeft)}
        </span>
        <span style={{ color: '#475569', fontSize: '10px', marginLeft: '2px' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>
    </div>
  );
};
