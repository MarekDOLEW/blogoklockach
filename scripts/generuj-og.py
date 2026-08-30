#!/usr/bin/env python3
"""Generuje obrazy OG dla artykułów i prezentowników: public/og/<slug>.png.

Po co: artykuły (`src/pages/artykuly/*.md`) i prezentowniki
(`src/pages/prezentowniki/*`) renderują się przez Artykul.astro albo
PrezentownikSerii.astro, a żaden z tych layoutów nie podaje `ogImage`. Wpadają
więc na domyślkę z Base.astro (`/og.png`) — wklejenie na Facebooku recenzji
zamku i rankingu kalendarzy adwentowych daje identyczną miniaturę z logo.

Strony zestawów `/zestaw/<nr>/` **są już obsłużone** i ten skrypt ich nie
dotyka: linia 139 w `src/pages/zestaw/[nr].astro` podaje `ogImage={foto?.url}`,
czyli zdjęcie produktowe przez trasę /img/. Poza tym hubów jest ~4870, więc
komplet obrazów ważyłby dziesiątki megabajtów.

Dwie decyzje projektowe, obie wymuszone regułami repo:

1. **Bez zdjęcia produktowego.** Zdjęcia w obrazy.json to hotlinki do cudzych
   CDN-ów (rebrickable, allegroimg). Worker serwuje je jako cache-proxy — to co
   innego niż wypalenie cudzej fotografii w plik, który sami publikujemy
   bezterminowo. Szablon jest typograficzny, co trafia w system „Instrukcja":
   komentarz w global.css nazywa fotografię produktową podejściem konkurencji.

2. **Bez ceny i bez plakietki rabatu.** CLAUDE.md wymaga „trwałej drabiny
   cenowej zamiast datowanego snapshotu cen", a obraz OG jest najgorszym
   miejscem na snapshot: Facebook trzyma go w cache do następnego
   przeskanowania, więc „-30%" wypalone dzisiaj wisi tam miesiącami po końcu
   promocji. To byłaby pseudopromocja, której zakazuje standard sprzedażowy.

Użycie:
    python3 scripts/generuj-og.py                  # wszystkie artykuły i prezentowniki
    python3 scripts/generuj-og.py --limit 3        # próbka do obejrzenia
    python3 scripts/generuj-og.py --wyjscie /tmp/x # inny katalog docelowy

Wymaga Pillow (requirements.txt) — pierwsza zależność pythonowa w repo.
Uruchamiamy ręcznie po dodaniu tekstu; wynik commitujemy, żeby build na
Cloudflare nie potrzebował Pythona.
"""

import argparse
import re
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Brak Pillow. Zainstaluj: pip install -r requirements.txt")

REPO = Path(__file__).resolve().parent.parent
FONT = REPO / "assets" / "fonts" / "Archivo-Variable.ttf"

# Tokeny z src/styles/global.css (:root). Źródłem prawdy jest CSS —
# opis systemu i reguły użycia: redakcja/system-wizualny.md.
PAPIER = (0xF6, 0xF7, 0xF9)
KARTA = (0xFF, 0xFF, 0xFF)
GRANAT = (0x17, 0x23, 0x3F)
GRANAT60 = (0x4A, 0x56, 0x70)
ZOLTY = (0xFF, 0xC9, 0x33)
CZERWIEN = (0xE0, 0x31, 0x2F)
LINIA = (0xDD, 0xE1, 0xE8)

W, H = 1200, 630
MARGINES = 72


def krój(rozmiar, waga="Bold"):
    """Archivo to font zmienny — domyślna waga na osi wght to 600, nie 400.
    Bez jawnego ustawienia dostalibyśmy SemiBold zamiast Bold i obraz
    rozjechałby się typograficznie ze stroną."""
    f = ImageFont.truetype(str(FONT), rozmiar)
    f.set_variation_by_name(waga)
    return f


def szer(d, tekst, font):
    return d.textbbox((0, 0), tekst, font=font)[2]


