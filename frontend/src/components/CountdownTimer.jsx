import { useState, useEffect } from 'react';

function parseIndianDate(str) {
  if (!str) return null;
  // Handles: "01-Jun-2026", "Jun 01, 2026", "2026-06-01", "01/06/2026"
  const cleaned = str.trim();
  let d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d;

  // Try DD-MMM-YYYY
  const ddMMMYYYY = /(\d{1,2})[- ]([A-Za-z]+)[- ](\d{4})/;
  const m = cleaned.match(ddMMMYYYY);
  if (m) {
    d = new Date(`${m[2]} ${m[1]}, ${m[3]}`);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

function formatCountdown(targetDate) {
  if (!targetDate) return 'Date TBD';
  const now = new Date();
  const diff = targetDate - now;
  if (diff <= 0) return 'Open Now';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function CountdownTimer({ openDate }) {
  const target = parseIndianDate(openDate);
  const [label, setLabel] = useState(() => formatCountdown(target));

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setLabel(formatCountdown(target)), 60_000);
    return () => clearInterval(id);
  }, [openDate]);

  const isOpen = label === 'Open Now';
  const isTBD = label === 'Date TBD';

  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded
        ${isOpen ? 'bg-accent/10 text-accent' : isTBD ? 'bg-gray-100 text-gray-500' : 'bg-primary/5 text-primary'}`}
    >
      {isOpen ? '🟢 Open Now' : isTBD ? '—' : `⏱ ${label}`}
    </span>
  );
}
