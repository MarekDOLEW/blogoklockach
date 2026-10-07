// Adres docelowy sklepu ukryty w linku trackingowym — wspólny dla
// scripts/kontrola-linkow.mjs i scripts/sprawdz-oferte.mjs.
//
// Po co osobny plik: oba skrypty muszą sprawdzać kod HTTP karty produktu, a NIE
// wolno im odpytywać samego trackingu (pdt./clk.tradedoubler.com, webep1.com,
// track.performers.tech, allegro.pl/affiliate) — każde takie wejście to
// zarejestrowany klik w sieci afiliacyjnej, sztucznie nabity, bez człowieka.
// Trzymanie tej logiki w jednym miejscu gwarantuje, że obie ścieżki robią to
// tak samo i że poprawka formatu jednej sieci nie ominie drugiego skryptu.

const dekoduj = (s) => { try { return decodeURIComponent(s); } catch { return s; } };

/** Adres karty produktu w sklepie albo null. Każda sieć pakuje go inaczej. */
export function celLinku(link) {
  if (!link) return null;
  // Tradedoubler productUrl: …ttid(3)url(https%3A%2F%2F…)
  const wNawiasie = /\burl\((.+)\)\s*$/.exec(link);
  if (wNawiasie) return dekoduj(wNawiasie[1]);
  // Tradedoubler deeplink i Adtraction/Performers: &url=…
  const param = /[?&]url=([^&]+)/.exec(link);
  if (param) return dekoduj(param[1]);
  // Allegro: ?redirect_url=… (bez kodowania)
  const allegro = /[?&]redirect_url=([^&]+)/.exec(link);
  if (allegro) return dekoduj(allegro[1]);
  // webePartners (Planeta Klocków): &r=<base64 adresu>
  const base64 = /[?&]r=([A-Za-z0-9_-]+=*)/.exec(link);
  if (base64) {
    try {
      const adres = Buffer.from(base64[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
      if (/^https?:\/\//.test(adres)) return adres;
    } catch { /* nie base64 — spada niżej */ }
  }
  // Link bezpośredni (lego.com, smyk.com, x-kom.pl)
  return /^https?:\/\//.test(link) ? link : null;
}

/** Sklepy, które odrzucają każde zapytanie serwerowe (zmierzone 18.09.2026). */
export const SKLEPY_BLOKUJACE = new Set(['allegro', 'empik', 'mediaexpert', 'lego']);

/** UA przeglądarki: z UA bota Empik odpowiadał 403, z tym odpowiada 200. */
export const UA_PRZEGLADARKI =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
