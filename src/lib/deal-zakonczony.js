// Czy post dealowy (/deale/<slug>/) jest już zakończony — decyzja Marka 06.11.2026 (D12, audyt 06.11).
//
// Search Console 06.11: cała sekcja /deale/ w „Strona wykryta – obecnie niezindeksowana”. Zakończone
// akcje i stare minima nie są warte budżetu crawla, a ich tytuły z dawnymi cenami („Grogu za 319 zł”)
// mylą. Zakończony deal dostaje noindex (zostaje dla czytelników i linków) i wypada z sitemap-deale.xml.
//
// Reguła: `wazne_do` (RRRR-MM-DD) — po tym dniu; bez `wazne_do` — 14 dni od `data` publikacji
// (ta sama granica co sito ofert MAX_WIEK_OFERTY_DNI i archiwizacja okazji w social). Deal, który
// ma żyć dłużej (np. kalendarze adwentowe do Wigilii), dostaje jawne `wazne_do`.

export const DNI_DEALU = 14;

export function dealZakonczony({ data, wazne_do: wazneDo } = {}, dzis = new Date().toISOString().slice(0, 10)) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(wazneDo ?? ''))) return String(wazneDo) < dzis;
  if (!/^\d{4}-\d{2}-\d{2}/.test(String(data ?? ''))) return false;
  return (Date.parse(dzis) - Date.parse(String(data).slice(0, 10))) / 864e5 > DNI_DEALU;
}
