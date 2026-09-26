#!/usr/bin/env python3
"""Wyciąga z feedów sklepowych WYŁĄCZNIE oferty LEGO i zapisuje je jako jeden
kompaktowy plik JSON (~kilkaset kB zamiast setek MB).

Powód: feed Media Expert waży ~600 MB, a interesuje nas z niego ~750 pozycji.
Łowca Promocji zamiast parsować surowe feedy w każdym przebiegu (drogo, dużo
prób i błędów) uruchamia ten skrypt i pracuje na gotowym wyciągu.

Użycie:
    python3 scripts/feedy-lego.py [--wyjscie plik.json] [--tylko mediaexpert,allegro]

Wynik: {"_meta": {...}, "mediaexpert": {"<nr>": {...}}, "planetaklockow": {...}, "allegro": {...}}
Pole oferty: cena (float), link (afiliacyjny), zdjecie, dostepny (bool), nazwa.
Zasady dopasowania numeru setu są takie same jak w src/data/feedy.json.
"""

import argparse, base64, json, os, re, subprocess, sys, tempfile, urllib.parse, xml.etree.ElementTree as ET
from datetime import date

KATALOG = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FEEDY = json.load(open(os.path.join(KATALOG, 'src/data/feedy.json'), encoding='utf-8'))

# numer setu tylko z tytułu zaczynającego się od "LEGO <numer>" — inaczej do wyników
# wpadają puzzle i gry innych marek z czterocyfrowym numerem w nazwie
WZORZEC_LEGO = re.compile(r'^LEGO\b.*?\b(\d{4,7})\b', re.IGNORECASE)

# Oferty, które NIE są zestawem, choć tytuł zaczyna się od „LEGO" i niesie numer:
# pojedyncze minifigurki (kod katalogowy sw1160 / njo104 / hp200 / cty0123),
# instrukcje, pudełka, naklejki, części na wagę. Taka aukcja bierze numer setu
# z tytułu i udaje deal rzędu −45%.
#
# Wzorzec kodu minifigurki wszedł 16.09.2026 po wycieku „Lego min­ifgurka sw1160"
# (415 zł, udawało −44,6% na 75315) — literówka w słowie „minifigurka" omijała
# filtr po słowach, ale kod `sw1160` w tytule jest jednoznaczny. Oba testy
# stosujemy razem: słowo albo kod.
WZORZEC_KOD_MINIFIGURKI = re.compile(
    r'\b(?:sw|njo|hp|cty|col|sh|iaj|tlm|dis|hs|loc|nex|elf|frnd|twn|cas|pi|gs|adp|idea|mk)\d{2,4}[a-z]?\b',
    re.IGNORECASE,
)
SLOWA_NIE_ZESTAW = re.compile(
    r'minifig|figurka\s+lego|instrukcj|pude[lł]k|naklejk|breloc|zestaw\s+cz[eę][sś]ci|cz[eę][sś]ci\s+lego|luzem|na\s+wag[eę]'
    # pojedyncze elementy (feed Allegro „tylko LEGO" od 22.09.2026 niesie ~470 tys.
    # ofert, w większości części z numerem elementu, który koliduje z numerami
    # starych zestawów: „Lego Tile 1751 Płytka 4x4", „Lego 2432 Tile Zaczep", „Lego
    # Klocek 2x4x2 (2434/4494850)"): nazwy części, wymiary 1x4/2x4x2, sztuki, gramy
    r'|\b(?:tile|brick|plate|slope|wedge|technic\s+pin|pin\b|axle|beam)\b|\bklocek\b|\b[12]\s*x\s*\d+\b|\b\d+\s*x\s*\d+\s*x\s*\d+\b'
    r'|\b\d+\s*szt\b|\(\d+\s*g\)|\bnr\.?\s*\d{4,7}\b|katalog\s+lego|drukowany|[lł]odyg|\belement\b'
    # akcesoria z numerem w tytule (Łowca 23.09: separator 96874 za 3,99 zł)
    r'|separator|akcesori|wyciskacz|\bmata\b|podk[lł]adk',
    re.IGNORECASE,
)

