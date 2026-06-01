import { useState, useEffect, useCallback } from 'react';
import api from '../api.js';
import StatCard from '../components/StatCard.jsx';
import IPOCard from '../components/IPOCard.jsx';
import SubscriptionChart from '../components/SubscriptionChart.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [openIPOs, setOpenIPOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);
  const [expandedChart, setExpandedChart] = useState(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [statsRes, openRes] = await Promise.all([
        api.get('/api/ipo/stats'),
        api.get('/api/ipo/open'),
      ]);
      setStats(statsRes.data.data);
      setOpenIPOs(openRes.data.data || []);
      setStale(openRes.data.stale || statsRes.data.stale);
    } catch (err) {
      setError(err.message);
      setStale(true);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(() => fetchData(true), REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  const topGainerText = stats?.topGainer
    ? `${stats.topGainer.name} (+${stats.topGainer.gainLossPct}%)`
    : '—';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live Indian IPO market overview</p>
        </div>
        <button
          onClick={() => fetchData()}
          className="btn-primary flex items-center gap-2 text-xs"
          disabled={loading}
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {stale && (
        <div className="mb-5 flex items-center gap-2 bg-warning/10 border border-warning/30 text-warning rounded-lg px-4 py-2.5 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Data may be outdated — scraper is refreshing in the background
        </div>
      )}

      {error && (
        <div className="mb-5 bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-2.5 text-sm">
          Failed to load data: {error}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {loading ? (
          <SkeletonLoader type="stat" />
        ) : (
          <>
            <StatCard label="Total Upcoming" value={stats?.totalUpcoming ?? '—'} subtext="IPOs this season" positive />
            <StatCard label="Currently Open" value={stats?.totalOpen ?? '—'} subtext="Apply now" positive />
            <StatCard
              label="Avg Listing Gain (30d)"
              value={stats?.avgListingGain30d != null ? `${stats.avgListingGain30d > 0 ? '+' : ''}${stats.avgListingGain30d}%` : '—'}
              subtext="Past 30 days average"
              positive={(stats?.avgListingGain30d ?? 0) >= 0}
            />
            <StatCard
              label="Top Gainer"
              value={stats?.topGainer?.gainLossPct != null ? `+${stats.topGainer.gainLossPct}%` : '—'}
              subtext={stats?.topGainer?.name || '—'}
              positive
            />
          </>
        )}
      </div>

      {/* Open IPOs */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">
          Currently Open
          {!loading && openIPOs.length > 0 && (
            <span className="ml-2 text-xs font-normal bg-accent/10 text-accent px-2 py-0.5 rounded-full">
              {openIPOs.length}
            </span>
          )}
        </h2>
      </div>

      {loading ? (
        <SkeletonLoader type="cards" count={6} />
      ) : openIPOs.length === 0 ? (
        <div className="card p-12 flex flex-col items-center justify-center text-gray-400">
          <span className="text-5xl mb-3">📭</span>
          <p className="font-medium">No open IPOs at the moment</p>
          <p className="text-sm mt-1">Check back soon or view upcoming IPOs</p>
        </div>
      ) : (
        <div className="space-y-4">
          {openIPOs.map((ipo, i) => (
            <div key={i}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <IPOCard ipo={ipo} />
                  <button
                    onClick={() => setExpandedChart(expandedChart === i ? null : i)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-secondary hover:border-accent hover:text-accent transition-all flex items-center justify-center text-sm"
                    title="Subscription chart"
                  >
                    {expandedChart === i ? '▼' : '▶'}
                  </button>
                </div>
              </div>
              {expandedChart === i && (
                <SubscriptionChart
                  ipoSlug={ipo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                  ipoName={ipo.name}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
