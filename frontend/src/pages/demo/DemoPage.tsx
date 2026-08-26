import React, { useState } from 'react';
import { useDemo } from '../../context/DemoContext';

export const DemoPage: React.FC = () => {
  const { startDemo } = useDemo();
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

  const handleStart = async () => {
    setLoading(true);
    setError('');
    setStatusMsg('Connecting to server...');

    // If cold start takes more than 2 seconds, show friendly notice
    const coldStartTimer = setTimeout(() => {
      setStatusMsg('⚡ Waking up backend server from cold start... Please wait a moment!');
    }, 2000);

    try {
      await startDemo();
    } catch (err: any) {
      setError(err.message || 'Failed to start demo. Please try again.');
      setLoading(false);
    } finally {
      clearTimeout(coldStartTimer);
      setStatusMsg('');
    }
  };

  const features = [
    { title: 'Products & Inventory', desc: 'Browse textile products, categories, colors, and live stock levels' },
    { title: 'Vendors & Customers', desc: 'Explore vendor and customer records with contact details' },
    { title: 'Purchases & Sales', desc: 'See how purchase orders and sales invoices are managed end-to-end' },
    { title: 'Returns', desc: 'Handle purchase and sale returns with automatic inventory adjustment' },
    { title: 'Payments & Ledger', desc: 'Track payments and view a running balance ledger per party' },
    { title: 'Dashboard', desc: 'Real-time business snapshot — total sales, purchases, and profit' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3.5 py-1 rounded-full mb-4 text-xs font-semibold uppercase tracking-wider">
            Interactive Demo (15 Min)
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Textile Manager Demo
          </h1>
          <p className="text-gray-600 text-base max-w-xl mx-auto leading-relaxed">
            Explore a fully interactive demo with sample textile data. You can test features, add, or edit records. All changes auto-reset every 15 minutes.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {features.map((f, i) => (
            <div key={i} className="p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors text-left">
              <div className="font-semibold text-blue-900 text-sm mb-1">{f.title}</div>
              <div className="text-gray-600 text-xs leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          {statusMsg && loading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-2.5 mb-4 text-xs font-medium inline-block w-full max-w-md animate-pulse">
              {statusMsg}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 mb-4 text-xs font-medium inline-block w-full max-w-md">
              {error}
            </div>
          )}

          <button
            id="start-demo-btn"
            onClick={handleStart}
            disabled={loading}
            className={`
              w-full sm:w-auto px-8 py-3 
              text-sm font-semibold text-white rounded-lg shadow-sm
              transition-all duration-150 
              ${loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }
            `}
          >
            {loading ? 'Setting up demo...' : 'Start Demo Session'}
          </button>

          <p className="text-gray-400 text-xs mt-3">
            No login required · Sample data only · Auto-resets in 15 min
          </p>
        </div>
      </div>
    </div>
  );
};