# Liczba elementów z atrybutu Allegro („Liczba elementów", id 201121): zestaw ma
# ich dziesiątki–tysiące, pojedyncza część 1–9. Poniżej tego progu oferta nie
# jest zestawem niezależnie od tytułu.
MIN_ELEMENTOW_ZESTAWU = 10


def nie_zestaw(nazwa):
    """Czy tytuł oferty to nie zestaw, tylko minifigurka/część/instrukcja."""
    tekst = (nazwa or '').replace('\u00ad', '')   # miękki dywiz z tytułów Allegro
    return bool(WZORZEC_KOD_MINIFIGURKI.search(tekst) or SLOWA_NIE_ZESTAW.search(tekst))
G = '{http://base.google.com/ns/1.0}'


# Feedy ME i PK miewają przesunięte wiersze: tytuł (i numer) jednego produktu
# z linkiem i ceną sąsiedniego. 25–26.09.2026 tak weszłyby m.in. „Tower Bridge
# 21067 za 132,95 zł" (naprawdę bukiet 11507) i cały blok Ninjago 71862–71871
# w PK — fałszywe minimum w ceny_baza i czytelnik odsyłany do innego produktu.
# Sito: numer zestawu z tytułu musi zgadzać się z numerem w adresie karty
# produktu; wiersz z innym numerem w URL wypada z wyciągu PRZED odswiez_redirects.
# Wzorce adresów są sklepowe (ME: slug „lego-<nr>-", PK: numer w ostatnim
# segmencie ścieżki), więc sito obejmuje tylko ME i PK; slugi ofert Allegro
# pisze sprzedawca i rozjazd z numerem niczego tam nie dowodzi.
def cel_linku(link):
    """Adres karty produktu wyłuskany z linku trackingowego (bez wywołań sieci)."""
    if 'url=' in link:      # performers.tech (ME): cel w parametrze url=, URL-encoded
        return urllib.parse.unquote(link.split('url=')[1].split('&')[0])
    if 'r=' in link:        # webepartners (PK): cel w parametrze r=, base64
        b = link.split('r=')[1].split('&')[0]
        b += '=' * (-len(b) % 4)
        try:
            return base64.b64decode(b).decode('utf-8', 'replace')
        except Exception:
            return ''
    return link


WZORZEC_NR_W_URL = {
    # ME: rok w dalszej części sluga (…-2022) nie może się mylić z numerem,
    # stąd kotwica na przedrostku „lego-"
    'mediaexpert': re.compile(r'/lego-(\d{4,7})-'),
    'planetaklockow': re.compile(r'(\d{4,7})'),
}


def numer_z_linku(sklep, link):
    """Numer zestawu z adresu karty produktu; None, gdy adres go nie niesie."""
    wzorzec = WZORZEC_NR_W_URL.get(sklep)
    if not wzorzec:
        return None
    url = cel_linku(link or '')
    if sklep == 'planetaklockow':
        url = url.rstrip('/').rsplit('/', 1)[-1]
    dopasowanie = wzorzec.search(url)
    return dopasowanie.group(1) if dopasowanie else None


def odsiej_niespojne(sklep, oferty):
    """Usuwa wiersze, których numer z tytułu nie zgadza się z numerem w URL."""
    niespojne = []
    for nr in list(oferty):
        nr_url = numer_z_linku(sklep, oferty[nr].get('link', ''))
        if nr_url and nr_url != nr:
            niespojne.append((nr, nr_url))
            del oferty[nr]
    return sorted(niespojne)


