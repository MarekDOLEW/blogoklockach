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
//   node scripts/r2-obrazy.mjs --sprawdz            # tylko raport: które /img/ nie oddają 200
//   node scripts/r2-obrazy.mjs                      # galerie: sprawdź i wgraj brakujące
//   node scripts/r2-obrazy.mjs --glowne             # to samo dla zdjęć głównych (obrazy.json)
//   node scripts/r2-obrazy.mjs --wszystko --limit 800  # galerie + główne, ale wgraj najwyżej 800
//   node scripts/r2-obrazy.mjs --klucze 42220-1,60478-3
//
// --limit N to sposób na rozłożenie zaległości na kilka dni bez żadnego stanu
// między przebiegami: każdy przebieg sprawdza wszystko, wgrywa N pierwszych
// brakujących, a gdy zaległość zniknie, codziennie dogrywa tylko to, co nowe.
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
const glowne = arg.includes('--glowne');
const wszystko = arg.includes('--wszystko');
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
  klucze = wszystko ? [...kluczeGalerii, ...kluczeGlowne] : glowne ? kluczeGlowne : kluczeGalerii;
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

console.log(`Sprawdzam ${klucze.length} zdjęć na produkcji…`);
const statusy = await partiami(klucze, async (k) => [k, await statusNaProdukcji(k)], ROWNOLEGLE_HEAD);
const wszystkieBrakujace = statusy.filter(([, s]) => s !== 200).map(([k, s]) => ({ klucz: k, status: s }));
// Przy limicie najpierw Planeta Klocków — tylko jej worker nie pobierze sam.
// Reszta (Allegro, Rebrickable) padła, bo źródło umarło; worker próbował i nie
// ma czego wgrać, więc nie ma sensu, żeby zajmowały codzienny limit.
const zPlanety = (b) => (/planetaklockow\.pl/.test(zrodlo(b.klucz) ?? '') ? 0 : 1);
wszystkieBrakujace.sort((x, y) => zPlanety(x) - zPlanety(y));
const brakujace = limit ? wszystkieBrakujace.slice(0, limit) : wszystkieBrakujace;
console.log(`OK: ${statusy.length - wszystkieBrakujace.length}, brakuje: ${wszystkieBrakujace.length}${limit ? `, w tym przebiegu wgrywam najwyżej ${limit}` : ''}`);
if (brakujace.length === 0 || tylkoSprawdz) {
  for (const b of wszystkieBrakujace.slice(0, 40)) console.log(`  ${b.status}  ${b.klucz}  ${zrodlo(b.klucz) ?? '(brak źródła w danych)'}`);
  if (wszystkieBrakujace.length > 40) console.log(`  … i ${wszystkieBrakujace.length - 40} więcej`);
  process.exit(0);
}

const { CF_ACCOUNT_ID, CF_R2_TOKEN } = process.env;
if (!CF_ACCOUNT_ID || !CF_R2_TOKEN) {
  console.error('Brak CF_ACCOUNT_ID albo CF_R2_TOKEN — mogę tylko sprawdzać (--sprawdz).');
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
