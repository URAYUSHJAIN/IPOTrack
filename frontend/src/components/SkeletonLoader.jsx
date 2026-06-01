function SkeletonCard() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-4 bg-secondary rounded w-3/4" />
        <div className="h-4 bg-secondary rounded w-12" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-3 bg-secondary rounded" />
        ))}
      </div>
      <div className="h-1.5 bg-secondary rounded-full" />
    </div>
  );
}

function SkeletonRow({ cols }) {
  return (
    <tr className="animate-pulse">
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-secondary rounded w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

function SkeletonTable({ rows = 6, cols = 5 }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-secondary shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-primary">
            {[...Array(cols)].map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-3 bg-white/20 rounded w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary bg-surface">
          {[...Array(rows)].map((_, i) => <SkeletonRow key={i} cols={cols} />)}
        </tbody>
      </table>
    </div>
  );
}

export default function SkeletonLoader({ type = 'cards', count = 6, cols = 5 }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(count)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 border-t-4 border-t-secondary animate-pulse">
            <div className="h-3 bg-secondary rounded w-24 mb-3" />
            <div className="h-8 bg-secondary rounded w-24 mb-2" />
            <div className="h-3 bg-secondary rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return <SkeletonTable rows={count} cols={cols} />;
}
