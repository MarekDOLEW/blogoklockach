#!/usr/bin/env python3
"""Logo tylkoklocki.pl: znak (granatowy klocek 2x2, żółte wypustki) + napis.

Napis jest złożony krojem Rubik ExtraBold i zamieniony na krzywe, więc pliki
nie zależą od fontu: logo wygląda tak samo w przeglądarce, w mailu i w Canvie.
Decyzja Marka 13.10.2026 — wariant „całe granatowe, tylko wypustki żółte".

Wyjście (SVG; rastry robi `node scripts/logo-rastry.mjs`):
  public/logo.svg          napis granatowy — jasne tło (nagłówek strony)
  public/logo-biale.svg    napis biały — granatowe tło (stopka)
  public/favicon.svg       sam znak
  assets/logo/og.svg               -> public/og.png (domyślny obraz OG)
  assets/logo/apple-touch-icon.svg -> public/apple-touch-icon.png
  assets/logo/logo-og-stopka.svg   -> assets/logo/logo-og-stopka.png (stopka OG artykułów)

Uruchamia człowiek na żądanie, gdy zmienia się logo:
    pip install -r requirements.txt
    python3 scripts/generuj-logo.py && node scripts/logo-rastry.mjs
"""
from pathlib import Path

try:
    import uharfbuzz as hb
    from fontTools.ttLib import TTFont
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    from fontTools.varLib.instancer import instantiateVariableFont
except ImportError:
    raise SystemExit("Brak fonttools/uharfbuzz. Zainstaluj: pip install -r requirements.txt")

REPO = Path(__file__).resolve().parent.parent
PUBLIC = REPO / "public"
ASSETS = REPO / "assets" / "logo"

# tokeny z src/styles/global.css (:root)
GRANAT, ZOLTY = "#17233f", "#ffc933"
GRANAT_JASNY = "#2c3a5c"   # obwódka znaku na granatowym tle, żeby się nie zlał

STUDS = [(29, 29), (71, 29), (29, 71), (71, 71)]
R = 15.5


def znak(x=0.0, y=0.0, s=1.0, pelny=False):
    """Klocek 2x2 z góry w układzie 100x100. pelny=True: kwadrat bez zaokrągleń
    (ikona iOS — system sam przycina narożniki)."""
    rx = 0 if pelny else 16
    el = [f'<rect width="100" height="100" rx="{rx}" fill="{GRANAT}"/>']
    for cx, cy in STUDS:
        el.append(f'<circle cx="{cx}" cy="{cy + 3.2}" r="{R}" fill="rgba(0,0,0,0.35)"/>')
        el.append(f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="{ZOLTY}"/>')
        el.append(f'<path d="M{cx - R * .62:.2f} {cy - R * .2:.2f}A{R * .66:.2f} {R * .66:.2f} 0 0 1 '
                  f'{cx + R * .2:.2f} {cy - R * .62:.2f}" fill="none" stroke="rgba(255,255,255,0.35)" '
                  f'stroke-width="2.6" stroke-linecap="round"/>')
    return f'<g transform="translate({x:.2f} {y:.2f}) scale({s:.4f})">{"".join(el)}</g>'


def _liczba(v):
    """Jedno miejsce po przecinku wystarcza (logo ma ~100 jednostek wysokości), a plik chudnie o połowę."""
    s = f"{v:.1f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


class Krój:
    def __init__(self, sciezka, osie=None):
        self.tt = TTFont(sciezka)
        if osie:
            instantiateVariableFont(self.tt, osie, inplace=True)
        self.upm = self.tt["head"].unitsPerEm
        self.gs = self.tt.getGlyphSet()
        self.kolejnosc = self.tt.getGlyphOrder()
        self.wys_k = self.tt["glyf"]["k"].yMax          # wydłużenie górne
        dane = Path(sciezka).read_bytes()
        if osie:
            from io import BytesIO
            buf = BytesIO(); self.tt.save(buf); dane = buf.getvalue()
        self.hb = hb.Font(hb.Face(dane))

    def krzywe(self, tekst, x, linia_bazowa, rozmiar, kolor, tracking=-0.01):
        """Tekst jako <path>; zwraca (svg, szerokość)."""
        b = hb.Buffer(); b.add_str(tekst); b.guess_segment_properties()
        hb.shape(self.hb, b, {"kern": True, "liga": False})
        sk = rozmiar / self.upm
        px, d = 0.0, []
        for info, poz in zip(b.glyph_infos, b.glyph_positions):
            pen = SVGPathPen(self.gs, ntos=_liczba)
            self.gs[self.kolejnosc[info.codepoint]].draw(
                TransformPen(pen, (sk, 0, 0, -sk, x + (px + poz.x_offset) * sk, linia_bazowa - poz.y_offset * sk)))
            d.append(pen.getCommands())
            px += poz.x_advance + tracking * self.upm
        szer = (px - tracking * self.upm) * sk
        return f'<path fill="{kolor}" d="{" ".join(d)}"/>', szer


RUBIK = Krój(REPO / "assets" / "fonts" / "Rubik-ExtraBold.ttf")


def logo(kolor_napisu, rozmiar=100.0, obwodka=False, x0=0.0, y0=0.0):
    """Znak + „tylkoklocki.pl". Zwraca (svg-elementy, szerokość, wysokość)."""
    asc = RUBIK.wys_k * rozmiar / RUBIK.upm
    hz = asc * 1.18                         # znak nieco wyższy od „k" i „l"
    s = hz / 100
    gap = hz * 0.26
    bazowa = y0 + hz - (hz - asc) / 2
    napis, w = RUBIK.krzywe("tylkoklocki.pl", x0 + hz + gap, bazowa, rozmiar, kolor_napisu)
    obw = (f'<rect x="{x0 - 1.5:.2f}" y="{y0 - 1.5:.2f}" width="{hz + 3:.2f}" height="{hz + 3:.2f}" '
           f'rx="{16 * s + 1.5:.2f}" fill="{GRANAT_JASNY}"/>') if obwodka else ""
    return obw + znak(x0, y0, s) + napis, hz + gap + w, hz


def svg(w, h, tresc, wymiary=True):
    wh = f' width="{w:.0f}" height="{h:.0f}"' if wymiary else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.2f} {h:.2f}"{wh}>{tresc}</svg>\n'


