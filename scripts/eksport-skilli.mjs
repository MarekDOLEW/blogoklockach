// Budowa paczek skilli z dokumentów w repo.
//
// Po co: standard i metodologia istniały w dwóch kopiach — w repo i w skillu na
// claude.ai — i rozjechały się w obie strony (repo miało §18.1/§18.2, skill miał
// nowsze wersje od Piotra). Ten skrypt likwiduje przyczynę: **źródłem jest repo**,
// paczka skilla jest z niego generowana i nigdy nie edytowana ręcznie.
//
// Powstają dwa skille, podzielone działem serwisu, nie długością tekstu:
//
//   lego-standard-redakcyjny  -> wszystko z /artykuly/ (siedem kategorii).
//                                Teksty od Piotra, pełny research.
//   lego-standard-sprzedazowy -> /prezentowniki/ i krótkie formy dealowe.
//                                Teksty Marka, nastawione na konwersję.
//
// Użycie:
//   node scripts/eksport-skilli.mjs            # buduje do skille/
//   node scripts/eksport-skilli.mjs --sprawdz  # tylko kontrola spójności
//
// Po zbudowaniu paczki wgrywa się na claude.ai (Settings -> Skills). Stamtąd
// synchronizują się same do Coworku i do Claude Code (~/.claude/skills/synced/).

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';

const repo = (p) => new URL(`../${p}`, import.meta.url);
const czytaj = (p) => readFileSync(repo(p), 'utf8');
const sprawdzTylko = process.argv.includes('--sprawdz');

const kategorie = JSON.parse(czytaj('src/data/kategorie_artykulow.json')).kategorie;
const wersja = (tekst) => /^Wersja\s+([\d.]+)/m.exec(tekst)?.[1] ?? '?';

const standard = czytaj('redakcja/standard-artykulow-biezacych.md');
const metodologia = czytaj('redakcja/metodologia-researchu-lego.md');
const ustalenia = czytaj('redakcja/ustalenia-projektowe.md');
const sklepy = czytaj('redakcja/sklepy-i-afiliacja.md');

// ── kontrola spójności: czy każda kategoria ma wzorzec ──
const wzorce = {
  Premiery: null,
  Recenzje: 'redakcja/wzorce/recenzja-zestawu.md',
  Rankingi: null,
  Porównania: null,
  Poradniki: null,
  Kalendarze: null,
  Historyczne: null,
};
const braki = kategorie.filter((k) => !wzorce[k.nazwa]).map((k) => k.nazwa);

console.log(`Standard: wersja ${wersja(standard)} · Metodologia: wersja ${wersja(metodologia)}`);
console.log(`Kategorie artykułów: ${kategorie.length}`);
if (braki.length) console.log(`Kategorie bez wzorca (do dopisania): ${braki.join(', ')}`);
if (sprawdzTylko) process.exit(0);

// ── wspólny nagłówek obu skilli ──
const skadTo = (rola) => `
> **Ten plik jest generowany.** Źródłem są dokumenty w repo \`blogoklockach\`:
> \`redakcja/\`. Nie edytuj skilla na claude.ai — poprawka przepadnie przy
> następnym eksporcie. Zmieniasz dokument w repo i uruchamiasz
> \`node scripts/eksport-skilli.mjs\`.
>
> Rola tego skilla: ${rola}
`;

const listaKategorii = kategorie.map((k) => `| ${k.nazwa} | ${k.opis} |`).join('\n');

