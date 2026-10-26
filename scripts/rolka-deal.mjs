// Rolka „Deal alert" 9:16 z jednego zestawu — dane z repo, szablon HyperFrames, MP4.
//
// Po co: rolki dealowe na TikTok/Reels miały być robione ręcznie w 10 minut
// (skill klocki-social, format 1). Ten skrypt robi to w ~1 min bez ręcznego
// przepisywania cen: bierze liczby z `ceny_baza.json` i `oferty_feed.json`,
// wycina pudełko z tła, dokłada dźwięk i renderuje szablon
// `materialy/rolki/szablon-deal/` do MP4 (1080×1920, 30 kl/s).
//
// Użycie:
//   node scripts/rolka-deal.mjs 75405
//   node scripts/rolka-deal.mjs 75405 --hook1 "Krążownik Rebelii" --hook2 "na dnie cenowym"
//   node scripts/rolka-deal.mjs 75405 --sklepy 4 --bez-renderu
//   node scripts/rolka-deal.mjs 75405 --wstep dynamiczny   # wstęp z osobnymi wjazdami i punch-inem (domyślnie: spokojny)
//   node scripts/rolka-deal.mjs 75405 --muzyka "energetic electronic beat"   # katalog HeyGen (HEYGEN_API_KEY)
//   node scripts/rolka-deal.mjs 75405 --muzyka synt                           # wymuś syntezator
//   node scripts/rolka-deal.mjs 75446 --kod black-weeks2   # cena najtańszego sklepu działa tylko z kodem — mówi o tym pod ceną i w CTA
//
// Wyjście: materialy/rolki/wyjscie/<nr>/ (projekt HyperFrames, w .gitignore)
//          materialy/rolki/wyjscie/<nr>/renders/deal-<nr>.mp4
//
// Wymaga: Node 22, ffmpeg (render), sieć do pobrania zdjęcia i pierwszego
// uruchomienia HyperFrames (headless Chrome, onnxruntime do wycinania tła).

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, rmSync, statSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const SZABLON = join(REPO, 'materialy/rolki/szablon-deal');
const WYJSCIE = join(REPO, 'materialy/rolki/wyjscie');
const FONT = join(REPO, 'assets/fonts/Archivo-Variable.ttf');
const CZCIONKA_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/Archivo%5Bwdth%2Cwght%5D.ttf';

const NAZWY_SKLEPOW = {
  mediaexpert: 'Media Expert', allegro: 'Allegro', ceneo: 'Ceneo', empik: 'Empik', xkom: 'x-kom',
  smyk: 'Smyk', mediamarkt: 'MediaMarkt', planetaklockow: 'Planeta Klocków', lego: 'LEGO.com',
  lidl: 'Lidl', amazon: 'Amazon', taniaksiazka: 'TaniaKsiążka', krzychumantoys: 'Krzychu Man Toys',
};
const DNI_SWIEZOSCI = 7;
// porównywarki i agregatory nie są sklepami — nie pokazujemy ich na liście
const NIE_SKLEPY = new Set(['ceneo']);

// ---------- argumenty ----------
const args = process.argv.slice(2);
const nr = args.find((a) => /^\d{4,6}$/.test(a));
if (!nr) {
  console.error('Podaj numer zestawu, np. node scripts/rolka-deal.mjs 75405');
  process.exit(1);
}
const flaga = (n, domyslnie = null) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : domyslnie; };
const bezRenderu = args.includes('--bez-renderu');
const ileSklepow = Number(flaga('--sklepy', 5));
const muzyka = flaga('--muzyka', 'auto');
const hook1Flaga = flaga('--hook1');
const hook2Flaga = flaga('--hook2');
const wstep = flaga('--wstep', 'spokojny'); // spokojny | dynamiczny
const kod = flaga('--kod'); // kod rabatowy, bez którego cena najtańszego sklepu nie działa

// ---------- dane ----------
const czytaj = (p) => JSON.parse(readFileSync(join(REPO, 'src/data', p), 'utf8'));
const cenyBaza = czytaj('ceny_baza.json');
const feed = czytaj('oferty_feed.json');
const sety = czytaj('sety.json');
const obrazy = czytaj('obrazy.json');

