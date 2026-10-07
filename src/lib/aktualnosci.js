// Aktualności (kategoria od 27.09.2026, decyzja Marka): krótkie teksty o akcjach
// sklepów i kampaniach z datą — Dzień Chłopaka w x-kom, Allegro Black Weeks itp.
// Na stronie głównej stoją zaraz pod slajderem deali, w dwóch kolumnach zamiast
// trzech, żeby czytelnik widział, że to ważniejsze niż zwykłe teksty.
//
// Tekst jest aktualnością, gdy ma `kategoria: "Aktualności"` — niezależnie od
// katalogu. Dzień Chłopaka został pod /deale/ (adres już żył w Google i w mailach),
// nowe aktualności piszemy w src/pages/artykuly/.
//
// Pola frontmattera ważne dla aktualności:
//   okladka   — obowiązkowa (numer zestawu albo /img/…); pilnuje tego
//               scripts/sprawdz-kategorie.mjs, bo karta bez zdjęcia jest pusta;
//   wazne_do  — opcjonalnie RRRR-MM-DD: koniec akcji sklepu. Karta pokazuje
//               „trwa do …", a po tej dacie „akcja zakończona" i spada na koniec
//               kolejności.

import { zajawkaArtykulu } from './artykuly.js';
import { dataPl } from './daty.js';

export const KATEGORIA_AKTUALNOSCI = 'Aktualności';

const moduly = {
  ...import.meta.glob('../pages/artykuly/*.md', { eager: true }),
  ...import.meta.glob('../pages/deale/*.md', { eager: true }),
  ...import.meta.glob('../pages/*.md', { eager: true }),
};

const dzisIso = new Date().toISOString().slice(0, 10);
const MIESIACE = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
/** „2026-09-30" -> „30 września" */
const dzienMiesiac = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? ''));
  return m ? `${Number(m[3])} ${MIESIACE[Number(m[2]) - 1]}` : String(iso ?? '');
};

/** Czy moduł markdownu jest aktualnością. */
export const jestAktualnoscia = (m) => m?.frontmatter?.kategoria === KATEGORIA_AKTUALNOSCI;

/**
 * Wszystkie aktualności jako zajawki: najpierw trwające i bez daty końca
 * (najnowsze u góry), na końcu zakończone akcje.
 */
export function aktualnosci() {
  return Object.values(moduly)
    .filter(jestAktualnoscia)
    .map((m) => {
      const z = zajawkaArtykulu(m);
      const wazneDo = m.frontmatter.wazne_do ? String(m.frontmatter.wazne_do) : null;
      return {
        ...z,
        dataTekst: dataPl(z.data),
        wazneDo,
        wazneDoTekst: wazneDo ? dzienMiesiac(wazneDo) : null,
        zakonczona: Boolean(wazneDo && wazneDo < dzisIso),
      };
    })
    .sort((a, b) => Number(a.zakonczona) - Number(b.zakonczona) || String(b.data).localeCompare(String(a.data)));
}
