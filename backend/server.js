require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const cache = require('./cache/memCache');
const { scrapeUpcomingIPOs } = require('./scrapers/upcomingIPO');
const { scrapeOpenIPOs } = require('./scrapers/openIPO');
const { scrapeListedIPOs } = require('./scrapers/listedIPO');
const { scrapeGMP } = require('./scrapers/gmpScraper');
const ipoRoutes = require('./routes/ipoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const TTL = parseInt(process.env.CACHE_TTL) || 3600;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET'],
  })
);
app.use(express.json());

app.use('/api/ipo', ipoRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Warm all caches on startup, then refresh every 60 minutes
async function refreshAll() {
  console.log('[cron] Refreshing all IPO data...');
  const tasks = [
    ['upcoming', scrapeUpcomingIPOs],
    ['open', scrapeOpenIPOs],
    ['listed', scrapeListedIPOs],
    ['gmp', scrapeGMP],
  ];
  await Promise.allSettled(
    tasks.map(async ([key, scraper]) => {
      try {
        const data = await scraper();
        cache.set(key, data, TTL);
        console.log(`[cron] ✓ ${key} — ${data.length} records`);
      } catch (err) {
        console.error(`[cron] ✗ ${key} — ${err.message}`);
      }
    })
  );
  console.log('[cron] Refresh complete');
}

// Warm cache immediately on start
refreshAll();

// Refresh every 60 minutes
cron.schedule('0 * * * *', refreshAll);

app.listen(PORT, () => {
  console.log(`IPOTrack backend running on http://localhost:${PORT}`);
});
