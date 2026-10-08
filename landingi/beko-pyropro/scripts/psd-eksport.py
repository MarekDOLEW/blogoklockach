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
  'skarbonka-rekawica': (['swinka', 'Layer 6'], None, 'png'),   # Layer 5 to cień w trybie multiply (poświata w eksporcie)
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
  'piekarnik-zawieszka':(['Layer 14'], (364, 4764, 1030, 5217), 'jpg'),   # do krawędzi korpusu (bez tła warstwy)
  'ciastka':            (['ciasteczka widok z góry'], (245, 5315, 485, 5445), 'jpg'),
  'homewhiz-telefon':   (['dodatkowe technologie', 'HomeWhiz', 'Grupa 7'], (779, 6075, 1093, 6497), 'png'),
  'homewhiz-logo':      (['dodatkowe technologie', 'HomeWhiz', 'Inteligentny obiekt wektorowy'], None, 'png'),
  'aeroperfect':        (['dodatkowe technologie', 'ProSmart', 'AeroPerfect#1'], None, 'jpg'),
  'ikona-skarbonka-piorun': (['dodatkowe technologie', 'Vector Smart Object'], None, 'png'),
  'pizza':              (['dodatkowe technologie', 'ProSmart#1', 'Layer 15'], None, 'png'),
}

# wyczyść stare źródła
for f in glob.glob(OUT + '*'):
    if not f.endswith(('agd.png', 'laur.png', 'beko-state-of-mind.png')):  # wycinki z JPG (npm run tnij)
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
    if nazwa == 'rekawica-intro':  # warstwa ma półprzezroczystą granatową poświatę wokół rękawicy – kluczujemy granat
        im = key_color(im, (2, 37, 96), 30, 90); im.save(f'{OUT}{nazwa}.png')
    if nazwa == 'skarbonka-rekawica':  # monety (srebrne, mało nasycone) w lewym dolnym rogu nie występują w layoucie
        pxs = im.load()
        for y in range(368, im.size[1]):
            for x in range(0, 125):
                r, g, b, a = pxs[x, y]
                mx, mn = max(r, g, b), min(r, g, b)
                if a and (mx - mn) < 110: pxs[x, y] = (0, 0, 0, 0)  # rękawica jest mocno nasycona (>150)
        im.save(f'{OUT}{nazwa}.png')
    meta[nazwa] = {'bbox': bb, 'size': im.size}
    print(f'{nazwa}: {bb} {im.size}')

# minutnik: zdjęcie na płaskim tle #03305a + ściereczka z alfą -> jeden PNG z przezroczystością
m = find(['minutnik2', 'Firefly_Gemini Flash#1']); mi = m.composite(); mb = m.bbox
s = find(['sciereczka']); si = s.composite(); sb = s.bbox
mi = key_color(mi, (3, 48, 90), 8, 26)  # tło jest płaskie – wąski klucz, żeby nie tknąć szkła wyświetlacza
mi.alpha_composite(si, (sb[0] - mb[0], sb[1] - mb[1]))
mi = mi.crop((0, 0, 600, mi.size[1]))  # do x=635 (tekst zaczyna się przy 655)
# cyfry „59:00”: jasne piksele segmentów wypełnione średnią z sąsiednich ciemnych pikseli
# (splot znormalizowany) – zachowuje gradient i odblask szkła wyświetlacza
from PIL import ImageFilter
L, T, R, B = 258, 156, 482, 256
reg = mi.crop((L, T, R, B)).convert('RGB'); rw, rh = reg.size; rp = reg.load()
maska = Image.new('L', (rw, rh), 0); mp = maska.load()
for y in range(rh):
    for x in range(rw):
        r, g, b = rp[x, y]
        if 0.299 * r + 0.587 * g + 0.114 * b > 105: mp[x, y] = 255  # segmenty ~240, odblask szkła < 100
