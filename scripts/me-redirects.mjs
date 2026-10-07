#!/usr/bin/env node
// Uzupełnienie redirects.json → mediaexpert o linki, których tam jeszcze nie ma.
//
// Po co: Łowca importuje z feedu ME ceny do oferty_feed.json, ale linki
// produktowe trzeba dopisać osobno. Bez wpisu worker nie ma dokąd przekierować
// (dla ME nie ma fallbacku ani szablonu `szukaj`), więc oferta pokazuje cenę,
// a klik przepada razem z prowizją 2% — 24 takie pozycje na 5 945 zł ekspozycji
// znalazł Kontroler 14.09.2026.
//
// Wejście: wyciąg z feedu, czyli plik z `python3 scripts/feedy-lego.py
// --tylko mediaexpert --wyjscie <plik>`; feed ma ~600 MB, więc nie pobieramy go
// tu drugi raz.
//
// Link z feedu ma placeholdery sieci Performers zamiast naszego identyfikatora
// (`aff_sub=Partner_ID`, `Partner_ID={aff_sub}`) — podstawiamy `tylkoklocki`
// i doklejamy `transaction_id`, dokładnie tak jak wyglądają wpisy już zapisane.
//
// Plik jest append-only: istniejących wpisów NIE ruszamy (starsze mają w URL
// inne parametry utm_* i nie ma powodu ich przepisywać — tracking afiliacyjny,
// czyli aff_id/aff_sub/transaction_id, jest w obu wariantach ten sam).
//
// Użycie:
//   node scripts/me-redirects.mjs <wyciag.json> [--sucho]

import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const plik = args.find((a) => !a.startsWith('--'));
const sucho = args.includes('--sucho');
if (!plik) {
  console.error('Użycie: node scripts/me-redirects.mjs <wyciag-feedu.json> [--sucho]');
  process.exit(2);
}

const PARTNER = 'tylkoklocki';

function naNaszLink(link) {
  let t = link
    .replace('aff_sub=Partner_ID', `aff_sub=${PARTNER}`)
    .replace('Partner_ID%3D{aff_sub}', `Partner_ID%3D${PARTNER}`);
  // parametr transaction_id musi stać także poza zakodowanym url=
  if (!/&transaction_id=\{transaction_id\}$/.test(t)) t += '&transaction_id={transaction_id}';
  return t;
}

const wyciag = JSON.parse(readFileSync(plik, 'utf8'));
const zFeedu = wyciag.mediaexpert ?? wyciag;
const oferty = JSON.parse(readFileSync('src/data/oferty_feed.json', 'utf8')).sety ?? {};
const redirects = JSON.parse(readFileSync('src/data/redirects.json', 'utf8'));
const me = (redirects.mediaexpert ??= {});
const przed = Object.keys(me).length;

// Dopisujemy tylko tam, gdzie serwis realnie pokazuje ofertę ME — inaczej
// zaśmiecamy plik linkami do zestawów, których nigdzie nie wyświetlamy.
const zOferta = new Set(
  Object.entries(oferty)
    .filter(([nr, v]) => nr !== '_meta' && v && typeof v === 'object' && (v.oferty ?? {}).mediaexpert !== undefined)
    .map(([nr]) => nr),
);

const dodane = [];
const odrzucone = [];
for (const [nr, wpis] of Object.entries(zFeedu)) {
  if (!/^\d{4,7}$/.test(nr) || me[nr] || !zOferta.has(nr)) continue;
  const link = wpis?.link ?? '';
  // numer zestawu musi stać w adresie karty produktu — inaczej link prowadzi
  // do czegoś innego, niż zapowiada cena obok
  if (!link.startsWith('https://track.performers.tech/') || !link.includes(nr)) {
    odrzucone.push([nr, link.slice(0, 80)]);
    continue;
  }
  me[nr] = naNaszLink(link);
  dodane.push(nr);
}

const po = Object.keys(me).length;
if (po < przed) {
  console.error(`PRZERWANE: ubyło wpisów (${przed} → ${po}).`);
  process.exit(1);
}
console.log(`redirects.mediaexpert: ${przed} → ${po} (+${dodane.length})`);
if (dodane.length) console.log('  dodane:', dodane.join(', '));
if (odrzucone.length) {
  console.log(`  ODRZUCONE (numer nie występuje w adresie): ${odrzucone.length}`);
  for (const [nr, l] of odrzucone) console.log(`    ${nr}  ${l}…`);
}
if (sucho) {
  console.log('--sucho: nic nie zapisano.');
  process.exit(0);
}
writeFileSync('src/data/redirects.json', `${JSON.stringify(redirects, null, 1)}\n`);
console.log('Zapisano src/data/redirects.json');