// ── skill 1: redakcyjny (dział /artykuly/) ──
const redakcyjny = `---
name: lego-standard-redakcyjny
description: >-
  Obowiązujący standard redakcyjny i metodologia researchu dla WSZYSTKICH tekstów
  z działu Artykuły serwisu tylkoklocki.pl — siedem kategorii: Premiery, Recenzje,
  Rankingi, Porównania, Poradniki, Kalendarze, Historyczne. Używaj przy: recenzja
  zestawu, artykuł o nowej fali premierowej, ranking, porównanie zestawów, poradnik
  zakupowy, kalendarz promocji, tekst historyczny o wycofanej serii. Triggeruj przy
  frazach "napisz artykuł o zestawie", "recenzja seta", "ranking zestawów",
  "porównaj zestawy", "poradnik zakupowy LEGO", "artykuł o nowej fali",
  "tekst na bloga klockowego" — nawet bez słowa "standard". NIE używaj do
  prezentowników ani krótkich form dealowych — tam obowiązuje skill
  lego-standard-sprzedazowy. Skill narzuca kolejność: research → karta researchu →
  bramka rozbieżności → dopiero tekst, oraz reguły stylu, cen, afiliacji
  i hierarchii źródeł.
---

# Standard redakcyjny — dział Artykuły
${skadTo('teksty do `/artykuly/`, pisane w oparciu o pełny research.')}
## Zanim zaczniesz pisać

1. **Ustal kategorię.** To ona decyduje o strukturze tekstu i o tym, gdzie tekst
   trafi w serwisie. Kategoria musi być jedną z siedmiu:

| Kategoria | Zakres |
|---|---|
${listaKategorii}

   Jeśli tekst nie mieści się w żadnej — to znak, że albo jest prezentownikiem
   (patrz skill \`lego-standard-sprzedazowy\`), albo brief wymaga doprecyzowania.
   **Nie tworzymy kategorii pod pojedynczy artykuł.**

2. **Nazwij tekst od kategorii.** „Recenzja LEGO 71858…", „Ranking zestawów
   Technic do 300 zł", „Porównanie 60506 i 60511". Po nazwie ma być widać, gdzie
   tekst trafia.

3. **Research przed tekstem.** Kolejność jest nienaruszalna: research → karta
   researchu → bramka rozbieżności → dopiero pisanie. Szczegóły w
   \`references/metodologia-researchu.md\`.

4. **Przeczytaj ustalenia projektowe** (\`references/ustalenia-projektowe.md\`)
   — tam jest to, czego nie ma w standardzie: kto wstawia ceny i linki, skąd
   bierze się cena katalogowa, czego serwer nie potrafi sprawdzić.

## Reguła, o którą najłatwiej się potknąć

**Nie wpisujesz do tekstu żadnej ceny sklepowej.** Podajesz wyłącznie ceny będące
oceną: cenę katalogową, dobrą cenę, bardzo dobrą cenę i próg zakupu. Kwoty
sklepowe wstawia redakcja techniczna przy publikacji, znacznikiem, który renderuje
się przy każdym budowaniu serwisu. W miejscu linków zostawiasz
\`[wstaw link afiliacyjny]\`.

Powód jest prosty: artykuł zostaje na stronie latami, a cena zmienia się
codziennie. Ręcznie wpisana kwota z datą starzeje się w tydzień.

## Dokumenty

| Plik | Co zawiera |
|---|---|
| \`references/standard-artykulow.md\` | pełny standard redakcyjny (wersja ${wersja(standard)}) |
| \`references/metodologia-researchu.md\` | hierarchia źródeł, mapa recenzji, karta researchu (wersja ${wersja(metodologia)}) |
| \`references/ustalenia-projektowe.md\` | warstwa tylkoklocki.pl — ceny, linki, kategorie, ograniczenia |
| \`references/sklepy-i-afiliacja.md\` | rejestr sklepów, wybór sklepów publikacyjnych |
| \`references/wzorzec-recenzja.md\` | gotowy szkielet recenzji zestawu |

Czytaj je na żądanie — nie wciągaj wszystkich naraz. Do recenzji potrzebujesz
standardu, metodologii i wzorca recenzji; do rankingu — standardu §23 i §26.
`;