def pobierz(url, sufiks):
    """Pobiera plik curl-em (wyjście sieciowe środowiska idzie przez proxy).

    --fail zamienia HTTP 4xx/5xx na błąd curla, a kontrola rozmiaru łapie
    pusty plik przy kodzie 200 — oba przypadki mają wylądować w _meta.bledy
    zamiast przejść po cichu jako „0 ofert" (tak 10–11.09.2026 wygasający
    feed Allegro przez dwa dni wyglądał na zdrowy).
    """
    sciezka = os.path.join(tempfile.gettempdir(), f'feed-lego{sufiks}')
    subprocess.run(['curl', '-sL', '--fail', '--max-time', '900', url, '-o', sciezka], check=True)
    if os.path.getsize(sciezka) == 0:
        raise RuntimeError(f'pusty plik z {url}')
    return sciezka


def cena_liczba(tekst):
    if not tekst:
        return None
    czysty = re.sub(r'[^\d,.]', '', str(tekst).split()[0]).replace(',', '.')
    try:
        wartosc = float(czysty)
    except ValueError:
        return None
    return wartosc if wartosc > 0 else None


def z_mediaexpert():
    """Google Shopping XML, ~600 MB — parsowanie strumieniowe z czyszczeniem drzewa."""
    plik = pobierz(FEEDY['mediaexpert']['url'], '-me.xml')
    oferty, updated = {}, None
    for zdarzenie, el in ET.iterparse(plik, events=('end',)):
        tag = el.tag.split('}')[-1]
        if tag == 'updated' and updated is None:
            updated = (el.text or '').strip()
        if tag != 'entry':
            continue
        marka = (el.findtext(G + 'brand') or '').strip()
        tytul = (el.findtext(G + 'title') or '').strip()
        if marka.upper() == 'LEGO':
            dopasowanie = WZORZEC_LEGO.match(tytul)
            if dopasowanie:
                cena = cena_liczba(el.findtext(G + 'price'))
                if cena:
                    nr = dopasowanie.group(1)
                    dostepny = (el.findtext(G + 'availability') or '').strip() == 'In stock'
                    stara = oferty.get(nr)
                    if not stara or cena < stara['cena']:
                        oferty[nr] = {
                            'cena': cena,
                            'link': (el.findtext(G + 'link') or '').strip(),
                            'zdjecie': (el.findtext(G + 'image_link') or '').strip(),
                            'dostepny': dostepny,
                            'nazwa': tytul,
                        }
        el.clear()  # bez tego 600 MB ląduje w pamięci
    os.unlink(plik)
    return oferty, {'feed_updated': updated}


def z_planetyklockow():
    plik = pobierz(FEEDY['planetaklockow']['url'], '-pk.xml')
    oferty, wycofane = {}, []
    for zdarzenie, el in ET.iterparse(plik, events=('end',)):
        if el.tag.split('}')[-1] != 'offer':
            continue
        nazwa = (el.findtext('name') or '').strip()
        kategoria = (el.findtext('shopcategory') or '').strip()
        dopasowanie = WZORZEC_LEGO.match(nazwa)
        if dopasowanie and kategoria.startswith('Klocki LEGO'):
            nr = dopasowanie.group(1)
            cena = cena_liczba(el.findtext('price'))
            # 9999,99 zł w archiwum = pozycja niedostępna, nie oferta
            archiwum = 'wycofane z oferty' in kategoria.lower() or (cena or 0) > 9000
            if archiwum:
                wycofane.append(nr)
            elif cena:
                zdjecie = next((p.text for p in el.findall('property')
                                if p.get('name') == 'ImageOriginalUrl'), None)
                strona = next((p.text for p in el.findall('property')
                               if p.get('name') == 'ProductUrl'), None)
                stara = oferty.get(nr)
                if not stara or cena < stara['cena']:
                    oferty[nr] = {
                        'cena': cena,
                        'link': (el.findtext('url') or '').strip(),
                        'zdjecie': (zdjecie or '').strip(),
                        'dostepny': True,
                        'nazwa': nazwa,
                        'strona': (strona or '').strip(),
                    }
        el.clear()
    os.unlink(plik)
    niedostepne = sprawdz_dostepnosc_pk(oferty)
    return oferty, {'archiwum_eol': sorted(set(wycofane)), 'niedostepne': niedostepne}


