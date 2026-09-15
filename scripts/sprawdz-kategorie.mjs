#!/usr/bin/env node
// Walidacja pola `kategoria` we frontmatterze tekstów (prebuild). Dozwolone:
// siedem kategorii redakcyjnych z src/data/kategorie_artykulow.json plus dwie
// sprzedażowe: Prezentownik (/prezentowniki/) i Deal (/deale/). Decyzja Marka
// 15.09.2026 — wcześniej NARZEDZIA.md i rejestr miały dwie różne „zamknięte" listy,
// a pięć postów dealowych używało wartości spoza obu.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const redakcyjne = JSON.parse(readFileSync('src/data/kategorie_artykulow.json', 'utf8')).kategorie.map((k) => k.nazwa);
const SPRZEDAZOWE = ['Prezentownik', 'Deal'];
const dozwolone = new Set([...redakcyjne, ...SPRZEDAZOWE]);
const pliki = [];
const zbierz = (dir) => { for (const f of readdirSync(dir)) { const p = join(dir, f); if (statSync(p).isDirectory()) zbierz(p); else if (p.endsWith('.md')) pliki.push(p); } };
zbierz('src/pages');
const bledy = [];
for (const p of pliki) {
  const m = /^---\n([\s\S]*?)\n---/.exec(readFileSync(p, 'utf8'));
  const k = m && /^kategoria:\s*["']?([^"'\n]+?)["']?\s*(#.*)?$/m.exec(m[1])?.[1]?.trim();
  if (k && !dozwolone.has(k)) bledy.push(`${p}: kategoria "${k}"`);
}
if (bledy.length) { console.error(`Niedozwolone kategorie (dozwolone: ${[...dozwolone].join(', ')}):\n  ${bledy.join('\n  ')}`); process.exit(1); }
console.log(`Kategorie OK (${pliki.length} tekstów).`);
