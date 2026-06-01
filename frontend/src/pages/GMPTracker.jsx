import { useState, useEffect } from 'react';
import axios from 'axios';
import GMPChart from '../components/GMPChart.jsx';
import IPOTable from '../components/IPOTable.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

export default function GMPTracker() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    axios
      .get('/api/ipo/gmp')
      .then((res) => {
        setData(res.data.data || []);
        setStale(res.data.stale);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'IPO Name',
      render: (v) => <span className="font-medium text-primary">{v}</span>,
    },
    {
      key: 'issuePrice',
      label: 'Issue Price (₹)',
      render: (v) => (v > 0 ? `₹${v}` : '—'),
    },
    {
      key: 'gmp',
      label: 'GMP (₹)',
      render: (v) => {
        if (v == null) return '—';
        const cls = v > 0 ? 'text-accent font-semibold' : v < 0 ? 'text-danger font-semibold' : '';
        return <span className={cls}>{v > 0 ? `+₹${v}` : `₹${v}`}</span>;
      },
    },
    {
      key: 'expectedListing',
      label: 'Exp. Listing (₹)',
      render: (v) => (v > 0 ? `₹${v}` : '—'),
    },
    {
      key: 'gmpPct',
      label: 'GMP %',
      render: (v) => {
        if (v == null) return '—';
        const cls = v > 0 ? 'badge-gain' : v < 0 ? 'badge-loss' : 'badge-neutral';
        return <span className={cls}>{v > 0 ? `+${v}%` : `${v}%`}</span>;
      },
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">GMP Tracker</h1>
        <p className="text-sm text-gray-500 mt-0.5">Grey Market Premium — live estimates</p>
      </div>

      {stale && (
        <div className="mb-5 flex items-center gap-2 bg-warning/10 border border-warning/30 text-warning rounded-lg px-4 py-2.5 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Data may be outdated
        </div>
      )}

      {error && (
        <div className="mb-5 bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-2.5 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <>
          <div className="card p-5 mb-6 animate-pulse">
            <div className="h-4 bg-secondary rounded w-48 mb-4" />
            <div className="h-64 bg-secondary rounded" />
          </div>
          <SkeletonLoader type="table" count={6} cols={5} />
        </>
      ) : (
        <>
          <div className="mb-6">
            <GMPChart data={data} />
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-primary">GMP Details</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              GMP data is indicative — grey market prices may not reflect actual listing prices
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <IPOTable columns={columns} data={data} />
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {data.map((ipo, idx) => (
              <div
                key={idx}
                className="bg-surface rounded-lg border border-secondary p-4 space-y-2"
              >
                <p className="font-semibold text-primary text-sm line-clamp-2">{ipo.name}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Issue Price</p>
                    <p className="text-primary font-medium">{ipo.issuePrice > 0 ? `₹${ipo.issuePrice}` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">GMP (₹)</p>
                    <p className={`font-semibold ${ipo.gmp > 0 ? 'text-accent' : ipo.gmp < 0 ? 'text-danger' : 'text-gray-500'}`}>
                      {ipo.gmp > 0 ? `+₹${ipo.gmp}` : `₹${ipo.gmp}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Exp. Listing</p>
                    <p className="text-primary font-medium">{ipo.expectedListing > 0 ? `₹${ipo.expectedListing}` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">GMP %</p>
                    <p className={`font-semibold ${ipo.gmpPct > 0 ? 'text-accent' : ipo.gmpPct < 0 ? 'text-danger' : ''}`}>
                      {ipo.gmpPct > 0 ? `+${ipo.gmpPct}%` : `${ipo.gmpPct}%`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
