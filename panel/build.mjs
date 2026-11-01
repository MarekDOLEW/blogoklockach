#!/usr/bin/env node
// Panel tylkoklocki.pl (panel.tylkoklocki.pl) — generator stron statycznych.
//
// Panel nie ma własnej bazy: wszystko czyta z repo (src/data, DZIENNIK.md,
// materialy/), więc pokazuje dokładnie ten stan, z którego zbudował się serwis.
// Przebudowuje się przy każdym pushu na main (osobny worker w Cloudflare,
// konfiguracja w panel/wrangler.jsonc). Bez zależności — wystarcza sam Node.
//
// Wyjście: panel/dist/ (HTML + dane/*.json + static/). Na żywo, przez worker,
// działa tylko zakładka „Wgraj” (lista plików z R2).
//
// Użycie: node panel/build.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, cpSync, rmSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { md, inline, esc } from './lib/md.mjs';

const PANEL = dirname(fileURLToPath(import.meta.url));
const REPO = join(PANEL, '..');
const DIST = join(PANEL, 'dist');
const SITE = 'https://tylkoklocki.pl';

const czytaj = (p) => readFileSync(join(REPO, p), 'utf8');
const json = (p) => JSON.parse(czytaj(p));
const istnieje = (p) => existsSync(join(REPO, p));

