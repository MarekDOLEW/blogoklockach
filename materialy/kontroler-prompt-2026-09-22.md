# Prompt Kontrolera — wersja z 22.09.2026 (trwała sesja z repo)

Po co ten plik: Routine „Kontroler" odpalany od zera (z panelu) nie ma repozytorium
w źródłach sesji ani konektora `Claude_Code_Remote` — 21.09 wykonał cały raport
i nie mógł pushować. Panel nie daje pola na konektor (sprawdzone przez Marka
22.09), a API nie przyjmuje ani źródeł, ani konektorów. Rozwiązanie z 22.09:

- Kontroler chodzi jako **trwała sesja z repo** (jak Łowca) — push działa;
- krok „harmonogram z konta" (`list_triggers`) przejęła sesja Code przez własny
  Routine „LEGO pon 07:45 — Harmonogram z konta" (`trig_01GJ2ecMp3gwtkZ1pFyUPKLH`,
  przed Kontrolerem o 09:00); Kontroler czyta gotowe pliki z repo i nie woła API.

Trigger Kontrolera: `trig_01EDEhtPiW4AVSAiGg9Co1mx`, trwała sesja
`session_01M8qMJFfKHEozBSGXjAKP4n`; zmiana promptu = delete + create na tę samą
sesję. **Treść promptu jest wyłącznie w `materialy/routine-prompty.md`** (kopia
z konta, generowana co poniedziałek) — ten plik jej nie powtarza, bo kopia
trzymana tu ręcznie rozjechała się z kontem już pierwszego dnia.

