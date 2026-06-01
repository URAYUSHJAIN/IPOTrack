const { scrapePage } = require('./browser');
const { scrapeGMP } = require('./gmpScraper');

// Subscription status page
const SUB_URL = 'https://www.chittorgarh.com/report/ipo-subscription-status-live-bidding-data-bse-nse/21/';

// Fuzzy name match — returns true if both names share significant overlap
function namesMatch(a, b) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const na = norm(a);
  const nb = norm(b);
  return na.includes(nb.slice(0, 10)) || nb.includes(na.slice(0, 10));
}

async function scrapeOpenIPOs() {
  // Headers (confirmed): Company | Closing Date | Total Issue Amount | QIB | sNII | bNII | NII | Retail | Employee | Shareholder | Others | Total(x) | Applications | Subscription as on
  const subData = await scrapePage(
    SUB_URL,
    () => {
      const table = document.querySelector('table');
      if (!table) return [];
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      return rows
        .map((row) => {
          const cells = Array.from(row.querySelectorAll('td'));
          if (cells.length < 12) return null;
          const c = (i) => (cells[i] ? cells[i].innerText.trim() : '');

          const name = c(0);
          if (!name) return null;

          // Close date: "07-May-2026" — filter out already-closed IPOs
          const closeDateStr = c(1);
          const closeD = new Date(closeDateStr);
          if (!isNaN(closeD.getTime()) && closeD < new Date(now.getTime() - 86400000)) return null;

          const totalSub = parseFloat(c(11).replace(/[^0-9.]/g, '')) || 0;
          return { name, closeDate: closeDateStr, subscriptionQQS: totalSub };
        })
        .filter(Boolean);
    },
    { waitSelector: 'table', timeout: 30000 }
  );

  // Enrich with GMP data (lot size, price band, gmp)
  let gmpData = [];
  try {
    gmpData = await scrapeGMP();
  } catch (_) {}

  return subData.map((ipo) => {
    const gmpEntry = gmpData.find((g) => namesMatch(ipo.name, g.name));
    return {
      name: ipo.name,
      closeDate: ipo.closeDate,
      subscriptionQQS: ipo.subscriptionQQS,
      priceBand: gmpEntry ? `₹${gmpEntry.issuePrice}` : '',
      lotSize: gmpEntry?.lotSize || 0,
      gmp: gmpEntry?.gmp || 0,
    };
  });
}

module.exports = { scrapeOpenIPOs };
