// Zdjęcia ZŁOŻONYCH modeli (nie pudełek) do kart „Nasze propozycje" na stronach
// serii (Marek 20.11.2026). Główne zdjęcie zestawu (obrazy.json) pochodzi zwykle
// z feedu sklepu i pokazuje pudełko; Rebrickable ma dla większości zestawów
// oficjalne zdjęcie modelu – to samo źródło i licencja co zapasowe zdjęcia
// w zdjecia.json. Skrypt sprawdza (HEAD), czy zdjęcie istnieje, i dopisuje je
// do src/data/zdjecia_modeli.json (append-only; istniejących wpisów nie rusza).
//
// Kto uruchamia: człowiek na żądanie (albo Łowca po dopisaniu zestawów), np.
//   node scripts/zdjecia-modeli.mjs            # zestawy z sety.json bez wpisu
//   node scripts/zdjecia-modeli.mjs 21066 21034 # wskazane numery
// Dalej: scripts/generuj-obrazy.mjs (prebuild) dokłada klucz `<nr>M` do obrazy.json,
// worker serwuje /img/<nr>M.jpg, a src/lib/media.js → zdjecieModelu(nr).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const sciezka = new URL('../src/data/zdjecia_modeli.json', import.meta.url);
const sety = JSON.parse(readFileSync(new URL('../src/data/sety.json', import.meta.url)));
const mapa = existsSync(sciezka)
  ? JSON.parse(readFileSync(sciezka))
  : { _meta: { opis: 'Zdjęcia złożonych modeli (nie pudełek): numer setu -> { url, zrodlo, dodano }. Worker serwuje je jako /img/<numer>M.jpg. Dopisuje scripts/zdjecia-modeli.mjs; append-only.', zrodlo: 'Rebrickable – oficjalne zdjęcia produktowe LEGO (cdn.rebrickable.com)' } };

const wskazane = process.argv.slice(2).filter((a) => /^\d{4,7}$/.test(a));
const kandydaci = (wskazane.length ? wskazane : Object.keys(sety)).filter((nr) => /^\d{4,7}$/.test(nr) && !mapa[nr]);

const jest = async (url) => {
  for (let proba = 0; proba < 2; proba++) {
    try {
      const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
      if (r.status === 404) return false;
      if (r.ok && /^image\//.test(r.headers.get('content-type') ?? '')) return true;
    } catch {}
  }
  return null; // nie wiadomo – nie zapisujemy ani tak, ani nie
};

let dodane = 0, brak = 0, nieznane = 0;
const dzis = new Date().toISOString().slice(0, 10);
const kolejka = [...kandydaci];
await Promise.all(Array.from({ length: 6 }, async () => {
  for (let nr = kolejka.shift(); nr; nr = kolejka.shift()) {
    const url = `https://cdn.rebrickable.com/media/sets/${nr}-1.jpg`;
    const w = await jest(url);
    if (w === true) { mapa[nr] = { url, zrodlo: 'rebrickable', dodano: dzis }; dodane++; }
    else if (w === false) brak++;
    else nieznane++;
  }
}));

if (dodane) {
  const posortowane = { _meta: mapa._meta };
  for (const nr of Object.keys(mapa).filter((k) => k !== '_meta').sort((a, b) => Number(a) - Number(b))) posortowane[nr] = mapa[nr];
  writeFileSync(sciezka, JSON.stringify(posortowane, null, 1) + '\n');
}
console.log(`zdjęcia modeli: sprawdzono ${kandydaci.length}, dopisano ${dodane}, brak ${brak}, nie udało się sprawdzić ${nieznane}; w pliku ${Object.keys(mapa).length - 1}`);
