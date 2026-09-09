// Indeks sitemap – adres wpisany w public/robots.txt i zgłoszony w Search Console.
// Do 09.09.2026 generowała go integracja @astrojs/sitemap (jeden plik
// sitemap-0.xml bez lastmod); teraz wskazuje sitemapy sekcyjne
// (src/lib/sitemapy.js). Osobna /sitemap-priorytet.xml zostaje bez zmian.
import { indeksXml, odpowiedzXml } from '../lib/sitemapy.js';

export function GET() {
  return odpowiedzXml(indeksXml());
}
