#!/usr/bin/env node
// Alerty cenowe „Obserwuj zestaw" — codziennie po Łowcy (Routine „Alerty cen").
//
// Zapisy leżą w R2 (kubełek tylkoklocki-obrazy, prefiks _obserwuj/<nr>/<token>.json),
// zakłada je worker (POST /obserwuj), potwierdza link z maila (double opt-in).
// Ten skrypt:
// 1. listuje zapisy; niepotwierdzone starsze niż 7 dni kasuje (minimalizacja danych);
// 2. dla potwierdzonych liczy dzisiejszą najlepszą cenę zestawu z danych serwisu
//    (oferty_feed + sety.json, bez Ceneo) i cenę katalogową (sety / rrp_potwierdzone);
// 3. wysyła mail (Resend), gdy cena jest co najmniej PROG_RABATU poniżej katalogowej
//    i jest niższa niż ta, o której ostatnio pisaliśmy (albo to pierwszy alert);
// 4. zapisuje w obiekcie ostatnia_cena + ostatni_alert, żeby nie pisać dwa razy o tym samym.
// Nigdy nie wysyła więcej niż jednego maila na zapis dziennie. Reguła progu jest
// ta sama, co „dobry deal" w redakcja/ (20–29% dobry, ≥30% gorący).
//
// Wymaga: CF_ACCOUNT_ID, CF_R2_TOKEN (odczyt/zapis R2), RESEND_API_KEY (wysyłka).
// Użycie: node scripts/alerty-cen.mjs [--sucho]

import { readFileSync } from 'node:fs';

const KUBELEK = 'tylkoklocki-obrazy';
const PREFIKS = '_obserwuj/';
const PROG_RABATU = 20;           // % poniżej ceny katalogowej
const DNI_NA_POTWIERDZENIE = 7;
const DOMENA = 'https://tylkoklocki.pl';
const NADAWCA = 'tylkoklocki.pl <alerty@tylkoklocki.pl>';
const sucho = process.argv.includes('--sucho');

const { CF_ACCOUNT_ID, CF_R2_TOKEN, RESEND_API_KEY } = process.env;
if (!CF_ACCOUNT_ID || !CF_R2_TOKEN) { console.error('Brak CF_ACCOUNT_ID / CF_R2_TOKEN.'); process.exit(2); }
if (!RESEND_API_KEY && !sucho) { console.error('Brak RESEND_API_KEY.'); process.exit(2); }