const baza = cenyBaza[nr];
const set = sety[nr] || {};
const wFeedzie = feed.sety?.[nr];
if (!baza && !set.cena_katalogowa) {
  console.error(`Zestaw ${nr}: brak w ceny_baza.json i sety.json — nie ma ceny katalogowej, rolka nie powstanie.`);
  process.exit(1);
}
const katalog = Number(baza?.cena_katalogowa ?? set.cena_katalogowa);
const nazwa = baza?.nazwa ?? set.nazwa;
if (!nazwa || !(katalog > 0)) {
  console.error(`Zestaw ${nr}: brak nazwy albo ceny katalogowej.`);
  process.exit(1);
}

const dzis = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const pl = (s) => { const [y, m, d] = s.split('-'); return `${d}.${m}.${y}`; };
const granica = iso(new Date(dzis.getTime() - DNI_SWIEZOSCI * 86400e3));

// oferty: z feedu, tylko świeże, posortowane od najtańszej
let oferty = [];
if (wFeedzie?.oferty) {
  oferty = Object.entries(wFeedzie.oferty)
    .map(([sklep, cena]) => ({ klucz: sklep, sklep: NAZWY_SKLEPOW[sklep] ?? sklep, cena: Number(cena), data: wFeedzie.daty?.[sklep] ?? null }))
    .filter((o) => !NIE_SKLEPY.has(o.klucz) && o.cena > 0 && (!o.data || o.data >= granica))
    .sort((a, b) => a.cena - b.cena);
}
if (!oferty.length && Array.isArray(set.oferty)) {
  oferty = set.oferty
    .map((o) => ({ klucz: o.sklep, sklep: NAZWY_SKLEPOW[o.sklep] ?? o.sklep, cena: Number(o.cena), data: o.data ?? null }))
    .filter((o) => !NIE_SKLEPY.has(o.klucz) && o.cena > 0 && (!o.data || o.data >= granica))
    .sort((a, b) => a.cena - b.cena);
}
if (!oferty.length) {
  console.error(`Zestaw ${nr}: żadna oferta nie jest świeższa niż ${DNI_SWIEZOSCI} dni — nie robimy rolki ze starą ceną.`);
  process.exit(1);
}
oferty = oferty.slice(0, Math.max(2, ileSklepow));
const cena = oferty[0].cena;
if (!(cena < katalog)) {
  console.error(`Zestaw ${nr}: cena dziś ${cena} nie jest niższa od katalogowej ${katalog} — to nie jest deal.`);
  process.exit(1);
}
const pct = Math.round((1 - cena / katalog) * 100);
const dnoCenowe = baza?.najnizsza_cena != null && cena <= Number(baza.najnizsza_cena) + 0.005;
const stanNa = oferty.reduce((m, o) => (o.data && o.data > m ? o.data : m), oferty[0].data ?? iso(dzis));

// hook: teza z liczbą, nie zapowiedź tematu
const skroc = (s, n) => {
  if (s.length <= n) return s;
  const slowa = s.split(' ');
  let out = '';
  for (const w of slowa) { if ((out + ' ' + w).trim().length > n) break; out = (out + ' ' + w).trim(); }
  return out || s.slice(0, n);
};
const hook1 = hook1Flaga ?? skroc(nazwa, 22);
const hook2 = hook2Flaga ?? (dnoCenowe ? 'na dnie cenowym' : `taniej o ${Math.round(katalog - cena)} zł`);

const DEAL = {
  nr, nazwa, seria: set.seria ?? 'LEGO', elementy: set.elementy ?? null, wiek: set.wiek ?? null,
  katalog, cena, dnoCenowe, dnoData: baza?.najnizsza_data ? pl(baza.najnizsza_data) : null,
  stanNa: pl(stanNa), hook1, hook2, wstep,
  ...(kod ? { kod, kodSklep: oferty[0].sklep } : {}),
  oferty: oferty.map((o) => ({ sklep: o.sklep, cena: o.cena })),
  wyciete: false,
};

console.log(`\n${nr} ${nazwa} — katalog ${katalog} zł, dziś ${cena} zł (−${pct}%)${dnoCenowe ? ', dno cenowe' : ''}`);
console.log(`sklepy: ${oferty.map((o) => `${o.sklep} ${o.cena}`).join(' · ')}`);
console.log(`hook: „${hook1} / ${hook2}"`);

// ---------- projekt ----------
const projekt = join(WYJSCIE, nr);
if (existsSync(projekt)) rmSync(projekt, { recursive: true });
mkdirSync(projekt, { recursive: true });
cpSync(SZABLON, projekt, { recursive: true });
mkdirSync(join(projekt, 'renders'), { recursive: true });

