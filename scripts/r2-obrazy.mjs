#!/usr/bin/env node
// Wgrywa do R2 zdjęcia, których worker nie potrafi pobrać ze źródła.
//
// Skąd ten skrypt (14.09.2026): 348 z 608 zdjęć galerii (/img/<nr>-<poz>.jpg)
// oddawało 502. Wszystkie leżą w cache Planety Klocków; z kontenera te same
// adresy dają 200, ale fetch z workera dostaje odmowę (PK odrzuca adresy
// Cloudflare). Worker czyta R2 PRZED źródłem, więc wystarczy wgrać plik pod
// tym samym kluczem, którego używa worker (`42220-1`, bez rozszerzenia) — bez
// zmiany kodu i bez deployu.
//
// Użycie:
//   node scripts/r2-obrazy.mjs                      # codzienny tryb: lista R2 → wgraj to, czego brakuje z Planety (sekundy)
//   node scripts/r2-obrazy.mjs --limit 300          # jak wyżej, ale najwyżej 300 plików w tym przebiegu
//   node scripts/r2-obrazy.mjs --sprawdz            # audyt: HEAD na każde /img/ na produkcji (~15 min), także martwe źródła
//   node scripts/r2-obrazy.mjs --sprawdz --galerie  # audyt tylko galerii (2 min)
//   node scripts/r2-obrazy.mjs --klucze 42220-1,60478-3   # wgraj wskazane klucze (bez pytania R2 i produkcji)
//
// Rejestrem „co już wgrane" jest sam kubełek R2: jedno listowanie (ok. 11 stron
// po 1000 kluczy) mówi dokładnie, co tam leży. Osobny plik stanu w repo
// rozjeżdżałby się przy każdym ręcznym wgraniu albo kasowaniu — kubełek nie.
// W trybie codziennym patrzymy tylko na źródła z Planety Klocków, bo tylko ich
// worker nie pobierze sam; Allegro i Rebrickable worker dociąga na żądanie.
// --sprawdz pyta produkcji o każdy plik i dlatego widzi też martwe źródła
// (np. Rebrickable 404) — to audyt, nie codzienność.
//
// Wymaga CF_ACCOUNT_ID i CF_R2_TOKEN (token z uprawnieniem Workers R2 Storage: Edit,
// osobny od CF_API_TOKEN, który ma tylko Analytics: Read). Sprawdzenie samo
// (--sprawdz) działa bez tokena.

import { readFileSync } from 'node:fs';

const KUBELEK = 'tylkoklocki-obrazy';
const PRODUKCJA = 'https://tylkoklocki.pl';
const UA_WORKERA = 'Mozilla/5.0 (compatible; tylkoklocki.pl image cache)';
const ROWNOLEGLE = 4;        // pobieranie ze źródła + PUT (Planeta zrywa przy większej liczbie)
const ROWNOLEGLE_HEAD = 12;  // samo sprawdzanie produkcji — tanie, można gęściej

const arg = process.argv.slice(2);
const tylkoSprawdz = arg.includes('--sprawdz');
const tylkoGalerie = arg.includes('--galerie');
const limit = Number(arg.find((a) => a.startsWith('--limit='))?.slice(8) ?? (arg.includes('--limit') ? arg[arg.indexOf('--limit') + 1] : 0)) || 0;
const kluczeArg = arg.find((a) => a.startsWith('--klucze='))?.slice(9) ?? (arg.includes('--klucze') ? arg[arg.indexOf('--klucze') + 1] : null);

const galerie = JSON.parse(readFileSync('src/data/galerie.json', 'utf8'));
const obrazy = JSON.parse(readFileSync('src/data/obrazy.json', 'utf8'));

// klucz -> URL źródła, dokładnie tak, jak liczy to worker
function zrodlo(klucz) {
  const m = /^([0-9]{4,7})(?:-([1-9][0-9]?))?$/.exec(klucz);
  if (!m) return null;
  return m[2] ? galerie[m[1]]?.[Number(m[2]) - 1] ?? null : obrazy[m[1]] ?? null;
}

let klucze;
if (kluczeArg) {
  klucze = kluczeArg.split(',').map((k) => k.trim()).filter(Boolean);
} else {
  const kluczeGalerii = Object.entries(galerie)
    .filter(([n]) => /^[0-9]{4,7}$/.test(n))
    .flatMap(([n, lista]) => lista.map((_, i) => `${n}-${i + 1}`));
  const kluczeGlowne = Object.keys(obrazy).filter((k) => /^[0-9]{4,7}$/.test(k));
  klucze = tylkoGalerie ? kluczeGalerii : [...kluczeGalerii, ...kluczeGlowne];
}

async function partiami(lista, fn, rownolegle = ROWNOLEGLE) {
  const wyniki = [];
  let i = 0;
  await Promise.all(Array.from({ length: rownolegle }, async () => {
    while (i < lista.length) {
      const j = i++;
      wyniki[j] = await fn(lista[j]);
    }
  }));
  return wyniki;
}

async function statusNaProdukcji(klucz) {
  try {
    const r = await fetch(`${PRODUKCJA}/img/${klucz}.jpg`, { method: 'HEAD', headers: { 'user-agent': UA_WORKERA } });
    return r.status;
  } catch {
    return 0;
  }
}

const { CF_ACCOUNT_ID, CF_R2_TOKEN } = process.env;
const zPlanety = (klucz) => /planetaklockow\.pl/.test(zrodlo(klucz) ?? '');