# Feed Planety Klocków (nokaut.xml) NIE niesie dostępności: poza kategorią
# „Produkty wycofane z oferty" każda pozycja wygląda na sprzedawaną, a część
# to widma — karta produktu ma schema.org/OutOfStock i przycisk „Powiadom
# o dostępności" (Łowca 23.09.2026: 55 z 85 „najtańszych" ofert PK, m.in.
# 21065 Sagrada Família za 559,99 zł). Dlatego każdą ofertę PK sprawdzamy na
# stronie produktu (zwykły curl, 8 naraz, ~1 300 stron w kilka minut):
# OutOfStock → oferta wypada z wyciągu (Łowca traktuje ją jak nieobecną w feedzie
# i zdejmuje cenę PK z huba). Błąd sieci = zostaje (nie kasujemy na ślepo).
PK_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36'
PK_ROWNOLEGLE = 8

def _pk_strona_dostepna(url, max_time='15'):
    try:
        r = subprocess.run(['curl', '-sL', '--max-time', max_time, '-A', PK_UA, url],
                           capture_output=True, text=True, timeout=int(max_time) + 10)
        html = r.stdout
    except Exception:
        return None
    if 'schema.org/OutOfStock' in html:
        return False
    if 'schema.org/InStock' in html:
        return True
    return None   # nieznany układ strony / 404 / blokada — nie rozstrzygamy

