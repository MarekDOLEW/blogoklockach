# Boty i kliknięcia `/idz/`: spadek ludzi i fala z 05.11 (audyt 06.11.2026, punkt 7)

Źródła: Analytics Engine `idz_kliki` (SQL API, odczyt 06.11 ok. 12:40 UTC), zrzuty
`materialy/statystyki/2026-11-0*.json`, GA4 (Data API, sesje dzienne), Performers API
(kliknięcia Media Expertu po stronie sieci), `src/worker.js` w stanie z `834e724a`.
Dni liczone w UTC. Doba 06.11 jest niepełna.

## Wniosek w trzech zdaniach

1. **Spadek ludzkich kliknięć z Polski nie jest prawdziwy.** Z okna 7 dni wypadł pik
   z 26–27.10 (38 kliknięć w dwa dni). Bieżące 44 na tydzień to **więcej** niż zwykły
   poziom z października (31–35). Filtr nie odcina Polaków, a ruch na stronie nie spadł.
2. **Fala z 05.11 (13 301 odrzuceń w jeden dzień) to ten sam crawler co 10.10, tylko
   13 razy większy.** Tym razem **nic nie przeszło do sieci afiliacyjnych**: 0 kliknięć
   „human” spoza Polski 05.11, Performers 0 kliknięć 05.11. Zadziałały łatki z 12.10
   (końcowy ukośnik, referer `/idz/`) i z 02.11 (strona główna + kraj spoza PL).
3. **Filtr nie wymaga pilnej zmiany.** Brakuje nam za to danych o samym ruchu:
   worker nie zapisuje user-agenta ani ASN-u. Proponuję łatkę diagnostyczną (niżej),
   do zgody Marka.

## (a) Czy spadek ludzi jest prawdziwy

### Ludzie z Polski, dzień po dniu

| Dzień | 19.10 | 20 | 21 | 22 | 23 | 24 | 25 | **26** | **27** | 28 | 29 | 30 | 31 | 01.11 | 02 | 03 | 04 | 05 | 06* |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| „human” PL | 3 | 5 | 2 | 6 | 5 | 4 | 10 | **23** | **15** | 6 | 10 | 3 | 9 | 8 | 4 | 7 | 9 | 4 | 4 |
| w tym z ChatGPT | 2 | 3 | 2 | 3 | 2 | 3 | 0 | 8 | 2 | 2 | 1 | 1 | 2 | 3 | 3 | 5 | 7 | 2 | 2 |

\* do ok. 12:40 UTC.

Tygodnie (pełne doby):

| Tydzień | Ludzie PL | Uwagi |
|---|---:|---|
| 28.09–04.10 | 31 | |
| 05–11.10 | 35 | |
| 12–18.10 | 53 | 15.10: 17 kliknięć |
| 19–25.10 | 35 | |
| **26.10–01.11** | **74** | pik 26–27.10: 38 |
| **30.10–05.11** | **44** | to jest „spadek” ze zrzutu 06.11 |

Pik 26–27.10 to artykuł x-kom Black Weeks, kod ME z października i wejścia z ChatGPT
(10 z 38). Bez niego tydzień 26.10–01.11 dałby ok. 36. Liczba 79 w zrzucie z 01.11
zawierała więc oba dni piku, liczba 44 w zrzucie z 06.11 już żadnego.

### Czy filtr odrzuca ludzi

Każde odrzucenie z 15 dni (23.10–06.11) przypisałem do reguły, która je złapała
(odtworzyłem logikę workera na zapisanych polach). **Polskie kliknięcia trafiły
wyłącznie do kategorii „pusty referer”.** Żadne polskie kliknięcie nie odpadło na
regule ukośnika, refererze `/idz/`, niezgodnym hubie ani sondzie strony głównej.