// ── skill 2: sprzedażowy (dział /prezentowniki/ + krótkie formy) ──
const sprzedazowy = `---
name: lego-standard-sprzedazowy
description: >-
  Standard treści sprzedażowych serwisu tylkoklocki.pl — dział Prezentowniki oraz
  krótkie formy dealowe. Używaj przy: prezentownik serii LEGO, prezentownik
  według wieku lub budżetu, "co kupić na prezent", post dealowy, alert cenowy,
  opis promocji, "okazja dnia", karta zestawu, snippet na newsletter lub social.
  Triggeruj przy frazach "zrób prezentownik", "co kupić dziecku", "prezent
  z LEGO", "napisz o tej promocji", "spadła cena", "zrób deala na ten set".
  NIE używaj do recenzji, rankingu, porównania, poradnika ani artykułu o nowej
  fali — tam obowiązuje skill lego-standard-redakcyjny. Skill pisze pod konwersję
  afiliacyjną, w dwóch tonacjach: dla rodziców i dla AFOL.
---

# Standard sprzedażowy — Prezentowniki i krótkie formy
${skadTo('teksty do `/prezentowniki/` oraz krótkie formy dealowe, pisane pod decyzję zakupową.')}
## Granica wobec standardu redakcyjnego

Granicę wyznacza **dział serwisu, nie długość tekstu**:

| Tekst trafia do | Standard |
|---|---|
| \`/artykuly/\` — siedem kategorii | \`lego-standard-redakcyjny\` |
| \`/prezentowniki/\` | **ten skill** |
| krótka forma dealowa (post, alert, karta zestawu) | **ten skill** |

Prezentownik z ośmioma zestawami nadal jest prezentownikiem — liczba pozycji
niczego tu nie rozstrzyga.

## Prezentownik serii — reguły

- **Osiem zestawów.** Galeria układa się po cztery w rzędzie, więc osiem daje dwa
  równe rzędy. Sześć zostawia dwie sieroty w drugim rzędzie.
- Osiem pozycji ma pokryć **osiem sytuacji zakupowych**, nie osiem ładnych
  pudełek — drabina progów jest we wzorcu.
- Jeśli seria nie ma sensownej pozycji w którymś progu, **przesuwamy próg**.
  Lepiej siedem dobrych niż osiem z zapchajdziurą.
- Terminy wycofań traktujemy jak cenę: gdy zestaw znika w tym roku, mówimy to
  wprost. Przy prezencie termin bywa ważniejszy od kwoty.
- Każda sekcja odpowiada na trzy pytania: dla kogo, co po zbudowaniu, przy jakiej
  cenie brać.

## Czego nie robimy

- **Nie wpisujemy cen sklepowych do treści** — tak samo jak w artykułach.
  Podajemy RRP, dobrą cenę i próg zakupu; kwoty wstawia redakcja techniczna.
- Nie tworzymy sztucznej presji zakupowej ani pozornej pilności.
- Nie przedstawiamy typowej ceny rynkowej jako wyjątkowej promocji.
- Nie dzielimy prezentów według płci dziecka — kryterium jest sposób zabawy
  (budowanie, przebudowa, mechanika, role-play, ekspozycja, licencja).
- Nie ukrywamy wad, żeby podnieść konwersję. Wiarygodność jest warta więcej niż
  pojedyncze kliknięcie.

## Dokumenty

| Plik | Co zawiera |
|---|---|
| \`references/wzorzec-prezentownik.md\` | szkielet prezentownika serii, drabina ośmiu progów |
| \`references/ustalenia-projektowe.md\` | ceny, linki, ograniczenia infrastruktury |
| \`references/sklepy-i-afiliacja.md\` | wybór sklepów publikacyjnych, bezstronność afiliacji |
| \`references/standard-artykulow.md\` | standard redakcyjny — do zajrzenia przy ocenie zestawu |
`;

// ── zapis paczek ──
const paczki = [
  {
    nazwa: 'lego-standard-redakcyjny',
    skill: redakcyjny,
    pliki: {
      'standard-artykulow.md': standard,
      'metodologia-researchu.md': metodologia,
      'ustalenia-projektowe.md': ustalenia,
      'sklepy-i-afiliacja.md': sklepy,
      'wzorzec-recenzja.md': czytaj('redakcja/wzorce/recenzja-zestawu.md'),
    },
  },
  {
    nazwa: 'lego-standard-sprzedazowy',
    skill: sprzedazowy,
    pliki: {
      'wzorzec-prezentownik.md': czytaj('redakcja/wzorce/prezentownik-serii.md'),
      'ustalenia-projektowe.md': ustalenia,
      'sklepy-i-afiliacja.md': sklepy,
      'standard-artykulow.md': standard,
    },
  },
];

if (existsSync(repo('skille'))) rmSync(repo('skille'), { recursive: true });
for (const p of paczki) {
  mkdirSync(new URL(`../skille/${p.nazwa}/references`, import.meta.url), { recursive: true });
  writeFileSync(new URL(`../skille/${p.nazwa}/SKILL.md`, import.meta.url), p.skill);
  for (const [plik, tresc] of Object.entries(p.pliki)) {
    writeFileSync(new URL(`../skille/${p.nazwa}/references/${plik}`, import.meta.url), tresc);
  }
  const kb = Math.round(Object.values(p.pliki).reduce((s, t) => s + t.length, p.skill.length) / 1024);
  console.log(`  ${p.nazwa.padEnd(26)} SKILL.md + ${Object.keys(p.pliki).length} plików · ${kb} KB`);
}
console.log('\nPaczki w skille/. Wgraj je na claude.ai -> Settings -> Skills.');
