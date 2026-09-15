#!/usr/bin/env node
// Przepisuje sekcję „Zrzut" w materialy/zadania-cykliczne.md z odczytu Routines.
//
// Po co: ręcznie pisany harmonogram rozjechał się już cztery razy. Sprawdzone
// 14.09.2026 — siedem z ośmiu wierszy kolumny „Ostatnie odpalenie" pokazywało
// 31.08, gdy konto mówiło 14.09. Zgadzał się jedyny wiersz ruszony tego dnia
// ręcznie, a nagłówek dokumentu twierdził „stan 31.08" nad treścią opisującą
// 14.09. Dokument, który sam sobie zabrania ręcznej edycji, był edytowany
// ręcznie — bo nie było czym go wygenerować.
//
// Skrypt NIE pobiera danych sam: Routines nie mają API dostępnego z kontenera.
// Odczyt robi sesja Claude Code wywołaniem `list_triggers` (potrzebny konektor
// `Claude_Code_Remote` — z naszych runnerów ma go wyłącznie Kontroler) i zapisuje
// odpowiedź do pliku. Tutaj zamieniamy ją na tekst dokumentu.
//
// Użycie:
//   node scripts/harmonogram-z-konta.mjs routines.json            # zapisz
//   node scripts/harmonogram-z-konta.mjs routines.json --sucho    # tylko pokaż
//
// Plik wejściowy: surowa odpowiedź `list_triggers` — obiekt z polem `data`
// albo sama tablica.

import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const sucho = args.includes('--sucho');
const zrodlo = args.find((a) => !a.startsWith('--'));

if (!zrodlo) {
  console.error('Użycie: node scripts/harmonogram-z-konta.mjs <odpowiedź list_triggers>.json [--sucho]');
  process.exit(1);
}

const DOKUMENT = 'materialy/zadania-cykliczne.md';
const START = '<!-- HARMONOGRAM:START — generuje scripts/harmonogram-z-konta.mjs, nie edytuj ręcznie -->';
const KONIEC = '<!-- HARMONOGRAM:KONIEC -->';

// ── wejście ──────────────────────────────────────────────────────────────────
const surowe = JSON.parse(readFileSync(zrodlo, 'utf8'));
const routines = Array.isArray(surowe) ? surowe : surowe.data;
if (!Array.isArray(routines) || !routines.length) {
  console.error('Wejście nie zawiera listy Routines (oczekuję tablicy albo pola `data`).');
  process.exit(1);
}