„Pusty referer” z Polski: 631 kliknięć, z czego **586 to dwie serie crawlera**
(27.10 20–21 UTC: 501 kliknięć, 9 sklepów, kilkaset różnych zestawów; 04.11 19 UTC:
85). Zostaje 48 pojedynczych odrzuceń od 20.10. Większość to kilka zestawów w tej samej
sekundzie, czyli też nie człowiek. **Tylko w 2 przypadkach ktoś w ciągu 30 minut kliknął
ponownie ten sam zestaw z hubu** (20.10, 75421), czyli był to człowiek, który trafił na
komunikat „otwarte spoza strony”. Fałszywe trafienia: najwyżej kilka na dwa tygodnie.

Uwaga do pomiaru: GA4 nie pokaże ludzi odrzuconych przez filtr. `TabelaCen.astro` czyści
`?idz=odrzucony` przez `history.replaceState`, zanim GA4 się załaduje. W GA4 jest 0 odsłon
z tym parametrem i to nic nie dowodzi.

### Czy spadł ruch na stronie (GA4)

| Tydzień | Sesje z Polski | Średnio dziennie | Sesje z chatgpt.com (PL) |
|---|---:|---:|---:|
| 12–18.10 | 1 349 | 193 | — |
| 19–25.10 | 1 356 | 194 | 103 |
| 26.10–01.11 | 1 500 | 214 | 93 |
| 30.10–05.11 | 1 525 | 218 | 98 |

Ruch nie spadł. Zastrzeżenie: 94% polskich sesji w GA4 to `(direct)`, a Search Console
daje 2 kliknięcia na tydzień. GA4 słabo więc oddaje liczbę czytelników. Stały kanał
ludzki, czyli ChatGPT, też się trzyma (ok. 100 sesji na tydzień).

## (b) Skąd fala botów

### Dzień po dniu

| Dzień | odrzucone (bot) | w tym z refererem `https://tylkoklocki.pl…` | bot z PL | „human” spoza PL | Performers (ME), kliki |
|---|---:|---:|---:|---:|---:|
| 20.10 | 505 | 23 | 3 | 0 | 1 |
| 21.10 | 159 | 0 | 6 | 0 | 1 |
| 22.10 | 117 | 1 | 4 | 0 | 4 |
| 23.10 | 312 | 129 | 10 | 6 | 2 |
| 24.10 | 141 | 19 | 0 | 11 | 2 |
| 25.10 | 396 | 31 | 2 | 0 | 0 |
| 26.10 | 183 | 8 | 5 | 8 | 4 |
| 27.10 | 697 | 28 | **501** | 7 | 1 |
| 28.10 | 240 | 114 | 5 | 4 | 2 |
| 29.10 | 151 | 26 | 1 | 7 | 3 |
| 30.10 | 144 | 13 | 0 | 2 | 0 |
| 31.10 | 307 | 72 | 0 | 9 | 2 |
| 01.11 | 238 | 31 | 2 | 6 | 3 |
| 02.11 | 522 | 168 | 6 | 0 | 2 |
| 03.11 | 187 | 19 | 0 | 3 | 3 |
| 04.11 | 580 | 277 | 85 | 0 | 3 |
| **05.11** | **13 301** | **13 155** | 4 | **0** | **0** |
| 06.11* | 221 | 107 | 10 | 5 | 2 |

„Human” spoza PL 23.10–01.11 to głównie referer strony głównej (57 z 66): ta sama sonda,
którą 02.11 zamknęła reguła „strona główna + kraj spoza PL”. Po 02.11 zostało 8
zagranicznych „human”: 4 z hubów z `utm_source=chatgpt.com` (NO, ES, HR) i 3–4 z USA
06.11, prawdopodobnie nasze sesje audytowe (nie sprawdzono).

### 05.11: rysopis fali

Przebieg w UTC: start 04.11 ok. 18:00, w ciągu doby 05.11 kolejno 1 093 (00–06),
6 148 (06–12), 5 488 (12–18) i 426 (18–24), koniec 06.11 ok. 00:00. Szczyt to 11–12 UTC,
czyli 12–13 w Polsce: 1 937 na godzinę, do 49 na minutę z 20 krajów naraz. Do 06.11
07:00 UTC przyszło jeszcze 101 kliknięć.