def zawin(d, tekst, font, maks_szer, maks_linii=2):
    """Łamie tekst na słowach. Ostatnią linię ucina wielokropkiem."""
    slowa, linie, biezaca = tekst.split(), [], ""
    for s in slowa:
        próba = f"{biezaca} {s}".strip()
        if szer(d, próba, font) <= maks_szer:
            biezaca = próba
        else:
            if biezaca:
                linie.append(biezaca)
            biezaca = s
            if len(linie) == maks_linii:
                break
    if biezaca and len(linie) < maks_linii:
        linie.append(biezaca)
    if len(linie) == maks_linii and len(" ".join(linie)) < len(tekst):
        ostatnia = linie[-1]
        while ostatnia and szer(d, ostatnia + "…", font) > maks_szer:
            ostatnia = ostatnia[:-1].rstrip()
        linie[-1] = ostatnia + "…"
    return linie


def wypustki(d, x, y, r=13, odstep=34, kolor=ZOLTY):
    """Sygnatura marki: cztery wypustki klocka w siatce 2x2.
    Wewnętrzny cień u dołu daje wrażenie plastiku, nie płaskiej kropki
    (odpowiednik `inset 0 -2px 0` z .studs w global.css)."""
    for dx, dy in ((0, 0), (odstep, 0), (0, odstep), (odstep, odstep)):
        cx, cy = x + dx, y + dy
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=kolor)
        d.arc([cx - r, cy - r, cx + r, cy + r], start=20, end=160,
              fill=(0xD9, 0xA6, 0x1F), width=3)


def plakietka(d, x, y, tekst, font, tlo=KARTA, ramka=LINIA, tekst_kolor=GRANAT60):
    """Pigułka jak .badge-seria: promień 999px, obrys, tekst drugorzędny."""
    pad_x, pad_y = 16, 9
    w = szer(d, tekst, font)
    wys = d.textbbox((0, 0), "Ag", font=font)[3]
    d.rounded_rectangle([x, y, x + w + 2 * pad_x, y + wys + 2 * pad_y],
                        radius=999, fill=tlo, outline=ramka, width=2)
    d.text((x + pad_x, y + pad_y), tekst, font=font, fill=tekst_kolor)
    return x + w + 2 * pad_x




# ── odczyt stron ──────────────────────────────────────────────────────────

def frontmatter_md(sciezka):
    """Wyciąga title i kategorię z frontmatteru .md. Bez parsera YAML —
    interesują nas dwa pola skalarne, a repo nie ma zależności na PyYAML."""
    tekst = sciezka.read_text(encoding="utf-8")
    if not tekst.startswith("---"):
        return None
    blok = tekst.split("---", 2)[1]
    pola = {}
    for linia in blok.splitlines():
        m = re.match(r'^(title|kategoria):\s*"?(.*?)"?\s*$', linia)
        if m:
            pola[m.group(1)] = m.group(2)
    return pola if pola.get("title") else None


def frontmatter_astro(sciezka):
    """Prezentowniki .astro trzymają tytuł w atrybucie `title="..."` przy
    <PrezentownikSerii>, a kategorię w obiekcie na górze pliku."""
    tekst = sciezka.read_text(encoding="utf-8")
    t = re.search(r'\btitle=\s*"([^"]+)"', tekst)
    k = re.search(r"\bkategoria:\s*'([^']+)'", tekst) or \
        re.search(r'\bkategoria:\s*"([^"]+)"', tekst)
    return {"title": t.group(1), "kategoria": k.group(1) if k else "Prezentownik"} if t else None


def zbierz_strony():
    """Zwraca [(slug, {title, kategoria}), ...] dla artykułów i prezentowników."""
    out = []
    for katalog, domyslna in (("artykuly", "Artykuł"), ("prezentowniki", "Prezentownik")):
        for p in sorted((REPO / "src" / "pages" / katalog).glob("*")):
            if p.name.startswith("index."):
                continue
            pola = frontmatter_md(p) if p.suffix == ".md" else (
                frontmatter_astro(p) if p.suffix == ".astro" else None)
            if not pola:
                continue
            pola.setdefault("kategoria", domyslna)
            out.append((p.stem, pola))
    return out


