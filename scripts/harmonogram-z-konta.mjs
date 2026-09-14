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

// „0 7 * * 1" → „pon 09:00" przy CEST. Godzina może przeskoczyć dobę, więc
// przy przejściu przez północ przesuwamy też dzień tygodnia.
const DNI = ['ndz', 'pon', 'wt', 'śr', 'czw', 'pt', 'sob'];
function cronNaPL(cron) {
  if (!cron) return '—';
  const [min, godz, , , dzien] = cron.split(/\s+/);
  if (!/^\d+$/.test(min)) return cron;
  const godziny = godz.includes(',') || godz.includes('/') || godz === '*'
    ? godz.split(',').filter((g) => /^\d+$/.test(g))
    : [godz];
  if (!godziny.length) return cron;

  const opis = godziny.map((g) => {
    const h = (Number(g) + PRZESUNIECIE + 24) % 24;
    return `${String(h).padStart(2, '0')}:${min.padStart(2, '0')}`;
  }).join(' / ');

  if (dzien === '*') return opis;
  // przeskok doby zmienia dzień tygodnia
  const przeskok = Number(godziny[0]) + PRZESUNIECIE >= 24 ? 1 : (Number(godziny[0]) + PRZESUNIECIE < 0 ? -1 : 0);
  const dni = dzien.split(',').map((d) => DNI[(Number(d) + przeskok + 7) % 7]).join(',');
  return `${dni} ${opis}`;
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
// Porównywanie NAPISÓW crona nie wystarcza — pierwsza wersja tego detektora tak
// robiła i przegapiła zderzenie Radara (`0 6 * * *`, codziennie) z Herzfadenem
// (`0 6 * * 1`): różne napisy, ta sama minuta w każdy poniedziałek. Dlatego
// rozwijamy crona na realne momenty tygodnia i grupujemy po nich.
const DOBA = [0, 1, 2, 3, 4, 5, 6];
function momenty(cron) {
  const [min, godz, , , dow] = cron.split(/\s+/);
  if (!/^\d+$/.test(min)) return [];            // nieobsługiwane wyrażenie — nie zgadujemy
  const godziny = (godz === '*' ? [] : godz.split(',')).filter((g) => /^\d+$/.test(g));
  const dni = dow === '*' ? DOBA : dow.split(',').filter((d) => /^\d+$/.test(d)).map(Number);
  return godziny.flatMap((g) => dni.map((d) => `${d}|${String(g).padStart(2, '0')}:${min.padStart(2, '0')}`));
}

const kolizje = {};
for (const r of routines) {
  if (!r.enabled || !r.cron_expression) continue;
  for (const m of momenty(r.cron_expression)) (kolizje[m] ??= []).push(r);
}
// jedno zadanie może zderzać się w kilka dni tygodnia — pokazujemy parę raz
const widziane = new Set();
const zderzenia = [];
for (const [moment, lista] of Object.entries(kolizje).sort()) {
  if (lista.length < 2) continue;
  const klucz = lista.map((r) => r.id).sort().join('+') + moment.split('|')[1];
  if (widziane.has(klucz)) continue;
  widziane.add(klucz);
  const [dzien, czas] = moment.split('|');
  const [gg, mm] = czas.split(':').map(Number);
  const hPL = (gg + PRZESUNIECIE + 24) % 24;
  const przeskok = gg + PRZESUNIECIE >= 24 ? 1 : (gg + PRZESUNIECIE < 0 ? -1 : 0);
  zderzenia.push({
    opis: `${DNI[(Number(dzien) + przeskok + 7) % 7]} ${String(hPL).padStart(2, '0')}:${String(mm).padStart(2, '0')} PL (${czas} UTC)`,
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

if (sucho) {
  console.log('\n--sucho: nic nie zapisano. Podgląd bloku:\n');
  console.log(blok);
  process.exit(0);
}

writeFileSync(DOKUMENT, nowy, 'utf8');
console.log(`\n${DOKUMENT}: sekcja „Zrzut" przepisana z odczytu.`);
