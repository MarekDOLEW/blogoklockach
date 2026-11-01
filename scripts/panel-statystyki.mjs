#!/usr/bin/env node
// Dzienny zrzut statystyk dla panelu (panel.tylkoklocki.pl → Statystyki, Afiliacje, Artykuły).
//
// Build panelu w Cloudflare nie ma kluczy do Search Console ani Analytics Engine,
// więc liczby trafiają do repo jako plik z datą: materialy/statystyki/RRRR-MM-DD.json.
// Kolejne dni dają historię (trend w panelu). Źródła — te same skrypty co u Kontrolera:
//   scripts/gsc-raport.mjs   (GSC_KEY_JSON_B64)          — kliknięcia, wyświetlenia, frazy, strony
//   scripts/kliki-raport.mjs (CF_ACCOUNT_ID, CF_API_TOKEN) — kliknięcia w /idz/ (tylko ludzie)
// Uruchamia go codziennie zadanie „Weryfikacja ofert do slajderów” (09:17, sesja Code).
// Błąd jednego źródła nie blokuje drugiego — w pliku ląduje wtedy `blad`.
//
// Użycie: node scripts/panel-statystyki.mjs

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const dzis = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(new Date());

function raport(skrypt, ...arg) {
  try {
    return JSON.parse(execFileSync('node', [join(REPO, 'scripts', skrypt), ...arg], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 180e3 }));
  } catch (e) {
    return { blad: String(e.stderr ?? e.message).trim().split('\n').pop().slice(0, 300) };
  }
}

const przytnij = (r, n = 50) => (r.blad ? r : { ...r, frazy: r.frazy?.slice(0, n), strony: r.strony?.slice(0, 100) });
const wynik = {
  data: dzis,
  czas: new Date().toISOString(),
  gsc: { d7: przytnij(raport('gsc-raport.mjs', '--dni', '7')), d28: przytnij(raport('gsc-raport.mjs', '--dni', '28')) },
  kliki: { d7: raport('kliki-raport.mjs', '--dni', '7'), d28: raport('kliki-raport.mjs', '--dni', '28') },
};

const kat = join(REPO, 'materialy/statystyki');
mkdirSync(kat, { recursive: true });
writeFileSync(join(kat, `${dzis}.json`), JSON.stringify(wynik, null, 1) + '\n');
const s = wynik.gsc.d28.suma;
console.log(`statystyki ${dzis}: GSC 28 dni ${s ? `${s.clicks} kliknięć, ${s.impressions} wyświetleń` : `błąd (${wynik.gsc.d28.blad})`}; sklepy 28 dni ${wynik.kliki.d28.kliki_lacznie ?? `błąd (${wynik.kliki.d28.blad})`} kliknięć ludzi`);
