#!/usr/bin/env node
// Opisy produktowe z kart lego.pl jako MATERIAŁ ŹRÓDŁOWY dla redakcji.
//
// Decyzja Marka 15.09.2026: zbieramy opisy tylko dla zestawów w sprzedaży,
// które nie mają u nas ani opisu (sety.json `opis`), ani karty Piotra
// (karty_setow.json) — 15.09 było ich 100. Każdy opis to jeden plik
// `materialy/opisy-lego/lego-pl/<nr>.md` (tekst LEGO: sekcje „Funkcje"
// i „Szczegóły produktu") oraz — na życzenie — PDF `<nr>.pdf` do przekazania
// Piotrowi. To materiał do researchu, NIE treść do publikacji: standard zakazuje
// języka marketingowego producenta, a tekst LEGO jest chroniony prawem autorskim.
//
// Koszt: 1 kredyt Firecrawla na kartę (markdown). Adresy kart bierzemy z katalogu
// lego.pl (scripts/firecrawl-legopl.mjs); zestaw bez adresu w katalogu pomijamy.
//
// Użycie:
//   node scripts/opisy-legopl.mjs katalog-legopl.json --sucho          # lista, bez pobierania
//   node scripts/opisy-legopl.mjs katalog-legopl.json [--limit 50]      # pobierz brakujące
//   node scripts/opisy-legopl.mjs katalog-legopl.json --numery 21333,21341
//   node scripts/opisy-legopl.mjs --pdf /tmp/opisy-pdf                  # same PDF-y z istniejących .md
//
// Wymaga FIRECRAWL_KEY (pobieranie). PDF: scripts/md-na-pdf.py + Chromium z kontenera.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { scrape } from './firecrawl.mjs';

const arg = process.argv.slice(2);
const plikKatalogu = arg.find((a) => !a.startsWith('--') && a.endsWith('.json'));
const sucho = arg.includes('--sucho');
const limit = Number(arg.find((a) => a.startsWith('--limit='))?.slice(8) ?? (arg.includes('--limit') ? arg[arg.indexOf('--limit') + 1] : 0)) || 0;
const numeryArg = arg.find((a) => a.startsWith('--numery='))?.slice(9) ?? (arg.includes('--numery') ? arg[arg.indexOf('--numery') + 1] : null);
const pdfDir = arg.find((a) => a.startsWith('--pdf='))?.slice(6) ?? (arg.includes('--pdf') ? arg[arg.indexOf('--pdf') + 1] : null);

const KATALOG_MD = 'materialy/opisy-lego/lego-pl';
mkdirSync(KATALOG_MD, { recursive: true });