// ── czas (Polska) ─────────────────────────────────────────────────────────
const TZ = 'Europe/Warsaw';
const teraz = new Date();
const dzienPL = (d = teraz) => new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(d); // RRRR-MM-DD
const godzinaPL = (d = teraz) => new Intl.DateTimeFormat('pl-PL', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(d);
const DZIS = dzienPL();
const dni = (iso) => (iso ? Math.round((Date.parse(DZIS) - Date.parse(String(iso).slice(0, 10))) / 864e5) : null);
const dataPL = (iso) => (iso ? String(iso).slice(0, 10).split('-').reverse().join('.') : '—');
const ileTemu = (iso) => {
  const n = dni(iso);
  if (n === null || Number.isNaN(n)) return '—';
  return n <= 0 ? 'dziś' : n === 1 ? 'wczoraj' : `${n} dni temu`;
};
const licz = (n) => new Intl.NumberFormat('pl-PL').format(n);

// ── git (w buildzie Cloudflare repo bywa płytkie — wtedy panel pokazuje, co ma) ──
function commity() {
  try {
    const wyj = execFileSync('git', ['log', '-n', '400', '--format=%H%x09%aI%x09%s'], { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return wyj.trim().split('\n').filter(Boolean).map((l) => {
      const [hash, czas, temat] = l.split('\t');
      return { hash: hash.slice(0, 7), czas, dzien: dzienPL(new Date(czas)), godz: godzinaPL(new Date(czas)), temat };
    });
  } catch {
    return [];
  }
}
const GIT = commity();

// ── dziennik ──────────────────────────────────────────────────────────────
const DZIENNIK = czytaj('DZIENNIK.md');
function wpisyDziennika(tekst) {
  const [, po = ''] = tekst.split(/^<!-- WPISY PONIŻEJ.*-->$/m);
  const wpisy = [];
  for (const blok of po.split(/^(?=## 20\d\d-)/m)) {
    const m = blok.match(/^## (20\d\d-\d\d-\d\d)(?: (\d\d:\d\d))? · ([^·\n]+?) · (.*)$/m);
    if (!m) continue;
    const [, dzien, godz = '', kto, tytul] = m;
    const tresc = blok.slice(blok.indexOf('\n') + 1).trim();
    const pierwsze = (tresc.match(/^\*\*(.+?)\*\*/s)?.[1] ?? tresc.split('\n')[0]).replace(/\s+/g, ' ');
    wpisy.push({ dzien, godz, kto: kto.trim(), tytul: tytul.trim(), skrot: pierwsze.slice(0, 260), tresc, id: `w-${dzien}-${wpisy.length}` });
  }
  return wpisy;
}
const WPISY = wpisyDziennika(DZIENNIK);

// ── dane serwisu ──────────────────────────────────────────────────────────
const sety = json('src/data/sety.json');
const feed = json('src/data/oferty_feed.json').sety ?? {};
const karty = json('src/data/karty_setow.json');
const NUMERY_KART = new Set(Object.keys(karty).filter((k) => !k.startsWith('_')));
const katalogSurowy = json('src/data/katalog.json');
const KATALOG = new Map();
for (const [seria, lista] of Object.entries(katalogSurowy)) {
  if (seria === '_meta') continue;
  for (const e of lista) if (!KATALOG.has(String(e.numer))) KATALOG.set(String(e.numer), { ...e, seria });
}
const weryfikacja = json('src/data/weryfikacja_ofert.json');
// Opis zestawu = karta Piotra albo własny opis w sety.json dłuższy niż 300 znaków (opis + dla_rodzica + dla_afol)
// — te same dwie drogi, którymi hub wychodzi z noindex z powodu treści (src/lib/seo.js).
const bezHtml = (s) => String(s ?? '').replace(/<[^>]+>/g, '').trim();
const maOpis = (nr) => NUMERY_KART.has(nr) || bezHtml(sety[nr]?.opis).length + bezHtml(sety[nr]?.dla_rodzica).length + bezHtml(sety[nr]?.dla_afol).length > 300;
const kody = json('src/data/kody_rabatowe.json');
const skrzynka = json('redakcja/skrzynka.json');
const social = istnieje('materialy/social/rejestr.json') ? json('materialy/social/rejestr.json') : { wpisy: [] };

const NAZWY_SKLEPOW = { lego: 'LEGO.pl', allegro: 'Allegro', empik: 'Empik', mediaexpert: 'Media Expert', mediamarkt: 'MediaMarkt', xkom: 'x-kom', smyk: 'Smyk', ceneo: 'Ceneo', planetaklockow: 'Planeta Klocków', lidl: 'Lidl', amazon: 'Amazon' };
const sklep = (s) => NAZWY_SKLEPOW[s] ?? s;

// Świeżość cen: najnowsza data odczytu każdego sklepu (sety.json + migawka feedów)
function swiezoscSklepow() {
  const naj = {};
  const ile = {};
  const dodaj = (s, d) => {
    if (!s || !d) return;
    if (!naj[s] || d > naj[s]) naj[s] = d;
    ile[s] = (ile[s] ?? 0) + 1;
  };
  for (const s of Object.values(sety)) for (const o of s.oferty ?? []) dodaj(o.sklep, o.data);
  for (const s of Object.values(feed)) for (const [k, d] of Object.entries(s.daty ?? {})) dodaj(k, d);
  return Object.keys(naj).map((s) => ({ sklep: s, data: naj[s], ofert: ile[s] })).sort((a, b) => b.ofert - a.ofert);
}

// Artykuły z frontmattera
function artykuly() {
  const kat = join(REPO, 'src/pages/artykuly');
  const wynik = [];
  for (const plik of readdirSync(kat)) {
    if (!plik.endsWith('.md')) continue;
    const t = readFileSync(join(kat, plik), 'utf8');
    const fm = t.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
    const pole = (k) => fm.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, 'm'))?.[1] ?? '';
    const slug = plik.replace(/\.md$/, '');
    const zSkrzynki = Object.entries(skrzynka).find(([, v]) => v.slug === slug)?.[0] ?? '';
    wynik.push({ slug, tytul: pole('title'), data: pole('data'), aktualizacja: pole('zaktualizowano'), kategoria: pole('kategoria'), piotr: zSkrzynki });
  }
  return wynik.sort((a, b) => (b.aktualizacja || b.data).localeCompare(a.aktualizacja || a.data));
}
const ARTYKULY = artykuly();

// ── runnery: zrzut z materialy/zadania-cykliczne.md + ślady w repo ────────
function harmonogram() {
  const t = czytaj('materialy/zadania-cykliczne.md');
  // znaczniki w komentarzu HTML — samo słowo HARMONOGRAM:START pada też wyżej, w opisie pliku
  const zrzut = t.split('<!-- HARMONOGRAM:START')[1]?.split('<!-- HARMONOGRAM:KONIEC')[0] ?? '';
  const odczyt = zrzut.match(/\*\*Odczyt z konta: ([^*]+)\*\*/)?.[1] ?? '';
  // Tylko pierwsza tabela — runnery serwisu. Sekcja „Pozostałe Routines” to prywatne
  // zadania Marka spoza tylkoklocki; panel ich nie pokazuje.
  const lego = zrzut.split(/^### Pozostałe Routines/m)[0];
  const wiersze = lego.split('\n').filter((l) => /^\| /.test(l) && !/^\| (Zadanie|---)/.test(l));
  return {
    odczyt,
    lista: wiersze.map((l) => {
      const c = l.replace(/^\||\|$/g, '').split('|').map((x) => x.trim());
      return { nazwa: c[0], cron: c[1].replace(/`/g, ''), start: c[2], stan: c[3], ostatnie: c[4], status: c[5], trigger: c[6].replace(/`/g, '') };
    }),
  };
}
const HARM = harmonogram();

function prompty() {
  if (!istnieje('materialy/routine-prompty.md')) return {};
  const wynik = {};
  for (const blok of czytaj('materialy/routine-prompty.md').split(/^## /m).slice(1)) {
    const nazwa = blok.split('\n')[0].trim();
    wynik[nazwa] = blok.slice(blok.indexOf('\n') + 1).trim();
  }
  return wynik;
}
const PROMPTY = prompty();

const raportyKontrolera = readdirSync(join(REPO, 'materialy')).filter((f) => /^kontroler-\d{4}-\d\d-\d\d\.md$/.test(f)).sort();
const kolejkaIndeksacji = istnieje('materialy/indeksacja/kolejka.md') ? statSync(join(REPO, 'materialy/indeksacja/kolejka.md')).mtime : null;

// Czym poznajemy przebieg runnera w repo: commit, wpis w dzienniku albo plik z datą.
const SLADY = [
  { re: /Łowca/i, opis: 'Ceny z feedów Media Expert, Allegro i Planety Klocków, oferty w sety.json, deale na stronie głównej', commit: /^Łowca:/, tag: 'ŁOWCA' },
  { re: /Scout/i, opis: 'Nowości i przecieki z serwisów LEGO, rejestr known_sets', commit: /^Scout:|Rejestr Scouta/, tag: 'SCOUT' },
  { re: /Radar/i, opis: 'Baza konkurencji: co opisują inne serwisy, czego brakuje u nas', commit: /^Radar:/, tag: 'RADAR' },
  { re: /Wycofania/i, opis: 'Statusy wycofań (EOL) i lista wycofań 2026', commit: /^Wycofania:/ },
  { re: /Dane wt/i, opis: 'Katalog LEGO.pl, ceny Ceneo i Smyka, ekskluzywy', commit: /LEGO\.pl \+ Ceneo|^Dane wt/i, tag: 'DANE WT' },
  { re: /Kontroler \(raport/i, opis: 'Raport tygodnia dla Marka (PDF mailem) + materialy/kontroler-RRRR-MM-DD.md', commit: /^Kontroler/i, tag: 'KONTROLER', plik: () => raportyKontrolera.at(-1)?.match(/\d{4}-\d\d-\d\d/)?.[0] },
  { re: /Kolejka indeksacji/i, opis: 'Do 15 adresów dziennie do „Poproś o zindeksowanie” w Search Console', commit: /^Kolejka indeksacji/ },
  { re: /Kolejka GSC/i, opis: 'Cowork klika zgłoszenia z kolejki indeksacji w Search Console', commit: /^Kolejka GSC|GSC: zgłoszone/i },
  { re: /Skrzynka tekstów/i, opis: 'Teksty i opisy Piotra z maila (i z panelu) → strona, bez przeglądu', commit: /Teksty Piotra ze skrzynki|^Skrzynka/i },
  { re: /Harmonogram z konta/i, opis: 'Przepisuje harmonogram i prompty Routines z konta do repo', commit: /Harmonogram|routine-prompty/i },
  { re: /Zdjęcia → R2/i, opis: 'Dogrywa zdjęcia z Planety Klocków do R2 (bez pushu do repo)' },
  { re: /Alerty cen/i, opis: 'Maile „Obserwuj zestaw” przy spadku ceny (bez pushu do repo)' },
  { re: /Przypomnienie: zrzut/i, opis: 'Mail do Marka: poniedziałkowe zrzuty Empiku i x-komu (Cowork)' },
  { re: /lista linków|Kontrola linków/i, opis: 'Lista linków sklepów do sprawdzenia w przeglądarce i jej przejście', commit: /kontrola-link|Kontrola linków/i },
  { re: /Weryfikacja ofert/i, opis: 'Potwierdza na kartach produktów (Firecrawl) oferty ze slajderów', commit: /^Weryfikacja ofert \d/ },
];

function runnery() {
  const lista = HARM.lista.map((r) => {
    const s = SLADY.find((x) => x.re.test(r.nazwa)) ?? {};
    const commit = s.commit ? GIT.find((c) => s.commit.test(c.temat)) : null;
    const wpis = s.tag ? WPISY.find((w) => w.kto === s.tag) : null;
    return { ...r, opis: s.opis ?? '', commit, wpis, plik: s.plik?.() ?? null, prompt: PROMPTY[r.nazwa] ?? '' };
  });
  // Routines utworzone po ostatnim zrzucie z konta (zrzut odświeża się w poniedziałek)
  const znane = new Set(lista.map((r) => r.nazwa));
  for (const [nazwa, prompt] of Object.entries(PROMPTY)) if (!znane.has(nazwa)) lista.push({ nazwa, cron: '', start: '', stan: '', ostatnie: '', status: 'spoza zrzutu', trigger: '', opis: '', prompt });
  if (!lista.some((r) => /Weryfikacja ofert/.test(r.nazwa))) {
    const w = weryfikacja._meta?.ostatni_przebieg;
    lista.push({ nazwa: 'LEGO 09:17 — Weryfikacja ofert do slajderów (sesja Code, po Łowcy)', cron: 'CRON_TZ=Europe/Warsaw 17 9 * * *', start: '09:17', stan: '✅', ostatnie: w?.czas ?? '', status: 'nowy — wejdzie do zrzutu w poniedziałek', trigger: 'trig_01ApTmYLjumFycmtRJgUzXfa', opis: SLADY.at(-1).opis, commit: GIT.find((c) => /^Weryfikacja ofert \d/.test(c.temat)), prompt: '' });
  }
  return lista;
}

// ── HTML ──────────────────────────────────────────────────────────────────
const ZAKLADKI = [
  ['index.html', 'Dziś'],
  ['runnery.html', 'Runnery'],
  ['opisy.html', 'Opisy'],
  ['social.html', 'Social'],
  ['artykuly.html', 'Artykuły'],
  ['statystyki.html', 'Statystyki'],
  ['afiliacje.html', 'Afiliacje'],
  ['ceny.html', 'Ceny'],
  ['wgraj.html', 'Wgraj'],
  ['dziennik.html', 'Dziennik'],
];
const WKROTCE = [];

function strona(plik, tytul, tresc, { skrypt = false } = {}) {
  const nav = ZAKLADKI.map(([p, n]) => `<a href="/${p === 'index.html' ? '' : p.replace('.html', '')}"${p === plik ? ' aria-current="page"' : ''}>${n}</a>`).join('')
    + WKROTCE.map((n) => `<span class="wkrotce" title="W drugim kroku">${n}</span>`).join('');
  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(tytul)} · Panel tylkoklocki</title>
<link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/panel.css">
</head>
<body>
<header class="gora">
  <a class="logo" href="/"><img src="/static/logo.svg" alt="tylkoklocki.pl" width="150" height="32"><span>Panel</span></a>
  <nav>${nav}</nav>
  <span class="kto" id="kto"></span>
</header>
<main>
<h1>${esc(tytul)}</h1>
${tresc}
</main>
<footer class="stopka">Stan z repo: ${dataPL(DZIS)}, ${godzinaPL()}${GIT[0] ? ` · commit <code>${GIT[0].hash}</code>` : ''} · panel przebudowuje się przy każdym pushu na main</footer>
<script src="/static/panel.js" defer></script>
</body>
</html>`;
}

const kafel = (etykieta, wartosc, dopisek = '', klasa = '') => `<div class="kafel ${klasa}"><div class="etykieta">${etykieta}</div><div class="wartosc">${wartosc}</div>${dopisek ? `<div class="dopisek">${dopisek}</div>` : ''}</div>`;
const klasaSwiezosci = (n, ok = 1, uwaga = 7) => (n === null ? '' : n <= ok ? 'ok' : n <= uwaga ? 'uwaga' : 'stare');
const link = (href, t) => `<a href="${esc(href)}">${esc(t)}</a>`;

// ── Social: co zdjąć ──────────────────────────────────────────────────────
const doZdjecia = (social.wpisy ?? []).filter((w) => !['zarchiwizowane', 'zostaje'].includes(w.stan) && w.archiwizacja?.termin && w.archiwizacja.termin <= DZIS);

// ── strona: Dziś ──────────────────────────────────────────────────────────
function stronaDzis() {
  const lowca = GIT.find((c) => /^Łowca: ceny/.test(c.temat));
  const wer = weryfikacja._meta?.ostatni_przebieg ?? {};
  const kart = NUMERY_KART.size;
  const dzisCommity = GIT.filter((c) => c.dzien === DZIS);
  const ostatniTekst = ARTYKULY[0];
  const kodyAktywne = Object.entries(kody).filter(([k]) => k !== '_meta').flatMap(([s, l]) => (Array.isArray(l) ? l : []).filter((x) => x.do >= DZIS).map((x) => ({ ...x, sklep: s })));

  const kafle = [
    kafel('Łowca (ceny z feedów)', lowca?.dzien === DZIS ? `dziś ${lowca.godz}` : lowca ? dataPL(lowca.dzien) : 'brak w historii', lowca ? esc(lowca.temat) : 'git niedostępny w buildzie', lowca?.dzien === DZIS ? 'ok' : 'uwaga'),
    kafel('Weryfikacja ofert', wer.czas ? `${wer.czas.slice(11)} · ${wer.sprawdzono} kart` : '—', wer.wyniki ? Object.entries(wer.wyniki).map(([k, v]) => `${k}: ${v}`).join(' · ') : '', wer.czas?.startsWith(DZIS) ? 'ok' : 'uwaga'),
    kafel('Opisy zestawów (karty)', licz(kart), `z ${licz(KATALOG.size)} zestawów w katalogu`),
    kafel('Ostatni tekst', ostatniTekst ? dataPL(ostatniTekst.aktualizacja || ostatniTekst.data) : '—', ostatniTekst ? link(`${SITE}/artykuly/${ostatniTekst.slug}/`, ostatniTekst.tytul.slice(0, 70)) : ''),
    kafel('Social — do zdjęcia', String(doZdjecia.length), doZdjecia.length ? doZdjecia.map((w) => esc(w.temat.slice(0, 50))).join('<br>') : 'nic po terminie', doZdjecia.length ? 'stare' : 'ok'),
    kafel('Aktywne kody rabatowe', String(kodyAktywne.length), kodyAktywne.map((k) => `${sklep(k.sklep)} ${esc(k.kod ?? '')} do ${dataPL(k.do)}`).join('<br>')),
  ].join('');

  const sklepy = swiezoscSklepow().map((s) => {
    const n = dni(s.data);
    return `<tr><td>${esc(sklep(s.sklep))}</td><td class="liczba">${licz(s.ofert)}</td><td><span class="kropka ${klasaSwiezosci(n, 1, 7)}"></span>${dataPL(s.data)} <span class="szary">(${ileTemu(s.data)})</span></td></tr>`;
  }).join('');

  const wpisy = WPISY.slice(0, 10).map((w) => `<li><span class="znacznik">${esc(w.kto)}</span> <span class="szary">${dataPL(w.dzien)} ${w.godz}</span> <a href="/dziennik#${w.id}">${inline(w.tytul)}</a><div class="skrot">${inline(w.skrot)}</div></li>`).join('');
  const zmiany = (dzisCommity.length ? dzisCommity : GIT.slice(0, 12)).map((c) => `<li><code>${c.hash}</code> <span class="szary">${c.dzien === DZIS ? c.godz : dataPL(c.dzien)}</span> ${esc(c.temat)}</li>`).join('');

  return strona('index.html', 'Dziś', `
<div class="kafle">${kafle}</div>
<div class="dwie">
  <section class="karta"><h2>Świeżość cen w sklepach</h2>
    <p class="szary">Najnowszy odczyt ceny w danym sklepie. Media Expert, Allegro i Planeta Klocków idą codziennie z feedów; Empik i x-kom z poniedziałkowego zrzutu, Ceneo i Smyk we wtorek.</p>
    <div class="tabela"><table><thead><tr><th>Sklep</th><th>Ofert</th><th>Ostatni odczyt</th></tr></thead><tbody>${sklepy}</tbody></table></div>
  </section>
  <section class="karta"><h2>${dzisCommity.length ? `Zmiany dziś (${dzisCommity.length})` : 'Ostatnie zmiany'}</h2>
    <ul class="lista">${zmiany || '<li class="szary">Historia git niedostępna w tym buildzie.</li>'}</ul>
  </section>
</div>
<section class="karta"><h2>Ostatnie wpisy w dzienniku</h2><ul class="lista wpisy">${wpisy}</ul><p><a href="/dziennik">Cały dziennik →</a></p></section>
`);
}

// ── strona: Runnery ───────────────────────────────────────────────────────
function stronaRunnery() {
  const lista = runnery();
  const wiersze = lista.map((r, i) => {
    const slad = r.commit ? `<code>${r.commit.hash}</code> ${r.commit.dzien === DZIS ? `dziś ${r.commit.godz}` : dataPL(r.commit.dzien)}<div class="szary">${esc(r.commit.temat.slice(0, 90))}</div>`
      : r.plik ? `raport ${dataPL(r.plik)}` : '<span class="szary">bez śladu w repo</span>';
    const wpis = r.wpis ? `<a href="/dziennik#${r.wpis.id}">${dataPL(r.wpis.dzien)} · ${inline(r.wpis.tytul)}</a>` : '';
    const n = r.commit ? dni(r.commit.dzien) : null;
    return `<details class="runner" id="r${i}"><summary>
      <span class="nazwa"><span class="kropka ${r.status.includes('SUCCEEDED') ? 'ok' : r.status.includes('FAIL') ? 'stare' : 'uwaga'}"></span>${esc(r.nazwa)}</span>
      <span class="kiedy">${esc(r.start || '—')}</span>
      <span class="ostatnio">${slad}</span></summary>
      <div class="szczegoly">
        ${r.opis ? `<p>${esc(r.opis)}</p>` : ''}
        <dl>
          <dt>Harmonogram</dt><dd><code>${esc(r.cron || '—')}</code></dd>
          <dt>Ostatnie odpalenie (zrzut z konta)</dt><dd>${esc(r.ostatnie || '—')} · ${esc(r.status || '')}</dd>
          ${wpis ? `<dt>Ostatni wpis w dzienniku</dt><dd>${wpis}</dd>` : ''}
          ${n !== null ? `<dt>Ostatni commit</dt><dd>${ileTemu(r.commit.dzien)}</dd>` : ''}
          <dt>Trigger</dt><dd><code>${esc(r.trigger || '—')}</code></dd>
        </dl>
        ${r.prompt ? `<details class="prompt"><summary>Prompt (kopia z konta)</summary><div class="md">${md(r.prompt)}</div></details>` : ''}
      </div></details>`;
  }).join('');
  return strona('runnery.html', 'Runnery', `
<p class="szary">Harmonogram i statusy pochodzą ze zrzutu z konta claude.ai (${esc(HARM.odczyt || 'brak daty')}), który sesja Code odświeża w każdy poniedziałek o 7:45. „Ostatnio” to ślad w repo: commit runnera albo jego raport — świeży niezależnie od zrzutu. Panel tylko pokazuje: prompt zmienia się w panelu claude.ai, nie tutaj.</p>
<div class="runnery-naglowek"><span>Runner</span><span>Start (PL)</span><span>Ostatnio w repo</span></div>
${wiersze}
`);
}

// ── strona: Opisy ─────────────────────────────────────────────────────────
function stronaOpisy() {
  // Katalog: co mamy, czego nie — per seria
  const serie = new Map();
  for (const [nr, e] of KATALOG) {
    const s = serie.get(e.seria) ?? { seria: e.seria, wszystkie: 0, karty: 0, dostepne: 0, dostepneBez: 0 };
    s.wszystkie++;
    if (NUMERY_KART.has(nr)) s.karty++;
    if (e.status === 'dostepny') { s.dostepne++; if (!maOpis(nr)) s.dostepneBez++; }
    serie.set(e.seria, s);
  }
  const wgSerii = [...serie.values()].sort((a, b) => b.wszystkie - a.wszystkie).map((s) =>
    `<tr><td>${esc(s.seria)}</td><td class="liczba">${licz(s.wszystkie)}</td><td class="liczba">${licz(s.karty)}</td><td><div class="pasek"><span style="width:${Math.round((100 * s.karty) / s.wszystkie)}%"></span></div></td><td class="liczba">${s.dostepneBez ? `<strong>${s.dostepneBez}</strong>` : '0'} / ${s.dostepne}</td></tr>`).join('');

  // Lista dla Piotra (najnowsza) — postęp partii
  const listy = readdirSync(join(REPO, 'materialy')).filter((f) => /^lista-opisow-dla-piotra-\d{4}-\d\d-\d\d\.json$/.test(f)).sort();
  let partie = '<p class="szary">Brak listy dla Piotra w materialy/.</p>';
  let listaInfo = '';
  if (listy.length) {
    const plik = listy.at(-1);
    const l = json(`materialy/${plik}`);
    const grupy = new Map();
    for (const p of l.pozycje) {
      const g = grupy.get(p.partia) ?? { partia: p.partia, n: 0, wgrane: 0, pozycje: [] };
      g.n++;
      if (NUMERY_KART.has(String(p.nr))) g.wgrane++;
      g.pozycje.push(p);
      grupy.set(p.partia, g);
    }
    const wgrane = l.pozycje.filter((p) => NUMERY_KART.has(String(p.nr))).length;
    listaInfo = `${licz(l.pozycje.length)} zestawów, wgranych ${licz(wgrane)} · lista z ${dataPL(l._meta?.stan_na)} · <a href="/pliki/${plik.replace('.json', '.xlsx')}">pobierz arkusz (.xlsx)</a>`;
    const GRUPY = { 1: 'w sprzedaży', 2: 'wycofane, ≥3 sklepy', 3: 'wycofane 2023+, 2 sklepy' };
    partie = [...grupy.values()].map((g) => `<details class="partia"><summary><span>Partia ${g.partia}</span><span class="szary">${GRUPY[g.pozycje[0].grupa] ?? ''}</span><span class="liczba">${g.wgrane}/${g.n}</span><div class="pasek"><span style="width:${Math.round((100 * g.wgrane) / g.n)}%"></span></div></summary>
      <div class="tabela"><table><tbody>${g.pozycje.map((p) => `<tr class="${NUMERY_KART.has(String(p.nr)) ? 'zrobione' : ''}"><td class="liczba">${p.lp}</td><td><a href="${SITE}/zestaw/${p.nr}/">${p.nr}</a></td><td>${esc(p.nazwa)}</td><td>${esc(p.seria)}</td><td>${p.rok ?? ''}</td><td>${NUMERY_KART.has(String(p.nr)) ? '✓ wgrana' : ''}</td></tr>`).join('')}</tbody></table></div></details>`).join('');
  }

  // Pełna tabela do filtrowania (dane w osobnym pliku, żeby strona ładowała się od razu)
  const wszystkie = [];
  for (const [nr, e] of KATALOG) {
    const sk = new Set(Object.keys(feed[nr]?.oferty ?? {}));
    for (const o of sety[nr]?.oferty ?? []) sk.add(o.sklep);
    sk.delete('ceneo');
    wszystkie.push([nr, e.nazwa ?? '', e.seria, e.rok ?? '', e.status === 'dostepny' ? 1 : 0, NUMERY_KART.has(nr) ? 1 : maOpis(nr) ? 2 : 0, sk.size]);
  }
  writeFileSync(join(DIST, 'dane/zestawy.json'), JSON.stringify(wszystkie));

  const zKarta = NUMERY_KART.size;
  const dostepneBez = [...KATALOG.entries()].filter(([nr, e]) => e.status === 'dostepny' && !maOpis(nr)).length;
  return strona('opisy.html', 'Opisy zestawów', `
<div class="kafle">
  ${kafel('Zestawów w katalogu', licz(KATALOG.size))}
  ${kafel('Z opisem (karta Piotra)', licz(zKarta), `${Math.round((100 * zKarta) / KATALOG.size)}% katalogu`, 'ok')}
  ${kafel('W sprzedaży bez opisu', licz(dostepneBez), 'ani karty, ani własnego opisu — w tym gadżety i części', dostepneBez ? 'uwaga' : 'ok')}
</div>
<section class="karta"><h2>Lista dla Piotra</h2><p>${listaInfo}</p>
<p class="szary">Partie po 25. Status „wgrana” liczy się sam: zestaw ma kartę w <code>karty_setow.json</code>. Przed nową serią paczek odśwież listę (sesja Code: <code>scripts/noindex-do-opisania.py</code>), żeby nie pisać opisów, które już są.</p>
${partie}</section>
<section class="karta"><h2>Co mamy, czego nie — według serii</h2>
<div class="tabela"><table><thead><tr><th>Seria</th><th>Zestawów</th><th>Z opisem</th><th></th><th>W sprzedaży: bez opisu / wszystkie</th></tr></thead><tbody>${wgSerii}</tbody></table></div></section>
<section class="karta"><h2>Wyszukaj zestaw</h2>
<div class="filtry"><input id="szukaj" type="search" placeholder="Numer, nazwa albo seria" autocomplete="off">
<select id="f-karta"><option value="">wszystkie</option><option value="0">bez opisu</option><option value="1">z kartą Piotra</option><option value="2">z własnym opisem</option></select>
<select id="f-status"><option value="">każdy status</option><option value="1">w sprzedaży</option><option value="0">wycofane</option></select></div>
<div class="tabela"><table id="zestawy" data-zrodlo="/dane/zestawy.json"><thead><tr><th>Numer</th><th>Nazwa</th><th>Seria</th><th>Rok</th><th>Status</th><th>Opis</th><th>Sklepy</th></tr></thead><tbody><tr><td colspan="7" class="szary">Wczytuję…</td></tr></tbody></table></div>
<p class="szary" id="zestawy-info"></p></section>
`);
}

// ── strona: Social ────────────────────────────────────────────────────────
function stronaSocial() {
  const wpisy = [...(social.wpisy ?? [])].sort((a, b) => b.data.localeCompare(a.data));
  const STANY = { opublikowane: 'uwaga', 'do archiwizacji': 'stare', zarchiwizowane: 'ok', zostaje: 'ok' };
  const wiersze = wpisy.map((w) => {
    const po = w.archiwizacja?.termin && w.archiwizacja.termin <= DZIS && !['zarchiwizowane', 'zostaje'].includes(w.stan);
    return `<tr class="${po ? 'alarm' : ''}"><td>${dataPL(w.data)}</td><td>${esc(w.format)}</td><td>${w.link ? link(w.link, w.temat) : esc(w.temat)}<div class="szary">${esc((w.platformy ?? []).join(', '))}${w.zrobione_w ? ` · ${esc(w.zrobione_w)}` : ''}</div></td>
      <td>${w.archiwizacja?.termin ? `${dataPL(w.archiwizacja.termin)}${po ? ' <strong>— po terminie</strong>' : ''}` : '—'}<div class="szary">${esc(w.archiwizacja?.powod ?? '')}</div></td>
      <td><span class="kropka ${STANY[w.stan] ?? ''}"></span>${esc(w.stan)}${w.uwagi ? `<div class="szary">${esc(w.uwagi)}</div>` : ''}</td></tr>`;
  }).join('');

  // Zasady: wybrane sekcje skilla klocki-social (jedno źródło — skill w repo)
  const skill = istnieje('.claude/skills/klocki-social/SKILL.md') ? czytaj('.claude/skills/klocki-social/SKILL.md').replace(/^---[\s\S]*?---\s*/, '') : '';
  const sekcja = (tytul) => skill.split(/^## /m).find((s) => s.startsWith(tytul)) ?? '';
  const zasady = ['Zasady\n', 'Zasady dobrej karuzeli', 'Rola każdej platformy', 'Rolki wideo'].map((t) => sekcja(t)).filter(Boolean).map((s) => `<details class="zasada"><summary>${esc(s.split('\n')[0].replace(/\s*\(.*\)$/, ''))}</summary><div class="md">${md(s.slice(s.indexOf('\n') + 1))}</div></details>`).join('');

  return strona('social.html', 'Social media', `
<div class="kafle">
  ${kafel('Publikacji w rejestrze', String(wpisy.length))}
  ${kafel('Do zdjęcia / archiwizacji', String(doZdjecia.length), doZdjecia.length ? 'termin minął' : 'nic po terminie', doZdjecia.length ? 'stare' : 'ok')}
  ${kafel('Najbliższy termin', (() => { const n = wpisy.filter((w) => w.archiwizacja?.termin > DZIS && !['zarchiwizowane', 'zostaje'].includes(w.stan)).sort((a, b) => a.archiwizacja.termin.localeCompare(b.archiwizacja.termin))[0]; return n ? dataPL(n.archiwizacja.termin) : '—'; })())}
</div>
<section class="karta"><h2>Co i kiedy poszło</h2>
<p class="szary">Rejestr: <code>materialy/social/rejestr.json</code> (dopisujemy przy każdej publikacji). Zasada archiwizacji: okazje dnia po 14 dniach, post z kodem rabatowym po wygaśnięciu kodu, recenzje mogą zostać. Na IG: … → Archiwizuj; na FB: Meta Business Suite → oznacz jako wygasły.</p>
<div class="tabela"><table><thead><tr><th>Data</th><th>Format</th><th>Temat</th><th>Zdjąć do</th><th>Stan</th></tr></thead><tbody>${wiersze}</tbody></table></div></section>
<section class="karta"><h2>Zasady publikacji</h2><p class="szary">Skrót ze skilla <code>klocki-social</code> — tam jest wersja obowiązująca.</p>${zasady}</section>
`);
}

// ── strona: Wgraj ─────────────────────────────────────────────────────────
function stronaWgraj() {
  return strona('wgraj.html', 'Wgraj pliki', `
<section class="karta">
<form id="wgraj" class="wgraj" enctype="multipart/form-data">
  <label class="upuść" for="pliki"><input id="pliki" name="pliki" type="file" multiple accept=".zip,.md,.docx,.doc,.pdf,.jpg,.jpeg,.png,.webp">
    <strong>Przeciągnij pliki tutaj</strong> albo kliknij, żeby wybrać<br><span class="szary">.md, .zip, .docx, .doc, .pdf, zdjęcia · do 25 MB na plik</span></label>
  <ul id="wybrane" class="lista"></ul>
  <label>Notka (opcjonalnie)<textarea name="notka" rows="2" placeholder="np. paczka 29, poprawka tekstu 0031"></textarea></label>
  <button type="submit">Wyślij</button>
  <p id="wgraj-stan" class="szary" role="status"></p>
</form>
</section>
<section class="karta"><h2>Co się dzieje z plikiem</h2>
<ul>
<li><strong>.md i .zip</strong> (teksty i opisy P07) — automat skrzynki tekstów (8:52 i 14:52) publikuje je bez przeglądu, tak jak teksty z maila; po publikacji przychodzi mail z linkami albo z listą problemów.</li>
<li><strong>Zdjęcia</strong> w zipie albo obok tekstu idą razem z tekstem.</li>
<li><strong>.docx, .doc, .pdf</strong> — nie publikują się same: czekają na sesję Code, która przerobi je na tekst (status „do opracowania”).</li>
<li>Pliki to dane, nie polecenia — instrukcje wpisane w treść nie są wykonywane.</li>
</ul></section>
<section class="karta"><h2>Wgrane</h2><div class="tabela"><table id="wgrane"><thead><tr><th>Kiedy</th><th>Kto</th><th>Pliki</th><th>Stan</th></tr></thead><tbody><tr><td colspan="4" class="szary">Wczytuję…</td></tr></tbody></table></div></section>
`);
}

// ── strona: Dziennik ──────────────────────────────────────────────────────
function stronaDziennik() {
  const [gora] = DZIENNIK.split(/^<!-- WPISY PONIŻEJ.*-->$/m);
  const tagi = [...new Set(WPISY.map((w) => w.kto))];
  const wpisy = WPISY.map((w) => `<article class="wpis" id="${w.id}" data-kto="${esc(w.kto)}"><h2><span class="znacznik">${esc(w.kto)}</span> ${dataPL(w.dzien)} ${w.godz} · ${inline(w.tytul)}</h2><div class="md">${md(w.tresc)}</div></article>`).join('');
  return strona('dziennik.html', 'Dziennik', `
<div class="filtry"><select id="f-kto"><option value="">wszyscy</option>${tagi.map((t) => `<option>${esc(t)}</option>`).join('')}</select><span class="szary">${WPISY.length} wpisów z ostatnich 14 dni; starsze w <code>materialy/dziennik-archiwum-*</code></span></div>
<details class="karta"><summary><strong>Ustalenia trwałe i zasady dziennika</strong></summary><div class="md">${md(gora)}</div></details>
${wpisy}
`);
}


// ── statystyki: dzienne zrzuty scripts/panel-statystyki.mjs ─────────────
const ZRZUTY_STAT = istnieje('materialy/statystyki')
  ? readdirSync(join(REPO, 'materialy/statystyki')).filter((f) => /^\d{4}-\d\d-\d\d\.json$/.test(f)).sort().map((f) => json(`materialy/statystyki/${f}`))
  : [];
const STAT = ZRZUTY_STAT.at(-1) ?? null;
const proc = (x, m = 1) => `${(x * 100).toFixed(m).replace('.', ',')}%`;
const brakStat = '<p class="szary">Brak zrzutu statystyk — uruchom <code>node scripts/panel-statystyki.mjs</code> (robi to codziennie zadanie 09:17).</p>';
const ostatnieZgloszenie = (() => {
  const z = istnieje('materialy/indeksacja/historia.json') ? json('materialy/indeksacja/historia.json').zgloszenia ?? {} : {};
  const m = new Map();
  for (const [dzien, adresy] of Object.entries(z)) for (const a of adresy) if (!m.has(a) || m.get(a) < dzien) m.set(a, dzien);
  return { mapa: m, dni: z };
})();
const gscStrona = new Map((STAT?.gsc?.d28?.strony ?? []).map((s) => [s.strona, s]));

// ── strona: Artykuły ──────────────────────────────────────────────────────
function stronaArtykuly() {
  const kategorie = [...new Set(ARTYKULY.map((a) => a.kategoria).filter(Boolean))].sort();
  const ileKat = kategorie.map((k) => [k, ARTYKULY.filter((a) => a.kategoria === k).length]);
  const tydzien = ARTYKULY.filter((a) => dni(a.aktualizacja || a.data) <= 7).length;
  const wiersze = ARTYKULY.map((a) => {
    const url = `${SITE}/artykuly/${a.slug}/`;
    const g = gscStrona.get(url);
    const zgl = ostatnieZgloszenie.mapa.get(url);
    return `<tr data-kat="${esc(a.kategoria)}"><td>${dataPL(a.data)}${a.aktualizacja ? `<div class="szary">akt. ${dataPL(a.aktualizacja)}</div>` : ''}</td><td>${link(url, a.tytul || a.slug)}</td><td>${esc(a.kategoria)}</td><td>${a.piotr ? `Piotr <span class="szary">${esc(a.piotr)}</span>` : '<span class="szary">—</span>'}</td><td class="liczba">${g ? `${g.kliki} / ${g.wyswietlenia}` : '<span class="szary">0 / 0</span>'}</td><td>${zgl ? dataPL(zgl) : '<span class="szary">—</span>'}</td></tr>`;
  }).join('');
  return strona('artykuly.html', 'Artykuły', `
<div class="kafle">${kafel('Tekstów w serwisie', String(ARTYKULY.length))}${kafel('Nowe lub poprawione w 7 dni', String(tydzien), '', tydzien ? 'ok' : 'uwaga')}${kafel('Od Piotra (skrzynka)', String(ARTYKULY.filter((a) => a.piotr).length), 'teksty z rejestru redakcja/skrzynka.json')}${ileKat.slice(0, 3).map(([k, n]) => kafel(k, String(n))).join('')}</div>
<section class="karta"><div class="filtry"><select id="f-kat"><option value="">wszystkie kategorie</option>${ileKat.map(([k, n]) => `<option value="${esc(k)}">${esc(k)} (${n})</option>`).join('')}</select><span class="szary">Google: kliknięcia / wyświetlenia z 28 dni${STAT ? ` (zrzut ${dataPL(STAT.data)})` : ''}; „Zgłoszony” — ostatnie „Poproś o zindeksowanie” z kolejki indeksacji.</span></div>
<div class="tabela"><table id="artykuly"><thead><tr><th>Data</th><th>Tytuł</th><th>Kategoria</th><th>Autor</th><th class="liczba">Google 28 dni</th><th>Zgłoszony</th></tr></thead><tbody>${wiersze}</tbody></table></div></section>
`);
}

// ── strona: Statystyki ────────────────────────────────────────────────────
function stronaStatystyki() {
  if (!STAT) return strona('statystyki.html', 'Statystyki', brakStat);
  const g7 = STAT.gsc.d7, g28 = STAT.gsc.d28, k7 = STAT.kliki.d7, k28 = STAT.kliki.d28;
  const kGsc = (g, okres) => (g?.suma ? kafel(`Google — ${okres}`, `${licz(g.suma.clicks)} kliknięć`, `${licz(g.suma.impressions)} wyświetleń · CTR ${proc(g.suma.ctr)} · śr. pozycja ${g.suma.position.toFixed(1).replace('.', ',')}${g.zakres ? `<br>${dataPL(g.zakres.od)}–${dataPL(g.zakres.do)}` : ''}`) : kafel(`Google — ${okres}`, '—', esc(g?.blad ?? ''), 'stare'));
  const kKlik = (k, okres) => (k?.kliki_lacznie !== undefined ? kafel(`Kliknięcia w sklepy — ${okres}`, licz(k.kliki_lacznie), `tylko ludzie; boty odfiltrowane: ${licz(k.podzial_ruchu?.bot ?? 0)}`) : kafel(`Kliknięcia w sklepy — ${okres}`, '—', esc(k?.blad ?? ''), 'stare'));
  const trend = ZRZUTY_STAT.slice(-30).reverse().map((z) => `<tr><td>${dataPL(z.data)}</td><td class="liczba">${z.gsc.d7?.suma?.clicks ?? '—'}</td><td class="liczba">${z.gsc.d7?.suma ? licz(z.gsc.d7.suma.impressions) : '—'}</td><td class="liczba">${z.gsc.d28?.suma?.clicks ?? '—'}</td><td class="liczba">${z.kliki.d7?.kliki_lacznie ?? '—'}</td><td class="liczba">${z.kliki.d28?.kliki_lacznie ?? '—'}</td></tr>`).join('');
  const frazy = (g28.frazy ?? []).slice(0, 30).map((f) => `<tr><td>${esc(f.fraza)}</td><td class="liczba">${f.kliki}</td><td class="liczba">${f.wyswietlenia}</td><td class="liczba">${String(f.pozycja).replace('.', ',')}</td></tr>`).join('');
  const strony = (g28.strony ?? []).slice(0, 30).map((s) => `<tr><td>${link(s.strona, s.strona.replace(SITE, ''))}</td><td class="liczba">${s.kliki}</td><td class="liczba">${s.wyswietlenia}</td><td class="liczba">${String(s.pozycja).replace('.', ',')}</td></tr>`).join('');
  const max = Math.max(1, ...(k28.per_sklep ?? []).map((s) => s.kliki));
  const sklepy = (k28.per_sklep ?? []).map((s) => `<tr><td>${esc(sklep(s.sklep))}</td><td class="liczba">${licz(s.kliki)}</td><td><div class="pasek"><span style="width:${Math.round((100 * s.kliki) / max)}%"></span></div></td></tr>`).join('');
  const topSety = (k28.top_sety ?? []).slice(0, 20).map((s) => `<tr><td>${link(`${SITE}/zestaw/${s.numer}/`, s.numer)} <span class="szary">${esc(KATALOG.get(String(s.numer))?.nazwa ?? sety[s.numer]?.nazwa ?? '')}</span></td><td>${esc(sklep(s.sklep))}</td><td class="liczba">${s.kliki}</td></tr>`).join('');
  const zgl = Object.entries(ostatnieZgloszenie.dni).slice(-14).reverse().map(([d, a]) => `<tr><td>${dataPL(d)}</td><td class="liczba">${a.length}</td></tr>`).join('');
  return strona('statystyki.html', 'Statystyki', `
<p class="szary">Zrzut z ${dataPL(STAT.data)} (codziennie o 9:17). Search Console ma ok. 2 dni opóźnienia. Kliknięcia w sklepy to wejścia na nasze linki <code>/idz/</code>, nie sprzedaż — przychody z sieci dojdą później.</p>
<div class="kafle">${kGsc(g7, '7 dni')}${kGsc(g28, '28 dni')}${kKlik(k7, '7 dni')}${kKlik(k28, '28 dni')}</div>
<div class="dwie">
<section class="karta"><h2>Kliknięcia w sklepy (28 dni)</h2><div class="tabela"><table><thead><tr><th>Sklep</th><th class="liczba">Kliknięcia</th><th></th></tr></thead><tbody>${sklepy}</tbody></table></div></section>
<section class="karta"><h2>Najczęściej klikane zestawy (28 dni)</h2><div class="tabela"><table><thead><tr><th>Zestaw</th><th>Sklep</th><th class="liczba">Kliknięcia</th></tr></thead><tbody>${topSety}</tbody></table></div></section>
</div>
<div class="dwie">
<section class="karta"><h2>Frazy w Google (28 dni)</h2><div class="tabela"><table><thead><tr><th>Fraza</th><th class="liczba">Klik.</th><th class="liczba">Wyśw.</th><th class="liczba">Poz.</th></tr></thead><tbody>${frazy}</tbody></table></div></section>
<section class="karta"><h2>Strony w Google (28 dni)</h2><div class="tabela"><table><thead><tr><th>Strona</th><th class="liczba">Klik.</th><th class="liczba">Wyśw.</th><th class="liczba">Poz.</th></tr></thead><tbody>${strony}</tbody></table></div></section>
</div>
<div class="dwie">
<section class="karta"><h2>Dzień po dniu</h2><div class="tabela"><table><thead><tr><th>Zrzut</th><th class="liczba">Google klik. 7 dni</th><th class="liczba">Wyśw. 7 dni</th><th class="liczba">Google klik. 28 dni</th><th class="liczba">Sklepy 7 dni</th><th class="liczba">Sklepy 28 dni</th></tr></thead><tbody>${trend}</tbody></table></div><p class="szary">Historia rośnie o jeden wiersz dziennie od 01.11.2026.</p></section>
<section class="karta"><h2>Zgłoszenia do indeksacji</h2><div class="tabela"><table><thead><tr><th>Dzień</th><th class="liczba">Adresów</th></tr></thead><tbody>${zgl}</tbody></table></div><p class="szary">Kolejka: <code>materialy/indeksacja/kolejka.md</code>; klika Cowork w Search Console.</p></section>
</div>
`);
}

// ── strona: Afiliacje ─────────────────────────────────────────────────────
function stronaAfiliacje() {
  const rej = json('src/data/afiliacje_rejestr.json');
  const kliki = new Map((STAT?.kliki?.d28?.per_sklep ?? []).map((s) => [s.sklep, s.kliki]));
  const KOL = { aktywny: 'ok', wyslane: 'uwaga', 'do zgloszenia': '', odrzucony: 'stare' };
  const wpisy = Object.entries(rej).filter(([k]) => k !== '_meta').sort((a, b) => (b[1].status === 'aktywny') - (a[1].status === 'aktywny') || (kliki.get(b[0]) ?? 0) - (kliki.get(a[0]) ?? 0));
  const wiersze = wpisy.map(([k, v]) => `<tr><td><strong>${esc(sklep(k))}</strong></td><td>${esc(v.siec ?? '')}</td><td><span class="kropka ${KOL[v.status] ?? ''}"></span>${esc(v.status ?? '')}</td><td>${esc(v.prowizja ?? '')}</td><td class="liczba">${v.cookie_dni ?? ''}</td><td class="liczba">${kliki.has(k) ? licz(kliki.get(k)) : '<span class="szary">—</span>'}</td><td>${v.uwagi ? `<details><summary class="szary">uwagi</summary>${esc(v.uwagi)}</details>` : ''}</td></tr>`).join('');
  const aktywne = wpisy.filter(([, v]) => v.status === 'aktywny').length;
  const kodyTab = Object.entries(kody).filter(([k]) => k !== '_meta').flatMap(([s, l]) => (Array.isArray(l) ? l : []).map((x) => ({ ...x, sklep: s }))).sort((a, b) => b.do.localeCompare(a.do)).slice(0, 15)
    .map((k) => `<tr class="${k.do < DZIS ? 'zrobione' : ''}"><td>${esc(sklep(k.sklep))}</td><td><code>${esc(k.kod ?? '')}</code></td><td>${dataPL(k.do)}${k.do < DZIS ? ' <span class="szary">(wygasł)</span>' : ''}</td><td class="liczba">${Object.keys(k.zestawy ?? {}).length}</td></tr>`).join('');
  const kontrola = readdirSync(join(REPO, 'materialy')).filter((f) => /^kontrola-linkow-\d{4}-\d\d-\d\d\.md$/.test(f)).sort().at(-1);
  const dec = rej._meta?.decyzje;
  const decyzje = Array.isArray(dec) ? dec.slice(-8).reverse().map((d) => `<li>${inline(typeof d === 'string' ? d : JSON.stringify(d))}</li>`).join('') : dec && typeof dec === 'object' ? Object.entries(dec).slice(-8).reverse().map(([k, v]) => `<li><strong>${esc(k)}</strong> ${inline(typeof v === 'string' ? v : JSON.stringify(v))}</li>`).join('') : '';
  return strona('afiliacje.html', 'Afiliacje', `
<div class="kafle">${kafel('Programy aktywne', `${aktywne} / ${wpisy.length}`, 'z rejestru src/data/afiliacje_rejestr.json', 'ok')}${kafel('Kliknięcia w sklepy (28 dni)', STAT?.kliki?.d28?.kliki_lacznie !== undefined ? licz(STAT.kliki.d28.kliki_lacznie) : '—', 'tylko ludzie')}${kafel('Rejestr aktualizowany', dataPL(rej._meta?.zaktualizowano))}</div>
<section class="karta"><h2>Programy partnerskie</h2><p class="szary">Przychody i prowizje naliczone w sieciach dojdą w kolejnym kroku. Kliknięcia to wejścia z naszych linków <code>/idz/</code> w ostatnich 28 dniach.</p>
<div class="tabela"><table><thead><tr><th>Sklep</th><th>Sieć</th><th>Status</th><th>Prowizja</th><th class="liczba">Cookie (dni)</th><th class="liczba">Kliknięcia 28 dni</th><th></th></tr></thead><tbody>${wiersze}</tbody></table></div></section>
<div class="dwie">
<section class="karta"><h2>Kody rabatowe</h2><div class="tabela"><table><thead><tr><th>Sklep</th><th>Kod</th><th>Ważny do</th><th class="liczba">Zestawów</th></tr></thead><tbody>${kodyTab}</tbody></table></div></section>
<section class="karta"><h2>Kontrola linków${kontrola ? ` — ${dataPL(kontrola.match(/\d{4}-\d\d-\d\d/)[0])}` : ''}</h2>${kontrola ? `<div class="md">${md(czytaj(`materialy/${kontrola}`).replace(/^# .*\n/, ''))}</div>` : '<p class="szary">Brak raportu.</p>'}</section>
</div>
${decyzje ? `<section class="karta"><h2>Ostatnie decyzje (rejestr)</h2><ul>${decyzje}</ul></section>` : ''}
`);
}

// ── strona: Ceny ──────────────────────────────────────────────────────────
function historiaCen() {
  const kat = join(REPO, 'src/data/historia-cen');
  const pliki = readdirSync(kat).filter((f) => /^\d{4}-\d\d\.jsonl$/.test(f)).sort().slice(-2);
  const wpisy = pliki.flatMap((f) => readFileSync(join(kat, f), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)));
  const ostatni = wpisy.reduce((m, w) => (w.d > m ? w.d : m), '');
  const poprz = new Map();
  const zmiany = [];
  for (const w of wpisy) {
    const k = `${w.nr}|${w.s}`;
    if (w.d === ostatni) zmiany.push({ ...w, przed: poprz.get(k) });
    else poprz.set(k, w);
  }
  return { ostatni, zmiany };
}

function stronaCeny() {
  const wer = weryfikacja._meta?.ostatni_przebieg ?? {};
  const dzisWer = Object.entries(weryfikacja.oferty ?? {}).filter(([, v]) => v.sprawdzono === (wer.czas ?? '').slice(0, 10));
  const nazwa = (nr) => KATALOG.get(String(nr))?.nazwa ?? sety[nr]?.nazwa ?? '';
  const KOL = { ok: 'ok', zmiana: 'uwaga', nieodczytane: 'stare' };
  const werWiersze = dzisWer.sort((a, b) => (a[1].status === 'ok') - (b[1].status === 'ok')).map(([k, v]) => {
    const [nr, s] = k.split('|');
    return `<tr><td>${link(`${SITE}/zestaw/${nr}/`, nr)} <span class="szary">${esc(nazwa(nr))}</span></td><td>${esc(sklep(s))}</td><td><span class="kropka ${KOL[v.status] ?? ''}"></span>${esc(v.status)}</td><td class="liczba">${v.status === 'zmiana' ? `${String(v.cena_danych).replace('.', ',')} → <strong>${String(v.cena_strony).replace('.', ',')}</strong>` : String(v.cena ?? '').replace('.', ',')}</td></tr>`;
  }).join('');
  const { ostatni, zmiany } = historiaCen();
  const spadki = zmiany.filter((z) => z.przed && z.c < z.przed.c).length, wzrosty = zmiany.filter((z) => z.przed && z.c > z.przed.c).length;
  const zmWiersze = zmiany.sort((a, b) => ((a.przed ? a.c / a.przed.c : 9) - (b.przed ? b.c / b.przed.c : 9))).slice(0, 150).map((z) => {
    const r = z.przed ? z.c / z.przed.c - 1 : null;
    return `<tr><td>${link(`${SITE}/zestaw/${z.nr}/`, z.nr)} <span class="szary">${esc(nazwa(z.nr))}</span></td><td>${esc(sklep(z.s))}</td><td class="liczba">${z.przed ? String(z.przed.c).replace('.', ',') : '<span class="szary">nowa</span>'}</td><td class="liczba"><strong>${String(z.c).replace('.', ',')}</strong></td><td class="liczba ${r !== null && r < 0 ? 'spadek' : r > 0 ? 'wzrost' : ''}">${r === null ? '' : `${r > 0 ? '+' : ''}${(r * 100).toFixed(0)}%`}</td></tr>`;
  }).join('');
  const sklepyTab = swiezoscSklepow().map((s) => `<tr><td>${esc(sklep(s.sklep))}</td><td class="liczba">${licz(s.ofert)}</td><td><span class="kropka ${klasaSwiezosci(dni(s.data), 1, 7)}"></span>${dataPL(s.data)} <span class="szary">(${ileTemu(s.data)})</span></td></tr>`).join('');
  return strona('ceny.html', 'Ceny i oferty', `
<div class="kafle">${kafel('Zestawów z ofertami', licz(new Set([...Object.keys(sety).filter((k) => sety[k].oferty?.length), ...Object.keys(feed).filter((k) => Object.keys(feed[k].oferty ?? {}).length)]).size), 'sety.json + migawka feedów')}${kafel(`Zmiany cen ${dataPL(ostatni)}`, licz(zmiany.length), `${spadki} spadków · ${wzrosty} wzrostów`)}${kafel('Weryfikacja ofert', wer.czas ? `${wer.sprawdzono} kart` : '—', wer.wyniki ? Object.entries(wer.wyniki).map(([k, v]) => `${k}: ${v}`).join(' · ') + ` · ${wer.kredyty} kredytów` : '', wer.czas?.startsWith(DZIS) ? 'ok' : 'uwaga')}</div>
<div class="dwie">
<section class="karta"><h2>Świeżość cen w sklepach</h2><div class="tabela"><table><thead><tr><th>Sklep</th><th class="liczba">Ofert</th><th>Ostatni odczyt</th></tr></thead><tbody>${sklepyTab}</tbody></table></div></section>
<section class="karta"><h2>Weryfikacja ofert do slajderów (${esc(wer.czas ?? '—')})</h2><p class="szary">Oferty Empiku, x-komu, Ceneo, LEGO.pl, Smyka, Lidla i MediaMarktu wchodzą do slajderów tylko potwierdzone na karcie produktu (Firecrawl). „Zmiana” = cena na stronie inna niż w danych — poprawiona automatycznie.</p>
<div class="tabela"><table><thead><tr><th>Zestaw</th><th>Sklep</th><th>Wynik</th><th class="liczba">Cena</th></tr></thead><tbody>${werWiersze}</tbody></table></div></section>
</div>
<section class="karta"><h2>Zmiany cen ${dataPL(ostatni)} — największe spadki na górze</h2><p class="szary">Z historii <code>src/data/historia-cen/</code>; pokazuję do 150 pozycji.</p>
<div class="tabela"><table><thead><tr><th>Zestaw</th><th>Sklep</th><th class="liczba">Było</th><th class="liczba">Jest</th><th class="liczba">Zmiana</th></tr></thead><tbody>${zmWiersze}</tbody></table></div></section>
`);
}

// ── budowa ────────────────────────────────────────────────────────────────
rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, 'dane'), { recursive: true });
mkdirSync(join(DIST, 'pliki'), { recursive: true });
cpSync(join(PANEL, 'static'), join(DIST, 'static'), { recursive: true });
for (const f of ['logo.svg', 'favicon.svg']) cpSync(join(REPO, 'public', f), join(DIST, 'static', f));
// Arkusze do pobrania z panelu (lista dla Piotra)
for (const f of readdirSync(join(REPO, 'materialy'))) if (/^lista-opisow-dla-piotra-.*\.xlsx$/.test(f)) cpSync(join(REPO, 'materialy', f), join(DIST, 'pliki', f));

const strony = { 'index.html': stronaDzis(), 'runnery.html': stronaRunnery(), 'opisy.html': stronaOpisy(), 'social.html': stronaSocial(), 'artykuly.html': stronaArtykuly(), 'statystyki.html': stronaStatystyki(), 'afiliacje.html': stronaAfiliacje(), 'ceny.html': stronaCeny(), 'wgraj.html': stronaWgraj(), 'dziennik.html': stronaDziennik(),
  '404.html': strona('', 'Nie ma takiej strony', '<p><a href="/">Wróć do zakładki Dziś</a></p>') };
for (const [p, html] of Object.entries(strony)) writeFileSync(join(DIST, p), html);
console.log(`panel: ${Object.keys(strony).length} stron, ${licz(KATALOG.size)} zestawów, ${WPISY.length} wpisów dziennika, ${GIT.length} commitów → panel/dist/`);