// ── czas ─────────────────────────────────────────────────────────────────────
// Crony są w UTC. Kolumna „PL" ma pokazywać, o której zadanie faktycznie
// chodzi dziś — a Polska przechodzi na CET 25.10.2026 i wtedy wszystko
// przesunie się o godzinę. Przesunięcie liczymy z kalendarza, nie wpisujemy
// na sztywno, bo wpisana na sztywno „+2" jest błędem czekającym na datę.
function przesunieciePL(data = new Date()) {
  const wPL = new Date(data.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
  const wUTC = new Date(data.toLocaleString('en-US', { timeZone: 'UTC' }));
  return Math.round((wPL - wUTC) / 36e5);
}

const PRZESUNIECIE = przesunieciePL();
const STREFA = PRZESUNIECIE === 2 ? 'CEST' : 'CET';

// Jeden parser pola crona dla kolumny PL i dla detektora kolizji. Wcześniej były
// dwa osobne i oba obsługiwały tylko listę „1,4" — zakres „1-5" dawał w kolumnie
// pusty dzień, a w detektorze zadanie znikało bez śladu (sprawdzone 14.09 na
// syntetycznym wpisie pon–pt). Czego parser nie umie, zwraca null, a wiersz
// dostaje jawne „nieobsługiwane" — nigdy cichą połowę odpowiedzi.
function rozwinPole(pole, min, max) {
  const wynik = new Set();
  for (const czesc of pole.split(',')) {
    const m = czesc.match(/^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/);
    if (!m) return null;
    const [, zakres, krok] = m;
    let od = min;
    let doo = max;
    if (zakres !== '*') {
      const [a, b] = zakres.split('-').map(Number);
      od = a;
      doo = b ?? a;
    }
    const co = krok ? Number(krok) : 1;
    if (!co || od < min || doo > max || od > doo) return null;
    for (let v = od; v <= doo; v += co) wynik.add(v);
  }
  return [...wynik].sort((a, b) => a - b);
}

// Rozbija wyrażenie na momenty tygodnia: [{dzien, godz, min}]. null = nie umiem.
function momentyCrona(cron) {
  if (!cron) return null;
  const pola = cron.trim().split(/\s+/);
  if (pola.length !== 5) return null;
  const [mi, go, , , dw] = pola;
  const minuty = rozwinPole(mi, 0, 59);
  const godziny = rozwinPole(go, 0, 23);
  const dni = rozwinPole(dw, 0, 6);
  if (!minuty || !godziny || !dni) return null;
  // Częstotliwość „co N minut" i tak nie mieści się w tabeli tygodnia —
  // oddajemy null, żeby wiersz dostał jawną etykietę, nie 96 wierszy.
  if (minuty.length > 4 || godziny.length > 8) return null;
  const out = [];
  for (const d of dni) for (const g of godziny) for (const m of minuty) out.push({ dzien: d, godz: g, min: m });
  return out;
}

const DNI = ['ndz', 'pon', 'wt', 'śr', 'czw', 'pt', 'sob'];
const DNI_KOLEJNOSC = [1, 2, 3, 4, 5, 6, 0];   // pon…ndz, do czytelnego wydruku

function godzinaPL(godz, min) {
  const h = (godz + PRZESUNIECIE + 24) % 24;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}
function dzienPL(dzien, godz) {
  const przeskok = godz + PRZESUNIECIE >= 24 ? 1 : (godz + PRZESUNIECIE < 0 ? -1 : 0);
  return (dzien + przeskok + 7) % 7;
}

// „0 7 * * 1" → „pon 09:00"; „0 3 * * *" → „05:00"; „0 5 * * 1-5" → „pon–pt 07:00".
function cronNaPL(cron) {
  const momenty = momentyCrona(cron);
  if (!momenty) return cron ? `⚠️ nieobsługiwane: \`${cron}\`` : '—';
  const godziny = [...new Set(momenty.map((m) => godzinaPL(m.godz, m.min)))].join(' / ');
  const dniUTC = [...new Set(momenty.map((m) => m.dzien))];
  if (dniUTC.length === 7) return godziny;
  const dniPL = [...new Set(momenty.map((m) => dzienPL(m.dzien, m.godz)))]
    .sort((a, b) => DNI_KOLEJNOSC.indexOf(a) - DNI_KOLEJNOSC.indexOf(b));
  // ciąg kolejnych dni skracamy do „pon–pt"
  const ciagly = dniPL.length > 2
    && dniPL.every((d, n) => n === 0 || DNI_KOLEJNOSC.indexOf(d) === DNI_KOLEJNOSC.indexOf(dniPL[n - 1]) + 1);
  const etykieta = ciagly ? `${DNI[dniPL[0]]}–${DNI[dniPL[dniPL.length - 1]]}` : dniPL.map((d) => DNI[d]).join(',');
  return `${etykieta} ${godziny}`;
}

function naPL(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pl-PL', {
    timeZone: 'Europe/Warsaw', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).replace(',', '');
}

// ── wiersze ──────────────────────────────────────────────────────────────────
// Sprawdzone 14.09.2026 na pełnej liście: `last_run` ze statusem dostajemy
// TAKŻE od triggerów przypiętych do trwałej sesji (Scout, Radar, Łowca,
// Wycofania mają `persist_session: true` i komplet statusów). Brakuje go
// wyłącznie tam, gdzie trigger nigdy nie wystrzelił. Wcześniejsza notatka
// w dokumencie wiązała brak statusu z trwałą sesją — to była nieprawda i nie
// wolno jej tu powtórzyć, bo tabela zaczęłaby tłumaczyć fakty zmyśloną
// przyczyną.
function wiersz(r) {
  const lr = r.last_run ?? {};
  const kiedy = lr.fired_at || r.last_fired_at;
  let status;
  if (lr.status) {
    status = lr.status.includes('SUCCEEDED') ? '✅ SUCCEEDED' : `⚠️ ${lr.status.replace('ROUTINE_RUN_STATUS_', '')}`;
  } else if (kiedy) {
    status = '— odpalony, bez zapisanego statusu';
  } else {
    status = '— nigdy nie odpalony';
  }
  const stan = r.enabled
    ? '✅'
    : `❌ ${r.ended_reason || r.suspension_reason || 'wyłączony'}`;
  return {
    nazwa: r.name,
    cron: r.cron_expression || (r.run_once_at ? `jednorazowo ${naPL(r.run_once_at)}` : '—'),
    pl: cronNaPL(r.cron_expression),
    stan,
    odpalenie: naPL(kiedy),
    status,
    id: r.id,
  };
}

