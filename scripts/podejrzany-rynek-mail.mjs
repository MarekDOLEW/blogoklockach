#!/usr/bin/env node
// Poranny mail do Marka z ofertami, które sito „podejrzany rynek" ukryło na stronie
// (cena poniżej 50% POTWIERDZONEJ ceny katalogowej bez wpisu w deale_potwierdzone.json).
//
// Decyzja Marka 16.09.2026: taka oferta nie wchodzi na stronę, dopóki człowiek nie
// otworzy karty sklepu — a żeby to zrobić, musi rano dostać listę z linkami.
// Skrypt liczy dokładnie tym samym predykatem co strona (src/lib/oferty.js →
// podejrzanyRynek), więc mail i serwis nigdy się nie rozjadą. Gdy lista jest pusta,
// nie wysyła nic (maile nie mogą spowszednieć).
//
// Użycie (Łowca po zapisie danych, przed commitem):
//   node scripts/podejrzany-rynek-mail.mjs            # wysyła (RESEND_API_KEY)
//   node scripts/podejrzany-rynek-mail.mjs --sucho    # tylko pokaż listę

import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const sucho = process.argv.includes('--sucho');
const czytaj = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url)));
const feed = czytaj('oferty_feed.json').sety;
const sety = czytaj('sety.json');
const rrpPotwierdzone = czytaj('rrp_potwierdzone.json');
const potwierdzone = czytaj('deale_potwierdzone.json').potwierdzone ?? {};
const redirects = czytaj('redirects.json');
const katalog = czytaj('katalog.json');
const PROG = 0.5; // = PROG_PODEJRZANEGO_RYNKU w src/lib/oferty.js

const nazwy = new Map();
for (const [seria, lista] of Object.entries(katalog)) if (seria !== '_meta' && Array.isArray(lista)) for (const z of lista) nazwy.set(String(z.numer), z.nazwa);

// link do sklepu wprost (nie /idz/ — mail otwiera się spoza strony i worker by go odrzucił)
function linkSklepu(sklep, nr) {
  const url = redirects?.[sklep]?.[nr];
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.searchParams.get('redirect_url') ?? u.searchParams.get('url') ?? url;
  } catch { return url; }
}

const kandydaci = new Map(); // nr|sklep -> wiersz
function sprawdz(nr, sklep, cena) {
  const rrp = rrpPotwierdzone[nr]?.cena;
  if (!rrp || !(cena > 0) || cena >= PROG * rrp) return;
  const p = potwierdzone[nr];
  if (p && cena >= p.cena - 0.01) return;
  kandydaci.set(`${nr}|${sklep}`, { nr, sklep, cena, rrp, rabat: Math.round(100 * (1 - cena / rrp)), nazwa: sety[nr]?.nazwa ?? nazwy.get(nr) ?? '', link: linkSklepu(sklep, nr), potwierdzonaWczesniej: p ? `${p.cena} zł (${p.data})` : '' });
}
for (const [nr, w] of Object.entries(feed)) for (const [sklep, cena] of Object.entries(w.oferty ?? {})) sprawdz(nr, sklep, cena);
for (const [nr, z] of Object.entries(sety)) for (const o of z.oferty ?? []) sprawdz(nr, o.sklep, o.cena);

const lista = [...kandydaci.values()].sort((a, b) => a.cena / a.rrp - b.cena / b.rrp);
console.log(`Ofert ukrytych przez sito „podejrzany rynek": ${lista.length}`);
for (const k of lista) console.log(`  ${k.nr} ${k.nazwa} | ${k.sklep} ${k.cena} zł przy RRP ${k.rrp} (−${k.rabat}%)${k.potwierdzonaWczesniej ? ' | wcześniej potwierdzona ' + k.potwierdzonaWczesniej : ''}`);
if (!lista.length || sucho) { if (sucho) console.log('--sucho: bez wysyłki.'); process.exit(0); }

const dzis = new Date().toISOString().slice(0, 10);
const md = [
  `Sito serwisu ukryło ${lista.length} ofert(y) z ceną poniżej 50% potwierdzonej ceny katalogowej. Na stronie ich nie ma, dopóki nie sprawdzisz w sklepie. Prawdziwa oferta → w rozmowie z Code jedno zdanie: „potwierdzam <numer> <cena> <sklep>" — trafia do deale_potwierdzone.json i wraca na stronę tego samego dnia. Zaślepka albo podszywka → nic nie rób, zostaje ukryta.`,
  '',
  '| Zestaw | Sklep | Cena | Katalog | Rabat | Link do sklepu | Hub |',
  '|---|---|---|---|---|---|---|',
  ...lista.map((k) => `| ${k.nr} ${k.nazwa} | ${k.sklep} | ${k.cena} zł | ${k.rrp} zł | −${k.rabat}% | ${k.link ? `[otwórz](${k.link})` : 'brak linku (wyszukiwarka sklepu)'} | [hub](https://tylkoklocki.pl/zestaw/${k.nr}/) |`),
  '',
  ...lista.filter((k) => k.potwierdzonaWczesniej).map((k) => `- ${k.nr}: wcześniej potwierdzona ${k.potwierdzonaWczesniej}, teraz niżej — sprawdź ponownie.`),
];
const plik = join(tmpdir(), `podejrzany-rynek-${dzis}.md`);
writeFileSync(plik, md.join('\n') + '\n');
const w = spawnSync('python3', ['scripts/wyslij-raport.py', '--zadanie', 'podejrzane', '--tytul', `Oferty do sprawdzenia — ${dzis.split('-').reverse().join('.')}`, '--plik', plik, '--wstep', `${lista.length} ofert(y) poniżej 50% ceny katalogowej czeka na Twoje sprawdzenie w sklepie.`], { stdio: 'inherit' });
process.exit(w.status ?? 1);
