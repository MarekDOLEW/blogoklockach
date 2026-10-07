// Sitemapa sekcji „inne" – lista i lastmod: src/lib/sitemapy.js.
import { odpowiedzXml, urlsetXml, wpisySekcji } from '../lib/sitemapy.js';

export function GET() {
  return odpowiedzXml(urlsetXml(wpisySekcji('inne')));
}
