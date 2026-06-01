function SubscriptionBar({ value }) {
  const pct = Math.min((value / 50) * 100, 100);
  const color =
    value >= 10 ? 'bg-accent' : value >= 1 ? 'bg-warning' : 'bg-gray-300';

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">Subscription</span>
        <span
          className={`font-semibold ${
            value >= 10 ? 'text-accent' : value >= 1 ? 'text-warning' : 'text-gray-500'
          }`}
        >
          {value > 0 ? `${value.toFixed(2)}x` : 'Not yet open'}
        </span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function GMPBadge({ gmp }) {
  if (!gmp && gmp !== 0)
    return <span className="badge-neutral">GMP N/A</span>;

  const cls = gmp > 0 ? 'badge-gain' : gmp < 0 ? 'badge-loss' : 'badge-neutral';
  const prefix = gmp > 0 ? '+' : '';
  return <span className={cls}>GMP ₹{prefix}{gmp}</span>;
}

export default function IPOCard({ ipo }) {
  const { name, closeDate, subscriptionQQS = 0, gmp = 0, lotSize, priceBand } = ipo;

  const glowClass =
    subscriptionQQS >= 10
      ? 'shadow-glow border-accent'
      : subscriptionQQS >= 1
      ? 'shadow-glow-yellow border-warning'
      : 'border-secondary';

  return (
    <div
      className={`bg-surface rounded-xl p-4 border transition-all duration-200 hover:shadow-card ${glowClass}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-primary text-sm leading-snug line-clamp-2 flex-1">
          {name}
        </h3>
        <GMPBadge gmp={gmp} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
        <div>
          <span className="text-gray-400">Closes</span>
          <p className="font-medium text-primary mt-0.5">{closeDate || '—'}</p>
        </div>
        <div>
          <span className="text-gray-400">Price Band</span>
          <p className="font-medium text-primary mt-0.5">{priceBand || '—'}</p>
        </div>
        <div>
          <span className="text-gray-400">Lot Size</span>
          <p className="font-medium text-primary mt-0.5">{lotSize > 0 ? `${lotSize} shares` : '—'}</p>
        </div>
      </div>

      <SubscriptionBar value={subscriptionQQS} />
    </div>
  );
}
