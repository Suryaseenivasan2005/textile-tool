import React from 'react';
import { useDemo } from '../../context/DemoContext';

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const DemoTimer: React.FC = () => {
  const { timeLeft } = useDemo();
  const isLow = timeLeft < 120;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
      }}
    >
      <div
        className={`
          flex items-center gap-2 px-3.5 py-1.5 rounded-full shadow-sm border text-xs font-semibold
          ${isLow 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-white border-blue-200 text-blue-700'
          }
        `}
      >
        <span className={`w-2 h-2 rounded-full ${isLow ? 'bg-red-500 animate-pulse' : 'bg-blue-600'}`} />
        <span>Demo</span>
        <span className="text-gray-300">•</span>
        <span className="font-mono tracking-wider">{formatTime(timeLeft)}</span>
      </div>
    </div>
  );
};
