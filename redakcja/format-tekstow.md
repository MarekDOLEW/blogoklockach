# tylkoklocki.pl — technika serwisu i format tekstów

Streszczenie dla Claude Piotra (18.10.2026). Odpowiedź na pytanie, czy teksty
formatować pod WordPressa, czy pod inny system.

## Krótko

**Nie mamy WordPressa ani żadnego CMS-a.** Nie ma panelu, edytora wizualnego,
bloków Gutenberga, shortcode'ów ani wtyczek SEO. Tekst nie musi być więc
przygotowany pod żaden konkretny system — wystarczy czysta struktura.
Technikę po naszej stronie (frontmatter, linki, ceny, zdjęcia) dokłada Code.

## Na czym stoi serwis

- **Astro**: generator stron statycznych. Każdy artykuł to plik Markdown
  (`src/pages/artykuly/<slug>.md`) z nagłówkiem YAML. Przy każdym deployu
  powstaje gotowy HTML.
- **Cloudflare**: hosting i Worker. Worker serwuje zdjęcia zestawów z
  własnego magazynu (R2) i obsługuje linki do sklepów `/idz/<sklep>/<numer>`,
  które przekierowują na link afiliacyjny. Atrybut `rel="sponsored nofollow"`
  (przy sklepach bez prowizji samo `nofollow`) dokłada build.
- **Dane w plikach JSON**: ceny, oferty, katalog zestawów i zdjęcia.
  Codziennie aktualizują je zadania automatyczne. Tabele cen na stronach
  zestawów (`/zestaw/<numer>/`) odświeżają się same.
- **Deploy**: automatyczny z gałęzi `main` repozytorium GitHub. Tekst jest na
  żywo ok. 2–3 minut po publikacji.
- **SEO techniczne robi szablon, nie tekst**: tytuł i opis strony, dane
  strukturalne (Article, FAQ, Product), sitemapa, disclosure afiliacji,
  data aktualizacji. W tekście nie trzeba tego dopisywać.

## Jak teraz wygląda obieg tekstu

1. Piotr przysyła gotowy artykuł w .docx.
2. Code importuje go skryptem (`scripts/import-artykul.py`), który z Worda bierze
   akapity, nagłówki (styl „Nagłówek”), tabele (w kolejności z dokumentu) i osadzone
   obrazy (każdy dostaje widoczny znacznik).
3. Code dokłada frontmatter (tytuł, opis, kategoria, FAQ, `seo_tytul`/`seo_opis`),
   linki do hubów i serii, linki do sklepów przez `/idz/`, żywe tabele cen i galerie
   zdjęć. Treść Piotra pozostaje bez zmian.

## Wytyczne do formatu — co pomaga, co ginie

Osobnych wytycznych „pod system” do tej pory nie było. Opis formatu w repo jest
w `redakcja/instrukcje-dla-claude-piotra.md`, sekcja „Format artykułu w repozytorium”.
Na podstawie tego, jak działa import, zasady są takie:

**Najlepiej (w kolejności):**
1. **Markdown (.md)**: wchodzi 1:1 i nic nie ginie. Działają `##`/`###`,
   pogrubienia (`**tekst**`), kursywa (`*tekst*`), listy, tabele i `[tekst](adres)`.
2. **Word (.docx) ze stylami**: też dobrze, przy warunkach poniżej.

**W Wordzie:**
- Tytuł artykułu w **pierwszym akapicie**, potem treść. Skrypt traktuje
  pierwszy akapit jako tytuł.
- Śródtytuły ustawiaj **stylem „Nagłówek 2”**, a nie pogrubionym zwykłym
  akapitem, bo wtedy import nie rozpozna ich jako nagłówka. Import spłaszcza
  wszystkie poziomy do jednego śródtytułu (`##`). Jeśli zależy Ci na
  podrozdziałach, zaznacz to na marginesie albo przyślij Markdown.
- Tabele jako **prawdziwe tabele Worda** (Wstaw → Tabela), a nie tabulatory
  ani spacje.
- Miejsce na żywą tabelę cen: osobny akapit `[TABELA CENOWA]`, w razie
  potrzeby z numerem zestawu. Zamieniamy go na tabelę odświeżaną codziennie.
- Przed wysłaniem **zaakceptuj wszystkie zmiany** (śledzenie zmian) i usuń
  komentarze.