// --- tylko PDF-y z tego, co już jest ---------------------------------------
if (pdfDir && !plikKatalogu) {
  mkdirSync(pdfDir, { recursive: true });
  const pliki = readdirSync(KATALOG_MD).filter((f) => /^\d+\.md$/.test(f)).sort();
  let n = 0;
  for (const f of pliki) {
    const nr = f.replace('.md', '');
    const md = readFileSync(`${KATALOG_MD}/${f}`, 'utf8');
    const tytul = (md.match(/^# (.+)$/m)?.[1] ?? `LEGO ${nr}`).replace(/"/g, '');
    execFileSync('python3', ['scripts/wyslij-raport.py', '--zadanie', 'przypomnienie', '--tytul', tytul, '--plik', `${KATALOG_MD}/${f}`, '--tylko-pdf', `${pdfDir}/${nr}.pdf`], { stdio: 'ignore' });
    n++;
  }
  console.log(`PDF-y: ${n} plików w ${pdfDir}`);
  process.exit(0);
}

if (!plikKatalogu) {
  console.error('Podaj katalog lego.pl (JSON z firecrawl-legopl.mjs) albo --pdf <katalog>.');
  process.exit(2);
}
const katalogLego = JSON.parse(readFileSync(plikKatalogu, 'utf8'));
const urlKarty = new Map((katalogLego.products ?? []).filter((p) => p.setNumber && p.url).map((p) => [String(p.setNumber), { url: p.url, nazwa: p.name }]));

// --- kandydaci: w sprzedaży, bez opisu i bez karty --------------------------
const sety = JSON.parse(readFileSync('src/data/sety.json', 'utf8'));
const karty = JSON.parse(readFileSync('src/data/karty_setow.json', 'utf8'));
const katalog = JSON.parse(readFileSync('src/data/katalog.json', 'utf8'));
let kandydaci;
if (numeryArg) {
  kandydaci = numeryArg.split(',').map((x) => x.trim()).filter(Boolean);
} else {
  kandydaci = [];
  for (const [seria, lista] of Object.entries(katalog)) {
    if (seria === '_meta' || !Array.isArray(lista)) continue;
    for (const s of lista) {
      const nr = String(s.numer);
      if (s.status !== 'dostepny') continue;
      if (sety[nr]?.opis || karty[nr]) continue;
      kandydaci.push(nr);
    }
  }
}
const doPobrania = kandydaci.filter((nr) => !existsSync(`${KATALOG_MD}/${nr}.md`));
const zAdresem = doPobrania.filter((nr) => urlKarty.has(nr));
const bezAdresu = doPobrania.filter((nr) => !urlKarty.has(nr));
console.log(`Kandydatów: ${kandydaci.length}, bez pliku: ${doPobrania.length}, z adresem karty: ${zAdresem.length}, bez adresu w katalogu lego.pl: ${bezAdresu.length}${bezAdresu.length ? ' (' + bezAdresu.slice(0, 10).join(' ') + (bezAdresu.length > 10 ? '…' : '') + ')' : ''}`);
if (sucho) { console.log('Tryb --sucho: nic nie pobrano.'); process.exit(0); }
if (!process.env.FIRECRAWL_KEY) { console.error('Brak FIRECRAWL_KEY.'); process.exit(2); }

// --- wycinanie treści z markdownu karty ------------------------------------
function wytnij(md) {
  const linie = md.split('\n');
  const start = linie.findIndex((l) => /^## (Funkcje|Szczegóły produktu)/.test(l));
  if (start < 0) return null;
  const koniec = linie.findIndex((l, i) => i > start && /^## (Recenzje produktu|LEGO\.com|STREFA ZABAWY|Zobacz więcej|Podobne)/.test(l));
  const fragment = linie.slice(start, koniec > 0 ? koniec : undefined);
  // wytnij sekcje marketingowe „Zobacz więcej zestawów…" w środku
  const out = []; let pomijam = false;
  for (const l of fragment) {
    if (/^## /.test(l)) pomijam = /^## (Zobacz więcej|Załóż strój|Zdobądź)/.test(l);
    if (!pomijam) out.push(l);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const lista = limit ? zAdresem.slice(0, limit) : zAdresem;
let ok = 0, bledy = [];
for (const nr of lista) {
  const { url, nazwa } = urlKarty.get(nr);
  try {
    const md = await scrape(url, { formaty: ['markdown'] });
    const tresc = wytnij(typeof md === 'string' ? md : md?.markdown ?? '');
    if (!tresc) { bledy.push(`${nr}: brak sekcji Funkcje/Szczegóły w karcie`); continue; }
    const naglowek = `# LEGO ${nazwa} (${nr}) — opis producenta\n\n*Źródło: ${url} · pobrano ${new Date().toISOString().slice(0, 10)} · materiał do researchu, nie do publikacji dosłownie (język producenta, prawa autorskie LEGO).*\n\n`;
    writeFileSync(`${KATALOG_MD}/${nr}.md`, naglowek + tresc + '\n');
    ok++;
  } catch (e) {
    bledy.push(`${nr}: ${String(e.message).slice(0, 100)}`);
  }
}
console.log(`Pobrane: ${ok}, błędy: ${bledy.length}`);
for (const b of bledy.slice(0, 20)) console.log('  ' + b);
if (pdfDir) {
  mkdirSync(pdfDir, { recursive: true });
  let n = 0;
  for (const nr of lista) {
    const f = `${KATALOG_MD}/${nr}.md`;
    if (!existsSync(f)) continue;
    const tytul = (readFileSync(f, 'utf8').match(/^# (.+)$/m)?.[1] ?? `LEGO ${nr}`).replace(/"/g, '');
    execFileSync('python3', ['scripts/wyslij-raport.py', '--zadanie', 'przypomnienie', '--tytul', tytul, '--plik', f, '--tylko-pdf', `${pdfDir}/${nr}.pdf`], { stdio: 'ignore' });
    n++;
  }
  console.log(`PDF-y: ${n} w ${pdfDir}`);
}
