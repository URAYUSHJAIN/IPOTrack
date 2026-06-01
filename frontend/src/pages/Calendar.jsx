import { useState, useEffect } from 'react';
import api from '../api.js';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

function parseDate(dateStr) {
  // "05-Jun-2026" or "05-Jun"
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function getDayOfMonth(dateStr) {
  const d = parseDate(dateStr);
  return d ? d.getDate() : null;
}

function getMonthKey(dateStr) {
  const d = parseDate(dateStr);
  return d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` : null;
}

export default function Calendar() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [upcoming, setUpcoming] = useState([]);
  const [open, setOpen] = useState([]);
  const [listed, setListed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/ipo/upcoming'),
      api.get('/api/ipo/open'),
      api.get('/api/ipo/listed'),
    ])
      .then(([upRes, opRes, liRes]) => {
        setUpcoming(upRes.data.data || []);
        setOpen(opRes.data.data || []);
        setListed(liRes.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // All IPOs across all months
  const allIPOs = [...upcoming, ...open, ...listed];

  // Build events for this month
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const events = {};

  allIPOs.forEach((ipo) => {
    // Open date (green)
    const openDay = getDayOfMonth(ipo.openDate);
    const openMonth = getMonthKey(ipo.openDate);
    if (openDay && openMonth === monthKey) {
      events[openDay] = events[openDay] || [];
      events[openDay].push({ name: ipo.name, type: 'open', ipo });
    }

    // Close date (red)
    const closeDay = getDayOfMonth(ipo.closeDate);
    const closeMonth = getMonthKey(ipo.closeDate);
    if (closeDay && closeMonth === monthKey) {
      events[closeDay] = events[closeDay] || [];
      events[closeDay].push({ name: ipo.name, type: 'close', ipo });
    }

    // Listing date (yellow) — only for listed/past
    if (ipo.listingDate) {
      const listDay = getDayOfMonth(ipo.listingDate);
      const listMonth = getMonthKey(ipo.listingDate);
      if (listDay && listMonth === monthKey) {
        events[listDay] = events[listDay] || [];
        events[listDay].push({ name: ipo.name, type: 'listing', ipo });
      }
    }
  });

  const today = new Date();
  const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();
  const todayDate = today.getDate();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevDays = Array.from({ length: firstDay }, (_, i) => daysInPrevMonth - firstDay + i + 1);
  const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const nextDays = Array.from({ length: 42 - firstDay - daysInMonth }, (_, i) => i + 1);

  const allDays = [...prevDays, ...currentDays, ...nextDays];

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const monthName = new Date(year, month).toLocaleString('en-IN', { month: 'long' });

  if (loading) return <SkeletonLoader type="cards" count={4} />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">IPO Calendar</h1>
        <p className="text-sm text-gray-500 mt-0.5">Month-view of IPO open, close, and listing dates</p>
      </div>

      {/* Month Navigation */}
      <div className="card p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-6 gap-2">
          <button
            onClick={handlePrevMonth}
            className="btn-outline text-sm px-2 sm:px-3 py-1.5 min-h-10 min-w-10"
          >
            ← <span className="hidden sm:inline">Prev</span>
          </button>
          <h2 className="text-lg sm:text-xl font-semibold text-primary">
            {monthName} {year}
          </h2>
          <button
            onClick={handleNextMonth}
            className="btn-outline text-sm px-2 sm:px-3 py-1.5 min-h-10 min-w-10"
          >
            <span className="hidden sm:inline">Next</span> →
          </button>
        </div>

        {/* Calendar Grid - Desktop/Tablet */}
        <div className="hidden sm:grid grid-cols-7 gap-1">
          {/* Weekday headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="h-10 flex items-center justify-center text-xs font-semibold text-primary uppercase">
              {day}
            </div>
          ))}

          {/* Date cells */}
          {allDays.map((day, idx) => {
            const isCurrentMonthDay = idx >= firstDay && idx < firstDay + daysInMonth;
            const isTodayDate = isCurrentMonth && isCurrentMonthDay && day === todayDate;
            const dayEvents = isCurrentMonthDay ? events[day] || [] : [];

            return (
              <div
                key={`${idx}-${day}`}
                className={`min-h-24 p-2 rounded-lg border transition-all duration-200
                  ${
                    isCurrentMonthDay
                      ? isTodayDate
                        ? 'border-4 border-accent bg-white/50'
                        : 'border border-secondary bg-white hover:shadow-card'
                      : 'border border-gray-100 bg-gray-50'
                  }`}
              >
                <div
                  className={`text-sm font-semibold mb-1 ${
                    isCurrentMonthDay ? 'text-primary' : 'text-gray-300'
                  }`}
                >
                  {day}
                </div>
                <div className="flex flex-col gap-0.5 text-xs overflow-y-auto max-h-16">
                  {dayEvents.map((event, i) => (
                    <button
                      key={i}
                      onClick={() => setPopup(event)}
                      className={`px-1.5 py-0.5 rounded text-white font-medium truncate cursor-pointer hover:opacity-80 transition-all
                        ${
                          event.type === 'open'
                            ? 'bg-accent'
                            : event.type === 'close'
                            ? 'bg-danger'
                            : 'bg-warning'
                        }`}
                    >
                      {event.type === 'open' ? '↗' : event.type === 'close' ? '↙' : '✓'} {event.ipo.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile List View */}
        <div className="sm:hidden">
          {Object.entries(events)
            .sort(([dayA], [dayB]) => parseInt(dayA) - parseInt(dayB))
            .map(([day, dayEvents]) => (
              <div key={day} className="mb-3">
                <p className="font-semibold text-primary text-sm mb-2">{day} {monthName}</p>
                <div className="flex flex-wrap gap-2">
                  {dayEvents.map((event, i) => (
                    <button
                      key={i}
                      onClick={() => setPopup(event)}
                      className={`px-2.5 py-1.5 rounded text-white text-xs font-medium cursor-pointer hover:opacity-80 transition-all whitespace-nowrap
                        ${
                          event.type === 'open'
                            ? 'bg-accent'
                            : event.type === 'close'
                            ? 'bg-danger'
                            : 'bg-warning'
                        }`}
                    >
                      {event.type === 'open' ? '↗' : event.type === 'close' ? '↙' : '✓'} {event.ipo.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          {Object.keys(events).length === 0 && (
            <p className="text-gray-400 text-sm">No IPO events this month</p>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-accent" />
            <span>Opens on this date</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-danger" />
            <span>Closes on this date</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-warning" />
            <span>Lists on this date</span>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {popup && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setPopup(null)}
        >
          <div
            className="card p-6 max-w-sm w-full bg-white rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-primary mb-2">{popup.ipo.name}</h3>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {popup.type === 'open' && (
                <>
                  <p><span className="font-medium text-primary">Status:</span> Opens today</p>
                  <p><span className="font-medium text-primary">Close Date:</span> {popup.ipo.closeDate || '—'}</p>
                </>
              )}
              {popup.type === 'close' && (
                <>
                  <p><span className="font-medium text-primary">Status:</span> Closes today</p>
                  <p><span className="font-medium text-primary">Open Date:</span> {popup.ipo.openDate || '—'}</p>
                </>
              )}
              {popup.type === 'listing' && (
                <>
                  <p><span className="font-medium text-primary">Status:</span> Lists today</p>
                  <p><span className="font-medium text-primary">Issue Price:</span> ₹{popup.ipo.issuePrice || '—'}</p>
                  <p><span className="font-medium text-primary">Listing Price:</span> ₹{popup.ipo.listingPrice || '—'}</p>
                </>
              )}
              <p><span className="font-medium text-primary">Type:</span> {popup.ipo.type || 'Mainboard'}</p>
              {popup.ipo.priceBand && (
                <p><span className="font-medium text-primary">Price Band:</span> {popup.ipo.priceBand}</p>
              )}
              {popup.ipo.lotSize > 0 && (
                <p><span className="font-medium text-primary">Lot Size:</span> {popup.ipo.lotSize}</p>
              )}
              {popup.ipo.gmp !== undefined && popup.ipo.gmp !== 0 && (
                <p><span className="font-medium text-primary">GMP:</span> ₹{popup.ipo.gmp}</p>
              )}
            </div>
            <button onClick={() => setPopup(null)} className="btn-primary w-full text-sm">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