def sprawdz_dostepnosc_pk(oferty):
    from concurrent.futures import ThreadPoolExecutor
    adresy = {}
    for nr, o in oferty.items():
        url = (o.get('strona') or '').strip()
        if url:
            adresy[nr] = url
    wyniki = {}
    with ThreadPoolExecutor(max_workers=PK_ROWNOLEGLE) as pula:
        for nr, wynik in zip(adresy, pula.map(_pk_strona_dostepna, adresy.values())):
            wyniki[nr] = wynik
    # Druga próba dla nierozstrzygniętych (test 23.09: 235 z 1302 — strony PK mają
    # 200–700 kB i przy 8 równoległych część nie mieści się w 15 s; przy ponownym
    # odczycie próbka 40 kart dała 40 rozstrzygnięć). Wolniej, z dłuższym limitem.
    ponownie = {nr: adresy[nr] for nr, w in wyniki.items() if w is None}
    if ponownie:
        with ThreadPoolExecutor(max_workers=max(1, PK_ROWNOLEGLE // 2)) as pula:
            for nr, wynik in zip(ponownie, pula.map(lambda u: _pk_strona_dostepna(u, '40'), ponownie.values())):
                wyniki[nr] = wynik
    niedostepne = sorted(nr for nr, w in wyniki.items() if w is False)
    nieznane = sum(1 for w in wyniki.values() if w is None)
    for nr in niedostepne:
        del oferty[nr]
    for o in oferty.values():
        o.pop('strona', None)
    print(f'planetaklockow: sprawdzono {len(wyniki)} kart, niedostępnych (OutOfStock) {len(niedostepne)}, '
          f'nierozstrzygniętych {nieznane} (druga próba: {len(ponownie)})', file=sys.stderr)
    return niedostepne


def z_allegro():
    """NDJSON — jedna linia = jedna oferta; czytamy linia po linii."""
    plik = pobierz(FEEDY['allegro']['url'], '-allegro.ndjson')
    oferty = {}
    with open(plik, encoding='utf-8') as f:
        for linia in f:
            try:
                o = json.loads(linia)
            except json.JSONDecodeError:
                continue
            nazwa = (o.get('name') or '').strip()
            # Od 11.09.2026 feed to cała kategoria Dziecko (stary feed LEGO
            # wygaszony przy migracji feedów Allegro), więc najpierw brama
            # marki: atrybut Marka (id 248811) = LEGO albo nazwa od "LEGO".
            # Bez niej atrybut "Numer produktu" wpuszczałby podróbki klocków
            # z numerami łudząco podobnymi do setów.
            marka = None
            nr = None
            elementow = None
            for atrybut in o.get('attributes', []) or []:
                ident = str(atrybut.get('id'))
                nazwa_atrybutu = str(atrybut.get('name') or '')
                wartosci = atrybut.get('values') or []
                if ident == '248811':
                    marka = str(wartosci[0]) if wartosci else None
                elif ident == '201105' or nazwa_atrybutu == 'Numer produktu':
                    # atrybut "Numer produktu" ma pierwszeństwo przed regexem z nazwy —
                    # ale tylko gdy niesie SAM numer (w kategorii LEGO id atrybutu to
                    # 245781, a części mają tam opisy typu „LEGO liść 3565 5x")
                    if wartosci:
                        znaleziony = re.fullmatch(r'\s*(?:LEGO\s+)?(\d{4,7})\s*', str(wartosci[0]), re.IGNORECASE)
                        nr = znaleziony.group(1) if znaleziony else None
                elif ident == '201121' or nazwa_atrybutu == 'Liczba elementów':
                    if wartosci:
                        znaleziony = re.search(r'\d+', str(wartosci[0]).replace(' ', ''))
                        elementow = int(znaleziony.group(0)) if znaleziony else None
            if (marka or '').strip().upper() != 'LEGO' and not nazwa.upper().startswith('LEGO'):
                continue
            if elementow is not None and elementow < MIN_ELEMENTOW_ZESTAWU:
                continue
            # Feed „tylko LEGO" (od 22.09.2026, fid 39967a61…) ma drzewo kategorii:
            # „… > LEGO > Zestawy > <seria>" to zestawy; „Klocki pojedyncze > Elementy"
            # (227 tys. ofert), „Minifigurki", „Pojemniki", „Breloczki", „Instrukcje",
            # „Mieszane" to nie zestawy — odpadają po ścieżce, zanim tytuł cokolwiek
            # powie. Feed zapasowy (cała kategoria Dziecko) tej ścieżki nie ma, więc
            # brama działa tylko, gdy ścieżka zawiera „> LEGO >".
            sciezka = str(o.get('category_name_path') or '')
            w_zestawach = ' > Zestawy' in sciezka
            if '> LEGO >' in sciezka and not w_zestawach:
                continue
            if not nr:
                dopasowanie = WZORZEC_LEGO.match(nazwa)
                nr = dopasowanie.group(1) if dopasowanie else None
            if not nr and w_zestawach:
                # w kategorii Zestawy tytuły często nie zaczynają się od „LEGO"
                # („Klocki Lego City…", „75399 Lego Star Wars…", „1x Lego Friends 42677…")
                # — bierz pierwszy 4–7-cyfrowy numer, o ile nie jest liczbą elementów/sztuk
                for znaleziony in re.finditer(r'\b(\d{4,7})\b(?!\s*(?:el\b|elem|szt|klock|cz[eę][sś]ci))', nazwa):
                    nr = znaleziony.group(1)
                    break
            if not nr or nie_zestaw(nazwa):
                continue
            cena = cena_liczba((o.get('price') or {}).get('value') if isinstance(o.get('price'), dict) else o.get('price'))
            if not cena:
                continue
            dostepny = str(o.get('availability', '')).lower() in ('in stock', 'in_stock')
            if not dostepny:
                continue
            stara = oferty.get(nr)
            if not stara or cena < stara['cena']:
                oferty[nr] = {
                    'cena': cena,
                    'link': (o.get('item_link') or '').strip(),
                    'zdjecie': (o.get('image_link') or '').strip(),
                    'dostepny': True,
                    'nazwa': nazwa,
                }
    os.unlink(plik)
    return oferty, {}


ZRODLA = {
    'mediaexpert': z_mediaexpert,
    'planetaklockow': z_planetyklockow,
    'allegro': z_allegro,
}


def odswiez_redirects(wynik):
    """Wpisuje do redirects.json dzisiejsze adresy kart produktów z feedów.

    Powód (18.09.2026): mapy linków rosły, ale nigdy się nie odświeżały — wpis raz
    zapisany zostawał na zawsze, także gdy sklep zmienił adres karty. Kontrola
    linków znalazła 43024 w Planecie Klocków: nasz link dawał 404, a feed z tego
    samego dnia miał poprawny, dłuższy adres. Różnic było 3 na 1 307 zestawów
    obecnych w feedzie — mało, ale każda to czytelnik wysłany na 404.

    „Append-only" znaczy, że nie wolno KASOWAĆ wpisów. Aktualizacja adresu tego
    samego zestawu w tym samym sklepie nie jest kasowaniem — liczba wpisów nigdy
    nie maleje i skrypt to sprawdza.
    """
    sciezka = os.path.join(KATALOG, 'src/data/redirects.json')
    with open(sciezka, encoding='utf-8') as f:
        redirects = json.load(f)
    zmiany, nowe = {}, {}
    for sklep in ('mediaexpert', 'planetaklockow', 'allegro'):
        mapa = redirects.setdefault(sklep, {})
        przed = len(mapa)
        for nr, oferta in (wynik.get(sklep) or {}).items():
            link = (oferta.get('link') or '').strip()
            if not link:
                continue
            if nr not in mapa:
                mapa[nr] = link
                nowe[sklep] = nowe.get(sklep, 0) + 1
            elif mapa[nr] != link:
                mapa[nr] = link
                zmiany[sklep] = zmiany.get(sklep, 0) + 1
        if len(mapa) < przed:  # nie powinno się zdarzyć — pilnujemy tego wprost
            raise RuntimeError(f'redirects.{sklep}: liczba wpisów zmalała {przed} -> {len(mapa)}')
    with open(sciezka, 'w', encoding='utf-8') as f:
        json.dump(redirects, f, ensure_ascii=False, indent=1)
        f.write('\n')
    return nowe, zmiany


# Zadania, które nie chodzą codziennie, a i tak odpala je ten skrypt.
# Klucz: nazwa, wartość: dni tygodnia wg date.weekday() (0 = poniedziałek).
#
# Smyk: wtorek i piątek (decyzja Marka 20.09.2026). Wtorkowy przebieg robi
# Routine „Dane wt 05:30" — my dokładamy piątek, żeby dostępność nie była
# siedmiodniowa. Powód decyzji: 75192 Sokół Millennium stał u nas z ceną Smyka
# 2799 zł przez pięć dni po tym, jak sklep go wyprzedał, i była to najniższa
# cena w tabeli tego zestawu. Odczyt trwa ok. 4–8 minut (704 karty po sześć naraz).
# Kontrola linków: poniedziałek (0). Do 21.09.2026 robił to Kontroler własnym
# krokiem w promptcie — jego pierwszy przebieg trwał 12 minut i skończył się bez
# commita i bez raportu, bo sprawdzanie 200 linków zjadło cały budżet czasu sesji.
# Skrypt jest tańszy w Łowcy: Łowca startuje 08:30, Kontroler 09:00, więc raport
# czeka już na niego w repo i wystarczy go przeczytać.
ZADANIA_TYGODNIOWE = {'smyk': {4}, 'linki': {0}}


def zadania_na_dzis():
    dzis = date.today().weekday()
    return [k for k, dni in ZADANIA_TYGODNIOWE.items() if dzis in dni]


def odswiez_smyka():
    """Ceny i dostępność Smyka: `smyk-odswiez.mjs` + domknięcie błędów sieci."""
    wynik = subprocess.run(['node', 'scripts/smyk-odswiez.mjs'], cwd=KATALOG,
                           capture_output=True, text=True, timeout=1800)
    linie = [l.strip() for l in ((wynik.stdout or '') + (wynik.stderr or '')).splitlines() if l.strip()]
    podsumowanie = linie[-1] if linie else 'brak wyjścia'
    if wynik.returncode == 0:
        # --stare domyka zestawy, których nie udało się odczytać za pierwszym razem
        domkniecie = subprocess.run(['node', 'scripts/smyk-odswiez.mjs', '--stare'], cwd=KATALOG,
                                    capture_output=True, text=True, timeout=900)
        linie2 = [l.strip() for l in ((domkniecie.stdout or '') + (domkniecie.stderr or '')).splitlines() if l.strip()]
        if linie2:
            podsumowanie += ' | --stare: ' + linie2[-1]
    return wynik.returncode == 0, podsumowanie


def kontrola_linkow():
    """Losowa próba linków sklepowych — raport do materialy/, mail gdy są martwe."""
    wynik = subprocess.run(['node', 'scripts/kontrola-linkow.mjs', '--ile', '150'],
                           cwd=KATALOG, capture_output=True, text=True, timeout=1800)
    linie = [l.strip() for l in ((wynik.stdout or '') + (wynik.stderr or '')).splitlines() if l.strip()]
    martwe = next((l for l in linie if l.startswith('Martwych linków')), linie[-1] if linie else 'brak wyjścia')
    return wynik.returncode == 0, martwe


def feedy_td_codzienne():
    """Feedy Tradedoublera oznaczone w feedy.json jako codzienne.

    Te feedy importuje `scripts/ceneo-feed.mjs`, który sam zapisuje dane serwisu
    (redirects, oferty_feed, sety) — nie przechodzą więc przez wyciąg w /tmp.
    Wołamy je stąd, bo Łowca i tak uruchamia ten skrypt codziennie, a prompt
    Routine'a jest w stałej sesji (zmiana = delete + create). Dzięki temu
    częstotliwość sklepu jest decyzją w danych, nie w promptach — tak jak mówi
    `_meta` w feedy.json. Sklep przestawia się na codzienny jednym polem:
    "odswiezanie": "codziennie".
    """
    return [k for k, v in FEEDY.items()
            if isinstance(v, dict)
            and str(v.get('siec', '')).startswith('Tradedoubler')
            and v.get('aktywny')
            and v.get('odswiezanie') == 'codziennie']


def importuj_feed_td(sklep):
    """Uruchamia importer TD dla jednego sklepu. Zwraca (ok, ostatnia_linia)."""
    wynik = subprocess.run(
        ['node', 'scripts/ceneo-feed.mjs', '--sklep', sklep],
        cwd=KATALOG, capture_output=True, text=True, timeout=600,
    )
    wyjscie = (wynik.stdout or '') + (wynik.stderr or '')
    linie = [l.strip() for l in wyjscie.splitlines() if l.strip()]
    return wynik.returncode == 0, (linie[-1] if linie else 'brak wyjścia')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--wyjscie', default='/tmp/feedy-lego.json')
    parser.add_argument('--tylko', default='', help='lista sklepów po przecinku')
    parser.add_argument('--bez-td', action='store_true', help='pomiń import feedów Tradedoublera')
    parser.add_argument('--tylko-td', action='store_true', help='TYLKO import feedów TD (bez pobierania wielkich feedów)')
    args = parser.parse_args()

    wybrane = [] if args.tylko_td else ([s.strip() for s in args.tylko.split(',') if s.strip()] or list(ZRODLA))
    wynik = {'_meta': {'pobrano': date.today().isoformat(), 'liczby': {}, 'bledy': {}}}

    for sklep in wybrane:
        try:
            oferty, dodatki = ZRODLA[sklep]()
            niespojne = odsiej_niespojne(sklep, oferty)
            if niespojne:
                wynik['_meta'][f'{sklep}_niespojne'] = niespojne
                print(f'{sklep}: odrzucone niespójne wiersze (numer z tytułu ≠ numer w URL): '
                      f'{len(niespojne)} — {", ".join(nr for nr, _ in niespojne)}', file=sys.stderr)
            wynik[sklep] = oferty
            wynik['_meta']['liczby'][sklep] = len(oferty)
            wynik['_meta'].update({f'{sklep}_{k}': v for k, v in dodatki.items()})
            print(f'{sklep}: {len(oferty)} setów', file=sys.stderr)
        except Exception as blad:  # feed niedostępny nie może przerwać pozostałych
            wynik['_meta']['bledy'][sklep] = str(blad)
            print(f'{sklep}: BŁĄD — {blad}', file=sys.stderr)

    # Adresy kart produktów z dzisiejszych feedów — zanim Łowca zacznie liczyć ceny.
    if wybrane and not args.tylko_td:
        try:
            nowe_linki, zmiany_linkow = odswiez_redirects(wynik)
            wynik['_meta']['redirects'] = {'nowe': nowe_linki, 'zmienione': zmiany_linkow}
            print(f'redirects: nowe {nowe_linki or "—"}, zmienione {zmiany_linkow or "—"}', file=sys.stderr)
        except Exception as blad:
            wynik['_meta']['bledy']['redirects'] = str(blad)
            print(f'redirects: BŁĄD — {blad}', file=sys.stderr)

    # Feedy TD (dziś: Lidl) — importer zapisuje dane serwisu sam, więc nie wchodzą
    # do wyciągu. Błąd jednego feedu nie może przerwać reszty przebiegu Łowcy.
    if not args.bez_td:
        wynik['_meta']['td'] = {}
        for sklep in feedy_td_codzienne():
            try:
                ok, podsumowanie = importuj_feed_td(sklep)
            except Exception as blad:
                ok, podsumowanie = False, str(blad)
            wynik['_meta']['td'][sklep] = podsumowanie
            if not ok:
                wynik['_meta']['bledy'][f'td:{sklep}'] = podsumowanie
            print(f'td:{sklep}: {"ok" if ok else "BŁĄD"} — {podsumowanie}', file=sys.stderr)

    # Zadania tygodniowe (dziś: Smyk we wtorki i piątki) — przed historią cen,
    # żeby jej wpisy widziały już świeże ceny i zniknięcia ofert Smyka.
    ZADANIA = {'smyk': odswiez_smyka, 'linki': kontrola_linkow}
    for zadanie in zadania_na_dzis():
        if args.tylko_td:
            continue
        try:
            ok, podsumowanie = ZADANIA[zadanie]()
        except Exception as blad:
            ok, podsumowanie = False, str(blad)
        wynik['_meta'].setdefault('tygodniowe', {})[zadanie] = podsumowanie
        if not ok:
            wynik['_meta']['bledy'][zadanie] = podsumowanie
        print(f'{zadanie}: {"ok" if ok else "BŁĄD"} — {podsumowanie}', file=sys.stderr)

    # Historia cen — jedna linia na zestaw tylko wtedy, gdy cena się ruszyła.
    # Tu, bo Łowca uruchamia ten skrypt codziennie po imporcie feedów, a seria
    # czasowa ma sens wyłącznie wtedy, gdy zbiera się bez przerw.
    try:
        h = subprocess.run(['node', 'scripts/historia-cen.mjs'], cwd=KATALOG,
                           capture_output=True, text=True, timeout=180)
        linia = [l for l in (h.stdout or '').splitlines() if l.strip()]
        wynik['_meta']['historia_cen'] = linia[-1] if linia else 'brak wyjścia'
        if h.returncode != 0:
            wynik['_meta']['bledy']['historia_cen'] = (h.stderr or '').strip()[:200]
        print(f'historia-cen: {wynik["_meta"]["historia_cen"]}', file=sys.stderr)
    except Exception as blad:
        wynik['_meta']['bledy']['historia_cen'] = str(blad)
        print(f'historia-cen: BŁĄD — {blad}', file=sys.stderr)

    if args.tylko_td:
        print('--tylko-td: wyciągu nie zapisuję.', file=sys.stderr)
        sys.exit(0)

    with open(args.wyjscie, 'w', encoding='utf-8') as f:
        json.dump(wynik, f, ensure_ascii=False)
    print(f'Zapisano {args.wyjscie} ({os.path.getsize(args.wyjscie)//1024} kB)', file=sys.stderr)
