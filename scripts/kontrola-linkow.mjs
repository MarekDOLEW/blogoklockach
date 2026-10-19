#!/usr/bin/env node
// Losowa próba linków sklepowych z redirects.json — czy karty produktów jeszcze żyją.
//
// Po co: linki podmieniają się przy każdym imporcie feedu, ale nikt nie sprawdzał,
// czy adres, na który wysyłamy czytelnika, w ogóle jeszcze istnieje. Sklep kasuje
// kartę produktu po wycofaniu zestawu i link prowadzi na 404 — czytelnik wraca,
// my tracimy klik, a Google widzi stronę, która wysyła ruch w pustkę.
//
// ZASADA, KTÓREJ NIE WOLNO ZŁAMAĆ: nie odpytujemy linków trackingowych
// (pdt.tradedoubler.com, clk.tradedoubler.com, webep1.com, track.performers.tech,
// allegro.pl/affiliate). Każde takie wejście to zarejestrowany klik w sieci
// afiliacyjnej — sztucznie nabity, bez człowieka po drugiej stronie. Sprawdzamy
// WYŁĄCZNIE adres docelowy sklepu, wyciągnięty z linku (funkcja `celLinku`).
//
// Użycie:
//   node scripts/kontrola-linkow.mjs                 # próba 200 linków, mail gdy są martwe
//   node scripts/kontrola-linkow.mjs --ile 500       # większa próba
//   node scripts/kontrola-linkow.mjs --sklep empik   # jeden sklep
//   node scripts/kontrola-linkow.mjs --sucho         # bez maila, tylko wydruk
//   node scripts/kontrola-linkow.mjs --blokujace     # lista 20 adresów do przeglądarki, BEZ żadnego zapytania
//                                                   # -> materialy/kontrola-przegladarkowa/lista.md (stała ścieżka)
//   node scripts/kontrola-linkow.mjs --blokujace 40 --sklepy xkom,empik
//
// Uruchamia: Łowca w poniedziałek (krok tygodniowy), Kontroler czyta wynik z repo.
// Tryb `--blokujace` uruchamia człowiek albo sesja Code raz w miesiącu — patrz niżej.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFile, spawnSync } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { celLinku, SKLEPY_BLOKUJACE, SKLEPY_BEZ_WERYFIKACJI, UA_PRZEGLADARKI } from './linki-cel.mjs';
import { join } from 'node:path';

const uruchom = promisify(execFile);
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const sucho = process.argv.includes('--sucho');
const ILE = Number(arg('--ile', 150));
const TYLKO = arg('--sklep', null);
// `--blokujace [N]`: N może być pominięte (wtedy 20), bo flaga bywa podawana sama.
const iBlok = process.argv.indexOf('--blokujace');
const BLOKUJACE = iBlok === -1 ? null : (() => {
  const nast = process.argv[iBlok + 1];
  return nast && !nast.startsWith('--') ? Number(nast) : 20;
})();
const ROWNOLEGLE = 12;

const czytaj = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url)));
const redirects = czytaj('redirects.json');
const sety = czytaj('sety.json');

const TRACKERY = /(tradedoubler\.com|webep1\.com|performers\.tech|adt\d+\.com|allegro\.pl\/affiliate)/i;

// ── Próba losowa ────────────────────────────────────────────────────────────
// Zmierzone 18.09.2026 na próbie 150 linków: cztery sklepy odrzucają każde
// zapytanie serwerowe (403 albo timeout), niezależnie od nagłówków; x-kom
// dołączył do listy 19.10.2026 (26/26 w blokadzie, decyzja Marka). Losowanie
// z całości marnowało na nie 3/4 budżetu czasu i 3/4 próby. Bierzemy z nich
// tylko kilka linków kontrolnych — po to, żeby zauważyć, gdyby któryś przestał
// blokować — a resztę próby przeznaczamy na sklepy, które da się sprawdzić.
const PROBA_KONTROLNA = 5;

const losuj = (tablica) => { // Fisher–Yates; sortowanie po Math.random() daje krzywy rozkład
  for (let i = tablica.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [tablica[i], tablica[j]] = [tablica[j], tablica[i]]; }
  return tablica;
};