async function kluczeWR2() {
  const wR2 = new Set();
  let cursor = '';
  for (let strona = 0; strona < 100; strona++) {
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${KUBELEK}/objects?per_page=1000${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
      { headers: { authorization: `Bearer ${CF_R2_TOKEN}` } });
    const d = await r.json().catch(() => ({}));
    if (!d.success) throw new Error(`listowanie R2 nie przeszło: ${JSON.stringify(d.errors ?? r.status).slice(0, 160)}`);
    for (const o of d.result) wR2.add(o.key);
    if (!d.result_info?.is_truncated) break;
    cursor = d.result_info.cursor;
  }
  return wR2;
}

let wszystkieBrakujace;
if (tylkoSprawdz) {
  console.log(`Sprawdzam ${klucze.length} zdjęć na produkcji…`);
  const statusy = await partiami(klucze, async (k) => [k, await statusNaProdukcji(k)], ROWNOLEGLE_HEAD);
  wszystkieBrakujace = statusy.filter(([, s]) => s !== 200).map(([k, s]) => ({ klucz: k, status: s }));
  console.log(`OK: ${statusy.length - wszystkieBrakujace.length}, brakuje: ${wszystkieBrakujace.length}`);
  for (const b of wszystkieBrakujace.slice(0, 40)) console.log(`  ${b.status}  ${b.klucz}  ${zrodlo(b.klucz) ?? '(brak źródła w danych)'}`);
  if (wszystkieBrakujace.length > 40) console.log(`  … i ${wszystkieBrakujace.length - 40} więcej`);
  process.exit(0);
} else if (kluczeArg) {
  wszystkieBrakujace = klucze.map((k) => ({ klucz: k, status: '-' }));
} else {
  if (!CF_ACCOUNT_ID || !CF_R2_TOKEN) {
    console.error('Brak CF_ACCOUNT_ID albo CF_R2_TOKEN — bez nich zostaje audyt produkcji (--sprawdz).');
    process.exit(2);
  }
  const wR2 = await kluczeWR2();
  const zPK = klucze.filter(zPlanety);
  wszystkieBrakujace = zPK.filter((k) => !wR2.has(k)).map((k) => ({ klucz: k, status: 'brak w R2' }));
  console.log(`W R2: ${wR2.size} obiektów. Zdjęć z Planety w danych: ${zPK.length}, brakuje w R2: ${wszystkieBrakujace.length}`);
  if (wszystkieBrakujace.length === 0) process.exit(0);
}
const brakujace = limit ? wszystkieBrakujace.slice(0, limit) : wszystkieBrakujace;
if (limit && wszystkieBrakujace.length > limit) console.log(`W tym przebiegu wgrywam najwyżej ${limit}.`);

if (!CF_ACCOUNT_ID || !CF_R2_TOKEN) {
  console.error('Brak CF_ACCOUNT_ID albo CF_R2_TOKEN — wgrywanie niemożliwe.');
  process.exit(2);
}
const API = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${KUBELEK}/objects/`;

async function wgraj({ klucz, status }) {
  const url = zrodlo(klucz);
  if (!url) return `${klucz}: brak źródła w danych (produkcja ${status})`;
  let odp;
  for (let proba = 1; proba <= 3; proba++) {
    try {
      odp = await fetch(url, { headers: { 'user-agent': UA_WORKERA } });
      if (odp.ok) break;
    } catch { odp = null; }
    await new Promise((r) => setTimeout(r, proba * 2000));
  }
  if (!odp?.ok) return `${klucz}: źródło ${odp?.status ?? 'błąd sieci'} (${url})`;
  const typ = odp.headers.get('content-type') ?? '';
  if (!typ.startsWith('image/')) return `${klucz}: źródło oddało ${typ || 'nieznany typ'}, nie obraz — pomijam`;
  const dane = Buffer.from(await odp.arrayBuffer());
  const put = await fetch(API + encodeURIComponent(klucz), {
    method: 'PUT',
    headers: { authorization: `Bearer ${CF_R2_TOKEN}`, 'content-type': typ },
    body: dane,
  });
  const wynik = await put.json().catch(() => ({}));
  if (!wynik.success) return `${klucz}: PUT do R2 nie przeszedł (${JSON.stringify(wynik.errors ?? put.status).slice(0, 120)})`;
  return null;
}

console.log(`Wgrywam ${brakujace.length} plików do R2 (${KUBELEK})…`);
const bledy = (await partiami(brakujace, wgraj)).filter(Boolean);
console.log(`Wgrane: ${brakujace.length - bledy.length}, błędy: ${bledy.length}`);
for (const b of bledy) console.log('  ' + b);

// kontrola po wgraniu — worker ma czytać z R2, więc produkcja powinna oddać 200 od razu
const poWgraniu = await partiami(brakujace.map((b) => b.klucz), async (k) => [k, await statusNaProdukcji(k)]);
const nadal = poWgraniu.filter(([, s]) => s !== 200);
console.log(`Po wgraniu nadal nie 200: ${nadal.length}`);
for (const [k, s] of nadal.slice(0, 20)) console.log(`  ${s}  ${k}`);
const zostalo = wszystkieBrakujace.length - brakujace.length;
if (zostalo) console.log(`Poza limitem tego przebiegu zostało: ${zostalo} — dogra się w następnych.`);
// kod 1 tylko, gdy coś z tego przebiegu się nie udało; zaległość poza limitem to nie błąd
process.exit(nadal.length ? 1 : 0);
