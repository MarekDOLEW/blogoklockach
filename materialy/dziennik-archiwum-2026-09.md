# Dziennik — archiwum 2026-09

Wpisy przeniesione z `DZIENNIK.md` po przekroczeniu progu wieku.
Treść jest niezmieniona. Bieżące wpisy i ustalenia trwałe: `DZIENNIK.md`.

## 02.09.2026 — 75457 Executor (punkt 2 z radaru 02.09)

Opublikowane: `/artykuly/lego-75457-executor-przed-premiera/`, dział Premiery.
Karta researchu: `redakcja/karty/75457-executor.md`.

**Oś tekstu jest odwrotna niż zwykle.** Executor to ekskluzyw LEGO.com i sklepów
stacjonarnych LEGO — nie ma drugiej ceny, rabatu ani progu zakupu. Nasza
standardowa rada („sprawdź, gdzie taniej", „poczekaj do listopada") nie ma tu
zastosowania i tekst mówi to wprost, zamiast udawać porównanie. Jedyna zmienna
pod kontrolą kupującego to zdążyć przed wyczerpaniem gratisu 40897 — stąd
praktyczna konsekwencja: **konto Insiders trzeba mieć założone przed 1.10**,
nie w dniu premiery.

**Wartość, której nikt inny nie poda:** 21065 Sagrada Família ma dokładnie tę
samą cenę katalogową 3199,99 zł przy 12 060 elementach (0,27 zł/el.) wobec
6130 u Executora (0,52 zł/el.). Widać to tylko z jednego katalogu z obiema
pozycjami.

**Dane poprawione przy okazji:**
- `sety.json` 75457: `cena_katalogowa` było `null`, a `dla_afol` szacowało
  ~3170 zł z przelicznika euro — wpisana potwierdzona kwota 3199,99 zł.
- `kalendarz-promocji-lego.md`: sekcja październikowa twierdziła, że polskiej
  ceny nie ogłoszono. Poprawione, dołożone okno gratisu i kanał sprzedaży.

**Nierozstrzygnięte i tak zapisane w tekście:** okno GWP — źródła
anglojęzyczne podają 1–10.10, polskie 1–7.10. Nie rozstrzygamy (LEGO różnicuje
okna między rynkami); w tekście krótsza wersja plus zdanie, że decyduje
wyczerpanie zapasów, nie kalendarz.

**Zdjęć 75457 nie mamy** — zestaw jeszcze nie istnieje w feedach. Zamiast
pustego znacznika galerii poszły dwie pozycje faktycznie w tekście
porównywane: 10221 (poprzednik) i 21065 (alternatywa), z podpisem
wyjaśniającym, czyje to zdjęcie.

Tekst wyszedł 18 dni przed planowanym oknem 20–30.09, bo cena potwierdziła się
wcześniej, a czekanie nie dawało nic poza ryzykiem.

**Zostaje z planu:** Wycofania grudnia 2026 (okno 1–20.10) i Black Friday —
rabat kontra pseudopromocja (okno 10–24.11).

---

## 04.09.2026 — punkty 1–3 z radaru: fala października i haczyk Black Friday

**Punkt 1 i 3 (dane).** Zweryfikowałem u źródeł październikową falę premier. Wpisane
tylko to, co potwierdzone niezależnie w co najmniej dwóch miejscach:

| Zestaw | Było | Jest |
|---|---|---|
| 72306 PlayStation | `cena_katalogowa: null` | **689,99 zł** (0,36 zł/el.) |
| 21371 Wallace i Gromit | `null` | **419,99 zł** (0,40 zł/el.) |
| 40874 Świąteczne odliczanie | `null` | **249,99 zł** (0,29 zł/el.) |
| 11387 Zimowa wioska | `elementy: null` | **1354** |

Miła kontrola własnej metody: nasze wcześniejsze szacunki z przelicznika euro
(≈680, ≈420, ≈250 zł) trafiły co do kilku złotych w kwoty, które LEGO faktycznie
ogłosiło. Przelicznik euro jako *szacunek oznaczony jako szacunek* działa.

**Czego NIE wpisałem i dlaczego** — zapisane w `katalog.json` →
`_meta.rozbieznosci_fala_pazdziernik_2026`:
- **40865 Elf Buddy** — liczba elementów sporna: 713 (faniklockow) kontra 719
  (zklockow). Żadnej nie przyjmuję.
- **11379 Księgarnia Book Nook** — cena sprzeczna: „ok. 520 zł" kontra 559,96 zł.
  Ta druga nie kończy się na „,99", więc to niemal na pewno wyliczenie
  porównywarki, a nie cena katalogowa.
- **40875, 40862, 40866, 11388, 11390, 21373** — po jednym źródle, w dodatku
  samo oznaczonym jako plotka. Zostają puste.
