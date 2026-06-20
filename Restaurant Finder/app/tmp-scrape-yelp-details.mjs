import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
  await page.goto('https://www.yelp.com/biz/gramercy-tavern-new-york', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(15000);
  const title = await page.title();
  const bodyText = await page.evaluate(() => document.body.innerText);
  const html = await page.content();
  const screenshotPath = path.join(process.cwd(), 'tmp-scrape-yelp-details.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  fs.writeFileSync(path.join(process.cwd(), 'tmp-scrape-yelp-details.html'), html, 'utf8');
  fs.writeFileSync(path.join(process.cwd(), 'tmp-scrape-yelp-details.txt'), bodyText.slice(0, 20000), 'utf8');
  console.log('title:', title);
  console.log('body length:', bodyText.length);
  console.log('body snippet:', bodyText.slice(0, 1200));
  console.log('screenshot saved to', screenshotPath);
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});