const sortCron = (a, b) => (a.cron_expression || '~').localeCompare(b.cron_expression || '~');
const lego = routines.filter((r) => /^LEGO\b/i.test(r.name)).sort(sortCron).map(wiersz);
const inne = routines.filter((r) => !/^LEGO\b/i.test(r.name)).sort(sortCron).map(wiersz);

// ── kolizje ──────────────────────────────────────────────────────────────────
// Dwa włączone zadania na tej samej minucie to albo duplikat po delete+create,
// albo zderzenie na limicie konta. Dwa Kontrolery chodziły tak przez miesiąc
// i nikt tego nie zauważył, bo nikt nie porównywał listy z listą.
//
// Porównujemy MOMENTY, nie napisy: `0 6 * * *` i `0 6 * * 1` to różne napisy
// i ta sama minuta w każdy poniedziałek — pierwsza wersja detektora to przegapiła.
const kolizje = {};
const nieobsluzone = [];
for (const r of routines) {
  if (!r.enabled || !r.cron_expression) continue;
  const momenty = momentyCrona(r.cron_expression);
  if (!momenty) { nieobsluzone.push(r); continue; }
  for (const m of momenty) (kolizje[`${m.dzien}|${godzinaPL(m.godz, m.min)}|${m.godz}`] ??= []).push(r);
}
// jedno zadanie może zderzać się w kilka dni tygodnia — pokazujemy parę raz
const widziane = new Set();
const zderzenia = [];
for (const [klucz, lista] of Object.entries(kolizje).sort()) {
  if (lista.length < 2) continue;
  const [dzien, czasPL, godzUTC] = klucz.split('|');
  const para = lista.map((r) => r.id).sort().join('+') + czasPL;
  if (widziane.has(para)) continue;
  widziane.add(para);
  zderzenia.push({
    opis: `${DNI[dzienPL(Number(dzien), Number(godzUTC))]} ${czasPL} PL`,
    zadania: lista.map((r) => `${r.name} — \`${r.cron_expression}\``),
  });
}

// ── tekst ────────────────────────────────────────────────────────────────────
const tabela = (wiersze) => [
  '| Zadanie | Cron (UTC) | Start PL | Stan | Ostatnie odpalenie (PL) | Status przebiegu | Trigger |',
  '|---|---|---|---|---|---|---|',
  ...wiersze.map((w) => `| ${w.nazwa} | \`${w.cron}\` | ${w.pl} | ${w.stan} | ${w.odpalenie} | ${w.status} | \`${w.id}\` |`),
].join('\n');

const blok = [
  START,
  '',
  '## Zrzut — runnery LEGO',
  '',
  `**Odczyt z konta: ${naPL(new Date().toISOString())} (${STREFA}, UTC+${PRZESUNIECIE}).** `
  + `Objął **${routines.length} Routines** — pełna lista, bez paginacji.`,
  '',
  'Tej sekcji nie pisze się ręcznie. Generuje ją `scripts/harmonogram-z-konta.mjs`',
  'z odpowiedzi `list_triggers`, a uruchamia Kontroler w cotygodniowym raporcie.',
  '',
  tabela(lego),
  '',
  '### Pozostałe Routines na tym samym koncie',
  '',
  'Nie dotyczą serwisu, ale **dzielą z runnerami ten sam limit użycia** — a to on',
  'wywrócił harmonogram 21.08. Trzymane tu, żeby obraz obciążenia konta był pełny.',
  '',
  tabela(inne),
  '',
  '### Kolizje — zadania na tej samej minucie',
  '',
  ...(zderzenia.length
    ? zderzenia.flatMap((z) => [`- **${z.opis}**`, ...z.zadania.map((n) => `  - ${n}`)])
    : ['- brak — żadne dwa włączone zadania nie startują w tej samej minucie']),
  ...(nieobsluzone.length ? [
    '',
    '**Poza detektorem** — wyrażenia crona, których nie umiem rozwinąć na momenty',
    'tygodnia (krok „co N minut" albo składnia spoza list/zakresów). Kolizje z nimi',
    'trzeba sprawdzić ręcznie:',
    '',
    ...nieobsluzone.map((r) => `- ${r.name} — \`${r.cron_expression}\``),
  ] : []),
  '',
  KONIEC,
].join('\n');

