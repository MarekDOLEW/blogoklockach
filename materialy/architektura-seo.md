# Architektura SEO tylkoklocki.pl — model pillar–cluster

Stan: 2026-08-20. Obowiązuje wszystkich agentów tworzących treści (redaktor, scout, łowca, radar).

## Skąd ten model

fanklockow.pl buduje widoczność architekturą: **hub evergreen → artykuły per seria** (np. hub „Zapowiedzi LEGO 2026" linkujący do artykułów o każdej serii) + interaktywny kalendarz promocji. Kopiujemy ten wzorzec i poprawiamy go zgodnie z aktualnym konsensusem specjalistów (2026): Google ocenia **pokrycie tematu siecią powiązanych stron**, nie pojedynczymi długimi tekstami — 20 spiętych linkami artykułów wygrywa z jednym „kompletnym poradnikiem". Standardem jest topologia pillar–cluster z linkami **dwukierunkowymi** i kluczowymi stronami maks. 3 kliknięcia od strony głównej.

## Nasze filary (pillar pages)

| Filar | URL | Klastry (spokes) | Status |
|---|---|---|---|
| Kalendarz promocji | `/kalendarz-promocji-lego/` | artykuły dealowe, strony zestawów GWP, wycofania | ✅ od 2026-08-17 |
| Zapowiedzi 2027 | `/zapowiedzi-lego-2027/` | strony zestawów kolekcjonerskich, wycofania, nowości | ✅ od 2026-08-20 |
| Wycofania 2026 | `/wycofania/` | strony zestawów EOL, artykuły „ostatnia szansa" | ✅ istnieje |
| Serie | `/serie/[seria]/` | strony zestawów serii, artykuły o serii | ✅ istnieje |
| Strona zestawu | `/zestaw/[nr]/` | deale, prezentowniki i newsy wspominające set | ✅ istnieje |
| Prezentowniki | `/prezentowniki/` | prezentowniki per wiek/budżet (do zbudowania IX–X) | ⚠️ hub bez klastrów |
| Black Friday | `/black-friday-lego/` | deale BF, kalendarz promocji | ❌ zbudować ~15.10 |

> **SPROSTOWANIE 2026-08-20.** Do tej pory stało tu zdanie, że bijemy konkurencję tabelami cen i ceną za klocek, „których u nich nie ma". **To była nieprawda.** Ceny z wielu sklepów to podstawowa funkcja promoklocki.pl, zklockow.pl i klockoradar.pl (deklaruje 50+ sklepów); promoklocki liczy też cenę za element i prowadzi historię cen; alerty cenowe mają trzy serwisy; faniklockow linkuje afiliacyjnie pięć sklepów, a fanklockow ma własny sklep i cykliczne zestawienia ofert.
>
> **Stan faktyczny: nie mamy dziś żadnej funkcji ani formatu, którego nie ma już ktoś inny.** Mamy 9 artykułów wobec 3–6 publikacji dziennie u blogów i mniej źródeł cenowych niż porównywarki. Wyróżnik trzeba dopiero zbudować — i zanim wpiszemy tu kolejną tezę o przewadze, musi być zweryfikowana na żywym serwisie konkurencji, nie założona.

## Reguły linkowania wewnętrznego (egzekwowane przy każdym tekście)

1. **Dwukierunkowość**: artykuł linkuje do swojego filaru, a filar przy aktualizacji dostaje link do artykułu. Publikacja dealu na set X = link do `/zestaw/X/` + przy najbliższej aktualizacji wpis/link w odpowiednim filarze.
2. **2–4 linki kontekstowe na artykuł** (przy dłuższych: 2–5 na 1000 słów). Anchor opisowy („zestawy wycofywane w 2026"), nie „kliknij tu" i nie goły URL.
3. **Maks. 3 kliknięcia od strony głównej** do każdej strony zarabiającej. Filary trzymamy w nawigacji głównej.
4. **Linkujemy tylko istniejące strony** — huby zestawów wg `src/lib/huby.js` (numeryHubow); link z listy nigdy nie prowadzi w próżnię.
5. Deale → strona zestawu (nie odwrotny kierunek jako jedyny); prezentowniki → deale i strony zestawów; nowości → strony zestawów.

### Bloki „skompletuj kolekcję" (huby zapowiedzi)

Wzorzec wprowadzony 2026-08-20 na `/zapowiedzi-lego-2027/`, do powielenia w kolejnych hubach zapowiedzi. Przy zapowiedzi dodajemy ramkę (blockquote) z zestawami z obecnej oferty, które domykają tę samą kolekcję tematyczną. Reguły:

1. **Maksymalnie 2 linki** na jedną zapowiedź — ramka ma podpowiadać, nie zasypywać.
2. **Tylko serie kolekcjonerskie** (Icons, Star Wars UCS, Ideas, Architecture, Technic z górnej półki, LOTR/Diuna) i **tylko zestawy powyżej 500 zł** — po obu stronach: zapowiedź musi być z tej półki i linkowany zestaw też.
3. **Zawsze podajemy status rynkowy** linkowanego zestawu: w regularnej sprzedaży czy z zapowiedzianym wycofaniem (data z `wycofania.json`). Pilność tylko prawdziwa.
4. **Linkujemy do `/zestaw/[nr]/`**, nigdy bezpośrednio do sklepu — hub setu ma tabelę cen i linki afiliacyjne, więc moc SEO i konwersja zostają u nas.
5. Uzasadnienie musi być kolekcjonerskie (kompletność serii, wycofanie), nie sztuczna presja. Zapowiedź to nie deal — nie obiecujemy cen, których nie znamy.

Uwaga: to nie jest trwały wyróżnik, tylko format, którego konkurencja **na dziś** nie stosuje przy zapowiedziach — łatwy do skopiowania. Traktujemy go jako przewagę tygodni, nie lat.

## Dane strukturalne (mapa)

| Typ strony | Schema | Gdzie |
|---|---|---|
| Zestaw | Product + AggregateOffer + BreadcrumbList | `zestaw/[nr].astro` ✅ |
| Artykuł/hub treściowy | Article + BreadcrumbList + FAQPage (z frontmattera `faq:`) | `layouts/Artykul.astro` ✅ od 2026-08-17 |
| Seria, strona główna | CollectionPage/ItemList | `serie/[seria].astro`, `index.astro` ✅ |

Frontmatter artykułu obsługuje: `zaktualizowano` (YYYY-MM-DD → dateModified + widoczna data przy tytule) i `faq` (lista `q`/`a` → FAQPage). **Huby evergreen zawsze z `zaktualizowano`** — świeżość to sygnał rankingowy i discoverowy.

## Zasady dla hubów evergreen (kalendarz, black friday, wycofania)

- Jeden stały URL bez roku w ścieżce tam, gdzie treść ma żyć latami (`/kalendarz-promocji-lego/`), rok tylko w tytule — moc domeny kumuluje się w jednym adresie zamiast rozpraszać na kopie roczne.
- Aktualizacja = zmiana `zaktualizowano` + realna zmiana treści (Google porównuje treść, nie datę).
- Rozróżniamy ✅ potwierdzone / 🔮 przewidywane — zero podawania plotek jako faktów (E-E-A-T + zaufanie czytelnika).

## Kalendarz egzekucji (z klocki-seo)

- **VIII–IX**: strony zestawów i serii + kalendarz promocji (✅), pierwsze prezentowniki.
- **IX–X**: WSZYSTKIE prezentowniki opublikowane (Google potrzebuje 6–10 tygodni na rankowanie przed XI).
- **~15.10**: hub `/black-friday-lego/`.
- **XI–XII**: deale + aktualizacje hubów, „ostatnia szansa przed świętami".
