#!/usr/bin/env node
// Pliki wgrane przez panel (panel.tylkoklocki.pl → Wgraj) → obieg skrzynki tekstów.
//
// Worker panelu (panel/worker.js) zapisuje każde wgranie w R2 pod
// `_panel/wplywy/<id>/` (meta.json + pliki/). Ten skrypt uruchamia automat
// „Skrzynka tekstów Piotra” (8:52 i 14:52) obok maili: pobiera wgranie,
// rozpakowuje zip tak samo jak załącznik maila, a potem automat woła
// `skrzynka-tekstow.py publikuj` i `powiadom` jak dla maila. Na koniec
// `wynik` zapisuje stan w R2, żeby panel pokazał linki albo problemy.
//
// .docx, .doc i .pdf nie publikują się same (skrzynka przyjmuje .md):
// trafiają do <katalog>/_inne/ i wgranie dostaje stan „do opracowania”.
//
// Użycie (CF_ACCOUNT_ID i CF_R2_TOKEN w środowisku, jak scripts/r2-obrazy.mjs):
//   node scripts/panel-wplywy.mjs lista                      # JSON: wgrania bez wyniku, od najstarszego
//   node scripts/panel-wplywy.mjs pobierz <id> <katalog>     # pliki do katalogu; JSON z podsumowaniem
//   node scripts/panel-wplywy.mjs wynik <id> <wynik.json>    # wynik `publikuj` → stan w panelu
//   node scripts/panel-wplywy.mjs wynik <id> --do-opracowania  # tylko docx/pdf, nic do publikacji

import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { listujR2, pobierzR2, wgrajR2 } from './r2-s3.mjs';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const PREFIKS = '_panel/wplywy/';

async function lista() {
  const klucze = await listujR2(PREFIKS);
  const ids = new Map();
  for (const k of klucze.keys()) {
    const [id, plik] = k.slice(PREFIKS.length).split('/');
    const e = ids.get(id) ?? { meta: false, wynik: false };
    if (plik === 'meta.json') e.meta = true;
    if (plik === 'wynik.json') e.wynik = true;
    ids.set(id, e);
  }
  return [...ids].filter(([, e]) => e.meta && !e.wynik).map(([id]) => id).sort();
}

async function pobierz(id, katalog) {
  const m = await pobierzR2(`${PREFIKS}${id}/meta.json`);
  if (!m) throw new Error(`Brak wgrania ${id}`);
  const meta = JSON.parse(m.dane.toString('utf8'));
  mkdirSync(katalog, { recursive: true });
  const inne = [];
  for (const p of meta.pliki) {
    const o = await pobierzR2(p.klucz);
    if (!o) continue;
    const roz = extname(p.nazwa).toLowerCase();
    if (roz === '.zip') {
      const tymczasowy = join(katalog, `_${p.nazwa}`);
      writeFileSync(tymczasowy, o.dane);
      execFileSync('python3', [join(REPO, 'scripts/skrzynka-tekstow.py'), 'rozpakuj', tymczasowy, katalog], { stdio: ['ignore', 'ignore', 'inherit'] });
    } else if (['.docx', '.doc', '.pdf'].includes(roz)) {
      mkdirSync(join(katalog, '_inne'), { recursive: true });
      writeFileSync(join(katalog, '_inne', p.nazwa), o.dane);
      inne.push(p.nazwa);
    } else {
      writeFileSync(join(katalog, p.nazwa), o.dane);
    }
  }
  const md = readdirSync(katalog).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  return { id, kto: meta.kto, kiedy: meta.kiedy, notka: meta.notka, md: md.length, pliki_md: md, inne };
}

async function wynik(id, zrodlo) {
  let stan;
  if (zrodlo === '--do-opracowania') {
    stan = { stan: 'do opracowania', linki: [], problemy: ['Pliki .docx/.doc/.pdf czekają na sesję Code.'] };
  } else {
    const w = JSON.parse(readFileSync(zrodlo, 'utf8'));
    stan = { stan: w.status === 'ok' ? 'opublikowane' : 'problem', linki: w.linki ?? [], problemy: w.problemy ?? [] };
  }
  stan.czas = new Date().toISOString();
  await wgrajR2(`${PREFIKS}${id}/wynik.json`, Buffer.from(JSON.stringify(stan)), 'application/json');
  return stan;
}

const [polecenie, a, b] = process.argv.slice(2);
try {
  if (polecenie === 'lista') console.log(JSON.stringify(await lista()));
  else if (polecenie === 'pobierz' && a && b) console.log(JSON.stringify(await pobierz(a, b), null, 1));
  else if (polecenie === 'wynik' && a && b) console.log(JSON.stringify(await wynik(a, b)));
  else {
    console.error('Polecenia: lista | pobierz <id> <katalog> | wynik <id> <wynik.json|--do-opracowania>');
    process.exit(2);
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
