import React from 'react';
import { useDemo, DEMO_DURATION } from '../../context/DemoContext';

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const DemoTimer: React.FC = () => {
  const { timeLeft, resetDemo, endDemo } = useDemo();

  const percentage = (timeLeft / DEMO_DURATION) * 100;
  const isLow = timeLeft < 120; // < 2 min
  const circumference = 2 * Math.PI * 22; // radius 22
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      id="demo-timer-widget"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
        background: isLow
          ? 'linear-gradient(135deg, #2d0a0a 0%, #1a0000 100%)'
          : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: `1px solid ${isLow ? 'rgba(239,68,68,0.4)' : 'rgba(139,92,246,0.3)'}`,
        borderRadius: '16px',
        padding: '16px',
        boxShadow: `0 8px 32px ${isLow ? 'rgba(239,68,68,0.25)' : 'rgba(139,92,246,0.2)'}`,
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        minWidth: '160px',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Label */}
      <div style={{ color: isLow ? '#fca5a5' : '#c4b5fd', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Demo Session
      </div>

      {/* Circular timer */}
      <div style={{ position: 'relative', width: '64px', height: '64px' }}>
        <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="32" cy="32" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle
            cx="32"
            cy="32"
            r="22"
            fill="none"
            stroke={isLow ? '#ef4444' : '#8b5cf6'}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: isLow ? '#f87171' : '#e2e8f0',
          fontSize: '13px',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        <button
          id="demo-reset-btn"
          onClick={resetDemo}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '7px 0',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          ↺ Reset Demo
        </button>
        <button
          id="demo-end-btn"
          onClick={endDemo}
          style={{
            background: 'transparent',
            color: '#94a3b8',
            border: '1px solid rgba(148,163,184,0.25)',
            borderRadius: '8px',
            padding: '6px 0',
            fontSize: '11px',
            fontWeight: 500,
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.25)'; }}
        >
          ✕ Exit Demo
        </button>
      </div>
    </div>
  );
};
