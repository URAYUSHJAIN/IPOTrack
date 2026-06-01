const { scrapePage } = require('./browser');

// IPO list page — has name, open/close dates, and price band ("Issue Price" column)
const URL = 'https://www.chittorgarh.com/report/ipo-in-india-list-main-board-sme/82/mainboard/';

async function scrapeUpcomingIPOs() {
  // Headers (confirmed): Company | Pricing Method | Opening Date | Closing Date | Listing Date | Issue Price(Rs.) | Total Issue Amount | Listing at | Lead Manager | Compare
  return scrapePage(
    URL,
    () => {
      const table = document.querySelector('table');
      if (!table) return [];
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return rows
        .map((row) => {
          const cells = Array.from(row.querySelectorAll('td'));
          if (cells.length < 6) return null;
          const c = (i) => (cells[i] ? cells[i].innerText.trim() : '');

          const name = c(0);
          if (!name) return null;

          const openDate = c(2);
          const closeDate = c(3);

          // Only include upcoming IPOs (open date in the future or very recent)
          const openD = new Date(openDate);
          const closeD = new Date(closeDate);
          // If close date has already passed more than 30 days, skip
          if (!isNaN(closeD.getTime()) && closeD < new Date(today.getTime() - 30 * 86400000)) {
            return null;
          }

          const priceBand = c(5); // "42.00 to 45.00"

          return { name, openDate, closeDate, priceBand, lotSize: 0, gmp: 0 };
        })
        .filter(Boolean);
    },
    { waitSelector: 'table', timeout: 30000 }
  );
}

module.exports = { scrapeUpcomingIPOs };
