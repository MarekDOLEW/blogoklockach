// Zrzuty ekranu strony w Chromium: desktop 1400 px i mobile 390 px -> dist/zrzut-*.png
// Sprawdza też błędy konsoli, nieudane requesty (brakujące obrazy), poziomy scroll.
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../', import.meta.url));

const exe = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
let bledy = 0;
for (const [nazwa, viewport, mobile] of [['desktop-1400', { width: 1400, height: 900 }, false], ['mobile-390', { width: 390, height: 844 }, true]]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce' });
  // Google Fonts blokujemy w teście (środowisko offline / deterministyczny fallback).
  if (process.env.BEZ_FONTOW !== '0') await ctx.route(/fonts\.g(oogleapis|static)\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) { bledy++; console.log(`[${nazwa}] console.error:`, m.text()); } });
  page.on('requestfailed', (r) => { if (!/fonts\.g/.test(r.url())) { bledy++; console.log(`[${nazwa}] request failed:`, r.url()); } });
  page.on('response', (r) => { if (r.status() >= 400) { bledy++; console.log(`[${nazwa}] HTTP ${r.status()}:`, r.url()); } });
  await page.goto(new URL('../index.html', import.meta.url).href, { waitUntil: 'load', timeout: 30000 });
  // przewiń całą stronę, żeby lazy-loading pobrał wszystkie obrazy
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    const czekaj = (i) => new Promise((r) => {
      if (i.complete) return r();
      i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true });
      setTimeout(r, 4000); // nigdy nie blokuj testu na jednym obrazie
    });
    await Promise.all([...document.images].map(czekaj));
    window.scrollTo(0, 0);
  });
  const niezaladowane = await page.evaluate(() => [...document.images].filter((i) => i.getClientRects().length && !i.naturalWidth).map((i) => i.currentSrc || i.src));
  if (niezaladowane.length) { bledy++; console.log(`[${nazwa}] obrazy bez wymiarów:`, niezaladowane); }
  const szerDok = await page.evaluate(() => document.documentElement.scrollWidth);
  if (szerDok > viewport.width) { bledy++; console.log(`[${nazwa}] poziomy scroll! scrollWidth=${szerDok}`); }
  await page.screenshot({ path: join(ROOT, `dist/zrzut-${nazwa}.png`), fullPage: true });
  console.log(`[${nazwa}] zrzut zapisany, scrollWidth=${szerDok}`);
  await ctx.close();
}
await browser.close();
console.log(bledy ? `BŁĘDY: ${bledy}` : 'OK – bez błędów');
process.exit(bledy ? 1 : 0);