| Cecha | 05.11 |
|---|---|
| Kraje | **89**; BR 3 309, AR 1 318, BD 1 174, CO 847, PK 723, MA 676, ZA 555, CL 442, MX 420 |
| Różne zestawy | **2 204** w jeden dzień |
| Sklepy | Allegro 5 463, Empik 2 384, ME 1 654, LEGO 1 215, Ceneo 723, Planeta 655, Smyk 566, x-kom 519, Lidl 120 |
| Referery | `/serie/marvel` 3 449, `/promocje-lego` 1 490, `/serie/friends` 428, `/wycofania` 320, `/wycofania?q=76307` 303, `/wycofania?q=76323` 282, `/wycofania?q=11198` 282, `/serie/archiwum` 275, `/serie/creator` 269, `/idz/ceneo/11208` 40… (580 różnych) |
| Referer z końcowym ukośnikiem | tylko `https://tylkoklocki.pl/` (59, wszystkie spoza PL) |
| User-agent, ASN | **nie sprawdzono**: worker ich nie zapisuje, a `CF_API_TOKEN` nie widzi strefy (lista stref jest pusta), więc GraphQL `httpRequestsAdaptiveGroups` odpada |

### Które reguły ją złapały (05.11, razem 13 301)

| Reguła w workerze | Kliknięcia |
|---|---:|
| ścieżka referera bez końcowego ukośnika (łatka 12.10), w tym 867 z `?q=…` po `/wycofania` | 11 432 |
| referer `/idz/…` (łatka 12.10) | 1 664 |
| pusty referer, bez `Sec-Fetch-Site` (14–15.09) | 146 |
| strona główna + kraj spoza PL (łatka 02.11) | 59 |
| hub z innym numerem / `http://` / obcy referer | 0 |

**Bez łatki z 12.10 przeszłoby ok. 13 100 kliknięć, bez łatki z 02.11 jeszcze 59.**

### Porównanie z falą z 10.10

| | 10.10 | 05.11 |
|---|---:|---:|
| kliknięcia z refererem naszej domeny | 978 | 13 155 |
| przepuszczone jako „human” (do sieci) | **644** | **0** |
| różne zestawy | 311 | 2 204 |
| top referery | `/serie/marvel` 461, `/promocje-lego` 349, `/zestaw/11208`, `/idz/*/11208` | `/serie/marvel` 3 449, `/promocje-lego` 1 490, …, `/zestaw/11208`, `/idz/*/11208` |
| top kraje | BR 210, AR 102, CO 62, BD, MA, PK | BR 3 309, AR 1 318, BD 1 174, CO, PK, MA |
| top sklepy | Allegro, Empik, ME | Allegro, Empik, ME |
| pora (UTC) | 17–21, dwie godziny | cała doba, szczyt 10–14 |
| Performers (ME) | **59** | **0** |

Sygnatura jest identyczna: te same referery, w tym nietypowy zestaw 11208, te same kraje
i sklepy. Mniejsze nawroty były po drodze: 15.10 (742), 19.10, 23.10, 28.10, 02.11, 04.11.

**Hipoteza (nie sprawdzono, bo nie mamy UA ani ASN):** to crawler na rezydencyjnych
proxy, nie oszustwo wymierzone w nas. Jako referer ustawia adres strony, z której wziął
link, i normalizuje go bez końcowego ukośnika. Dlatego jedyny „poprawny” referer, jaki
wysyła, to strona główna (ścieżka `/`). Przechodzi po wszystkich linkach `/idz/`, jakie
znajdzie. Fala 27.10–02.11 z refererem strony głównej („sonda”) była tym samym ruchem.

### Czy doszło do sieci afiliacyjnych

