// Artykuły przypisane do konkretnych zestawów – jedno źródło dla huba
// /zestaw/<nr>/ i dla list zestawów (tabele serii, wycofania, strona główna).
//
// Przypisanie jest jawne: artykuł deklaruje we frontmatterze
//   zestawy: ["42215"]
// Nie zgadujemy numeru z tytułu ani ze slugu – tekst o fali premierowej wymienia
// kilkanaście numerów i wcale nie jest recenzją żadnego z nich, a hub ma
// prowadzić wyłącznie tam, gdzie czytelnik znajdzie ten konkretny zestaw
// omówiony od środka.
//
// Deali (dział /deale/) świadomie tu nie ma: post dealowy opisuje cenę z
// konkretnego dnia i po kilku tygodniach linkowanie do niego z huba wprowadza
// czytelnika w błąd. Hub pokazuje aktualne ceny sam.

const moduly = {
  ...import.meta.glob('../pages/artykuly/*.md', { eager: true }),
  ...import.meta.glob('../pages/*.md', { eager: true }),
};

// Plakietka mówi, CZYM jest tekst – kategorie są w liczbie mnogiej
// (src/data/kategorie_artykulow.json), a przy jednym zestawie brzmią naturalnie
// w pojedynczej.
const ETYKIETA = {
  Recenzje: 'Recenzja',
  Premiery: 'Premiera',
  Porównania: 'Porównanie',
  Rankingi: 'Ranking',
  Poradniki: 'Poradnik',
  Kalendarze: 'Kalendarz',
  Historyczne: 'Historia',
};

// Recenzja opisuje zestaw od środka, więc gdy tekstów jest kilka, ona wygrywa;
// dalej decyduje data (najnowszy pierwszy).
const WAGA = { Recenzje: 0, Porównania: 1, Premiery: 2 };
const waga = (a) => WAGA[a.kategoria] ?? 3;

function zbuduj() {
  const mapa = new Map();
  for (const modul of Object.values(moduly)) {
    const f = modul.frontmatter ?? {};
    if (!Array.isArray(f.zestawy) || !f.zestawy.length) continue;
    const wpis = {
      url: modul.url + '/',
      tytul: f.title,
      data: f.data ?? '',
      kategoria: f.kategoria ?? null,
      etykieta: ETYKIETA[f.kategoria] ?? 'Artykuł',
    };
    for (const nr of f.zestawy) {
      const klucz = String(nr);
      if (!mapa.has(klucz)) mapa.set(klucz, []);
      mapa.get(klucz).push(wpis);
    }
  }
  for (const lista of mapa.values()) {
    lista.sort((a, b) => waga(a) - waga(b) || (a.data < b.data ? 1 : -1));
  }
  return mapa;
}

const indeks = zbuduj();

/** Wszystkie nasze teksty o tym zestawie, najważniejszy pierwszy. */
export const artykulyZestawu = (nr) => indeks.get(String(nr)) ?? [];

/** Jeden tekst do pokazania przy zestawie albo null. */
export const artykulZestawu = (nr) => artykulyZestawu(nr)[0] ?? null;

/** Czy mamy o tym zestawie osobny tekst – do plakietek na listach. */
export const maArtykul = (nr) => indeks.has(String(nr));
