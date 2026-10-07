#!/usr/bin/env node
// Sprawdzenie na żądanie: czy oferty konkretnego zestawu są jeszcze aktualne.
//
// Odpowiada na pytanie Marka (18.09.2026): „jak sprawdzić, czy oferta do tego
// zestawu jest aktualna". Dane serwisu mówią tylko, KIEDY widzieliśmy cenę
// w feedzie — a feed potrafi kłamać. Dowód z tego samego dnia: feed Planety
// Klocków podawał cenę zestawu 43024, a karta produktu dawała 404, bo sklep
// zmienił adres. Ten skrypt sprawdza jedno i drugie naraz.
//
// Co pokazuje dla każdej oferty:
//   – cenę i datę odczytu oraz wiek w dniach,
//   – czy oferta przechodzi sito serwisu (14 dni, 28% ceny katalogowej,
//     podejrzany rynek) — czyli czy w ogóle jest widoczna na stronie,
//   – kod HTTP karty produktu w sklepie.
//
// Jak w kontroli linków: NIE odpytujemy linku trackingowego (to byłby sztucznie
// nabity klik), tylko adres docelowy sklepu wyciągnięty z linku. Allegro, Empik,
// Media Expert i LEGO.com odrzucają ruch serwerowy — dla nich kod to „blokada",
// nie „martwy".
//
// Użycie:
//   node scripts/sprawdz-oferte.mjs 43024
//   node scripts/sprawdz-oferte.mjs 43024 76444 10333   # kilka naraz

import { readFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { celLinku, SKLEPY_BLOKUJACE, UA_PRZEGLADARKI } from './linki-cel.mjs';

const uruchom = promisify(execFile);
const czytaj = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url)));
const sety = czytaj('sety.json');
const feed = czytaj('oferty_feed.json').sety ?? {};
const redirects = czytaj('redirects.json');
const rrpPotwierdzone = czytaj('rrp_potwierdzone.json');
const cenyBaza = czytaj('ceny_baza.json');
const dealePotwierdzone = czytaj('deale_potwierdzone.json');
const katalog = czytaj('katalog.json');
const sklepy = czytaj('sklepy.json');

const numery = process.argv.slice(2).filter((a) => /^\d{4,7}$/.test(a));
if (!numery.length) { console.error('Podaj numer zestawu, np.: node scripts/sprawdz-oferte.mjs 43024'); process.exit(1); }

const BLOKUJACE = SKLEPY_BLOKUJACE;
const UA = UA_PRZEGLADARKI;
const DZIS = new Date();
const wiek = (data) => (data ? Math.round((DZIS - new Date(data)) / 864e5) : null);
const fmt = (c) => Number(c).toFixed(2).replace('.', ',') + ' zł';

function cenaKatalogowa(nr) {
  return rrpPotwierdzone[nr]?.cena ?? sety[nr]?.cena_katalogowa ?? cenyBaza[nr]?.cena_katalogowa ?? null;
}

async function kodHttp(adres) {
  const wspolne = ['-s', '-o', '/dev/null', '-w', '%{http_code}', '-L', '--max-time', '12', '--connect-timeout', '6',
    '-A', UA, '-H', 'Accept-Language: pl-PL,pl;q=0.9'];
  try {
    const { stdout } = await uruchom('curl', ['-I', ...wspolne, adres]);
    return Number(stdout.trim());
  } catch { return 0; }
}

for (const nr of numery) {
  const s = sety[nr] ?? {};
  const nazwa = s.nazwa ?? Object.values(katalog).flat().find?.((x) => String(x?.numer) === nr)?.nazwa ?? '';
  const rrp = cenaKatalogowa(nr);
  console.log(`\n== ${nr}${nazwa ? ' ' + nazwa : ''}`);
  console.log(`   cena katalogowa: ${rrp ? fmt(rrp) : 'nieznana'} · hub: https://tylkoklocki.pl/zestaw/${nr}/`);

  // Wszystkie oferty z obu źródeł, najniższa per sklep.
  const zebrane = new Map();
  const dodaj = (sklep, cena, data) => {
    if (!(cena > 0)) return;
    const stara = zebrane.get(sklep);
    if (!stara || cena < stara.cena) zebrane.set(sklep, { cena, data: data ?? null });
  };
  const w = feed[nr] ?? {};
  for (const [sklep, cena] of Object.entries(w.oferty ?? {})) dodaj(sklep, cena, (w.daty ?? {})[sklep] ?? w.data);
  for (const o of s.oferty ?? []) dodaj(o.sklep, o.cena, o.data);

  if (!zebrane.size) { console.log('   Brak jakiejkolwiek oferty w danych — na stronie hub pokazuje sam katalog.'); continue; }

  for (const [sklep, o] of [...zebrane].sort((a, b) => a[1].cena - b[1].cena)) {
    const dni = wiek(o.data);
    const przestarzala = dni !== null && dni > 14;
    const podszywka = rrp && o.cena < 0.28 * rrp;
    const potwierdzony = dealePotwierdzone.potwierdzone?.[nr];
    const podejrzana = rrpPotwierdzone[nr]?.cena && o.cena < 0.5 * rrpPotwierdzone[nr].cena
      && !(potwierdzony && o.cena >= potwierdzony.cena - 0.01);
    const link = redirects[sklep]?.[nr] ?? null;
    const cel = celLinku(link);
    const kod = cel ? await kodHttp(cel) : 0;
    const stanLinku = !link ? 'brak linku w mapie'
      : !cel ? 'nie umiem wyciągnąć adresu docelowego'
      : kod >= 200 && kod < 400 ? `karta produktu OK (${kod})`
      : kod === 404 || kod === 410 ? `KARTA NIE ISTNIEJE (${kod})`
      : BLOKUJACE.has(sklep) ? `sklep blokuje ruch serwerowy (${kod || 'timeout'}) — nie sprawdzone`
      : `nierozstrzygnięte (${kod || 'timeout'})`;
    const ukryta = [przestarzala && `starsza niż 14 dni (${dni})`, podszywka && 'poniżej 28% ceny katalogowej', podejrzana && 'podejrzany rynek, czeka na potwierdzenie'].filter(Boolean);
    console.log(`   ${(sklepy[sklep]?.nazwa ?? sklep).padEnd(16)} ${fmt(o.cena).padStart(11)}  odczyt ${o.data ?? '—'}${dni !== null ? ` (${dni} dni temu)` : ''}`);
    console.log(`   ${' '.repeat(16)} ${ukryta.length ? 'UKRYTA NA STRONIE: ' + ukryta.join('; ') : 'widoczna na stronie'} · ${stanLinku}`);
    if (cel) console.log(`   ${' '.repeat(16)} ${cel}`);
  }
}
