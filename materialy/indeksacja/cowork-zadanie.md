# Cowork: codzienne „Poproś o zindeksowanie” (zadanie cykliczne)

Ustala Marek w aplikacji Cowork na swoim komputerze (sesja Code nie zakłada zadań
Coworka — tamte żyją lokalnie). Proponowana pora: **codziennie 10:00**. Komputer musi
być wtedy włączony, a Chrome zalogowany do konta Google z dostępem do Search Console
(logowanie do GitHuba niepotrzebne — repo jest publiczne). Listę na każdy dzień układa w nocy runner „Kolejka indeksacji
01:57” (`scripts/kolejka-indeksacji.mjs`, trigger `trig_01Gh6Payj9QVGDkrKXNzkbCX`).

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
   - w przeciwnym razie kliknij „Poproś o zindeksowanie” i poczekaj na komunikat
     „Poproszono o zindeksowanie” (do 2 minut), zamknij okno komunikatu;
   - gdy pojawi się „Przekroczono limit” — przerwij, reszta przyjdzie jutro.
4. Nic poza tym nie klikaj, niczego nie zmieniaj w ustawieniach, nie usuwaj adresów,
   nie zgłaszaj map witryny.
5. Na koniec jedna linijka: „Zgłoszone X z N; w indeksie już Y; limit na pozycji Z (albo: bez limitu)”.
```
