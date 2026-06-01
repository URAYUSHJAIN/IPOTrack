import { useState } from 'react';

function SortIcon({ active, dir }) {
  if (!active) return <span className="text-white/30 ml-1">↕</span>;
  return <span className="text-accent ml-1">{dir === 'asc' ? '↑' : '↓'}</span>;
}

export default function IPOTable({ columns, data, rowClassName }) {
  const [sort, setSort] = useState({ key: null, dir: 'asc' });

  function handleSort(key) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  }

  const sorted = [...data].sort((a, b) => {
    if (!sort.key) return 0;
    const va = a[sort.key];
    const vb = b[sort.key];
    if (va == null) return 1;
    if (vb == null) return -1;
    const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
    return sort.dir === 'asc' ? cmp : -cmp;
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-secondary shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-primary">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                className={`px-4 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider whitespace-nowrap
                  ${col.sortable !== false ? 'cursor-pointer hover:text-white select-none' : ''}`}
              >
                {col.label}
                {col.sortable !== false && (
                  <SortIcon active={sort.key === col.key} dir={sort.dir} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary bg-surface">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">📭</span>
                  <span>No data available</span>
                </div>
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => (
              <tr
                key={i}
                className={`hover:bg-gray-50 transition-colors duration-100 ${
                  rowClassName ? rowClassName(row) : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap text-primary">
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
