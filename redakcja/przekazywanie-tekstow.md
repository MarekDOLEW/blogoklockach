# tylkoklocki.pl — jak przekazujemy teksty do publikacji

Notatka dla Marka (do wykorzystania w Code), stan na 20.10.2026, wersja 2 — uwzględnia odpowiedzi z notatki „odpowiedzi do zasad publikacji” z 20.10.2026.

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

- `[TABELA CENOWA]` — żywa tabela cen; bez numeru dotyczy pierwszego zestawu z pola „Zestawy”.
- `[TABELA CENOWA 42215]` — tabela dla jednego zestawu w tekście o kilku zestawach.
- `[TABELA CENOWA 42215, 42216]` — tabela zbiorcza dla kilku zestawów.
- `[sprawdź aktualne ceny LEGO 12345 – link wewnętrzny]` — link do strony zestawu `/zestaw/12345/`.
- `[zobacz kategorię LEGO [SERIA] – link wewnętrzny]` — link do kategorii serii.
- `[zobacz część 2 – link wewnętrzny]`, `[zobacz artykuł o LEGO 7750 – link wewnętrzny]` — odesłania między częściami cyklu i artykułami (patrz „Cykle”).
- `[ZDJĘCIE: opis ujęcia]` — miejsce na zdjęcie Piotrka (patrz „Zdjęcia własne”).

## Blok danych dla serwisu

Na samym końcu pliku. Nie jest publikowany; służy do frontmattera. Każde pole jest osobnym akapitem.

```
[DANE DLA SERWISU]
Opis: opis do Google, do 160 znaków
Tytuł SEO: krótszy tytuł, do 60 znaków (tylko gdy tytuł artykułu jest dłuższy)
Kategoria: Recenzje
Zestawy: 42215, 42216
Ważne do: 2026-10-27
Cykl: Pociągi LEGO 12 V, część 1 z 4
FAQ:
P: pytanie
O: odpowiedź
[KONIEC DANYCH DLA SERWISU]
```

Proponowane mapowanie pól:

- `Opis` → `opis` (zajawka na listach i opis dla Google jednocześnie)
- `Tytuł SEO` → `seo_tytul`
- `Kategoria` → `kategoria`
- `FAQ` → `faq`
- `Zestawy` → numery zestawów, których dotyczy tekst; **pierwszy numer to zestaw główny** (zdjęcie okładki, domyślna tabela cenowa). Przy przecieku bez numeru pole może nie wystąpić — wtedy dobierasz zdjęcie poglądowe.
- `Ważne do` → data końca akcji w formacie RRRR-MM-DD (tylko teksty z terminem); po niej baner „akcja zakończona”
- `Cykl` → nazwa cyklu i numer części (tylko w cyklach i tekstach wieloczęściowych), do połączenia części na stronie

FAQ pojawia się tylko wtedy, gdy artykuł ma sekcję pytań i odpowiedzi.

## Cykle i teksty wieloczęściowe

Artykuły historyczne mogą tworzyć cykl (np. przegląd serii i osobne artykuły o jej zestawach) albo jeden tekst podzielony na części. Każda część to osobny plik z własnym numerem i polem `Cykl` w bloku danych. Wszystkie części cyklu dostaniesz razem, gotowe do publikacji. Odesłania między częściami są zapisane jako znaczniki `[zobacz … – link wewnętrzny]`.

## Zdjęcia własne

W artykułach historycznych mogą pojawić się zdjęcia z kolekcji Piotrka. Miejsce zdjęcia oznacza osobny akapit `[ZDJĘCIE: opis ujęcia]`, np. `[ZDJĘCIE: 7750 z tendrem, widok z boku]`. Pliki zdjęć przychodzą w tym samym mailu co plik .md, z nazwami zaczynającymi się od numeru artykułu, np. `0025_zdjecie_1.jpg`; kolejność numerów odpowiada kolejności znaczników w tekście. Znacznik pojawia się tylko wtedy, gdy zdjęcie rzeczywiście jest.

## Kategorie

Znacznik kategorii to drugi człon nazwy pliku (po numerze): Aktualności, Premiery, Recenzje, Rankingi, Porównania, Poradniki, Kalendarze, Historyczne.

**Aktualności** to przecieki, zmiany w ofercie i pojedyncze akcje promocyjne. Trafiają do działu Artykuły, na listę /aktualnosci/ i do pasa aktualności na stronie głównej (potwierdzone 20.10.2026).

## Czego teksty nie zawierają (robi to serwis lub Code)

- linków do sklepów i linków afiliacyjnych;
- informacji o afiliacji;
- zdjęć zestawów z internetu (poza zdjęciami własnymi Piotrka opisanymi wyżej);
- dat sprawdzenia cen;
- technicznego SEO.

Ceny w tekście to tylko trwałe poziomy: RRP, dobra cena i próg zakupu.

## Opisy zestawów P07

Zostajemy przy paczkach DOCX (import `scripts/import-karty.py`). Każda karta ma stały szablon:

- tytuł „LEGO <numer> <nazwa>”;
- sekcja „Opis zestawu”;
- sekcja „Metryka zestawu” — tabela dwukolumnowa (pole | wartość);
- sekcja „FAQ” — pytania jako śródtytuły, odpowiedzi jako akapity.

Nazwy pól metryki są stałe: Numer, Nazwa, Seria, Premiera, Elementy, Wiek, Minifigurki / postacie, Cena katalogowa w Polsce, Cena katalogowa za element, Typ zestawu, Kolekcja / system, Dystrybucja, a dla GWP i nagród Insiders — Sposób uzyskania. Każdą zmianę nazwy pola zgłosimy wcześniej. Cenę katalogową w metryce sprawdzamy na LEGO.pl.

## Ustalenia z 20.10.2026

1. `[TABELA CENOWA 42215, 42216]` działa i daje tabelę zbiorczą.
2. Aktualności — potwierdzone (patrz „Kategorie”).
3. P07 — paczki DOCX według stałego szablonu (patrz wyżej).
4. Blok danych — pasuje; `Opis` → `opis`, pierwszy numer w `Zestawy` = okładka, nowe pole `Ważne do`.

## Otwarte pytania

1. Czy pole `Cykl` i znaczniki odesłań `[zobacz … – link wewnętrzny]` wystarczą, żeby połączyć części cyklu na stronie (np. nawigacją „poprzednia / następna część”)?
2. Czy taki sposób przekazywania zdjęć (`[ZDJĘCIE: …]` w tekście i pliki `NNNN_zdjecie_N.jpg` w mailu) Ci pasuje?
