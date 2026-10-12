// Dane strukturalne listingów (audyt 12.10.2026: /artykuly/, /nowosci/, /serie/
// i pięć innych działów nie miało żadnego JSON-LD, nawet okruszków — huby, artykuły
// i miesiące nowości miały). Jedno miejsce, żeby siedem stron składało to samo:
// BreadcrumbList (Strona główna → dział) + CollectionPage z listą pozycji.
//
// `pozycje` – [{ nazwa, url }] (url względny albo pełny); bierzemy najwyżej 50,
// bo ItemList ma pokazać, co jest na stronie, a nie powielać sitemapy.

export function jsonldListingu({ site, nazwa, sciezka, opis, pozycje = [] }) {
  const pelny = (u) => new URL(u, site).href;
  const lista = pozycje.filter((p) => p?.url && p?.nazwa).slice(0, 50);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Strona główna', item: pelny('/') },
          { '@type': 'ListItem', position: 2, name: nazwa, item: pelny(sciezka) },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: nazwa,
        url: pelny(sciezka),
        ...(opis ? { description: opis } : {}),
        inLanguage: 'pl-PL',
        ...(lista.length
          ? {
              mainEntity: {
                '@type': 'ItemList',
                numberOfItems: lista.length,
                itemListElement: lista.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.nazwa, url: pelny(p.url) })),
              },
            }
          : {}),
      },
    ],
  };
}
