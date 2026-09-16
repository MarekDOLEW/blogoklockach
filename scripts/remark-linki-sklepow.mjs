// Linki do sklepów i Ceneo (`/idz/<sklep>/<nr>`) wpisane ręcznie w markdownie
// dostają przy budowaniu `target="_blank"` i `rel` z `noopener` — tak samo jak
// anchory z szablonów (TabelaCen, remark-ceny…). Decyzja Marka 16.09.2026:
// sklep otwiera się w nowej karcie, czytelnik zostaje u nas.
//
// Obsługuje węzły `link` (składnia [tekst](/idz/…)) i surowy HTML z `<a href="/idz/…">`.
// Delegacja kliknięcia w Base.astro robi to samo w przeglądarce, ale roboty i
// czytelnicy bez JS dostają atrybuty wprost z HTML. Nigdy `noreferrer` — filtr
// botów na /idz/ rozpoznaje klik z naszej strony po refererze.

const IDZ = /^\/idz\//;
const REL_DOMYSLNY = 'sponsored nofollow noopener';

function dopelnijRel(rel) {
  const czesci = new Set(String(rel ?? '').split(/\s+/).filter(Boolean));
  if (!czesci.size) return REL_DOMYSLNY;
  czesci.add('noopener');
  czesci.delete('noreferrer');
  return [...czesci].join(' ');
}

function odwiedz(node, fn) {
  fn(node);
  for (const dziecko of node.children ?? []) odwiedz(dziecko, fn);
}

export default function remarkLinkiSklepow() {
  return (tree) => {
    odwiedz(tree, (node) => {
      if (node.type === 'link' && IDZ.test(node.url ?? '')) {
        node.data ??= {};
        node.data.hProperties = { ...(node.data.hProperties ?? {}), target: '_blank', rel: dopelnijRel(node.data.hProperties?.rel) };
      }
      if (node.type === 'html' && /<a\s[^>]*href="\/idz\//.test(node.value ?? '')) {
        node.value = node.value.replace(/<a\s([^>]*href="\/idz\/[^"]*"[^>]*)>/g, (m, atr) => {
          let a = atr.replace(/\s*target="[^"]*"/, '');
          const relM = /\srel="([^"]*)"/.exec(a);
          const rel = dopelnijRel(relM ? relM[1] : '');
          a = relM ? a.replace(relM[0], ` rel="${rel}"`) : `${a} rel="${rel}"`;
          return `<a ${a} target="_blank">`;
        });
      }
    });
  };
}
