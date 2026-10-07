# Search Console — co sprawdzić w panelu (prompt dla sesji Cowork z dostępem do GSC)

*Napisane 15.09.2026 przez sesję Code po audycie mechanizmu. API Search Console
nie pokazuje stanu indeksacji (pole „zindeksowane" w API sitemap zwraca 0 dla
wszystkiego), więc te rzeczy trzeba odczytać z panelu. Wynik wklej z powrotem do
sesji Code — liczby i nazwy powodów dosłownie, bez interpretacji.*

Usługa: **domena `tylkoklocki.pl`** (sc-domain), nie prefiks URL.

## 1. Strony (Indeksowanie → Strony)

1. Liczby z górnego wykresu: **zindeksowane** i **niezindeksowane** — wartości
   na dziś i z 1.09 (przesuń kursor po wykresie).
2. Tabela „Dlaczego strony nie są indeksowane" — **każdy powód z liczbą stron**,
   dosłownie, np.:
   - „Strona zeskanowana, ale jeszcze niezindeksowana" — N
   - „Strona wykryta, ale obecnie niezindeksowana" — N
   - „Wykluczona za pomocą tagu noindex" — N (spodziewane ~3700, to celowe)
   - „Duplikat, użytkownik nie wybrał strony kanonicznej" — N
   - „Duplikat, Google wybrał inną stronę kanoniczną" — N
   - „Strona z przekierowaniem" — N
   - „Błąd serwera (5xx)" / „Nie znaleziono (404)" — N
3. Dla dwóch największych powodów kliknij w wiersz i przepisz **10 pierwszych
   adresów** z listy.
4. Filtr u góry: „Wszystkie znane strony" → zmień na **każdą sitemapę po kolei**
   (`sitemap-zestawy.xml`, `sitemap-artykuly.xml`, `sitemap-prezentowniki.xml`,
   `sitemap-serie.xml`, `sitemap-nowosci.xml`, `sitemap-deale.xml`,
   `sitemap-inne.xml`) i spisz zindeksowane/niezindeksowane dla każdej.

## 2. Sprawdzenie adresu URL (pasek u góry)

Dla każdego z pięciu adresów wpisz go w pasek i spisz: *Czy adres jest w Google*,
*Ostatnie skanowanie* (data), *Kanoniczny wybrany przez Google*, *Kanoniczny
zadeklarowany*, *Pobieranie strony* (dozwolone / zablokowane), *Indeksowanie*:

- `https://tylkoklocki.pl/`
- `https://tylkoklocki.pl/wycofania/`
- `https://tylkoklocki.pl/zestaw/75430/`
- `https://tylkoklocki.pl/artykuly/lego-11381-jaguar-e-type-recenzja/`
- `https://tylkoklocki.pl/serie/technic/`

Jeśli „adres nie jest w Google" — kliknij **Testuj adres na żywo** i spisz wynik
(w tym „Dostępność strony" i „Zasoby strony: N nie udało się załadować").
NIE klikaj „Poproś o zindeksowanie" hurtowo — najwyżej dla `/` i `/wycofania/`.

## 3. Statystyki indeksowania (Ustawienia → Statystyki indeksowania → Otwórz raport)

- Łączna liczba żądań indeksowania w ostatnich 90 dniach i **wykres per dzień**
  (czy są dni z zerem).
- Tabele: **Wg odpowiedzi** (200 / 301 / 404 / 5xx / „inny błąd klienta" — z
  procentami), **Wg celu** (odkrywanie vs odświeżanie), **Wg typu Googlebota**.
- **Stan hosta**: czy są ostrzeżenia przy „Pobieranie robots.txt", „Rozpoznawanie
  DNS", „Łączność z serwerem" (i ich daty).

## 4. Mapy witryn

Dla każdej sitemapy: **Stan** (Powodzenie / Nie można pobrać / Zawiera błędy),
**Wykryte strony**, data ostatniego odczytu. Czy `sitemap-priorytet.xml` jest
nadal zgłoszona i co pokazuje.

## 5. Ulepszenia i sygnały (menu po lewej)

- **Podstawowe wskaźniki internetowe** (mobile i desktop): liczby URL-i dobrych /
  wymagających poprawy / słabych, i nazwa problemu (LCP / CLS / INP).
- **Elementy nawigacyjne (breadcrumbs)**, **Fragmenty rozszerzone produktów**,
  **Pytania i odpowiedzi (FAQ)** — prawidłowe / błędy / ostrzeżenia, nazwa błędu.
- **Ręczne działania** i **Problemy z bezpieczeństwem** — czy puste.
- **Linki**: liczba **zewnętrznych linków** ogółem, 5 najczęściej linkujących
  witryn, 5 najczęściej linkowanych stron.

## 6. Skuteczność (ostatnie 28 dni)

- Zakładka **Strony**: pierwsze 20 wierszy (adres, kliknięcia, wyświetlenia,
  średnia pozycja).
- Filtr **Wygląd w wyszukiwarce** (jeśli jest): jakie typy wyników się pojawiają
  (fragmenty rozszerzone produktów, breadcrumbs, FAQ).
- Zakładka **Kraje**: czy Polska jest pierwsza.

## 7. Jedno pytanie na koniec

W **Ustawienia → Właściciele i użytkownicy** sprawdź, czy konto serwisowe
(adres z `client_email` w kluczu GSC) ma uprawnienie **Pełny** czy **Ograniczony**.
Przy pełnym Code mógłby w przyszłości zgłaszać sitemapy i sprawdzać adresy z API.

---

Wynik odeślij jako zwykły tekst (albo zrzuty ekranu tabel z §1 i §3). Bez
komentarza „wygląda dobrze" — same liczby i nazwy powodów.