const wszystkie = [];
for (const [sklep, mapa] of Object.entries(redirects)) {
  if (sklep === '_meta' || !mapa || typeof mapa !== 'object') continue;
  if (TYLKO && sklep !== TYLKO) continue;
  for (const [nr, link] of Object.entries(mapa)) wszystkie.push({ sklep, nr, link });
}
// ── Tryb `--blokujace`: lista adresów do sprawdzenia w przeglądarce ─────────
// Decyzja Marka 19.10.2026 (wariant A): linków sklepów, które odrzucają ruch
// serwerowy, nie da się sprawdzić z kontenera — raz w miesiącu przechodzi je
// Cowork w przeglądarce. Ten tryb przygotowuje dla niego listę i NIE WYKONUJE
// ANI JEDNEGO ZAPYTANIA: ani na kartę sklepu, ani tym bardziej na tracker.
// W pliku stoi adres docelowy sklepu (`celLinku`), nigdy link trackingowy —
// otwarcie trackingu w przeglądarce byłoby takim samym sztucznie nabitym
// klikiem jak z serwera, tylko trudniejszym do wychwycenia.
if (BLOKUJACE !== null) {
  if (!Number.isFinite(BLOKUJACE) || BLOKUJACE < 1) {
    console.error('--blokujace: podaj liczbę adresów większą od zera (albo samą flagę — wtedy 20).');
    process.exit(2);
  }
  const wybrane = (arg('--sklepy', null) ?? '').split(',').map((x) => x.trim()).filter(Boolean);
  const sklepy = wybrane.length ? wybrane : [...SKLEPY_BEZ_WERYFIKACJI];
  const nieznaneSklepy = sklepy.filter((x) => !Object.keys(redirects).includes(x));
  if (nieznaneSklepy.length) {
    console.error(`--sklepy: w redirects.json nie ma gałęzi: ${nieznaneSklepy.join(', ')}.`);
    process.exit(2);
  }
  // Po równo z każdego sklepu, karuzelą — żeby jeden duży (x-kom: 788 linków)
  // nie zjadł całej listy, a sklep z kilkoma wpisami w ogóle się na niej znalazł.
  const pule = new Map(sklepy.map((sk) => [sk, losuj(wszystkie.filter((w) => w.sklep === sk))]));
  const lista = [];
  while (lista.length < BLOKUJACE && [...pule.values()].some((x) => x.length)) {
    for (const sk of sklepy) {
      if (lista.length >= BLOKUJACE) break;
      const w = pule.get(sk).pop();
      if (!w) continue;
      const cel = celLinku(w.link);
      if (!cel || TRACKERY.test(cel)) continue; // nierozpakowany tracker na listę nie wchodzi
      lista.push({ ...w, cel });
    }
  }
  const brakujace = BLOKUJACE - lista.length;
  const perSklepLista = sklepy.map((sk) => `${sk} ${lista.filter((w) => w.sklep === sk).length}`).join(', ');
  const dzisB = new Date().toISOString().slice(0, 10);
  const tekst = [
    `# Linki do sprawdzenia w przeglądarce — ${dzisB}`,
    '',
    'Plik generowany przez `scripts/kontrola-linkow.mjs --blokujace` — nie edytować ręcznie.',
    'Ścieżka jest stała, bo zadanie Coworka otwiera ją pod niezmiennym adresem; datę trzymamy',
    'w nagłówku i to ją sprawdza Cowork przed pracą.',
    '',
    `Próba **${lista.length}** adresów ze sklepów, których kontrola tygodniowa nie potrafi sprawdzić`,
    `z serwera (odrzucają ruch serwerowy: 403/429/503 albo timeout). Rozkład: ${perSklepLista}.`,
    '',
    '**Jak to przejść:** otwórz każdy adres z kolumny „Karta produktu" w przeglądarce i wpisz',
    'w kolumnie „Wynik" jedno z: `żywy` (karta produktu się otwiera), `404` (karta nie istnieje),',
    '`przekierowanie` (sklep przerzuca na listing, kategorię albo stronę główną — to nie jest żywa',
    'karta) albo `inne: <co widać>`. Wypełniony plik wraca do sesji Code.',
    '',
    '**Czego NIE otwierać:** w tym pliku są wyłącznie adresy docelowe sklepów. Nie wchodź na linki',
    'trackingowe (`pdt.tradedoubler.com`, `webep1.com`, `track.performers.tech`, `allegro.pl/affiliate`)',
    'ani na nasze `/idz/<sklep>/<numer>` — każde takie wejście to sztucznie nabity klik w sieci',
    'afiliacyjnej, tak samo z przeglądarki jak z serwera.',
    '',
    '| Sklep | Zestaw | Karta produktu | Hub | Wynik |',
    '|---|---|---|---|---|',
    ...lista.map((w) => `| ${w.sklep} | ${w.nr} ${sety[w.nr]?.nazwa ?? ''} | ${w.cel} | https://tylkoklocki.pl/zestaw/${w.nr}/ | |`),
    '',
    'Martwe karty Empiku po wypełnieniu idą do `scripts/empik-redirects.mjs --usun-martwe`',
    '(to jedyna mapa linków, z której wolno kasować wpisy — poza nią dane są append-only).',
    '',
  ].join('\n');
  const katalogB = new URL('../materialy/kontrola-przegladarkowa/', import.meta.url);
  const plikB = new URL('lista.md', katalogB);
  if (sucho) {
    console.log(tekst);
    console.log('--sucho: bez zapisu.');
  } else {
    mkdirSync(katalogB, { recursive: true });
    writeFileSync(plikB, tekst + '\n');
    console.log(`Lista: materialy/kontrola-przegladarkowa/lista.md (${dzisB}) — ${lista.length} adresów (${perSklepLista}).`);
  }
  if (brakujace > 0) console.log(`Uwaga: zabrakło ${brakujace} adresów — wybrane sklepy mają w redirects.json mniej wpisów, niż poproszono.`);
  console.log('Żadnego zapytania nie wysłano — ten tryb tylko losuje adresy.');
  process.exit(0);
}

