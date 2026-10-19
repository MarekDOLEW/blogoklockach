# Cowork: codzienne „Poproś o zindeksowanie” (zadanie cykliczne)

Ustala Marek w aplikacji Cowork na swoim komputerze (sesja Code nie zakłada zadań
Coworka — tamte żyją lokalnie). **Założone 14.10.2026 jako „Kolejka GSC — zgłoszenia”, codziennie 10:24 (Europe/Warsaw), pierwszy przebieg 15.10, tryb automatycznego zatwierdzania, przypięte do komputera Marka.** Cowork dopisał jedno zabezpieczenie: przy prośbie o logowanie albo CAPTCHA zatrzymuje się i pisze, gdzie stanął. Komputer musi
być wtedy włączony, a Chrome zalogowany do konta Google z dostępem do Search Console
(logowanie do GitHuba niepotrzebne — repo jest publiczne). Listę na każdy dzień układa w nocy runner „Kolejka indeksacji
01:57” (`scripts/kolejka-indeksacji.mjs`, trigger `trig_01Gh6Payj9QVGDkrKXNzkbCX`). **Od 19.10.2026 (decyzja Marka) w poniedziałek pierwsze miejsca
w kolejce dostają huby działów z crawlem starszym niż 14 dni, oznaczone „ODŚWIEŻENIE” — są
w indeksie, więc GSC pokaże „jest w Google”, a prośbę i tak trzeba kliknąć.** Próba zmiany promptu
z API 19.10 (`update_trigger`) wróciła z `needs_device_approval` — **nic się nie zmieniło**: zadanie jest
przypięte do Maca Marka i prompt może zmienić tylko on, w aplikacji Claude Desktop na tym komputerze.
Do wklejenia jest wersja poniżej (z wyjątkiem „ODŚWIEŻENIE” w kroku 3). Bez tej zmiany poniedziałkowe
huby działów będą w kolejce, ale Cowork ich nie kliknie.

## Prompt do wklejenia w zadanie Coworka

```
Codzienne zgłoszenia do indeksu Google dla tylkoklocki.pl.

1. Otwórz w Chrome https://github.com/MarekDOLEW/blogoklockach/blob/main/materialy/indeksacja/kolejka.md
   i przeczytaj nagłówek z datą oraz listę „Adresy na dziś”. Jeśli data w nagłówku nie jest
   dzisiejsza — nic nie zgłaszaj, napisz „kolejka nieaktualna (data …)” i zakończ.
2. Otwórz https://search.google.com/search-console?resource_id=sc-domain%3Atylkoklocki.pl
3. Dla każdego adresu z listy, po kolei:
   - wklej adres w pole „Sprawdź dowolny URL” na górze i naciśnij Enter, poczekaj na wynik;
   - jeśli wynik mówi „Adres URL jest w Google” — nie klikaj nic, przejdź do następnego;
     WYJĄTEK: adres oznaczony w kolejce „ODŚWIEŻENIE” zgłaszaj zawsze, także gdy jest w Google
     (hub działu, którego Google nie odwiedził od tygodni — prośba wymusza nowy crawl);
   - w przeciwnym razie kliknij „Poproś o zindeksowanie” i poczekaj na komunikat
     „Poproszono o zindeksowanie” (do 2 minut), zamknij okno komunikatu;
   - gdy pojawi się „Przekroczono limit” — przerwij, reszta przyjdzie jutro.
4. Nic poza tym nie klikaj, niczego nie zmieniaj w ustawieniach, nie usuwaj adresów,
   nie zgłaszaj map witryny.
5. Na koniec jedna linijka: „Zgłoszone X z N; w indeksie już Y; limit na pozycji Z (albo: bez limitu)”.
```
