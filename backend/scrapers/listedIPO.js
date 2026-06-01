const { scrapePage } = require('./browser');

// Listing performance page
const URL = 'https://www.chittorgarh.com/report/ipo-listing-date-check-status-price-bse-nse/25/mainboard/';

async function scrapeListedIPOs() {
  // Headers (confirmed): Company | Opening Date | Listing Date | Listing At | ISIN | BSE Scrip Code | NSE Symbol | Issue Price(Rs.) | Close Price on Listing(Rs.) | % Gain/Loss | Current Price BSE | Current Price NSE | Gain/Loss(%)
  return scrapePage(
    URL,
    () => {
      const table = document.querySelector('table');
      if (!table) return [];
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      return rows
        .map((row) => {
          const cells = Array.from(row.querySelectorAll('td'));
          if (cells.length < 10) return null;
          const c = (i) => (cells[i] ? cells[i].innerText.trim() : '');
          const num = (s) => parseFloat((s || '').replace(/[^0-9.-]/g, '')) || 0;

          const name = c(0);
          if (!name) return null;

          const issuePrice = num(c(7));
          const listingPrice = num(c(8));   // Close price on listing day
          const gainLossPct = num(c(9));    // % Gain/Loss vs issue price

          // Skip rows with no meaningful data (not yet listed)
          if (!issuePrice || !listingPrice || !c(2)) return null;

          return {
            name,
            issuePrice,
            listingPrice,
            gainLossPct,
            listingDate: c(2),              // Listing Date
          };
        })
        .filter(Boolean);
    },
    { waitSelector: 'table', timeout: 30000 }
  );
}

module.exports = { scrapeListedIPOs };
