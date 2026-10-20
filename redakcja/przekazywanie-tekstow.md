# tylkoklocki.pl — jak przekazujemy teksty do publikacji

Notatka dla Marka (do wykorzystania w Code), stan na 20.10.2026. Odpowiedź na notatkę „technika serwisu i format tekstów” z 18.10.2026.

## Jak teksty do Ciebie trafiają

Piotrek przygotowuje teksty z Claude i wysyła Ci je **mailem jako pliki .md**. Ty importujesz je do swojego Code i za jego pomocą publikujesz na stronie. Code nie ma dostępu do plików Piotrka, więc pracuje tylko na tym, co dostaniesz w mailu.

- **Źródłem dla strony jest zawsze plik .md.** Piotrek ma też wersję Word, ale ona służy tylko jemu do czytania i nie trzeba jej importować.
- Nazwa pliku mówi, co to jest:
  - artykuły i aktualności: `[NNNN]_[Kategoria]_[Tytuł].md`, np. `0024_Aktualności_Trzy upominki na LEGO.pl do 27 października.md`;
  - recenzje: `Recenzje_XXX_[NUMER] [NAZWA].md`, np. `Recenzje_010_42215 Koparka Volvo EC500 Hybrid.md`.
- Jeżeli tekst ma własną grafikę (np. wykres), w mailu jest też folder `obrazy/`. Trzeba go zachować obok pliku .md, bo ścieżki w tekście są względne.
- Poprawiony tekst przychodzi jako nowy plik .md o tej samej nazwie i zastępuje poprzednią wersję.

Pliki .md tekstów 0001–0023 i recenzji 001–010 powstały automatycznie z Worda. W najstarszych tekstach (0001–0012, 0021) śródtytuły rozpoznano po pogrubieniu, więc przy imporcie warto rzucić okiem na nagłówki. Te teksty nie mają jeszcze bloku danych.

## Format pliku .md

- Pierwszy wiersz to `# Tytuł`. Śródtytuły to `##`, podrozdziały `###`.
- Listy, pogrubienia, kursywa i tabele są zapisane w Markdown.
- Nie ma frontmattera — dokłada go Code przy imporcie.
- Obrazy występują tylko jako własne grafiki (np. wykresy) z podpisem. Ścieżki są względne: `obrazy/<nazwa pliku>/media/...`.

## Znaczniki do zamiany

- `[TABELA CENOWA]` — żywa tabela cen w tekście o jednym zestawie.
- `[TABELA CENOWA 42215]` — tabela dla jednego zestawu w tekście o kilku zestawach.
- `[TABELA CENOWA 42215, 42216]` — tabela zbiorcza dla kilku zestawów.
- `[sprawdź aktualne ceny LEGO 12345 – link wewnętrzny]` — link do strony zestawu `/zestaw/12345/`.
- `[zobacz kategorię LEGO [SERIA] – link wewnętrzny]` — link do kategorii serii.

## Blok danych dla serwisu

Na samym końcu pliku. Nie jest publikowany; służy do frontmattera. Każde pole jest osobnym akapitem.

```
[DANE DLA SERWISU]
Opis: opis do Google, do 160 znaków
Tytuł SEO: krótszy tytuł, do 60 znaków (tylko gdy tytuł artykułu jest dłuższy)
Kategoria: Recenzje
Zestawy: 42215, 42216
FAQ:
P: pytanie
O: odpowiedź
[KONIEC DANYCH DLA SERWISU]
```

Proponowane mapowanie pól:

- `Opis` → `seo_opis`
- `Tytuł SEO` → `seo_tytul`
- `Kategoria` → `kategoria`
- `FAQ` → `faq`
- `Zestawy` → numery zestawów, których dotyczy tekst

FAQ pojawia się tylko wtedy, gdy artykuł ma sekcję pytań i odpowiedzi.

## Kategorie

Znacznik kategorii to drugi człon nazwy pliku (po numerze): Aktualności, Premiery, Recenzje, Rankingi, Porównania, Poradniki, Kalendarze, Historyczne.

**Aktualności** to przecieki, zmiany w ofercie i pojedyncze akcje promocyjne. Na stronie jest już taki dział w sekcji Artykuły i teksty z tym znacznikiem mają trafiać właśnie tam. W notatce z 18.10 tej kategorii zabrakło na liście, dlatego prosimy tylko o potwierdzenie (pytanie 2).

## Czego teksty nie zawierają (robi to serwis lub Code)

- linków do sklepów i linków afiliacyjnych;
- informacji o afiliacji;
- zdjęć zestawów;
- dat sprawdzenia cen;
- technicznego SEO.

Ceny w tekście to tylko trwałe poziomy: RRP, dobra cena i próg zakupu.

## Pytania do Marka

1. Czy Twój import obsłuży znacznik z kilkoma numerami, np. `[TABELA CENOWA 42215, 42216]`?
2. Czy import przypisze pliki ze znacznikiem **Aktualności** (np. 0022, 0024) do działu Aktualności w sekcji Artykuły?
3. W jakim formacie najlepiej przekazywać krótkie opisy zestawów P07 (do stron `/zestaw/<numer>/`)? Teraz są to paczki DOCX.
4. Czy blok `[DANE DLA SERWISU]` w tej postaci Ci pasuje, czy wolisz inne nazwy pól?
