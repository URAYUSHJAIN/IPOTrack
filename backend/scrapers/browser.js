const puppeteer = require('puppeteer');

let _browser = null;

async function getBrowser() {
  if (_browser && _browser.connected) return _browser;
  _browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
    ],
  });
  _browser.on('disconnected', () => { _browser = null; });
  return _browser;
}

async function scrapePage(url, extractFn, { waitSelector = 'table', timeout = 30000 } = {}) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1280, height: 900 });
    // Block images/fonts to speed up scraping
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (['image', 'font', 'media', 'stylesheet'].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout });
    // Wait for the data table to appear
    await page.waitForSelector(waitSelector, { timeout });
    // Small extra wait for JS to populate rows
    await page.waitForFunction(
      (sel) => document.querySelectorAll(`${sel} tbody tr`).length > 0,
      { timeout },
      waitSelector
    );

    const data = await page.evaluate(extractFn);
    return data;
  } finally {
    await page.close();
  }
}

module.exports = { scrapePage };