- 72306 nie ma wpisu w `katalog.json` (nowa seria „PlayStation") — hub działa
  z `sety.json`. Dodanie serii do katalogu należy do Zwiadowcy, nie do Radaru.

**Punkt 2 (Black Friday).** 21375 Godzilla ma premierę **27 listopada, czyli w sam
Black Friday**, z własnym gratisem — potwierdzone w dwóch źródłach, cena wciąż
nieznana. To zmienia planowany tekst z ogólnego wywodu w konkret: zestaw
debiutujący w dniu BF z definicji nie jest przeceniony, a stoi obok przecen
i korzysta z ich rozpędu.

- okno tekstu przesunięte z `11-10..11-24` na **`11-05..11-20`**, żeby wyszedł
  przed premierą, nie po niej; w planie dopisany hak i przypomnienie, żeby przed
  publikacją sprawdzić cenę katalogową (bez niej nie policzymy rabatu ani jego braku);
- do kotwic sezonu doszła data 27.11 z premierą Godzilli;
- w `kalendarz-promocji-lego.md` — akapit w sekcji listopadowej („Nowość w Black
  Friday nie jest okazją"), nowa sekcja „Październik to nie tylko Executor"
  z tabelą trzech potwierdzonych cen, oraz dwa wiersze w ściądze.

Sekcja październikowa mówiła dotąd wyłącznie o Executorze, choć tego samego dnia
wchodzi cała reszta fali — to była realna dziura na stronie, która już rankuje.

Build czysty, `kontrola-rrp.mjs` → ROZBIEŻNYCH: 0, wszystkie nowe linki żyją.
`/nowosci/pazdziernik-2026/` podchwyciło ceny samo.

## 2026-09-05 · CODE (Radar) · Dla Łowcy: 16 „okazji" konkurencji — co z nich wynika

Konkurencja (faniklockow) wypuściła 4.09 **szesnaście mikropostów dealowych w jednej
dobie**, większość między 12:22 a 15:08. Poprzednie dni: dwa. Przepuściłem tę listę
przez nasz `oferty_feed.json` (stan 05.09) i zamiast jednej hipotezy wyszły trzy
konkrety. **Nie ruszałem danych Łowcy — to jest zgłoszenie, nie zmiana.**

Zestawy: 10316, 76300, 11389, 11375, 42240, 21355, 77256, 77260, 76475, 60423,
60478, 60488, 71848, 42224, 42226, 42229, 43023.

### 1. To nie jest jeden sklep — i to dobra wiadomość

Rozkład najtańszych ofert: **Allegro 11, Smyk 4, Empik 1, Media Expert 1**. Czyli nie
jedna wyprzedaż u jednego sprzedawcy, tylko szeroki ruch przedsezonowy. Nasze tabele
złapały go same — 15 z 17 zestawów ma świeże oferty, rabaty 23–39% względem katalogu.
Pod tym względem nie mamy nic do nadrabiania.

**Warte uwagi: Smyk jest najtańszy przy czterech pozycjach** (11375 Ferrari −30%,
42240 Aston Martin −26%, 42224 Porsche −23%, 42226 BMW −28%) — same duże Technic
i Icons, czyli wysokie koszyki. Smyk mamy w rejestrze jako **aktywny (Adtraction,
2,10% CPS, cookie 45 dni)**. To sugestia, żeby przy doborze sklepów publikacyjnych
dla Technica nie pomijać Smyku odruchowo na rzecz Allegro.

### 2. Jedna z ich „okazji" okazją nie jest

**11389 Projekt Hail Mary** — u nich „Okazja Cenowa". Nasze dane: cena katalogowa
**469,99 zł**, najtańsza oferta **479,99 zł** (Allegro), Empik 543 zł. Czyli
„okazja" jest **droższa od ceny katalogowej LEGO o dwa procent**.

To jest dokładnie ten mechanizm, o którym ma być listopadowy tekst o Black Friday,
tyle że złapany na żywo we wrześniu. Zapisuję to jako materiał do tamtego artykułu.

### 3. Dwa pytania do sprawdzenia po stronie Łowcy

**a) Empik nigdy nie wygrywa pola `cena`.** W całym feedzie `sklep == "empik"`
występuje **zero razy**, a w **386 zestawach Empik ma najniższą ofertę, która nie
trafiła do pola `cena`**. Przykłady: 3677 (empik 2899 vs allegro 3141), 3818
(1899 vs 2299), 3831 (1599 vs 2177).

Nie przesądzam, czy to błąd. `_meta.zasady` opisuje regułę wyboru `cena` przez
pryzmat PK i ME, a Empik dokumentuje osobno jako klucz w `oferty` — więc możliwe,
że wyłączenie jest **celowe** (marketplace, zrzut tygodniowy, wątpliwa dostępność).
Za celowością przemawiają pozycje w rodzaju 1246 (empik 60,50 vs allegro 179,99),
gdzie cena wygląda na ofertę używanego albo niekompletnego zestawu.

**Jeśli celowe — warto to dopisać wprost do `_meta.zasady`**, bo dziś czyta się to
jak przeoczenie. **Jeśli nie — to 386 zestawów, przy których pokazujemy cenę wyższą
niż dostępna**, a to uderza w jedyną rzecz, którą sprzedajemy.

**b) 2644 zestawy mają cenę rynkową, ale nie mają ceny katalogowej** — więc przy
żadnym z nich nie policzymy rabatu. Z dzisiejszej listy dotyczy to **76300 Arkham
Asylum**: konkurencja ogłasza okazję, a my nie umiemy powiedzieć, czy nią jest.
To nie zadanie na dziś, ale przy 2644 pozycjach to systemowa dziura w funkcji,
która jest sednem serwisu.

### Czego NIE trzeba robić

Odświeżania feedu — dane są z 05.09 i złapały ruch. Zrzut Empiku jest z 31.08
(tygodniowy, przez Cowork), więc w normie.