def zapisz(p, tresc):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(tresc, encoding="utf-8")
    print(f"{p.relative_to(REPO)}  {len(tresc.encode()) / 1024:.1f} KB")


def main():
    # 1. logo na stronę (margines 2 jednostki na obwódkę i cień wypustek)
    m = 2.0
    tresc, w, h = logo(GRANAT, x0=m, y0=m)
    zapisz(PUBLIC / "logo.svg", svg(w + 2 * m, h + 2 * m, tresc))
    tresc, w, h = logo("#ffffff", obwodka=True, x0=m, y0=m)
    zapisz(PUBLIC / "logo-biale.svg", svg(w + 2 * m, h + 2 * m, tresc))

    # 2. favicon i ikona iOS
    zapisz(PUBLIC / "favicon.svg", svg(100, 100, znak(), wymiary=False))
    zapisz(ASSETS / "apple-touch-icon.svg",
           svg(180, 180, f'<rect width="180" height="180" fill="{GRANAT}"/>' + znak(26, 26, 1.28, pelny=True)))

    # 3. domyślny obraz OG 1200x630: granat, żółta belka, logo i hasło
    W, H = 1200, 630
    rozm = 118.0
    _, w_logo, h_logo = logo("#ffffff", rozmiar=rozm)
    x0 = (W - w_logo) / 2
    y0 = 215
    tresc_logo, _, _ = logo("#ffffff", rozmiar=rozm, obwodka=True, x0=x0, y0=y0)
    archivo = Krój(REPO / "assets" / "fonts" / "Archivo-Variable.ttf", {"wght": 500, "wdth": 100})
    haslo = "Prawdziwe promocje LEGO — rabaty od cen katalogowych"
    _, w_h = archivo.krzywe(haslo, 0, 0, 34, "#cfd6e4", tracking=0)
    haslo_svg, _ = archivo.krzywe(haslo, (W - w_h) / 2, y0 + h_logo + 92, 34, "#cfd6e4", tracking=0)
    zapisz(ASSETS / "og.svg", svg(W, H,
           f'<rect width="{W}" height="{H}" fill="{GRANAT}"/><rect width="{W}" height="14" fill="{ZOLTY}"/>'
           + tresc_logo + haslo_svg))

    # 4. logo do stopki obrazów OG artykułów (scripts/generuj-og.py wkleja PNG)
    tresc, w, h = logo(GRANAT, rozmiar=40.0, x0=1, y0=1)
    zapisz(ASSETS / "logo-og-stopka.svg", svg(w + 2, h + 2, tresc))


if __name__ == "__main__":
    main()