const API = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${KUBELEK}/objects`;
const naglowki = { authorization: `Bearer ${CF_R2_TOKEN}` };

async function listaZapisow() {
  const klucze = []; let cursor = null;
  do {
    const r = await fetch(`${API}?per_page=1000&prefix=${encodeURIComponent(PREFIKS)}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`, { headers: naglowki });
    const j = await r.json();
    if (!j.success) throw new Error(`R2 list: ${JSON.stringify(j.errors).slice(0, 200)}`);
    for (const o of j.result ?? []) if (o.key.startsWith(PREFIKS) && o.key.endsWith('.json')) klucze.push(o.key);
    cursor = j.result_info?.cursor && (j.result_info?.is_truncated ?? j.result?.length === 1000) ? j.result_info.cursor : null;
  } while (cursor);
  return klucze;
}
const obiekt = async (klucz) => { const r = await fetch(`${API}/${encodeURIComponent(klucz)}`, { headers: naglowki }); if (!r.ok) throw new Error(`GET ${klucz}: ${r.status}`); return r.json(); };
const zapisz = (klucz, dane) => fetch(`${API}/${encodeURIComponent(klucz)}`, { method: 'PUT', headers: { ...naglowki, 'content-type': 'application/json' }, body: JSON.stringify(dane) });
const usun = (klucz) => fetch(`${API}/${encodeURIComponent(klucz)}`, { method: 'DELETE', headers: naglowki });

// --- ceny z danych serwisu ---------------------------------------------------
const sety = JSON.parse(readFileSync('src/data/sety.json', 'utf8'));
const feed = JSON.parse(readFileSync('src/data/oferty_feed.json', 'utf8')).sety ?? {};
const rrp = JSON.parse(readFileSync('src/data/rrp_potwierdzone.json', 'utf8'));
const cenyBaza = JSON.parse(readFileSync('src/data/ceny_baza.json', 'utf8'));
const katalogIdx = new Map();
for (const [seria, lista] of Object.entries(JSON.parse(readFileSync('src/data/katalog.json', 'utf8')))) {
  if (seria === '_meta' || !Array.isArray(lista)) continue;
  for (const s of lista) if (!katalogIdx.has(String(s.numer))) katalogIdx.set(String(s.numer), s);
}
const sklepy = JSON.parse(readFileSync('src/data/sklepy.json', 'utf8'));
// Oferta starsza niż tyle dni nie jest „dzisiejsza" — LEGO.com odświeża się co
// tydzień, Empik/Ceneo tygodniowo, więc mail mówi o dacie, a stare pomija.
const MAKS_WIEK_OFERTY_DNI = 2;
const nazwaSklepu = (s) => sklepy?.[s]?.nazwa ?? s;

function najlepszaCena(nr) {
  const dzis = new Date().toISOString().slice(0, 10);
  const swieza = (data) => data && (Date.parse(dzis) - Date.parse(data)) / 864e5 <= MAKS_WIEK_OFERTY_DNI;
  const oferty = [];
  const w = feed[nr];
  const daty = w?.daty && typeof w.daty === 'object' ? w.daty : {};
  for (const [sklep, cena] of Object.entries(w?.oferty ?? {})) {
    const data = daty[sklep] ?? w.data;
    if (sklep !== 'ceneo' && cena > 0 && swieza(data)) oferty.push({ sklep, cena, data });
  }
  if (w?.cena > 0 && !w?.oferty && swieza(w.data)) oferty.push({ sklep: w.sklep, cena: w.cena, data: w.data });
  for (const o of sety[nr]?.oferty ?? []) if (o.sklep !== 'ceneo' && o.cena > 0 && swieza(o.data)) oferty.push({ sklep: o.sklep, cena: o.cena, data: o.data });
  return oferty.sort((a, b) => a.cena - b.cena)[0] ?? null;
}
// Ta sama kolejność źródeł co src/lib/oferty.js cenaKatalogowaSetu(): rejestr
// potwierdzony → sety.json → baza Łowcy → katalog. Inna kolejność = mail o
// rabacie, którego hub nie pokazuje (audyt 15.09: 3 209 zestawów bez alertu,
// 6 z zawyżonym rabatem).
const cenaKatalogowa = (nr) => rrp?.[nr]?.cena ?? sety[nr]?.cena_katalogowa ?? cenyBaza?.[nr]?.cena_katalogowa ?? katalogIdx.get(nr)?.cena_katalogowa ?? null;
const nazwaSetu = (nr) => sety[nr]?.nazwa ?? '';
const zl = (c) => `${Number(c).toFixed(2).replace('.', ',')} zł`;

async function mail(odbiorca, temat, tekst) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${RESEND_API_KEY}`, 'content-type': 'application/json', 'user-agent': 'tylkoklocki.pl-alerty/1.0' },
    body: JSON.stringify({ from: NADAWCA, to: [odbiorca], subject: temat, text: tekst }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

// --- przebieg ---------------------------------------------------------------
const klucze = await listaZapisow();
const dzis = new Date().toISOString().slice(0, 10);
let potwierdzone = 0, skasowane = 0, wyslane = 0, bezCeny = 0;
const bledy = [];
const juzDzis = new Set(); // email+nr — jeden mail dziennie, nawet przy podwójnym zapisie

for (const klucz of klucze) {
  try {
    const w = await obiekt(klucz);
    if (!w.potwierdzony) {
      const wiek = (Date.now() - Date.parse(w.kiedy)) / 864e5;
      if (wiek > DNI_NA_POTWIERDZENIE) { if (!sucho) await usun(klucz); skasowane++; }
      continue;
    }
    potwierdzone++;
    const nr = String(w.nr);
    const oferta = najlepszaCena(nr);
    const kat = cenaKatalogowa(nr);
    if (!oferta || !kat) { bezCeny++; continue; }
    const rabat = Math.round((1 - oferta.cena / kat) * 100);
    const nowaNizsza = w.ostatnia_cena == null || oferta.cena < w.ostatnia_cena - 0.5;
    if (rabat < PROG_RABATU || !nowaNizsza) continue;
    if (w.ostatni_alert === dzis || juzDzis.has(`${w.email}|${nr}`)) continue;
    const temat = `LEGO ${nr}${nazwaSetu(nr) ? ' ' + nazwaSetu(nr) : ''}: ${zl(oferta.cena)} (${rabat}% poniżej ceny katalogowej)`;
    const tekst = [
      `Cena zestawu LEGO ${nr}${nazwaSetu(nr) ? ' ' + nazwaSetu(nr) : ''} spadła.`,
      '',
      `Najniższa cena (stan z ${oferta.data}): ${zl(oferta.cena)} w sklepie ${nazwaSklepu(oferta.sklep)} – ${rabat}% poniżej ceny katalogowej ${zl(kat)}.`,
      rabat >= 30 ? 'To poziom „gorący” w naszej skali (30% i więcej) – takie ceny zwykle nie trwają długo.' : 'To poziom „dobry” w naszej skali (20–29%).',
      '',
      `Porównanie sklepów i link do oferty: ${DOMENA}/zestaw/${nr}/`,
      '',
      'Ceny bierzemy z cenników sklepów; wiążąca jest cena w koszyku. Linki do sklepów na stronie są afiliacyjne – nie zmienia to ceny.',
      `Nie chcesz więcej alertów o tym zestawie? Zrezygnuj jednym kliknięciem: ${DOMENA}/obserwuj/rezygnuj?nr=${nr}&t=${w.token}`,
    ].join('\n');
    if (sucho) { console.log(`[sucho] ${w.email} ← ${temat}`); }
    else {
      await mail(w.email, temat, tekst);
      await zapisz(klucz, { ...w, ostatnia_cena: oferta.cena, ostatni_alert: dzis, ostatni_sklep: oferta.sklep });
    }
    juzDzis.add(`${w.email}|${nr}`);
    wyslane++;
  } catch (e) {
    bledy.push(`${klucz}: ${String(e.message).slice(0, 120)}`);
  }
}
console.log(`Zapisów: ${klucze.length}, potwierdzonych: ${potwierdzone}, bez ceny: ${bezCeny}, skasowanych niepotwierdzonych: ${skasowane}, alertów ${sucho ? 'do wysłania' : 'wysłanych'}: ${wyslane}, błędów: ${bledy.length}`);
for (const b of bledy) console.log('  ' + b);
process.exit(bledy.length ? 1 : 0);
