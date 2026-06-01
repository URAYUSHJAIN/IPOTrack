import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function GMPChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-8 flex items-center justify-center min-h-[200px] text-gray-400">
        <div className="text-center">
          <span className="text-4xl block mb-2">📉</span>
          <span>No GMP data to display</span>
        </div>
      </div>
    );
  }

  const labels = data.map((d) => d.name.length > 18 ? d.name.slice(0, 18) + '…' : d.name);
  const gmpPctValues = data.map((d) => d.gmpPct);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'GMP %',
        data: gmpPctValues,
        borderColor: '#00C853',
        backgroundColor: 'rgba(0,200,83,0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: gmpPctValues.map((v) => (v >= 0 ? '#00C853' : '#F44336')),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isTablet = typeof window !== 'undefined' && window.innerWidth < 1024;
  const chartHeight = isMobile ? 220 : isTablet ? 300 : 400;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111111',
        titleColor: '#fff',
        bodyColor: '#00C853',
        borderColor: '#333',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          title: (items) => data[items[0].dataIndex]?.name || '',
          label: (item) => {
            const d = data[item.dataIndex];
            return [
              `GMP: ₹${d.gmp}`,
              `Expected Listing: ₹${d.expectedListing}`,
              `GMP %: ${d.gmpPct > 0 ? '+' : ''}${d.gmpPct}%`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#EAEAEA', drawBorder: false },
        ticks: {
          color: '#111111',
          font: { family: 'Ubuntu', size: isMobile ? 9 : 11 },
          maxRotation: isMobile ? 45 : 30,
        },
      },
      y: {
        grid: { color: '#EAEAEA', drawBorder: false },
        ticks: {
          color: '#111111',
          font: { family: 'Ubuntu', size: isMobile ? 9 : 11 },
          callback: (v) => `${v}%`,
        },
        zero: true,
      },
    },
  };

  return (
    <div className="card p-3 sm:p-5">
      <h2 className="text-base font-semibold text-primary mb-4">GMP % Comparison</h2>
      <div style={{ height: chartHeight }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