// ── zapis ────────────────────────────────────────────────────────────────────
const dokument = readFileSync(DOKUMENT, 'utf8');
const i = dokument.indexOf(START);
const j = dokument.indexOf(KONIEC);

if (i < 0 || j < 0) {
  console.error(`Nie znalazłem znaczników w ${DOKUMENT}.`);
  console.error(`Sekcja generowana musi być objęta:\n  ${START}\n  ...\n  ${KONIEC}`);
  process.exit(1);
}

const nowy = dokument.slice(0, i) + blok + dokument.slice(j + KONIEC.length);

console.log(`Routines: ${routines.length} (LEGO: ${lego.length}, pozostałe: ${inne.length}).`);
console.log(`Włączonych: ${routines.filter((r) => r.enabled).length}. Kolizji: ${zderzenia.length}.`);
for (const z of zderzenia) console.log(`  KOLIZJA ${z.opis}: ${z.zadania.join('  +  ')}`);
for (const r of nieobsluzone) console.log(`  POZA DETEKTOREM: ${r.name} — ${r.cron_expression}`);

if (sucho) {
  console.log('\n--sucho: nic nie zapisano. Podgląd bloku:\n');
  console.log(blok);
  process.exit(0);
}

writeFileSync(DOKUMENT, nowy, 'utf8');
console.log(`\n${DOKUMENT}: sekcja „Zrzut" przepisana z odczytu.`);

// ── prompty Routines LEGO → materialy/routine-prompty.md (cały plik generowany) ──
// Od 15.09.2026 (uwaga Marka: „to rodzi możliwość błędu") repo NIE utrzymuje
// promptów ręcznie. Jedynym źródłem prawdy jest konto; ten plik to jego kopia
// do czytania i do diffów w git (widać, kto i kiedy zmienił prompt w panelu).
// Odświeża go Kontroler razem z sekcją „Zrzut" — nikt nie musi tego pilnować.
const PROMPTY = 'materialy/routine-prompty.md';
const promptRoutine = (r) =>
  r.derived_state?.prompt
  ?? r.session_request?.events?.find((e) => e.payload?.type === 'user')?.payload?.internal_anthropic_catchall?.message?.content
  ?? '';
const tryb = (r) => (r.persist_session || r.persistent_session_id ? 'stała sesja (zmiana promptu = delete + create)' : 'świeża sesja na każdy przebieg');
const legoSurowe = routines.filter((r) => /^LEGO\b/i.test(r.name)).sort(sortCron);
const blokPromptow = [
  '# Prompty Routines LEGO — kopia z konta',
  '',
  `*Plik w całości generuje \`scripts/harmonogram-z-konta.mjs\` z odpowiedzi \`list_triggers\`;`,
  `odczyt z konta: ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw', dateStyle: 'short', timeStyle: 'short' })} (${STREFA}). Nie edytuj ręcznie — źródłem prawdy`,
  'jest panel claude.ai, a ten plik odświeża Kontroler co poniedziałek. Diff w git',
  'pokazuje, co i kiedy zmieniło się w promptach. Zmiana promptu: Routine ze stałą sesją',
  'wymaga delete + create (sesja Code), Routine ze świeżą sesją edytuje się w panelu.*',
  '',
  ...legoSurowe.flatMap((r) => [
    `## ${r.name}`,
    '',
    `- ID: \`${r.id}\` · cron \`${r.cron_expression ?? '—'}\` (UTC) · ${r.enabled ? 'włączony' : 'WYŁĄCZONY'} · ${tryb(r)}`,
    '',
    '```',
    promptRoutine(r).trim() || '(brak promptu w odczycie)',
    '```',
    '',
  ]),
].join('\n');
writeFileSync(PROMPTY, blokPromptow, 'utf8');
console.log(`${PROMPTY}: ${legoSurowe.length} promptów przepisanych z odczytu.`);
