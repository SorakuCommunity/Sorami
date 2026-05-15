import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
});

const page = await browser.newPage();
// Make headless harder to detect
await page.setExtraHTTPHeaders({
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br'
});

// Block the fingerprint JS to see what happens  
await page.route('**/fingerprint/**', route => route.abort());

try {
  // First try the streaming page directly
  const url = 'https://gogoplay.io/streaming.php?id=MjIwMQ==&title=Naruto+Shippuden+Episode+1';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  console.log('Initial Title:', await page.title());
  console.log('URL:', page.url());
  
  // Wait for potential redirect
  await new Promise(r => setTimeout(r, 2000));
  console.log('Title after 2s:', await page.title());
  console.log('URL after 2s:', page.url());
  
  // Try to find links
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({ href: a.href, text: a.textContent }));
  });
  console.log('Links:', JSON.stringify(links));
  
  const content = await page.content();
  console.log('Content length:', content.length);
  
} catch(e) {
  console.log('Error:', e.message?.substring(0, 200));
}

await browser.close();
