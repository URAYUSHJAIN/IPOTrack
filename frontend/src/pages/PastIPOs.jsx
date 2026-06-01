import { useState, useEffect } from 'react';
import axios from 'axios';
import IPOTable from '../components/IPOTable.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

const PAGE_SIZE = 20;

const FILTER_OPTIONS = [
  { value: 'all', label: 'All', activeClass: 'bg-primary text-white' },
  { value: 'profit', label: '📈 Profit', activeClass: 'bg-accent text-primary' },
  { value: 'loss', label: '📉 Loss', activeClass: 'bg-danger text-white' },
];

export default function PastIPOs() {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    axios
      .get('/api/ipo/listed')
      .then((res) => {
        setIpos(res.data.data || []);
        setStale(res.data.stale);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter]);

  const filtered = ipos.filter((ipo) => {
    if (filter === 'profit') return ipo.gainLossPct > 0;
    if (filter === 'loss') return ipo.gainLossPct < 0;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      key: 'listingPrice',
      label: 'Listing Price (₹)',
      render: (v) => (v > 0 ? `₹${v}` : '—'),
    },
    {
      key: 'gainLossPct',
      label: 'Gain / Loss',
      render: (v) => {
        if (v == null) return '—';
        const cls = v > 0 ? 'badge-gain' : v < 0 ? 'badge-loss' : 'badge-neutral';
        const prefix = v > 0 ? '+' : '';
        return <span className={cls}>{prefix}{v}%</span>;
      },
    },
    { key: 'listingDate', label: 'Listing Date' },
  ];

  const rowClassName = (row) => {
    if (row.gainLossPct > 0) return 'bg-green-50/60';
    if (row.gainLossPct < 0) return 'bg-red-50/60';
    return '';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Past IPOs</h1>
        <p className="text-sm text-gray-500 mt-0.5">Listed IPO performance — allotment to listing</p>
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

      {!loading && (
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-2">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === opt.value
                    ? opt.activeClass
                    : 'bg-secondary text-gray-600 hover:bg-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {filtered.length} IPO{filtered.length !== 1 ? 's' : ''} · Page {page} of {totalPages}
          </span>
        </div>
      )}

      {loading ? (
        <SkeletonLoader type="table" count={10} cols={5} />
      ) : filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center text-gray-400">
          <span className="text-5xl mb-3">📭</span>
          <p className="font-medium text-lg">No IPOs found</p>
          <p className="text-sm mt-1">Try adjusting the filter</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <IPOTable columns={columns} data={paginated} rowClassName={rowClassName} />
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {paginated.map((ipo, idx) => (
              <div
                key={idx}
                className={`bg-surface rounded-lg border border-secondary p-4 space-y-2.5 ${
                  ipo.gainLossPct > 0 ? 'bg-green-50/30' : ipo.gainLossPct < 0 ? 'bg-red-50/30' : ''
                }`}
              >
                <p className="font-semibold text-primary text-sm line-clamp-2">{ipo.name}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Listing Price</p>
                    <p className="text-primary font-medium">{ipo.listingPrice > 0 ? `₹${ipo.listingPrice}` : '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Gain / Loss</p>
                    <p className={`font-bold text-lg ${ipo.gainLossPct > 0 ? 'text-accent' : ipo.gainLossPct < 0 ? 'text-danger' : 'text-gray-500'}`}>
                      {ipo.gainLossPct > 0 ? `+${ipo.gainLossPct}%` : `${ipo.gainLossPct}%`}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-secondary/50">
                  <p className="text-xs text-gray-500">Listed on {ipo.listingDate || '—'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-10 px-4 sm:h-10 sm:px-6 btn-outline disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                ← Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === '...' ? (
                      <span key={`dot-${i}`} className="px-2 text-gray-400">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`min-h-10 min-w-10 text-sm rounded-lg font-medium transition-all duration-200
                          ${page === item ? 'bg-primary text-white' : 'hover:bg-secondary text-primary'}`}
                      >
                        {item}
                      </button>
                    )
                  )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-10 px-4 sm:h-10 sm:px-6 btn-outline disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
