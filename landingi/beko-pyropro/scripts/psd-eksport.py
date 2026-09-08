#!/usr/bin/env python3
"""Eksport warstw z layout/Beko_Pyroliza_LP_2026.psd (rozpakowanego z .psd.zip)
do img/src/ jako PNG z przezroczystością / JPG. Wymaga: pip install psd-tools pillow.
Użycie: python3 scripts/psd-eksport.py [ścieżka.psd]
Zastępuje cięcie z JPG (scripts/tnij-layout.mjs) – zdjęcia hero i sekcji końcowej
są tu bez wypalonych tekstów, wycinki mają prawdziwą alfę zamiast kluczowania koloru."""
import sys, os, glob, json
from psd_tools import PSDImage
from PIL import Image

PSD = sys.argv[1] if len(sys.argv) > 1 else 'layout/Beko_Pyroliza_LP_2026.psd'
OUT = 'img/src/'
psd = PSDImage.open(PSD)
os.makedirs(OUT, exist_ok=True)

def find(path):
    node = psd
    for p in path:
        name, _, idx = p.partition('#'); idx = int(idx) if idx else 0
        kids = [l for l in node if l.name.startswith(name)]
        node = kids[idx]
    return node

def crop_doc(im, bb, crop):
    L, T, R, B = crop
    return im.crop((L - bb[0], T - bb[1], R - bb[0], B - bb[1])), (L, T, R, B)

def key_color(im, rgb, t1=18, t2=60):
    """alfa z odległości od koloru tła (płaskie tło -> przezroczystość)"""
    im = im.convert('RGBA'); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            d = ((r - rgb[0]) ** 2 + (g - rgb[1]) ** 2 + (b - rgb[2]) ** 2) ** .5
            k = min(1, max(0, (d - t1) / (t2 - t1)))
            px[x, y] = (r, g, b, int(a * k))
    return im

eksport = {
  'hero':               (['header', 'Hue/Saturation 5'], (0, 0, 1400, 700), 'jpg'),
  'final':              (['lifestyle', 'Hue/Saturation 10'], (0, 7935, 1400, 8696), 'jpg'),
  'logo-beko':          (['header', 'Vector Smart Object'], None, 'png'),
  'rekawica-intro':     (['header', 'inne ułożenie palców'], (0, 764, 244, 1232), 'png'),
  'balon':              (['header', 'mama z corka'], None, 'png'),
  'ikona-tarcza':       (['bezszorowania', 'Vector Smart Object'], None, 'png'),
  'ikona-zegar':        (['Szuybko', 'oszczedzam', 'Vector Smart Object'], None, 'png'),
  'ikona-skarbonka':    (['oszczedzaj', 'oszczedzam', 'Vector Smart Object'], None, 'png'),
  'wideo-plakat':       (['Beko_Spot_PyroPRO_2026_technologiczny'], None, 'jpg'),
  'ikona-pizza':        (['ikonka Pizza', 'BEKO_Pyszna pizza'], None, 'png'),
  'ikona-wifi':         (['ikonka Pizza copy 2', 'Vector Smart Object'], None, 'png'),
  'produkt-1':          (['Gdzie kupić', 'original'], None, 'png'),
  'produkt-2':          (['Gdzie kupić', '7768287668_MDM2_LOW_1'], None, 'png'),
  'produkt-3':          (['Gdzie kupić', 'original (70)'], None, 'png'),
  'produkt-4':          (['Gdzie kupić', 'original (71)'], None, 'png'),
  'stopka-pas':         (['Gdzie kupić', 'stopka', 'Layer 13'], None, 'jpg'),
  'rekawica-lewa':      (['Hue/Saturation 8'], (0, 4683, 244, 5163), 'png'),
  'rekawica-prawa':     (['Hue/Saturation 7'], (1107, 4895, 1400, 5400), 'png'),
  'piekarnik-zawieszka':(['Layer 14'], (364, 4764, 1045, 5225), 'jpg'),
  'ciastka':            (['ciasteczka widok z góry'], (245, 5315, 485, 5445), 'jpg'),
  'homewhiz-telefon':   (['dodatkowe technologie', 'HomeWhiz', 'Grupa 7'], (779, 6075, 1093, 6497), 'png'),
  'homewhiz-logo':      (['dodatkowe technologie', 'HomeWhiz', 'Inteligentny obiekt wektorowy'], None, 'png'),
  'aeroperfect':        (['dodatkowe technologie', 'ProSmart', 'AeroPerfect#1'], None, 'jpg'),
  'ikona-skarbonka-piorun': (['dodatkowe technologie', 'Vector Smart Object'], None, 'png'),
  'pizza':              (['dodatkowe technologie', 'ProSmart#1', 'Layer 15'], None, 'png'),
}

# wyczyść stare źródła
for f in glob.glob(OUT + '*'):
    if not f.endswith(('skarbonka-rekawica.png', 'agd.png', 'laur.png', 'beko-state-of-mind.png')):
        os.remove(f)

meta = {}
for nazwa, (path, crop, fmt) in eksport.items():
    l = find(path)
    im = l.composite(); bb = l.bbox
    if crop: im, bb = crop_doc(im, bb, crop)
    if fmt == 'jpg':
        tlo = Image.new('RGB', im.size, (1, 34, 79)); tlo.paste(im, mask=im.split()[3]); tlo.save(f'{OUT}{nazwa}.jpg', quality=95)
    else:
        im.save(f'{OUT}{nazwa}.png')
    meta[nazwa] = {'bbox': bb, 'size': im.size}
    print(f'{nazwa}: {bb} {im.size}')

# UWAGA: grupa 'swinka' ma warstwę z trybem mieszania, którego psd-tools nie odtwarza (jasna poświata);
# skarbonka-rekawica.png pochodzi z kluczowania koloru w scripts/tnij-layout.mjs.
# minutnik: zdjęcie na płaskim tle #03305a + ściereczka z alfą -> jeden PNG z przezroczystością
m = find(['minutnik2', 'Firefly_Gemini Flash#1']); mi = m.composite(); mb = m.bbox
s = find(['sciereczka']); si = s.composite(); sb = s.bbox
mi = key_color(mi, (3, 48, 90), 14, 55)
mi.alpha_composite(si, (sb[0] - mb[0], sb[1] - mb[1]))
mi = mi.crop((0, 0, 600, mi.size[1]))  # do x=635 (tekst zaczyna się przy 655)
mi.save(f'{OUT}minutnik.png'); meta['minutnik'] = {'bbox': (mb[0], mb[1], mb[0] + 600, mb[3]), 'size': mi.size}
print('minutnik:', meta['minutnik'])

# kadry mobilne (pionowe) z czystych zdjęć
Image.open(f'{OUT}hero.jpg').crop((300, 0, 1400, 700)).save(f'{OUT}hero-mobile.jpg', quality=92)
Image.open(f'{OUT}final.jpg').crop((150, 0, 1150, 761)).save(f'{OUT}final-mobile.jpg', quality=92)
json.dump(meta, open('layout/warstwy-meta.json', 'w'), indent=1, ensure_ascii=False)
print('OK ->', OUT)