// czcionka: z repo, a gdyby jej nie było — z Google Fonts
if (existsSync(FONT)) cpSync(FONT, join(projekt, 'assets/Archivo-Variable.ttf'));
else {
  console.log('brak assets/fonts/Archivo-Variable.ttf — pobieram z Google Fonts');
  const r = await fetch(CZCIONKA_URL);
  if (!r.ok) throw new Error(`czcionka: HTTP ${r.status}`);
  writeFileSync(join(projekt, 'assets/Archivo-Variable.ttf'), Buffer.from(await r.arrayBuffer()));
}

// ---------- zdjęcie ----------
const zdjecieUrl = wFeedzie?.zdjecie ?? obrazy[nr];
if (!zdjecieUrl) {
  console.error(`Zestaw ${nr}: brak zdjęcia w feedzie i obrazy.json.`);
  process.exit(1);
}
const oryginal = join(projekt, 'assets/zestaw-oryginal.jpg');
{
  const r = await fetch(zdjecieUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (tylkoklocki.pl rolka)' } });
  if (!r.ok) throw new Error(`zdjęcie: HTTP ${r.status} ${zdjecieUrl}`);
  writeFileSync(oryginal, Buffer.from(await r.arrayBuffer()));
}
const wyciete = join(projekt, 'assets/zestaw.png');
// Rendery pudełek ze sklepów stoją na czystej bieli — wycinamy biel od krawędzi
// (wypełnienie), bo model matujący (hyperframes remove-background) uczony na
// ludziach bierze ciemny karton za tło i zostawia sam statek. Model dostaje
// tylko zdjęcia, których krawędzie nie są białe.
const metoda = await wytnijTlo(oryginal, wyciete);
if (metoda) {
  DEAL.wyciete = true;
  console.log(`tło wycięte: ${metoda}`);
} else {
  // bez wycięcia: szablon użyje oryginału z mix-blend-mode: multiply
  cpSync(oryginal, wyciete);
  console.log('UWAGA: wycięcie tła nie powiodło się — zostaje oryginał na białym tle');
}

// ---------- muzyka ----------
const bed = join(projekt, 'audio/bed.wav');
let zrodloMuzyki = 'syntezator';
if (muzyka !== 'synt') {
  const klucz = process.env.HEYGEN_API_KEY;
  if (klucz) {
    try {
      const zapytanie = muzyka === 'auto' ? 'upbeat energetic electronic pop, punchy, 120 bpm, positive' : muzyka;
      const params = new URLSearchParams({ query: zapytanie, type: 'music', limit: '5' });
      const r = await fetch(`https://api.heygen.com/v3/audio/sounds?${params}`, { headers: { 'X-Api-Key': klucz, 'X-HeyGen-Client-Source': 'media-use' } });
      if (!r.ok) throw new Error(`HeyGen HTTP ${r.status}`);
      const payload = await r.json();
      const lista = Array.isArray(payload?.data) ? payload.data : Object.values(payload?.data ?? {});
      const top = lista[0];
      if (!top?.audio_url) throw new Error('katalog HeyGen nie zwrócił utworu');
      const mp3 = join(projekt, 'audio/bed-heygen.mp3');
      const d = await fetch(top.audio_url);
      if (!d.ok) throw new Error(`pobranie utworu: HTTP ${d.status}`);
      writeFileSync(mp3, Buffer.from(await d.arrayBuffer()));
      // przytnij do 12 s z krótkim wejściem i wybrzmieniem, zapisz jako bed.wav
      execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', mp3, '-t', '12', '-af', 'afade=t=in:st=0:d=0.3,afade=t=out:st=10.8:d=1.2,loudnorm=I=-16:TP=-1.5', '-ar', '48000', bed]);
      zrodloMuzyki = `HeyGen: ${top.title ?? top.name ?? top.id ?? 'utwór z katalogu'}`;
    } catch (e) {
      console.log(`muzyka z HeyGen nie wyszła (${e.message}) — syntezator`);
    }
  } else if (muzyka !== 'auto') {
    console.log('brak HEYGEN_API_KEY w środowisku — --muzyka wymaga klucza; biorę syntezator');
  }
}
if (!existsSync(bed)) writeFileSync(bed, syntezujPodklad(12));
console.log(`podkład: ${zrodloMuzyki}`);

// ---------- deal.js ----------
writeFileSync(join(projekt, 'deal.js'), `// generowane przez scripts/rolka-deal.mjs — nie edytuj ręcznie\nwindow.DEAL = ${JSON.stringify(DEAL, null, 2)};\n`);

// ---------- kontrola i render ----------
const hf = (...a) => spawnSync('npx', ['--yes', 'hyperframes@0.8.157', ...a], { cwd: projekt, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const check = hf('check', '.');
const bledy = (check.stdout + check.stderr).split('\n').filter((l) => /✗|error\(s\)/.test(l) && !/0 error\(s\)/.test(l));
if (check.status !== 0) {
  console.error('npx hyperframes check nie przeszedł:\n' + bledy.join('\n'));
  process.exit(1);
}
console.log('check: OK');

if (bezRenderu) {
  console.log(`\nProjekt gotowy: ${projekt}\nPodgląd: cd ${projekt.replace(REPO + '/', '')} && npm run dev`);
  process.exit(0);
}
const out = join(projekt, 'renders', `deal-${nr}.mp4`);
const render = hf('render', '.', '-q', 'high', '-o', out);
if (render.status !== 0 || !existsSync(out)) {
  console.error('render nie powiódł się:\n' + (render.stderr || render.stdout).split('\n').slice(-15).join('\n'));
  process.exit(1);
}
const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=width,height', '-of', 'csv=p=0', out], { encoding: 'utf8' }).trim().replace(/\n/g, ' ');
console.log(`\nMP4: ${out.replace(REPO + '/', '')} (${Math.round(statSync(out).size / 1024)} KB, ${probe})`);

// ---------- wycinanie tła ----------
// Zwraca nazwę użytej metody albo null. Biel liczona jako min(r,g,b) >= PROG;
// wypełnienie rusza z każdego białego piksela na obwodzie, więc białe pola
// NA pudełku (napisy, logo LEGO) zostają. Piksele graniczne dostają półprzezroczystość.
async function wytnijTlo(wejscie, wyjscie) {
  // dekodowanie i kodowanie przez ffmpeg (jest wymagany do renderu) — bez sharp,
  // żeby skrypt działał także w świeżym klonie bez `npm install`
  let W, H, data;
  try {
    const wh = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', wejscie], { encoding: 'utf8' }).trim().split(',');
    W = Number(wh[0]); H = Number(wh[1]);
    data = execFileSync('ffmpeg', ['-v', 'error', '-i', wejscie, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: 256 * 1024 * 1024 });
    if (data.length !== W * H * 4) throw new Error(`rozmiar bufora ${data.length} ≠ ${W}×${H}×4`);
  } catch (e) {
    console.log(`dekodowanie zdjęcia przez ffmpeg nie wyszło (${e.message})`);
    W = 0;
  }
  if (W > 0) {
    const PROG = 236, MIEKKI = 200;
    const biel = (i) => Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]) >= PROG;
    // czy obwód jest biały? (próbka co 8 px) — jeśli nie, to nie jest render na bieli
    let probki = 0, biale = 0;
    for (let x = 0; x < W; x += 8) for (const y of [0, H - 1]) { probki++; if (biel(y * W + x)) biale++; }
    for (let y = 0; y < H; y += 8) for (const x of [0, W - 1]) { probki++; if (biel(y * W + x)) biale++; }
    if (biale / probki >= 0.9) {
      const odw = new Uint8Array(W * H);
      const stos = [];
      for (let x = 0; x < W; x++) { stos.push(x, (H - 1) * W + x); }
      for (let y = 0; y < H; y++) { stos.push(y * W, y * W + W - 1); }
      while (stos.length) {
        const i = stos.pop();
        if (odw[i] || !biel(i)) continue;
        odw[i] = 1;
        const x = i % W, y = (i - x) / W;
        if (x > 0) stos.push(i - 1);
        if (x < W - 1) stos.push(i + 1);
        if (y > 0) stos.push(i - W);
        if (y < H - 1) stos.push(i + W);
      }
      for (let i = 0; i < W * H; i++) {
        if (odw[i]) { data[i * 4 + 3] = 0; continue; }
        const x = i % W, y = (i - x) / W;
        const przyTle = (x > 0 && odw[i - 1]) || (x < W - 1 && odw[i + 1]) || (y > 0 && odw[i - W]) || (y < H - 1 && odw[i + W]);
        if (przyTle) {
          const m = Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
          if (m >= MIEKKI) data[i * 4 + 3] = Math.round(255 * (1 - (m - MIEKKI) / (PROG - MIEKKI)) * 0.8);
        }
      }
      execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-i', '-', '-frames:v', '1', wyjscie], { input: data, maxBuffer: 256 * 1024 * 1024 });
      return 'biel od krawędzi (ffmpeg)';
    }
  }
  const rb = spawnSync('npx', ['--yes', 'hyperframes@0.8.157', 'remove-background', wejscie, '-o', wyjscie, '--json'], { encoding: 'utf8' });
  if (rb.status === 0 && existsSync(wyjscie) && statSync(wyjscie).size > 1000) return 'model matujący (hyperframes remove-background)';
  if (rb.stderr) console.log(rb.stderr.split('\n').filter((l) => /fail|error/i.test(l)).slice(-3).join('\n'));
  return null;
}

// ---------- syntezator podkładu: 120 BPM, a-moll, bez zależności ----------
// Deterministyczny: ten sam deal → ten sam dźwięk. Kick na każdą ćwierćnutę,
// hi-hat na ósemki, bas w pochodzie i-VI-III-VII, pad akordowy, uderzenie na końcu.
function syntezujPodklad(sekundy) {
  const sr = 48000, bpm = 120, beat = 60 / bpm;
  const n = Math.round(sr * sekundy);
  const L = new Float32Array(n), R = new Float32Array(n);
  const nuta = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // takty 4/4; akordy co takt: Am, F, C, G (i-VI-III-VII w a-moll)
  const akordy = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
  const basy = [45, 41, 36, 43];
  const hash = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const takt = Math.floor(t / (beat * 4)) % 4;
    const wTakcie = (t % (beat * 4)) / beat;      // 0..4
    const wBeat = t % beat;                         // 0..beat
    const wOsemka = t % (beat / 2);
    // kick
    const kickEnv = Math.exp(-wBeat * 18);
    const kick = Math.sin(2 * Math.PI * (55 + 80 * Math.exp(-wBeat * 40)) * wBeat) * kickEnv * 0.9;
    // hi-hat (szum z krótką obwiednią), akcent na „i"
    const hatEnv = Math.exp(-wOsemka * 70) * (Math.floor(wTakcie * 2) % 2 ? 0.35 : 0.2);
    const hat = (hash(i) * 2 - 1) * hatEnv;
    // snare na 2 i 4
    const naSnare = (Math.floor(wTakcie) === 1 || Math.floor(wTakcie) === 3) ? wBeat : 1;
    const snare = (hash(i * 7) * 2 - 1) * Math.exp(-naSnare * 25) * 0.5 + Math.sin(2 * Math.PI * 190 * naSnare) * Math.exp(-naSnare * 35) * 0.3;
    // bas: ósemki, sidechain pod kick
    const basF = nuta(basy[takt]);
    const basEnv = Math.exp(-wOsemka * 6) * (1 - 0.6 * kickEnv);
    const bas = (Math.sin(2 * Math.PI * basF * t) * 0.7 + Math.sign(Math.sin(2 * Math.PI * basF * t)) * 0.3) * basEnv * 0.45;
    // pad: trzy nuty akordu, lekkie detune, sidechain
    let pad = 0;
    for (const m of akordy[takt]) {
      const f = nuta(m);
      pad += Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * f * 1.003 * t);
    }
    pad *= 0.06 * (1 - 0.5 * kickEnv);
    // arpeggio szesnastkowe w górnym rejestrze od 4. sekundy
    let arp = 0;
    if (t > beat * 8) {
      const idx = Math.floor((t % (beat * 4)) / (beat / 4)) % 3;
      const f = nuta(akordy[takt][idx] + 12);
      arp = Math.sin(2 * Math.PI * f * t) * Math.exp(-(t % (beat / 4)) * 14) * 0.18;
    }
    // uderzenie końcowe i wyciszenie
    const koniec = Math.max(0, 1 - Math.max(0, t - (sekundy - 1.2)) / 1.2);
    const wejscie = Math.min(1, t / 0.25);
    let s = (kick + hat + snare + bas + pad + arp) * koniec * wejscie * 0.6;
    s = Math.tanh(s * 1.4) / 1.4;                   // miękki limiter
    const szer = (arp + pad) * 0.3;
    L[i] = s + szer; R[i] = s - szer;
  }
  // WAV 16-bit stereo
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4);
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))), 46 + i * 4);
  }
  return buf;
}