# ── szablon ───────────────────────────────────────────────────────────────

def obraz_strony(pola):
    im = Image.new("RGB", (W, H), PAPIER)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 14], fill=ZOLTY)  # belka marki, ciągłość z og.png

    f_kat = krój(26, "Bold")
    f_tytul = krój(60, "ExtraBold")
    f_logo = krój(30, "ExtraBold")

    stopka = H - 108
    # Tytuł jest tu treścią, nie podpisem — dostaje najwięcej miejsca i schodzi
    # o stopień, gdy nie mieści się w czterech liniach. Kadr trzyma stałą
    # stopkę, więc blok tytułu rośnie w dół od plakietki, nie odwrotnie.
    szerokosc = W - 2 * MARGINES
    for rozmiar in (60, 54, 48):
        f_tytul = krój(rozmiar, "ExtraBold")
        linie = zawin(d, pola["title"], f_tytul, szerokosc, 4)
        if len(linie) <= 3 or rozmiar == 48:
            break
    interlinia = int(rozmiar * 1.18)

    # plakietka kategorii — granat na żółtym (biały na żółtym to 1,54:1, zakaz)
    plakietka(d, MARGINES, 66, pola["kategoria"].upper(), f_kat,
              tlo=ZOLTY, ramka=ZOLTY, tekst_kolor=GRANAT)

    y = 150
    for linia in linie:
        d.text((MARGINES, y), linia, font=f_tytul, fill=GRANAT)
        y += interlinia

    d.line([MARGINES, stopka, W - MARGINES, stopka], fill=LINIA, width=2)

    # marka w stopce: logo z czerwonym „klocki" na białej płytce (jak og.png)
    logo_y = stopka + 34
    c1, c2, c3 = "tylko", "klocki", ".pl"
    w1, w2, w3 = (szer(d, c, f_logo) for c in (c1, c2, c3))
    wys = d.textbbox((0, 0), "Ag", font=f_logo)[3]
    d.text((MARGINES, logo_y), c1, font=f_logo, fill=GRANAT)
    d.rounded_rectangle([MARGINES + w1 + 2, logo_y - 6,
                         MARGINES + w1 + w2 + 14, logo_y + wys + 6],
                        radius=6, fill=KARTA, outline=LINIA, width=2)
    d.text((MARGINES + w1 + 8, logo_y), c2, font=f_logo, fill=CZERWIEN)
    d.text((MARGINES + w1 + w2 + 16, logo_y), c3, font=f_logo, fill=GRANAT)

    # jedna sygnatura na kadr (redakcja/system-wizualny.md)
    wypustki(d, W - MARGINES - 46, stopka + 36, r=16, odstep=42)
    return im


def main():
    ap = argparse.ArgumentParser(description="Obrazy OG artykułów i prezentowników.")
    ap.add_argument("--limit", type=int, help="ogranicz liczbę (próbka)")
    ap.add_argument("--wyjscie", default=None, help="katalog docelowy")
    a = ap.parse_args()

    if not FONT.exists():
        sys.exit(f"Brak kroju: {FONT}")

    strony = zbierz_strony()
    if a.limit:
        strony = strony[: a.limit]

    kat = Path(a.wyjscie) if a.wyjscie else REPO / "public" / "og"
    kat.mkdir(parents=True, exist_ok=True)

    for slug, pola in strony:
        # PNG w palecie: szablon ma kilka płaskich kolorów, więc kwantyzacja
        # jest bezstratna wizualnie i tnie wagę pliku kilkukrotnie.
        obraz_strony(pola).quantize(colors=64, method=Image.MEDIANCUT).save(
            kat / f"{slug}.png", optimize=True)

    waga = sum(p.stat().st_size for p in kat.glob("*.png"))
    print(f"OG: {len(strony)} obrazów -> {kat}")
    print(f"Razem {waga / 1024:.0f} KB, średnio {waga / max(len(strony), 1) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
