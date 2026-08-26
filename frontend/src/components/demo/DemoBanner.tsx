import React from 'react';
import { useDemo } from '../../context/DemoContext';

export const DemoBanner: React.FC = () => {
  const { endDemo } = useDemo();

  return (
    <div
      id="demo-banner"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 20px',
        fontSize: '13px',
        fontWeight: 600,
        boxShadow: '0 2px 12px rgba(245,158,11,0.4)',
        letterSpacing: '0.01em',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>⚡</span>
        <span>Demo Mode — Sample data only. Feel free to explore! Everything resets automatically.</span>
      </span>
      <button
        id="demo-banner-exit-btn"
        onClick={endDemo}
        style={{
          background: 'rgba(0,0,0,0.2)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.35)',
          borderRadius: '6px',
          padding: '4px 12px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.35)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.2)')}
      >
        Exit Demo
      </button>
    </div>
  );
};
