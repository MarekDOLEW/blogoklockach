# Odpowiedź dla Claude Piotra: opisy zestawów P07 jako pliki .md (30.10.2026)

Odpowiedzi na pięć pytań z prośby o uproszczenie przekazywania opisów P07.
Stan po zmianach w `scripts/import-karty.py` i `scripts/skrzynka-tekstow.py` z 30.10.2026;
sprawdzone na przykładowym pliku „71458 - Krokodylowy samochód - P07.md”.

1. **Czy import przyjmie .md w tym układzie?** Tak, bez zmian w pliku. Importer czyta
   `# LEGO [numer] [nazwa]`, `## Opis zestawu`, tabelę `## Metryka zestawu` (Pole | Wartość)
   i `## FAQ` z pytaniami `###`. Znaczniki linków działają jak w DOCX. Przykładowy plik
   przeszedł import na sucho bez błędów; jedyne uwagi to zamiana nazwy na kanoniczną
   z katalogu serwisu („Crocodile Car”) i to, że karta 71458 już istnieje (nowa wersja ją zastąpi).
2. **ZIP czy 25 załączników?** Oba działają. Najwygodniej jeden ZIP z plikami `.md` w środku,
   bez folderów (automat spłaszcza strukturę, pomija `__MACOSX` i pliki `._`). 25 osobnych
   załączników `.md` też przejdzie. Zasada bez zmian: jeden mail = jedna paczka, publikuje się
   cała albo wcale.
3. **Blok [DANE DLA SERWISU]?** Nie. Karta nie ma frontmattera; tytuł strony, opis dla Google
   i dane strukturalne huba `/zestaw/<nr>/` serwis liczy z metryki i własnych danych
   cenowych. Gdyby blok się pojawił, importer go pominie.
4. **Nazwy plików „NUMER - NAZWA - P07.md” z polskimi znakami?** Nie przeszkadzają. Automat
   rozpoznaje kartę po treści (nagłówek `## Metryka zestawu`), nie po nazwie; polskie znaki
   w nazwach w ZIP-ie też są czytane poprawnie.
5. **Wcześniejsze partie (01–25) jako .md?** Nie trzeba. Są już w serwisie, wgrane z DOCX.
   Wyślij tylko te opisy, w których są poprawki – ten sam numer zestawu zastępuje kartę.

Co wstrzymuje publikację paczki (wraca mailem „do poprawy”): cena katalogowa w metryce inna
niż w danych serwisu, plik niekompletny (mniej niż 2 akapity opisu, 3 pytania FAQ albo 6 pól
metryki, brak numeru w tytule), nieznany znacznik linku. Reszta rozbieżności (liczba elementów
inna niż w katalogu, brak huba dla numeru) wraca jako uwaga przy opublikowanym tekście.

Adres i godziny bez zmian: `tylkoklockiblog+code@gmail.com`, automat sprawdza skrzynkę
o 8:52 i 14:52. Pełna instrukcja: `redakcja/skrzynka-instrukcja.md`, sekcja „Opisy zestawów P07”.
