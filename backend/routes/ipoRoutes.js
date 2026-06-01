const express = require('express');
const router = express.Router();
const cache = require('../cache/memCache');
const { scrapeUpcomingIPOs } = require('../scrapers/upcomingIPO');
const { scrapeOpenIPOs } = require('../scrapers/openIPO');
const { scrapeListedIPOs } = require('../scrapers/listedIPO');
const { scrapeGMP } = require('../scrapers/gmpScraper');
const { scrapeSubscriptionDetail } = require('../scrapers/subscriptionDetail');

const TTL = parseInt(process.env.CACHE_TTL) || 3600;
const SUB_TTL = 1800; // 30 minutes for subscription detail

// Helper that returns cached data immediately and refreshes in background
async function cachedFetch(key, scraper, res) {
  const fresh = cache.get(key);
  if (fresh) {
    return res.json({ data: fresh, stale: false, cachedAgeSeconds: cache.getAge(key) });
  }

  const stale = cache.getStale(key);
  if (stale) {
    // Return stale, trigger refresh in background
    res.json({ data: stale, stale: true, cachedAgeSeconds: cache.getAge(key) });
    scraper()
      .then((d) => cache.set(key, d, TTL))
      .catch((err) => console.error(`[cache refresh] ${key}:`, err.message));
    return;
  }

  // No cache at all — must scrape now
  try {
    const data = await scraper();
    cache.set(key, data, TTL);
    res.json({ data, stale: false, cachedAgeSeconds: 0 });
  } catch (err) {
    console.error(`[scrape error] ${key}:`, err.message);
    res.status(502).json({ error: 'Failed to fetch IPO data', detail: err.message, data: [] });
  }
}

router.get('/upcoming', (req, res) => cachedFetch('upcoming', scrapeUpcomingIPOs, res));
router.get('/open', (req, res) => cachedFetch('open', scrapeOpenIPOs, res));
router.get('/listed', (req, res) => cachedFetch('listed', scrapeListedIPOs, res));
router.get('/gmp', (req, res) => cachedFetch('gmp', scrapeGMP, res));

router.get('/stats', async (req, res) => {
  try {
    const upcoming = cache.getStale('upcoming') || [];
    const open = cache.getStale('open') || [];
    const listed = cache.getStale('listed') || [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recent = listed.filter((ipo) => {
      if (!ipo.listingDate) return true;
      const d = new Date(ipo.listingDate);
      return isNaN(d.getTime()) || d >= thirtyDaysAgo;
    });

    const gains = recent.map((ipo) => ipo.gainLossPct).filter((v) => !isNaN(v));
    const avgListingGain30d =
      gains.length > 0
        ? parseFloat((gains.reduce((a, b) => a + b, 0) / gains.length).toFixed(2))
        : 0;

    const topGainerIPO = [...listed].sort((a, b) => b.gainLossPct - a.gainLossPct)[0];

    res.json({
      data: {
        totalUpcoming: upcoming.length,
        totalOpen: open.length,
        avgListingGain30d,
        topGainer: topGainerIPO
          ? { name: topGainerIPO.name, gainLossPct: topGainerIPO.gainLossPct }
          : null,
      },
      stale: false,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute stats', data: {} });
  }
});

router.get('/subscription/:slug', async (req, res) => {
  const cacheKey = `subscription:${req.params.slug}`;
  try {
    const fresh = cache.get(cacheKey);
    if (fresh) {
      return res.json({ data: fresh, stale: false, cachedAgeSeconds: cache.getAge(cacheKey) });
    }

    const stale = cache.getStale(cacheKey);
    if (stale) {
      res.json({ data: stale, stale: true, cachedAgeSeconds: cache.getAge(cacheKey) });
      scrapeSubscriptionDetail(req.params.slug)
        .then((d) => cache.set(cacheKey, d, SUB_TTL))
        .catch((err) => console.error(`[cache refresh] ${cacheKey}:`, err.message));
      return;
    }

    const data = await scrapeSubscriptionDetail(req.params.slug);
    cache.set(cacheKey, data, SUB_TTL);
    res.json({ data, stale: false, cachedAgeSeconds: 0 });
  } catch (err) {
    console.error(`[scrape error] ${cacheKey}:`, err.message);
    res.status(502).json({
      error: 'Failed to fetch subscription data',
      detail: err.message,
      data: { ipoName: '', days: [] },
    });
  }
});

module.exports = router;