const sprawdzalne = losuj(wszystkie.filter((w) => !SKLEPY_BLOKUJACE.has(w.sklep)));
const blokujace = new Map();
for (const w of losuj(wszystkie.filter((w) => SKLEPY_BLOKUJACE.has(w.sklep)))) {
  const lista = blokujace.get(w.sklep) ?? [];
  if (lista.length < PROBA_KONTROLNA) { lista.push(w); blokujace.set(w.sklep, lista); }
}
const kontrolne = [...blokujace.values()].flat();
const proba = [...sprawdzalne.slice(0, Math.max(0, ILE - kontrolne.length)), ...kontrolne];
console.log(`Linków w redirects.json: ${wszystkie.length}${TYLKO ? ` (sklep ${TYLKO})` : ''}. Próba: ${proba.length}, w tym ${kontrolne.length} kontrolnych z ${[...blokujace.keys()].join(', ') || '—'} (sklepy blokujące ruch serwerowy).`);

// ── Sprawdzenie ─────────────────────────────────────────────────────────────
// HEAD bywa odrzucany tam, gdzie GET przechodzi (Ceneo, Empik), więc przy 4xx
// innym niż 404/410 powtarzamy GET-em z limitem pobrania.
// UA przeglądarki, nie bota: zmierzone 18.09.2026 — Empik z UA „tylkoklocki-kontrola-linkow"
// odpowiadał 403, z UA Chrome'a odpowiada 200. To nie jest podszywanie się pod człowieka
// w celu obejścia regulaminu: sprawdzamy tylko kod odpowiedzi własnych linków, jednym
// zapytaniem na link, raz w tygodniu.
const UA = UA_PRZEGLADARKI;
async function kod(adres, metoda) {
  const wspolne = ['-s', '-o', '/dev/null', '-w', '%{http_code}', '-L', '--max-time', '12', '--connect-timeout', '6',
    '-A', UA, '-H', 'Accept-Language: pl-PL,pl;q=0.9', '-H', 'Accept: text/html,application/xhtml+xml'];
  const { stdout } = await uruchom('curl', metoda === 'HEAD' ? ['-I', ...wspolne, adres] : [...wspolne, '-r', '0-2048', adres]);
  return Number(stdout.trim());
}

