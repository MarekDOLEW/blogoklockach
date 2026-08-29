# Instrukcja dla sesji Cowork: baza SQL Republiki Klocków → wyciągi dla tylkoklocki.pl

*Prompt do wklejenia w sesji Cowork na komputerze Marka (tej z dostępem do
plików lokalnych). Napisane 29.08.2026 przez sesję Łowcy Promocji.*

---

Masz na dysku zrzut bazy danych starego serwisu Republika Klocków (~1,2 GB,
plik `.sql`, prawdopodobnie MySQL). Zadanie: przerobić go lokalnie na SQLite,
zinwentaryzować zawartość i wyeksportować do CSV wyłącznie tabele przydatne
dla tylkoklocki.pl. Niczego nie wysyłaj na zewnętrzne serwisy — całość robisz
lokalnie na tym komputerze.

## Krok 1 — rozpoznanie pliku

Poproś Marka o ścieżkę do pliku dumpu. Sprawdź pierwsze linie:

    head -5 /sciezka/do/dump.sql

- `-- MySQL dump 10.x` → idź dalej wg tej instrukcji.
- `-- PostgreSQL database dump` → zatrzymaj się i napisz o tym; konwersja
  wygląda inaczej (Docker + postgres), nie improwizuj mysql2sqlite.
- Plik `.gz`/`.zip` → najpierw rozpakuj (`gunzip` / `unzip`).

## Krok 2 — konwersja do SQLite (bez instalowania MySQL)

macOS ma wbudowane `awk` i `sqlite3`. Pobierz skrypt mysql2sqlite
(https://github.com/mysql2sqlite/mysql2sqlite — jeden plik awk) i uruchom:

    cd ~/Downloads   # albo katalog z dumpem
    curl -LO https://raw.githubusercontent.com/mysql2sqlite/mysql2sqlite/master/mysql2sqlite
    chmod +x mysql2sqlite
    ./mysql2sqlite dump.sql | sqlite3 rk.db

Przy 1,2 GB potrwa to kilka–kilkanaście minut. Gdyby konwersja sypała
błędami składni (dump z nietypowymi opcjami), plan B to Docker:

    docker run -d --name rkdb -e MYSQL_ROOT_PASSWORD=rk -p 3307:3306 mysql:8
    docker exec -i rkdb mysql -uroot -prk -e "CREATE DATABASE rk"
    docker exec -i rkdb mysql -uroot -prk rk < dump.sql

i dalsze kroki analogicznie przez `docker exec ... mysql`.

## Krok 3 — inwentaryzacja

    sqlite3 rk.db ".tables"
    sqlite3 rk.db "SELECT name FROM sqlite_master WHERE type='table'" | while read t; do
      echo "$t: $(sqlite3 rk.db "SELECT COUNT(*) FROM \"$t\"")"
    done

Pokaż Markowi pełną listę tabel z licznościami oraz — dla 10 największych —
`PRAGMA table_info(nazwa)` (kolumny). To trafia do czatu jako tabelka.

## Krok 4 — eksport wyciągów (tylko to, co wartościowe)

Szukamy przede wszystkim (nazwy tabel będą inne — dopasuj po kolumnach):

1. **Historia cen** — tabela z kolumnami typu `set_id/product_id, price,
   shop/store, date/created_at`, zwykle największa w bazie (miliony wierszy).
   To najcenniejsza rzecz: gotowe wykresy historii cen na karty zestawów.
2. **Zdjęcia** — tabela z URL-ami obrazków per set (nie BLOB-y; jeśli BLOB-y,
   tylko policz i zgłoś, nie eksportuj).
3. **Sklepy/oferty** — mapowanie set → sklep → URL produktu.
4. **Slugi/URL-e podstron** — do ewentualnych przekierowań 301 ze starej
   domeny (jeśli nie ma osobnej tabeli, slugi są w tabeli setów — tę już mamy).

**Pomiń całkowicie**: users, sessions, logi logowań, tokeny, komentarze
z e-mailami — dane osobowe zostają na dysku Marka, nie eksportujemy ich.

Eksport każdej wybranej tabeli:

    sqlite3 -header -csv rk.db "SELECT * FROM nazwa_tabeli" > rk-nazwa.csv

Dla historii cen, jeśli plik wychodzi > 200 MB, przytnij kolumny do
niezbędnych (set, sklep, cena, data) i/lub podziel po latach:

    sqlite3 -header -csv rk.db "SELECT ... WHERE date >= '2024-01-01'" > rk-ceny-2024plus.csv

Spakuj wyciągi zipem per plik.

## Krok 5 — kontrola jakości przed oddaniem

- każdy CSV otwiera się i ma nagłówek + sensowne wartości w 5 pierwszych wierszach,
- liczba wierszy CSV = COUNT(*) z tabeli (± nagłówek),
- w plikach nie ma kolumn z e-mailami/hasłami/tokenami (sprawdź nagłówki!).

## Krok 6 — przekazanie

Wgraj zipy do sesji **„Łowca Promocji"** (czat tylkoklocki.pl) z notką, co
jest w każdym pliku i z której tabeli pochodzi. Import do danych serwisu robi
Łowca ustalonym procesem — nie rób go samodzielnie. Plik `rk.db` zostaw na
dysku Marka (przyda się przy kolejnych pytaniach do bazy).