**Co z Worda ginie przy imporcie — nie opieraj na tym treści:**
- pogrubienia i kursywa (wracają tylko, gdy zaznaczysz je w Markdown);
- listy punktowane i numerowane (zostają zwykłymi akapitami);
- adresy hiperłączy (zostaje sam tekst linku). Jeśli link jest ważny, wpisz adres
  w nawiasie albo w uwagach do tekstu;
- przypisy, pola tekstowe, kształty, nagłówki i stopki strony;
- kolory, czcionki, wyrównanie, ręczne odstępy (puste akapity, Shift+Enter).

**Czego nie robić, bo zrobi to serwis:**
- nie wklejaj linków afiliacyjnych ani linków do sklepów. Wystarczy napisać,
  które 2–3 sklepy mają się pojawić, a linki `/idz/...` doda Code;
- nie dopisuj disclosure afiliacji (jest w szablonie artykułu);
- nie dodawaj zdjęć zestawów z sieci. Zdjęcia LEGO mamy u siebie, a galerię
  dobieramy do numeru zestawu. Wklejaj tylko grafiki, które są częścią tekstu
  (wykres, własne zdjęcie), i podpisz je;
- nie podawaj daty sprawdzenia cen w treści (zgodnie ze standardem: trwała
  drabina cenowa, aktualne ceny są w hubie zestawu).

**Mile widziane jako osobny blok na końcu dokumentu** (ułatwia nam frontmatter):
- **Opis do Google**, do 160 znaków, pełne zdania;
- krótszy **tytuł SEO**, do 60 znaków, jeśli tytuł artykułu jest dłuższy;
- **kategoria**: Premiery, Recenzje, Rankingi, Porównania, Poradniki, Kalendarze
  albo Historyczne;
- **FAQ**: 3–5 par pytanie/odpowiedź, jeśli artykuł je ma;
- **numery zestawów**, których dotyczy tekst.

Jeśli tego bloku nie będzie, uzupełni go Code. To ułatwienie, nie wymóg.

## Odpowiedzi na notatkę „jak przekazujemy teksty do publikacji” (20.10.2026)

Notatka Piotra leży w repo bez zmian: `redakcja/przekazywanie-tekstow.md`. Pliki .md importuje
od dziś `scripts/import-artykul-md.py` — bez przepisywania ręcznego.

1. **`[TABELA CENOWA 42215, 42216]` — tak, od dziś.** Daje tabelę zbiorczą: wiersz na zestaw
   z ceną katalogową, najniższą dzisiejszą ceną, sklepem, rabatem i linkiem do karty zestawu
   z pełną tabelą. `[TABELA CENOWA]` bez numeru bierze pierwszy zestaw z pola „Zestawy”.
2. **Aktualności — tak.** To kategoria działu Artykuły; teksty z nią trafiają też na listę
   `/aktualnosci/` i do pasa aktualności na stronie głównej. Jeden wymóg techniczny: aktualność
   musi mieć zdjęcie okładki. Bierzemy je z pierwszego numeru w polu „Zestawy”; gdy tekst nie
   dotyczy istniejącego zestawu (np. przecieki), dobieramy zdjęcie poglądowe z podpisem.
3. **Opisy zestawów P07 — zostańmy przy paczkach DOCX.** Import (`scripts/import-karty.py`)
   wczytał w dwa dni 275 kart bez ręcznej pracy. Prośba tylko o stały szablon: tytuł
   „LEGO <numer> <nazwa>”, sekcje „Opis zestawu”, „Metryka zestawu” (tabela Pole | Dane),
   „FAQ” z pytaniami jako nagłówkami. Partie 05–07 zmieniły nazwy pól metryki („Elementy”,
   „Cena katalogowa w Polsce”) — import już je zna, ale nowe nazwy prosimy zgłaszać.
   Cena katalogowa w metryce musi zgadzać się z ceną LEGO.pl; przy różnicy karta czeka na
   sprawdzenie. Opis może mieć jeden akapit, jeśli ma ponad 300 znaków — strona zestawu
   i tak wchodzi do indeksu.
4. **Blok `[DANE DLA SERWISU]` pasuje.** Jedna korekta mapowania: „Opis” trafia do pola
   `opis` (zajawka na listach i opis dla Google jednocześnie), nie do `seo_opis`.
   Pierwszy numer w „Zestawy” to zdjęcie okładki. Nowe pole opcjonalne dla aktualności
   z terminem: `Ważne do: 2026-10-27` — po tej dacie tekst dostaje baner „akcja zakończona”
   i schodzi na dół list.
