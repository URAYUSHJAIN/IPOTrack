import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/upcoming', label: 'Upcoming', icon: '🗓' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/gmp', label: 'GMP Tracker', icon: '📈' },
  { to: '/past', label: 'Past IPOs', icon: '📋' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all duration-200 rounded-r-lg
     ${isActive
       ? 'border-l-4 border-accent bg-white/10 text-white'
       : 'border-l-4 border-transparent text-white/70 hover:text-white hover:bg-white/5'
     }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
     ${isActive ? 'bg-accent text-primary' : 'text-white/80 hover:text-white hover:bg-white/10'}`;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-60 bg-primary flex-col z-40 shadow-lg">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src={logo} alt="IPOTrack" className="w-8 h-8" />
            <div>
              <span className="text-xl font-bold tracking-tight font-mono">
                <span className="text-white">IPO</span>
                <span className="text-accent">Track</span>
              </span>
              <p className="text-white/40 text-[10px] mt-0.5 uppercase tracking-widest">Tracker</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setOpen(false)}>
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Live indicator */}
        <div className="px-5 py-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent live-dot" />
            <span className="text-white/50 text-xs">Live · {lastUpdated}</span>
          </div>
          <p className="text-white/25 text-[10px] mt-1">Data: chittorgarh.com</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-primary shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="IPOTrack" className="w-6 h-6" />
            <span className="text-lg font-bold font-mono">
              <span className="text-white">IPO</span>
              <span className="text-accent">Track</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent live-dot" />
              <span className="text-white/50 text-xs">{lastUpdated}</span>
            </div>
            <button
              onClick={() => setOpen((v) => !v)}
              className="text-white/70 hover:text-white p-1 transition-colors"
              aria-label="Toggle menu"
            >
              {open ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="px-4 pb-4 border-t border-white/10 space-y-1 bg-primary">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={mobileLinkClass}
                onClick={() => setOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Mobile spacer */}
      <div className="md:hidden h-14" />
    </>
  );
}