async function sprawdz(w) {
  const cel = celLinku(w.link);
  if (!cel) return { ...w, cel: null, stan: 'bez-adresu', kod: 0 };
  if (TRACKERY.test(cel)) return { ...w, cel, stan: 'pominiety-tracker', kod: 0 };
  let status = 0;
  try {
    status = await kod(cel, 'HEAD');
    // GET powtarzamy tylko tam, gdzie HEAD jest odrzucany jako metoda (405/501)
    // albo serwer w ogóle nie odpowiedział. Przy 403 nie ma po co: zmierzone
    // 18.09.2026 — Allegro, Media Expert i LEGO.com dają 403 tak samo na HEAD
    // i na GET, a druga próba podwajała czas przebiegu.
    if (status === 405 || status === 501 || status === 0) status = await kod(cel, 'GET');
  } catch { status = 0; }
  // 403/429/503 to ściana antybotowa sklepu, a nie martwa karta. Trzymamy to
  // w osobnej kategorii, żeby raport nie udawał, że coś sprawdziliśmy.
  // Zmierzone 18.09.2026: Allegro, Media Expert i LEGO.com odrzucają ruch
  // serwerowy niezależnie od nagłówków; Empik, Ceneo, Planeta, Smyk i Lidl nie.
  const stan = status >= 200 && status < 400 ? 'ok'
    : status === 404 || status === 410 ? 'martwy'
    : status === 403 || status === 429 || status === 503 ? 'blokada'
    : 'nieznany';
  return { ...w, cel, stan, kod: status };
}

const wyniki = [];
for (let i = 0; i < proba.length; i += ROWNOLEGLE) {
  wyniki.push(...(await Promise.all(proba.slice(i, i + ROWNOLEGLE).map(sprawdz))));
  process.stderr.write(`  sprawdzono ${Math.min(i + ROWNOLEGLE, proba.length)}/${proba.length}\r`);
}
process.stderr.write('\n');

// ── Raport ──────────────────────────────────────────────────────────────────
const perSklep = new Map();
for (const w of wyniki) {
  const s = perSklep.get(w.sklep) ?? { ok: 0, martwy: 0, blokada: 0, nieznany: 0, inne: 0 };
  s[['ok', 'martwy', 'blokada', 'nieznany'].includes(w.stan) ? w.stan : 'inne']++;
  perSklep.set(w.sklep, s);
}
const wiersze = [...perSklep].sort((a, b) => b[1].ok + b[1].martwy - (a[1].ok + a[1].martwy))
  .map(([sklep, s]) => `| ${sklep} | ${s.ok + s.martwy + s.blokada + s.nieznany + s.inne} | ${s.ok} | ${s.martwy} | ${s.blokada} | ${s.nieznany + s.inne} |`);
console.log('\n| Sklep | w próbie | żywe | martwe (404/410) | blokada sklepu | nierozstrzygnięte |');
console.log('|---|---|---|---|---|---|');
for (const w of wiersze) console.log(w);
const martwe = wyniki.filter((w) => w.stan === 'martwy');
const zablokowane = wyniki.filter((w) => w.stan === 'blokada');
const nieznane = wyniki.filter((w) => w.stan === 'nieznany');
const sklepyBlokujace = [...perSklep].filter(([, s]) => s.blokada && !s.ok && !s.martwy).map(([sklep]) => sklep);
console.log(`\nMartwych linków: ${martwe.length} / ${wyniki.length - zablokowane.length} sprawdzalnych. Blokada sklepu: ${zablokowane.length}. Nierozstrzygniętych: ${nieznane.length}.`);
if (sklepyBlokujace.length) console.log(`Sklepy, których nie da się sprawdzić z serwera: ${sklepyBlokujace.join(', ')} — nie twierdzimy o nich niczego.`);
for (const w of martwe) console.log(`  ${w.sklep} ${w.nr} (${w.kod}) ${w.cel}`);

const dzis = new Date().toISOString().slice(0, 10);