maska = maska.filter(ImageFilter.MaxFilter(15))  # rozszerz o poświatę segmentów
inv = maska.point(lambda v: 255 - v)
znane = Image.composite(Image.new('RGB', (rw, rh), (0, 0, 0)), reg, maska)  # cyfry -> czarne
for _ in range(3):
    b_img = znane.filter(ImageFilter.GaussianBlur(9)); b_w = inv.filter(ImageFilter.GaussianBlur(9))
    zp, wp, kp, mk = b_img.load(), b_w.load(), znane.load(), maska.load()
    for y in range(rh):
        for x in range(rw):
            if mk[x, y]:
                w = wp[x, y] / 255
                if w > 0.02: kp[x, y] = tuple(min(255, int(zp[x, y][i] / w)) for i in range(3))
    inv = Image.new('L', (rw, rh), 255)  # kolejne iteracje: wszystko już „znane”
wynik = Image.composite(znane, reg, maska.filter(ImageFilter.GaussianBlur(1.5)))
alfa_org = mi.split()[3]
mi.paste(wynik.convert('RGBA'), (L, T))
mi.putalpha(alfa_org)  # zachowaj oryginalną przezroczystość (łata zmienia tylko kolor)
mi.save(f'{OUT}minutnik.png'); meta['minutnik'] = {'bbox': (mb[0], mb[1], mb[0] + 600, mb[3]), 'size': mi.size}
print('minutnik:', meta['minutnik'])

# zawieszka: sylwetka z warstwy 'zawieszka txt' (tekst jest w HTML), kolor wiersza z lewego marginesu kształtu
zl = [x for x in psd if x.name == 'zawieszka txt'][0]
zi = zl.composite().convert('RGBA'); za = zi.split()[3]
zm = za.point(lambda v: 255 if v >= 200 else 0); zb = zm.getbbox()
zi, zm, za = zi.crop(zb), zm.crop(zb), za.crop(zb); zw, zh = zi.size
zout = Image.new('RGBA', (zw, zh), (0, 0, 0, 0)); zp = zout.load(); zs = zi.load(); zk = zm.load()
for y in range(zh):
    xs = [x for x in range(zw) if zk[x, y]]
    if not xs: continue
    r, g, b, _ = zs[min(xs[0] + 6, zw - 1), y]
    for x in xs: zp[x, y] = (r, g, b, 255)
zout.putalpha(za.point(lambda v: 0 if v < 120 else min(255, int((v - 120) * 255 / 135))))
zout.save(f'{OUT}zawieszka.png'); meta['zawieszka'] = {'bbox': (zl.bbox[0] + zb[0], zl.bbox[1] + zb[1], zl.bbox[0] + zb[2], zl.bbox[1] + zb[3]), 'size': zout.size}
print('zawieszka:', meta['zawieszka'])

# tła sekcji granatowych: render PSD z samymi warstwami tła (bez tekstów, zdjęć i kształtów UI)
TLO = {'Layer 0', 'Prostokąt 13', 'Rectangle 4', 'Prostokąt 13 copy', 'Warstwa 50', 'Rectangle 6', 'Prostokąt 5'}
tlo = psd.composite(layer_filter=lambda l: l.is_visible() and (l.name in TLO or (l.parent is not psd and l.name in TLO)))
tlo = tlo.convert('RGB')
tlo.crop((0, 700, 1400, 1206)).save(f'{OUT}tlo-intro.jpg', quality=88)
tlo.crop((0, 4393, 1400, 5221)).save(f'{OUT}tlo-zabawa.jpg', quality=88)
print('tła sekcji: tlo-intro, tlo-zabawa')

# kadry mobilne (pionowe) z czystych zdjęć
Image.open(f'{OUT}hero.jpg').crop((330, 0, 1030, 700)).save(f'{OUT}hero-mobile.jpg', quality=92)  # kadr 1:1 pod tekst nałożony na zdjęcie
Image.open(f'{OUT}final.jpg').crop((150, 0, 1150, 761)).save(f'{OUT}final-mobile.jpg', quality=92)
json.dump(meta, open('layout/warstwy-meta.json', 'w'), indent=1, ensure_ascii=False)
print('OK ->', OUT)
