#!/usr/bin/env node
// Czy karta produktu na lego.pl jeszcze istnieje? (zasada Marka 16.09.2026)
//
// Po EOL zostawiamy w tabeli cen wiersz LEGO.com z ceną katalogową, linkiem
// i dopiskiem „brak w sprzedaży" — na lego.pl dalej są zdjęcia i opis, a karta
// mówi „Produkcja zakończona" (sprawdzone na 75377). Link znika dopiero wtedy,
// gdy karty nie ma. Ten skrypt weryfikuje pojedyncze numery i prowadzi listę
// `src/data/lego_strony_brak.json`.
//
// Dlaczego nie sitemapa: `sitemap-productPage-pl-PL0.xml` ma 2 165 numerów,
// ale 75377 w nim nie ma — mimo że karta żyje. Brak w sitemapie niczego nie
// dowodzi, więc test musi iść po karcie (Firecrawl, 1 kredyt na zestaw;
// lego.com oddaje naszemu serwerowi 403).
//
// Użycie:
//   node scripts/lego-strony.mjs 75377 10182            # sprawdź podane numery
//   node scripts/lego-strony.mjs --kandydaci 20         # 20 zestawów EOL z RRP, najstarsze
//   node scripts/lego-strony.mjs --kandydaci 20 --sucho # tylko lista, bez pobierania

import { readFileSync, writeFileSync } from 'node:fs';
import { scrape } from './firecrawl.mjs';

const P = (n) => `src/data/${n}`;
const arg = process.argv.slice(2);
const sucho = arg.includes('--sucho');
const limitKandydatow = Number(arg[arg.indexOf('--kandydaci') + 1]) || 0;
const numeryArg = arg.filter((a) => /^\d{4,7}$/.test(a));
const ODSTEP_MS = 6500; // plan Firecrawla: 10 zapytań/min
const czekaj = (ms) => new Promise((r) => setTimeout(r, ms));

const plikTekst = readFileSync(P('lego_strony_brak.json'), 'utf8');
const rejestr = JSON.parse(plikTekst);
const bezStrony = new Set(rejestr.bez_strony ?? []);

function kandydaci(ile) {
  const katalog = JSON.parse(readFileSync(P('katalog.json'), 'utf8'));
  const sety = JSON.parse(readFileSync(P('sety.json'), 'utf8'));
  const rrp = JSON.parse(readFileSync(P('rrp_potwierdzone.json'), 'utf8'));
  const out = [];
  for (const [seria, lista] of Object.entries(katalog)) {
    if (seria === '_meta' || !Array.isArray(lista)) continue;
    for (const s of lista) {
      const nr = String(s.numer);
      if (s.status !== 'eol' || bezStrony.has(nr)) continue;
      const cena = rrp[nr]?.cena ?? sety[nr]?.cena_katalogowa ?? s.cena_katalogowa;
      if (!cena) continue;              // bez ceny katalogowej wiersz LEGO i tak nie powstaje
      out.push({ nr, rok: s.rok ?? 9999 });
    }
  }
  return out.sort((a, b) => a.rok - b.rok).slice(0, ile).map((x) => x.nr);
}

const lista = numeryArg.length ? numeryArg : kandydaci(limitKandydatow || 20);
console.log(`Do sprawdzenia: ${lista.length}${lista.length ? ` — ${lista.slice(0, 15).join(' ')}${lista.length > 15 ? '…' : ''}` : ''}`);
if (sucho) { console.log('Tryb --sucho: nic nie pobrano.'); process.exit(0); }
if (!process.env.FIRECRAWL_KEY) { console.error('Brak FIRECRAWL_KEY.'); process.exit(2); }

const maStrone = [], brak = [], bledy = [];
for (const nr of lista) {
  try {
    const d = await scrape(`https://www.lego.com/pl-pl/product/${nr}`, { formaty: ['markdown'] });
    const md = (typeof d === 'string' ? d : d?.markdown) ?? '';
    // karta zestawu ma nagłówek z nazwą i sekcję „Szczegóły produktu"; strona
    // błędu LEGO jest krótka i niesie „nie znaleziono"/„Page not found"
    const jest = md.length > 3000 && !/nie mogliśmy znaleźć|nie znaleziono|page not found/i.test(md.slice(0, 2000));
    (jest ? maStrone : brak).push(nr);
  } catch (e) {
    const komunikat = String(e.message);
    if (/\b404\b/.test(komunikat)) brak.push(nr);
    else bledy.push(`${nr}: ${komunikat.slice(0, 100)}`);
  }
  await czekaj(ODSTEP_MS);
}
console.log(`Karta istnieje: ${maStrone.length}. Brak karty: ${brak.length}${brak.length ? ` — ${brak.join(' ')}` : ''}. Błędy: ${bledy.length}`);
for (const b of bledy) console.log('  ' + b);

if (brak.length) {
  for (const nr of brak) bezStrony.add(nr);
  rejestr.bez_strony = [...bezStrony].sort();
  rejestr._meta.zaktualizowano = new Date().toISOString().slice(0, 10);
  rejestr._meta.sprawdzono_kart = (rejestr._meta.sprawdzono_kart ?? 0) + lista.length;
  writeFileSync(P('lego_strony_brak.json'), JSON.stringify(rejestr, null, 1) + (plikTekst.endsWith('\n') ? '\n' : ''));
  console.log(`Zapisano: ${rejestr.bez_strony.length} numerów bez karty na lego.pl.`);
} else {
  console.log('Nic do zapisania — wszystkie sprawdzone karty istnieją.');
}
