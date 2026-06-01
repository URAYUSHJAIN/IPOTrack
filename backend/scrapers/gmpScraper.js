const { scrapePage } = require('./browser');

const URL = 'https://www.investorgain.com/report/live-ipo-gmp/331/ipo/';

async function scrapeGMP() {
  return scrapePage(
    URL,
    () => {
      const table = document.querySelector('table');
      if (!table) return [];

      // Headers: Name | GMP | Rating | Sub | Price(₹) | IPO Size | Lot | Open | Close | BoA Dt | Listing | Updated-On | Anchor
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      return rows
        .map((row) => {
          const cells = Array.from(row.querySelectorAll('td'));
          if (cells.length < 8) return null;
          const c = (i) => (cells[i] ? cells[i].innerText.trim() : '');

          const rawName = c(0);

          // Skip already-listed IPOs (name contains "IPOL@")
          const isListed = rawName.includes('IPOL');
          if (isListed) return null;

          // Clean name — strip IPOU/IPOO/SME suffixes
          const name = rawName
            .replace(/\s*IPO[A-Z@()\d.\-% ]+$/, '')
            .replace(/\s*SME\s*$/i, '')
            .trim();
          if (!name) return null;

          // Parse GMP field: "₹15 (10.00%)" or "₹-- (0.00%)"
          const gmpRaw = c(1);
          const gmpNumMatch = gmpRaw.match(/([-\d.]+)/);
          const gmp = gmpNumMatch ? parseFloat(gmpNumMatch[1]) || 0 : 0;
          const gmpPctMatch = gmpRaw.match(/\(([-\d.]+)%\)/);
          const gmpPct = gmpPctMatch ? parseFloat(gmpPctMatch[1]) : 0;

          const issuePrice = parseFloat(c(4).replace(/[^0-9.]/g, '')) || 0;
          const lotSize = parseInt(c(6).replace(/[^0-9]/g, '')) || 0;

          // Dates may contain "\nGMP: x" on historical rows — take first line only
          const openDate = c(7).split('\n')[0].trim();
          const closeDate = c(8).split('\n')[0].trim();
          const expectedListing = issuePrice > 0 ? parseFloat((issuePrice + gmp).toFixed(2)) : 0;

          return { name, gmp, gmpPct, issuePrice, expectedListing, lotSize, openDate, closeDate };
        })
        .filter(Boolean);
    },
    { waitSelector: 'table', timeout: 30000 }
  );
}

module.exports = { scrapeGMP };
