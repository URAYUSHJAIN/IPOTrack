export default function StatCard({ label, value, subtext, positive = true, loading = false }) {
  if (loading) {
    return (
      <div className="card p-4 sm:p-5 animate-pulse">
        <div className="h-3 bg-secondary rounded w-24 mb-3" />
        <div className="h-8 bg-secondary rounded w-32 mb-2" />
        <div className="h-3 bg-secondary rounded w-20" />
      </div>
    );
  }

  return (
    <div
      className={`card p-4 sm:p-5 border-t-4 transition-all duration-200 hover:shadow-lg
        ${positive ? 'border-t-accent' : 'border-t-danger'}`}
    >
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-primary leading-none mb-1">{value ?? '—'}</p>
      {subtext && (
        <p className={`text-xs font-medium ${positive ? 'text-accent' : 'text-danger'}`}>
          {subtext}
        </p>
      )}
    </div>
  );
}