// Raport zapisujemy ZAWSZE, także gdy nic nie jest martwe. Powód (21.09.2026):
// pierwszy przebieg tego kroku w Kontrolerze nie zostawił po sobie żadnego śladu
// w repo, więc nie dało się stwierdzić, czy krok się wykonał, czy został pominięty.
// „Brak martwych linków" to wynik, a nie brak wyniku.
const raport = [
  `# Kontrola linków sklepowych — ${dzis.split('-').reverse().join('.')}`,
  '',
  `Próba ${wyniki.length} linków z \`redirects.json\` (${wszystkie.length} w całości). Martwych: **${martwe.length}**.`,
  '',
  'Sprawdzamy adres docelowy sklepu, nigdy link trackingowy — wejście na tracker byłoby sztucznie nabitym klikiem w sieci afiliacyjnej.',
  '',
  '| Sklep | w próbie | żywe | martwe (404/410) | blokada sklepu | nierozstrzygnięte |',
  '|---|---|---|---|---|---|',
  ...wiersze,
  '',
  martwe.length
    ? ['| Sklep | Zestaw | Kod | Karta produktu | Hub |', '|---|---|---|---|---|',
       ...martwe.map((w) => `| ${w.sklep} | ${w.nr} ${sety[w.nr]?.nazwa ?? ''} | ${w.kod} | [adres](${w.cel}) | [hub](https://tylkoklocki.pl/zestaw/${w.nr}/) |`)].join('\n')
    : 'Żaden sprawdzalny link nie prowadzi na nieistniejącą kartę produktu.',
  '',
  `Blokada sklepu: ${zablokowane.length} linków (sklep odrzuca ruch serwerowy — o tych nie twierdzimy nic).${sklepyBlokujace.length ? ' Dotyczy: ' + sklepyBlokujace.join(', ') + '.' : ''} Nierozstrzygniętych: ${nieznane.length}.`,
  '',
].join('\n');
const plikRaportu = new URL(`../materialy/kontrola-linkow-${dzis}.md`, import.meta.url);
if (!sucho) { writeFileSync(plikRaportu, raport + '\n'); console.log(`Raport: materialy/kontrola-linkow-${dzis}.md`); }

if (!martwe.length || sucho) { if (sucho) console.log('\n--sucho: bez zapisu i bez wysyłki.'); process.exit(0); }
const md = [
  `Losowa próba ${wyniki.length} linków sklepowych z \`redirects.json\`. **Martwych: ${martwe.length}** (HTTP 404/410 na karcie produktu).`,
  '',
  'Sprawdzamy adres docelowy sklepu, nigdy link trackingowy — wejście na tracker byłoby sztucznie nabitym klikiem w sieci afiliacyjnej.',
  '',
  '| Sklep | Zestaw | Kod | Karta produktu | Hub |',
  '|---|---|---|---|---|',
  ...martwe.map((w) => `| ${w.sklep} | ${w.nr} ${sety[w.nr]?.nazwa ?? ''} | ${w.kod} | [adres](${w.cel}) | [hub](https://tylkoklocki.pl/zestaw/${w.nr}/) |`),
  '',
  '| Sklep | w próbie | żywe | martwe | blokada sklepu | nierozstrzygnięte |',
  '|---|---|---|---|---|---|',
  ...wiersze,
  '',
  `Blokada sklepu: ${zablokowane.length} linków — sklep odrzuca ruch serwerowy (403/429/503), więc o tych linkach nie twierdzimy nic.${sklepyBlokujace.length ? ' Dotyczy: ' + sklepyBlokujace.join(', ') + '.' : ''} Nierozstrzygniętych (timeout, inny kod): ${nieznane.length}.`,
];
const plik = join(tmpdir(), `kontrola-linkow-${dzis}.md`);
writeFileSync(plik, md.join('\n') + '\n');
const w = spawnSync('python3', ['scripts/wyslij-raport.py', '--zadanie', 'linki', '--tytul', `Martwe linki sklepowe — ${dzis.split('-').reverse().join('.')}`, '--plik', plik, '--wstep', `${martwe.length} z ${wyniki.length} sprawdzonych linków prowadzi na nieistniejącą kartę produktu.`], { stdio: 'inherit' });
process.exit(w.status ?? 1);
