const { scrapePage } = require('./browser');

// Scrapes day-wise subscription data for a specific IPO
// URL pattern: https://www.chittorgarh.com/ipo/{ipo-slug}/subscription-status/
async function scrapeSubscriptionDetail(ipoSlug) {
  const URL = `https://www.chittorgarh.com/ipo/${ipoSlug}/subscription-status/`;

  return scrapePage(
    URL,
    () => {
      // Find the IPO name from page heading
      const heading = document.querySelector('h1, h2, .page-title') || document.body;
      const ipoName = heading.innerText.trim().split('\n')[0];

      const table = document.querySelector('table');
      if (!table) return { ipoName, days: [] };

      const headers = Array.from(table.querySelectorAll('thead th')).map((th) =>
        th.innerText.trim().toLowerCase()
      );

      function colIdx(...keywords) {
        for (const kw of keywords) {
          const i = headers.findIndex((h) => h.includes(kw));
          if (i !== -1) return i;
        }
        return -1;
      }

      const dayIdx = colIdx('day');
      const dateIdx = colIdx('date');
      const qibIdx = colIdx('qib');
      const niiIdx = colIdx('nii', 'nnii');
      const riiIdx = colIdx('rii', 'rii', 'retail');
      const totalIdx = colIdx('total', 'subscription');

      const rows = Array.from(table.querySelectorAll('tbody tr'));
      const days = rows
        .map((row) => {
          const cells = Array.from(row.querySelectorAll('td'));
          if (cells.length < 3) return null;
          const c = (i) => (cells[i] ? cells[i].innerText.trim() : '');
          const num = (s) => parseFloat((s || '').replace(/[^0-9.]/g, '')) || 0;

          const day = parseInt(c(dayIdx >= 0 ? dayIdx : 0)) || 0;
          if (!day) return null;

          return {
            day,
            date: c(dateIdx >= 0 ? dateIdx : 1),
            qib: num(c(qibIdx >= 0 ? qibIdx : 2)),
            nii: num(c(niiIdx >= 0 ? niiIdx : 3)),
            rii: num(c(riiIdx >= 0 ? riiIdx : 4)),
            total: num(c(totalIdx >= 0 ? totalIdx : 5)),
          };
        })
        .filter(Boolean);

      return { ipoName, days };
    },
    { waitSelector: 'table', timeout: 30000 }
  );
}

module.exports = { scrapeSubscriptionDetail };
