#!/usr/bin/env node
// Warianty zdjęć zestawów (WebP w stałych szerokościach) generowane u nas
// i trzymane w R2 — zamiast Cloudflare Image Transformations.
//
// Dlaczego (8.10.2026): po wdrożeniu `?w=` przez Image Transformations darmowy
// limit 5 000 unikalnych transformacji miesięcznie skończył się w jeden dzień
// (każda para adres + szerokość + format liczy się osobno, a w R2 jest 11,5 tys.
// zdjęć). Marek nie chce płacić, więc warianty robi sharp tutaj, a worker
// oddaje je z R2 spod klucza `w/<klucz>/<szerokość>.webp`. Brak wariantu =
// worker oddaje oryginał, więc strona nigdy nie zostaje bez zdjęcia.
//
// Szerokości to ta sama lista, co w src/worker.js i src/lib/media.js. Obraz
// nie jest powiększany ponad oryginał (mniejszy oryginał daje po prostu
// mniejszy plik pod tym samym kluczem). Format tylko WebP: AVIF w sharp koduje
// się kilkanaście razy wolniej, a różnica wagi to ~10–15 %.
//
// Użycie:
//   node scripts/warianty-obrazow.mjs                 # wszystkie oryginały z R2 bez kompletu wariantów
//   node scripts/warianty-obrazow.mjs --limit 500     # najwyżej 500 obrazów w tym przebiegu
//   node scripts/warianty-obrazow.mjs --klucze 31168,42143-1   # wskazane klucze (zawsze od nowa)
//   node scripts/warianty-obrazow.mjs --glowne        # najpierw zdjęcia główne (bez galerii `-N`)
//
// Z innego skryptu (r2-obrazy.mjs po wgraniu nowych oryginałów):
//   import { generujWarianty } from './warianty-obrazow.mjs'; await generujWarianty(['31168']);
//
// Wymaga CF_ACCOUNT_ID i CF_R2_TOKEN (jak r2-obrazy.mjs). sharp przychodzi z Astro.

import sharp from 'sharp';
import { listujR2, pobierzR2, wgrajR2 } from './r2-s3.mjs';

export const SZEROKOSCI = [130, 260, 440, 600, 880, 1200];
const JAKOSC = 82;
const ROWNOLEGLE = 8;
const PREFIKS = 'w/';
const KLUCZ_ORYGINALU = /^[A-Za-z0-9]{1,24}(?:-[0-9]{1,2})?$/;

export const kluczWariantu = (klucz, w) => `${PREFIKS}${klucz}/${w}.webp`;

async function partiami(lista, fn, rownolegle = ROWNOLEGLE) {
  const wyniki = [];
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(rownolegle, lista.length) }, async () => {
    while (i < lista.length) { const j = i++; wyniki[j] = await fn(lista[j], j); }
  }));
  return wyniki;
}

/** Generuje i wgrywa komplet wariantów jednego oryginału. Zwraca null albo opis błędu. */
export async function wariantyJednego(klucz, oryginal = null) {
  try {
    const o = oryginal ?? (await pobierzR2(klucz));
    if (!o) return `${klucz}: brak oryginału w R2`;
    const baza = sharp(o.dane, { failOn: 'none' }).rotate();
    const meta = await baza.metadata();
    if (!meta.width) return `${klucz}: sharp nie czyta pliku (${o.typ})`;
    // kodowanie po kolei (CPU), wgrywanie wszystkich szerokości naraz (sieć)
    const warianty = [];
    for (const w of SZEROKOSCI) warianty.push([w, await baza.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: JAKOSC, effort: 4 }).toBuffer()]);
    await Promise.all(warianty.map(([w, dane]) => wgrajR2(kluczWariantu(klucz, w), dane, 'image/webp')));
    return null;
  } catch (e) {
    return `${klucz}: ${String(e.message).slice(0, 120)}`;
  }
}

/** Dla listy kluczy: generuje warianty (równolegle), wypisuje postęp, zwraca listę błędów. */
export async function generujWarianty(klucze, { cicho = false } = {}) {
  const start = Date.now();
  let zrobione = 0;
  const bledy = (await partiami(klucze, async (k) => {
    const b = await wariantyJednego(k);
    zrobione++;
    if (!cicho && zrobione % 100 === 0) console.log(`  ${zrobione}/${klucze.length} (${Math.round((Date.now() - start) / 1000)} s)`);
    return b;
  })).filter(Boolean);
  if (!cicho) console.log(`Warianty: ${klucze.length - bledy.length} obrazów × ${SZEROKOSCI.length} szerokości w ${Math.round((Date.now() - start) / 1000)} s. Błędy: ${bledy.length}`);
  for (const b of bledy.slice(0, 30)) console.log('  ' + b);
  return bledy;
}

const uruchomionyBezposrednio = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (uruchomionyBezposrednio) {
  const arg = process.argv.slice(2);
  const limit = Number(arg.find((a) => a.startsWith('--limit='))?.slice(8) ?? (arg.includes('--limit') ? arg[arg.indexOf('--limit') + 1] : 0)) || 0;
  const kluczeArg = arg.find((a) => a.startsWith('--klucze='))?.slice(9) ?? (arg.includes('--klucze') ? arg[arg.indexOf('--klucze') + 1] : null);
  const tylkoGlowne = arg.includes('--glowne');

  let klucze;
  if (kluczeArg) {
    klucze = kluczeArg.split(',').map((k) => k.trim()).filter(Boolean);
  } else {
    console.log('Listuję R2…');
    const wszystko = await listujR2();
    const oryginaly = [...wszystko.keys()].filter((k) => KLUCZ_ORYGINALU.test(k));
    // komplet = jest wariant o największej szerokości (generujemy wszystkie naraz, więc ostatni wgrany oznacza całość)
    const gotowe = new Set([...wszystko.keys()].filter((k) => k.startsWith(PREFIKS) && k.endsWith(`/${SZEROKOSCI.at(-1)}.webp`)).map((k) => k.slice(PREFIKS.length, -`/${SZEROKOSCI.at(-1)}.webp`.length)));
    let brakujace = oryginaly.filter((k) => !gotowe.has(k));
    if (tylkoGlowne) brakujace = brakujace.filter((k) => !/-[0-9]{1,2}$/.test(k));
    // zdjęcia główne przed galeriami — są na listingach i hubach, galerie tylko na hubach i w artykułach
    brakujace.sort((a, b) => (/-[0-9]{1,2}$/.test(a) ? 1 : 0) - (/-[0-9]{1,2}$/.test(b) ? 1 : 0));
    console.log(`Oryginałów w R2: ${oryginaly.length}, z kompletem wariantów: ${gotowe.size}, do zrobienia: ${brakujace.length}${limit ? `, w tym przebiegu ${Math.min(limit, brakujace.length)}` : ''}`);
    klucze = limit ? brakujace.slice(0, limit) : brakujace;
  }
  if (!klucze.length) { console.log('Nic do zrobienia.'); process.exit(0); }
  const bledy = await generujWarianty(klucze);
  process.exit(bledy.length ? 1 : 0);
}
