import { useState, useEffect } from 'react';
import api from '../api.js';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler);

export default function SubscriptionChart({ ipoSlug, ipoName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ipoSlug) {
      setLoading(false);
      return;
    }

    api
      .get(`/api/ipo/subscription/${ipoSlug}`)
      .then((res) => {
        setData(res.data.data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Subscription data unavailable');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [ipoSlug]);

  if (loading) {
    return (
      <div className="card p-5 animate-pulse">
        <div className="h-4 bg-secondary rounded w-48 mb-3" />
        <div className="h-64 bg-secondary rounded" />
      </div>
    );
  }

  if (error || !data || data.days.length === 0) {
    return (
      <div className="card p-8 flex items-center justify-center min-h-[200px] text-gray-400 text-center">
        <div>
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <p className="text-sm">{error || 'No subscription data available'}</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.days.map((d) => `Day ${d.day}`),
    datasets: [
      {
        label: 'QIB',
        data: data.days.map((d) => d.qib),
        backgroundColor: '#00C853',
        borderColor: '#00C853',
        borderRadius: 3,
      },
      {
        label: 'NII',
        data: data.days.map((d) => d.nii),
        backgroundColor: '#111111',
        borderColor: '#111111',
        borderRadius: 3,
      },
      {
        label: 'Retail',
        data: data.days.map((d) => d.rii),
        backgroundColor: '#888888',
        borderColor: '#888888',
        borderRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Ubuntu', size: 11 },
          color: '#111111',
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#111111',
        titleColor: '#fff',
        bodyColor: '#00C853',
        borderColor: '#333',
        borderWidth: 1,
        padding: 8,
        callbacks: {
          label: (item) => `${item.dataset.label}: ${item.parsed.y.toFixed(2)}x`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#EAEAEA', drawBorder: false },
        ticks: {
          color: '#111111',
          font: { family: 'Ubuntu', size: 11 },
        },
      },
      y: {
        grid: { color: '#EAEAEA', drawBorder: false },
        ticks: {
          color: '#111111',
          font: { family: 'Ubuntu', size: 11 },
          callback: (v) => `${v}x`,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="card p-5 mt-4">
      <h3 className="text-base font-semibold text-primary mb-4">Category-wise Subscription Progress</h3>
      <div style={{ height: 300 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
