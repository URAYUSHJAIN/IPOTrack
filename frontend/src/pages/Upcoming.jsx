import { useState, useEffect } from 'react';
import api from '../api.js';
import IPOTable from '../components/IPOTable.jsx';
import CountdownTimer from '../components/CountdownTimer.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

export default function Upcoming() {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    api
      .get('/api/ipo/upcoming')
      .then((res) => {
        setIpos(res.data.data || []);
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
    { key: 'openDate', label: 'Open Date' },
    { key: 'closeDate', label: 'Close Date' },
    { key: 'priceBand', label: 'Price Band' },
    {
      key: 'lotSize',
      label: 'Lot Size',
      render: (v) => (v > 0 ? v : '—'),
    },
    {
      key: 'gmp',
      label: 'GMP (₹)',
      render: (v) => {
        if (!v && v !== 0) return '—';
        const cls = v > 0 ? 'text-accent font-semibold' : v < 0 ? 'text-danger font-semibold' : 'text-gray-500';
        return <span className={cls}>{v > 0 ? `+₹${v}` : v < 0 ? `-₹${Math.abs(v)}` : '₹0'}</span>;
      },
    },
    {
      key: 'openDate',
      label: 'Opens In',
      sortable: false,
      render: (v) => <CountdownTimer openDate={v} />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Upcoming IPOs</h1>
        <p className="text-sm text-gray-500 mt-0.5">IPOs opening soon — sorted by open date</p>
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
        <SkeletonLoader type="table" count={8} cols={7} />
      ) : ipos.length === 0 ? (
        <div className="card p-12 md:p-16 flex flex-col items-center justify-center text-gray-400">
          <span className="text-5xl mb-3">📭</span>
          <p className="font-medium text-lg">No upcoming IPOs</p>
          <p className="text-sm mt-1">Check back later — new issues are added frequently</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <IPOTable columns={columns} data={ipos} />
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {ipos.map((ipo, idx) => (
              <div
                key={idx}
                className="bg-surface rounded-lg border border-secondary p-4 space-y-2.5"
              >
                <div>
                  <p className="font-semibold text-primary text-sm line-clamp-2">{ipo.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Open</p>
                    <p className="text-primary font-medium">{ipo.openDate || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Close</p>
                    <p className="text-primary font-medium">{ipo.closeDate || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Price Band</p>
                    <p className="text-primary font-medium">{ipo.priceBand || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">GMP</p>
                    <p className={`font-medium ${ipo.gmp > 0 ? 'text-accent' : ipo.gmp < 0 ? 'text-danger' : 'text-gray-500'}`}>
                      {ipo.gmp > 0 ? `+₹${ipo.gmp}` : ipo.gmp < 0 ? `-₹${Math.abs(ipo.gmp)}` : '—'}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-secondary/50">
                  <CountdownTimer openDate={ipo.openDate} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
