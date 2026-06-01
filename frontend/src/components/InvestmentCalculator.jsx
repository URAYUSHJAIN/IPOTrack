import { useState, useEffect } from 'react';
import api from '../api.js';

export default function InvestmentCalculator() {
  const [open, setOpen] = useState(false);
  const [ipoList, setIpoList] = useState([]);
  const [selectedIPO, setSelectedIPO] = useState(null);

  // Form inputs
  const [issuePrice, setIssuePrice] = useState('100');
  const [gmp, setGmp] = useState('10');
  const [lotSize, setLotSize] = useState('1');
  const [numLots, setNumLots] = useState('1');
  const [category, setCategory] = useState('Retail');

  useEffect(() => {
    if (open) {
      Promise.all([api.get('/api/ipo/upcoming'), api.get('/api/ipo/open')])
        .then(([upRes, opRes]) => {
          const all = [...(upRes.data.data || []), ...(opRes.data.data || [])];
          setIpoList(all.slice(0, 20)); // Limit to first 20
        })
        .catch((err) => console.error(err));
    }
  }, [open]);

  const handleSelectIPO = (ipo) => {
    setSelectedIPO(ipo);
    setIssuePrice(ipo.priceBand?.split(' ')[0].replace('₹', '') || '100');
    setGmp(ipo.gmp || '0');
    setLotSize(ipo.lotSize || '1');
    setNumLots('1');
  };

  // Calculations
  const issuePriceNum = parseFloat(issuePrice) || 0;
  const gmpNum = parseFloat(gmp) || 0;
  const lotSizeNum = parseInt(lotSize) || 1;
  const numLotsNum = parseInt(numLots) || 1;

  const totalInvestment = issuePriceNum * lotSizeNum * numLotsNum;
  const totalShares = lotSizeNum * numLotsNum;
  const expectedListingPrice = issuePriceNum + gmpNum;
  const expectedProfit = gmpNum * totalShares;
  const expectedReturnPct = issuePriceNum > 0 ? parseFloat(((gmpNum / issuePriceNum) * 100).toFixed(2)) : 0;

  const formatIndian = (num) => {
    if (!num && num !== 0) return '—';
    return Math.round(num).toLocaleString('en-IN');
  };

  return (
    <>
      {/* Floating FAB Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-white shadow-lg hover:bg-accent hover:text-primary transition-all duration-200 flex items-center justify-center text-xl sm:text-2xl"
        title="Investment Calculator"
      >
        🧮
      </button>

      {/* Modal/Drawer - Bottom Sheet on Mobile, Right Drawer on Desktop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity duration-200"
          onClick={() => setOpen(false)}
        >
          <div
            className="fixed right-0 top-0 md:right-0 md:top-0 h-full md:h-full w-full md:w-full md:max-w-sm bg-white shadow-xl overflow-y-auto transform transition-transform duration-300 ease-out
            bottom-0 md:bottom-auto md:top-0 rounded-t-2xl md:rounded-none"
            style={{
              maxHeight: 'calc(100vh - 40px)',
              maxWidth: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle for mobile */}
            <div className="md:hidden sticky top-0 flex justify-center py-2 bg-white rounded-t-2xl">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
            {/* Header */}
            <div className="sticky top-8 md:top-0 bg-primary text-white p-4 sm:p-5 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold">IPO Calculator</h2>
              <button onClick={() => setOpen(false)} className="text-lg hover:text-accent min-h-10 min-w-10 flex items-center justify-center">
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
              {/* IPO Selector */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Select IPO or Enter Details
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search IPO..."
                    className="flex-1 px-3 py-2 border border-secondary rounded-lg text-sm focus:border-accent outline-none"
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase();
                      const ipo = ipoList.find((i) => i.name.toLowerCase().includes(val));
                      if (ipo) handleSelectIPO(ipo);
                    }}
                  />
                </div>
                {selectedIPO && (
                  <p className="text-xs text-accent mt-1 font-medium">✓ {selectedIPO.name}</p>
                )}
              </div>

              {/* Issue Price */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Issue Price (₹)
                </label>
                <input
                  type="number"
                  value={issuePrice}
                  onChange={(e) => setIssuePrice(e.target.value)}
                  placeholder="e.g., 100"
                  className="w-full px-3 py-2 border border-secondary rounded-lg text-sm focus:border-accent outline-none"
                />
              </div>

              {/* GMP */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  GMP (₹)
                </label>
                <input
                  type="number"
                  value={gmp}
                  onChange={(e) => setGmp(e.target.value)}
                  placeholder="e.g., 10"
                  className="w-full px-3 py-2 border border-secondary rounded-lg text-sm focus:border-accent outline-none"
                />
              </div>

              {/* Lot Size */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Lot Size (shares)
                </label>
                <input
                  type="number"
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                  placeholder="e.g., 1"
                  className="w-full px-3 py-2 border border-secondary rounded-lg text-sm focus:border-accent outline-none"
                />
              </div>

              {/* Number of Lots */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  No. of Lots
                </label>
                <input
                  type="number"
                  value={numLots}
                  onChange={(e) => setNumLots(e.target.value)}
                  placeholder="e.g., 1"
                  min="1"
                  className="w-full px-3 py-2 border border-secondary rounded-lg text-sm focus:border-accent outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Investor Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary rounded-lg text-sm focus:border-accent outline-none"
                >
                  <option>Retail</option>
                  <option>NII</option>
                  <option>QIB</option>
                </select>
              </div>

              {/* Results Card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-secondary space-y-3">
                <h3 className="text-sm font-semibold text-primary">Results</h3>

                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Total Investment</p>
                  <p className="text-lg font-bold text-primary">₹{formatIndian(totalInvestment)}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Total Shares</p>
                  <p className="text-lg font-bold text-primary">{formatIndian(totalShares)}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Expected Listing Price</p>
                  <p className="text-lg font-bold text-primary">₹{formatIndian(expectedListingPrice)}</p>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-500 mb-0.5">Expected Profit</p>
                  <p className={`text-2xl font-bold ${expectedProfit >= 0 ? 'text-accent' : 'text-danger'}`}>
                    {expectedProfit >= 0 ? '+' : ''}₹{formatIndian(expectedProfit)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Expected Return %</p>
                  <p className={`text-lg font-bold ${expectedReturnPct >= 0 ? 'text-accent' : 'text-danger'}`}>
                    {expectedReturnPct > 0 ? '+' : ''}{expectedReturnPct}%
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-gray-700">
                  ⚠️ <span className="font-medium">Disclaimer:</span> GMP is indicative and not guaranteed. Actual returns may vary.
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setOpen(false)}
                className="btn-primary w-full text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
