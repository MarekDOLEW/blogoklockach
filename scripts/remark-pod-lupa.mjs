// Znaczniki tekstów „Zestawy pod lupą” (brief Coworka `_SZABLON-I-ZASADY.md`,
// 30.10.2026) – markdown przychodzi od Coworka w ustalonym formacie i ma działać
// bez ręcznej przeróbki:
//
//   [moduł ceny: cena-pod-lupa, set 75389]   – moduł ceny renderuje layout
//                                              (Artykul.astro → CenaPodLupa) z frontmattera;
//                                              akapit ze znacznikiem znika z treści
//   [tabela: ceny-setu, set 75389]           – zamienia się w znacznik tabeli cen
//                                              <div class="ceny-setu" data-set="75389"></div>,
//                                              który renderuje remark-ceny (ten plugin
//                                              musi więc stać PRZED remarkCeny w astro.config)
//   ## Do weryfikacji (wewnętrzne, nie publikować) – sekcja do końca pliku (wraz
//                                              z linią `---` nad nią) nie trafia na stronę.
//                                              Importer (scripts/import-pod-lupa.mjs) wycina
//                                              ją już przy wgrywaniu; tu zostaje siatka
//                                              bezpieczeństwa.

const MODUL = /^\[moduł ceny:\s*cena-pod-lupa,\s*set\s+\d{4,7}\]$/u;
const TABELA = /^\[tabela:\s*ceny-setu,\s*set\s+(\d{4,7}(?:\s*,\s*\d{4,7})*)\]$/u;
const DO_WERYFIKACJI = /^do weryfikacji/iu;

const tekstAkapitu = (wezel) =>
  wezel.type === 'paragraph' && wezel.children?.length === 1 && wezel.children[0].type === 'text'
    ? wezel.children[0].value.trim()
    : null;

const tekstNaglowka = (wezel) =>
  wezel.type === 'heading' ? (wezel.children ?? []).map((d) => d.value ?? '').join('').trim() : null;

export default function remarkPodLupa() {
  return (drzewo) => {
    const dzieci = drzewo.children ?? [];
    // 1. sekcja wewnętrzna: od nagłówka „Do weryfikacji” do końca dokumentu
    const odcieciePoz = dzieci.findIndex((w) => DO_WERYFIKACJI.test(tekstNaglowka(w) ?? ''));
    if (odcieciePoz >= 0) {
      let od = odcieciePoz;
      if (od > 0 && dzieci[od - 1].type === 'thematicBreak') od -= 1;
      dzieci.splice(od);
    }
    // 2. znaczniki modułu i tabeli
    for (let i = dzieci.length - 1; i >= 0; i -= 1) {
      const t = tekstAkapitu(dzieci[i]);
      if (t === null) continue;
      if (MODUL.test(t)) {
        dzieci.splice(i, 1);
        continue;
      }
      const m = TABELA.exec(t);
      if (m) dzieci[i] = { type: 'html', value: `<div class="ceny-setu" data-set="${m[1].replace(/\s+/g, '')}"></div>` };
    }
  };
}
