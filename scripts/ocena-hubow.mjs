// Ocena każdego huba /zestaw/<nr>/ prosto z `ocenaHubu()` w src/lib/seo.js —
// ta sama funkcja, która w buildzie decyduje o noindex i sitemapie. Raporty
// (np. scripts/noindex-do-opisania.py) czytają ten wynik zamiast powtarzać
// regułę u siebie: 12.10.2026 kopia w Pythonie wciąż twierdziła „sam opis nie
// wystarczy", choć od 02.10 wystarcza, i liczyła premierę z 365 dni zamiast 18 mies.
//
// Moduł ładuje vite z konfiguracją Astro (importy JSON bez atrybutów, aliasy).
// Lista hubów pochodzi z dist/zestaw, więc potrzebny jest świeży `npm run build`.
//
// Użycie:  node scripts/ocena-hubow.mjs [plik.json]   (domyślnie /tmp/ocena-hubow.json)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BAZA = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
process.chdir(BAZA);
const wyjscie = process.argv[2] ?? '/tmp/ocena-hubow.json';

if (!fs.existsSync('dist/zestaw')) {
  console.error('Brak dist/zestaw — najpierw `npm run build`.');
  process.exit(1);
}

const { getViteConfig } = await import('astro/config');
const { createServer } = await import('vite');
const cfg = await getViteConfig({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })({ command: 'serve', mode: 'development' });
const serwer = await createServer({
  ...cfg,
  configFile: false,
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] },
});
const seo = await serwer.ssrLoadModule('/src/lib/seo.js');

const wynik = {};
for (const nr of fs.readdirSync('dist/zestaw')) {
  if (!fs.existsSync(`dist/zestaw/${nr}/index.html`)) continue;
  const html = fs.readFileSync(`dist/zestaw/${nr}/index.html`, 'utf8').slice(0, 6000);
  wynik[nr] = { ...seo.ocenaHubu(nr), noindexWBuildzie: /<meta name="robots" content="[^"]*noindex/.test(html) };
}
await serwer.close();

const rozjazd = Object.entries(wynik).filter(([, o]) => o.indeksowalny === o.noindexWBuildzie).map(([nr]) => nr);
fs.writeFileSync(wyjscie, JSON.stringify(wynik));
console.error(`huby: ${Object.keys(wynik).length}, indeksowalne: ${Object.values(wynik).filter((o) => o.indeksowalny).length}` +
  (rozjazd.length ? `, ROZJAZD z buildem: ${rozjazd.length} (np. ${rozjazd.slice(0, 5).join(', ')}) — build nieświeży?` : ', zgodne z buildem'));
process.exit(0);
