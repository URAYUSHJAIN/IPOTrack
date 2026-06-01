import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import InvestmentCalculator from './components/InvestmentCalculator.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Upcoming from './pages/Upcoming.jsx';
import Calendar from './pages/Calendar.jsx';
import GMPTracker from './pages/GMPTracker.jsx';
import PastIPOs from './pages/PastIPOs.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 ml-0 md:ml-60 min-h-screen">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upcoming" element={<Upcoming />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/gmp" element={<GMPTracker />} />
            <Route path="/past" element={<PastIPOs />} />
          </Routes>
          <InvestmentCalculator />
        </main>
      </div>
    </BrowserRouter>
  );
}