05.11 **nie**. Wszystkie 13 301 odrzuceń dostały 302 na hub, żadne kliknięcie spoza
Polski nie przeszło jako „human”, a Performers ma tego dnia 0 kliknięć. Allegro,
Tradedoublera i Adtraction nie sprawdzałem, ale bot przechodzi do nich tą samą bramką,
co do ME. Do sieci trafiło natomiast ok. 57 kliknięć sondy w dniach 23.10–01.11, przed
łatką z 02.11 (Performers bez widocznego skoku).

## (c) Co zrobić

1. **Nie zmieniać reguł filtra.** Trzymają, a fałszywych trafień wśród Polaków prawie
   nie ma. Uwaga przy każdej przyszłej łatce: połowa prawdziwych kliknięć ma referer
   z query (`?utm_source=chatgpt.com`, `?q=cree`, `?rok=2026&dostepne=1`). Reguła
   odrzucająca query w refererze odcięłaby ChatGPT, najlepsze źródło ludzi.
2. **Zmienić alarm w raportach, nie filtr.** Liczba „bot” to szum, który rośnie z każdą
   falą i nie mówi o ryzyku. Ryzyko konta mierzą: (i) „human” spoza PL na dobę (alarm
   > 10), (ii) kliknięcia Performers kontra nasze „human” ME z PL. Ludzi z PL warto
   pokazywać w zrzucie dziennie, nie tylko w oknie 7 dni. Wtedy pik nie udaje spadku.
   Zmiana w `kliki-raport.mjs` i zrzutach Kontrolera, bez workera.
3. **Łatka diagnostyczna workera (do zgody Marka):** zapisywać user-agenta, ASN,
   operatora sieci i `Sec-Fetch-Site`, żeby następną falę dało się przypisać i w razie
   czego odciąć po ASN. Zachowanie przekierowań się nie zmienia, dochodzą tylko pola
   `blob7`–`blob10`, a stare zapytania działają bez zmian:

   ```diff
   --- a/src/worker.js
   +++ b/src/worker.js
   @@ const test = request.headers.has('x-tk-test');
          const test = request.headers.has('x-tk-test');
   +      // 06.11.2026 (fala 05.11, 13 301 odrzuceń, UA/ASN nieznane): diagnostyka
   +      // do Analytics Engine — blob7 user-agent, blob8 ASN, blob9 operator sieci,
   +      // blob10 Sec-Fetch-Site. Nie wpływa na przekierowanie.
   +      const ua = (request.headers.get('user-agent') ?? '').slice(0, 256);
   +      const asn = String(request.cf?.asn ?? '');
   +      const operator = String(request.cf?.asOrganization ?? '').slice(0, 96);
   @@
              blobs: [sklep, numer, cel ? 'ok' : 'brak-linku', referer, kraj,
   -                  test ? 'test' : zNaszejStrony ? 'human' : 'bot'],
   +                  test ? 'test' : zNaszejStrony ? 'human' : 'bot',
   +                  ua, asn, operator, secFetch],
   ```

   Po wdrożeniu: `SELECT blob8, blob9, SUM(_sample_interval) FROM idz_kliki WHERE blob6='bot' … GROUP BY blob8, blob9`.
   Nie są to dane osobowe w sensie IP (IP nie zapisujemy). User-agent przycinamy.
4. **Opcjonalnie, nie teraz:** podrobiony referer naszej domeny (`refererNasz &&
   !refererOk`) mógłby dostawać 403 zamiast 302 na hub. Bot nie pobierałby wtedy huba
   drugi raz. Zysk jest mały: 05.11 worker obsłużył 14 351 wywołań, daleko od limitu.
   Gdyby jednak fala urosła jeszcze kilkukrotnie, limit planu Workers stałby się realny.
   Planu konta nie sprawdzałem.
5. **Do sprawdzenia przy okazji:** kliknięcia „human” z USA 06.11 (07:26, 07:28, 11:56;
   Amazon, Ceneo, Planeta) wyglądają na nasze sesje audytowe. Jeśli tak, to złamana zasada
   „żaden audyt nie chodzi przez `/idz/`”. Seria crawlera z PL 27.10 (501) i 04.11 (85),
   z pustym refererem, wieczorami: źródła nie ustalono.
