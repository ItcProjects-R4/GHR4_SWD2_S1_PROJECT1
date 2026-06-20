import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
  await page.goto('https://www.yelp.com/biz/gramercy-tavern-new-york', { waitUntil: 'domcontentloaded', timeout: 120000 });
  const html = await page.content();
  const text = await page.evaluate(() => document.body.innerText.slice(0, 2000));
  const reviews = await page.evaluate(() => {
    const results = [];
    const reviewEl = document.querySelector('section[aria-label*="reviews"], section#reviews, [data-testid="reviews"]');
    if (reviewEl) {
      results.push({ selector: 'reviews section', text: reviewEl.innerText.slice(0, 1000) });
    }
    const cards = Array.from(document.querySelectorAll('article, div[class*="review"], li[class*="review"], [data-review-id], [data-testid="review"]')).slice(0, 5);
    cards.forEach((el, index) => {
      results.push({ index, html: el.outerHTML.slice(0, 500), text: el.innerText.slice(0, 500) });
    });
    return results;
  });
  console.log('title:', await page.title());
  console.log('text snippet:', text);
  console.log('reviews count:', reviews.length);
  console.log(JSON.stringify(reviews, null, 2));
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});