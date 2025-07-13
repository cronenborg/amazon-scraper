import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs/promises';

const TEST_MODE = false;

puppeteer.use(StealthPlugin());

const URL = 'https://www.amazon.it/s?k=sandali+donna';
const MAX_PAGES = TEST_MODE ? 1 : 7;
const WAIT_BETWEEN_PAGES_MS = 5000;

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137 Safari/537.36';

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });
}

async function scrapeAmazonSandals() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENT);

  let currentPage = 1;
  let nextPageUrl = URL;
  const allProducts = [];

  while (currentPage <= MAX_PAGES && nextPageUrl) {
    console.log(`➡️  Pagina ${currentPage}: ${nextPageUrl}`);

    await page.goto(nextPageUrl, { waitUntil: 'domcontentloaded' });
    await autoScroll(page);
    await new Promise(res => setTimeout(res, 2000));


    const products = await page.$$eval('div.s-main-slot > div[data-component-type="s-search-result"]', items =>
    items.map(item => {
            const linkEl = item.querySelector('a.a-link-normal.s-line-clamp-2');
            const titleEl = linkEl?.querySelector('h2 span'); // nested <span> inside <h2>

            const priceEl = item.querySelector('.a-price .a-offscreen');
            const imgEl = item.querySelector('img.s-image');

            const rawPrice = priceEl?.innerText.trim() || null;
            let cleanPrice = null;

            if (rawPrice) {
            cleanPrice = rawPrice
                .replace(/\s/g, '')     // rimuove spazi normali e non-breaking
                .replace('€', '')       // rimuove simbolo euro
                .replace(',', '.');     // sostituisce virgola con punto
            }
            
            return {
            title: titleEl?.innerText.trim() || null,
            price: cleanPrice ? parseFloat(cleanPrice) : null,
            link: linkEl?.href || null,
            image: imgEl?.getAttribute('src') || null,
            };
        })
    );


    console.log(`🛍️  Trovati ${products.length} prodotti`);
    allProducts.push(...products);

    if (TEST_MODE) {
        console.log('🧪 Test mode attivo: esco dopo la prima pagina.');
        break;
    }


    // Trova il link alla pagina successiva
    const nextButtonHref = await page.$eval('a.s-pagination-next', el => el?.href).catch(() => null);
    if (!nextButtonHref) {
      console.log('⛔ Nessuna pagina successiva trovata.');
      break;
    }

    nextPageUrl = nextButtonHref;
    currentPage++;

    console.log(`⏳ Aspetto ${WAIT_BETWEEN_PAGES_MS / 1000}s prima della prossima pagina...`);
    await new Promise(res => setTimeout(res, WAIT_BETWEEN_PAGES_MS));

  }

  await fs.mkdir('./results', { recursive: true });
  await fs.writeFile('./results/search.json', JSON.stringify(allProducts, null, 2), 'utf8');

  console.log(`✅ Salvati ${allProducts.length} prodotti in ./results/search.json`);
  await browser.close();
}

scrapeAmazonSandals().catch(err => {
  console.error('❌ Errore:', err);
});
