import React, { useState } from 'react';
import { useDemo } from '../../context/DemoContext';

export const DemoPage: React.FC = () => {
  const { startDemo } = useDemo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      await startDemo();
    } catch (err: any) {
      setError(err.message || 'Failed to start demo. Please try again.');
      setLoading(false);
    }
  };

  const features = [
    { icon: '📦', title: 'Products & Inventory', desc: 'Browse textile products, categories, colors, and live stock levels' },
    { icon: '🏪', title: 'Vendors & Customers', desc: 'Explore vendor and customer records with contact details' },
    { icon: '🛒', title: 'Purchases & Sales', desc: 'See how purchase orders and sales invoices are managed end-to-end' },
    { icon: '↩️', title: 'Returns', desc: 'Handle purchase and sale returns with automatic inventory adjustment' },
    { icon: '💰', title: 'Payments & Ledger', desc: 'Track payments and view a running balance ledger per party' },
    { icon: '📊', title: 'Dashboard', desc: 'Real-time business snapshot — total sales, purchases, and profit' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Glow blobs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '860px', width: '100%', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '100px',
            padding: '6px 16px',
            marginBottom: '24px',
          }}>
            <span style={{ fontSize: '14px' }}>⚡</span>
            <span style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 600 }}>Interactive Demo — 15 Minutes</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800,
            color: '#f1f5f9',
            lineHeight: 1.2,
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
          }}>
            Welcome to{' '}
            <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Textile Manager
            </span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '17px', lineHeight: 1.6, maxWidth: '560px', margin: '0 auto' }}>
            Your complete textile business command center. Explore a fully loaded demo with sample data — add, edit, or delete anything. All changes reset automatically every 15 minutes.
          </p>
        </div>

        {/* Feature grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '48px',
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(8px)',
              transition: 'border-color 0.2s, background 0.2s',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139,92,246,0.4)';
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(139,92,246,0.06)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{f.icon}</div>
              <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>{f.title}</div>
              <div style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5',
              borderRadius: '10px',
              padding: '12px 20px',
              marginBottom: '20px',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          <button
            id="start-demo-btn"
            onClick={handleStart}
            disabled={loading}
            style={{
              background: loading ? '#4c1d95' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 48px',
              fontSize: '17px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
              transition: 'all 0.2s ease',
              letterSpacing: '-0.01em',
              transform: 'scale(1)',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={e => {
              if (!loading) {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(139,92,246,0.55)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(139,92,246,0.4)';
            }}
          >
            {loading ? '⏳ Setting up demo...' : '🚀 Start 15-Min Demo'}
          </button>

          <p style={{ color: '#475569', fontSize: '13px', marginTop: '16px' }}>
            No login required · Sample data only · Auto-resets every 15 min
          </p>
        </div>
      </div>
    </div>
  );
};
