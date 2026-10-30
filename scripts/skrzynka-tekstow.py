#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Skrzynka tekstów Piotra: mail z załącznikami .md → artykuł na stronie (decyzja Marka 24.10.2026).

Obieg: Claude Piotra wysyła teksty ze skrzynki tylkoklockiblog@gmail.com na
tylkoklockiblog+code@gmail.com (ta sama skrzynka). Zadanie cykliczne w sesji Code z konektorem
Gmail znajduje takie maile, pobiera je narzędziem get_message (format RAW) i woła ten skrypt.
Teksty publikują się bez przeglądu, jeśli import nie zgłosi błędu (TYLKO_UWAGA niżej to wyjątki) i build przejdzie;
inaczej nic nie trafia na stronę, a Marek i Piotr dostają listę problemów.

Polecenia:
  wyciagnij <messageId> <katalog>   — szuka wyniku get_message(RAW) w zapisie sesji (transkrypt
                                       i katalog tool-results), rozpakowuje załączniki do katalogu
  publikuj <katalog> [--sucho]      — import .md (import-artykul-md.py), build, commit, push;
                                       wypisuje JSON z linkami albo problemami
  powiadom <wynik.json>             — krótki mail (same linki albo lista problemów) do odbiorców
                                       z klucza `teksty` w src/data/raporty_mail.json

Od 30.10.2026 ten sam obieg przyjmuje opisy zestawów P07 jako .md (układ: „# LEGO <nr> <nazwa>”,
„## Opis zestawu”, „## Metryka zestawu” z tabelą, „## FAQ”). Załącznik z nagłówkiem „## Metryka zestawu”
to karta: idzie do scripts/import-karty.py (--nadpisz: poprawka zastępuje kartę), trafia do
src/data/karty_setow.json i na hub /zestaw/<nr>/. ZIP w załączniku jest rozpakowywany (płasko, tylko
.md i zdjęcia) – 25 opisów może przyjść jako jeden zip albo 25 załączników. Karty i artykuły
w jednym mailu publikują się razem albo wcale (jeden mail = jedna paczka).

Rejestr `redakcja/skrzynka.json` pamięta, pod jakim adresem stoi tekst o danym numerze
(0025, Recenzje_011): poprawiona wersja z tą samą nazwą pliku zastępuje tekst pod tym samym
adresem, zachowuje datę publikacji i dostaje datę aktualizacji.
"""

import base64, datetime, email, email.policy, glob, importlib.util, io, json, os, re, subprocess, sys, urllib.request, zipfile

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REJESTR = os.path.join(REPO, 'redakcja', 'skrzynka.json')
ARTYKULY = os.path.join(REPO, 'src', 'pages', 'artykuly')
KARTY_JSON = os.path.join('src', 'data', 'karty_setow.json')
ZALACZNIK = re.compile(r'\.(md|jpe?g|png|webp)$', re.I)
SITE = 'https://tylkoklocki.pl'
NADAWCA = 'Raporty tylkoklocki.pl <raporty@tylkoklocki.pl>'
# uwagi importu, które nie wstrzymują publikacji (link do huba zamiast artykułu, długość opisu/tytułu SEO);
# każda inna uwaga oznacza, że na stronie zostałby surowy znacznik albo brak pola — wtedy nic nie publikujemy
TYLKO_UWAGA = r'brak artykułu o LEGO|opis ma \d+ znaków|tytuł SEO ma|tytuł ma \d+ znaków'


def importer():
    sp = importlib.util.spec_from_file_location('imd', os.path.join(REPO, 'scripts', 'import-artykul-md.py'))
    m = importlib.util.module_from_spec(sp)
    sp.loader.exec_module(m)
    return m


# ── wyciągnij ──────────────────────────────────────────────────────────────
def znajdz_raw(msg_id):
    """Wynik get_message(RAW) trafia do transkryptu albo — gdy jest duży — do pliku w tool-results."""
    wzor = f'"id":"{msg_id}"'
    pliki = glob.glob('/root/.claude/projects/*/*/tool-results/*') + glob.glob('/root/.claude/projects/*/*.jsonl')
    for p in sorted(pliki, key=os.path.getmtime, reverse=True):
        try:
            tekst = open(p, encoding='utf-8', errors='replace').read()
        except OSError:
            continue
        for m in re.finditer(r'"raw"\s*:\s*\\?"([A-Za-z0-9_\-=]+)', tekst):
            okno = tekst[max(0, m.start() - 4000):m.end() + 4000]
            if wzor in okno or wzor.replace('"', '\\"') in okno:
                return m.group(1)
    return None


def rozpakuj_zip(dane, katalog):
    """ZIP z paczką (np. 25 opisów P07): płasko, tylko .md i zdjęcia; śmieci macOS (__MACOSX, ._x) pomijamy."""
    zapisane = []
    with zipfile.ZipFile(io.BytesIO(dane)) as z:
        for info in z.infolist():
            # zip bez flagi UTF-8 (zip z Linuksa/Windows) – Python czyta nazwę jako cp437, polskie znaki się sypią
            sciezka = info.filename if info.flag_bits & 0x800 else info.filename.encode('cp437', 'replace').decode('utf-8', 'replace')
            nazwa = os.path.basename(sciezka)
            if info.is_dir() or not nazwa or nazwa.startswith('._') or '__MACOSX' in info.filename or not ZALACZNIK.search(nazwa):
                continue
            with open(os.path.join(katalog, nazwa), 'wb') as f:
                f.write(z.read(info))
            zapisane.append(nazwa)
    return zapisane


def wyciagnij(msg_id, katalog):
    raw = znajdz_raw(msg_id)
    if not raw:
        raise SystemExit(f'Nie znalazłem wyniku get_message(RAW) dla {msg_id} — wywołaj narzędzie jeszcze raz.')
    mime = base64.urlsafe_b64decode(raw + '=' * (-len(raw) % 4))
    wiad = email.message_from_bytes(mime, policy=email.policy.default)
    os.makedirs(katalog, exist_ok=True)
    zapisane = []
    for czesc in wiad.iter_attachments():
        nazwa = czesc.get_filename()
        if not nazwa:
            continue
        nazwa = os.path.basename(nazwa)
        dane = czesc.get_payload(decode=True)
        if nazwa.lower().endswith('.zip'):
            zapisane += rozpakuj_zip(dane, katalog)
            continue
        if not ZALACZNIK.search(nazwa):
            continue
        with open(os.path.join(katalog, nazwa), 'wb') as f:
            f.write(dane)
        zapisane.append(nazwa)
    print(json.dumps({'od': str(wiad['From']), 'do': str(wiad['To']), 'temat': str(wiad['Subject'] or ''),
                      'zalaczniki': zapisane}, ensure_ascii=False))


# ── publikuj ───────────────────────────────────────────────────────────────
def klucz_pliku(plik):
    b = os.path.basename(plik)
    m = re.match(r'^(Recenzje_\d+|\d{3,5})_', b)
    return m.group(1) if m else re.sub(r'\.md$', '', b)


def git(*args, check=True):
    return subprocess.run(['git', *args], cwd=REPO, capture_output=True, text=True, check=check)


def jest_karta(plik):
    """Opis zestawu P07 poznajemy po treści (nagłówek „## Metryka zestawu”), nie po nazwie pliku."""
    try:
        return re.search(r'^##\s+Metryka zestawu', open(plik, encoding='utf-8-sig').read(), re.M) is not None
    except OSError:
        return False


# uwagi importu kart, po których na stronie zostałby surowy znacznik – blokują publikację;
# reszta (nazwa kanoniczna, nadpisanie, elementy vs katalog, brak huba) wraca jako uwaga
KARTA_PROBLEM = r'NIEROZWIĄZANY placeholder'
# uwagi techniczne, których Piotrowi nie wysyłamy (korekty szablonu robi importer sam)
KARTA_CICHO = r'gramatyka szablonu'


def importuj_karty(pliki, sucho):
    """scripts/import-karty.py dla plików .md z kartami; zwraca (numery, problemy, uwagi)."""
    polecenie = ['python3', os.path.join(REPO, 'scripts', 'import-karty.py'), *pliki, '--nadpisz'] + (['--sucho'] if sucho else [])
    wyn = subprocess.run(polecenie, cwd=REPO, capture_output=True, text=True)
    numery, problemy, uwagi = [], [], []
    if wyn.returncode != 0:
        problemy.append('Import kart nie powiódł się: ' + (wyn.stderr or wyn.stdout)[-600:])
        return numery, problemy, uwagi
    for linia in wyn.stdout.splitlines():
        m = re.match(r'^\s+(karta|BLOKADA|uwaga) (\S+): (.*)$', linia)
        if not m:
            continue
        rodzaj, nr, tresc = m.groups()
        if rodzaj == 'karta':
            numery.append(nr)
        elif rodzaj == 'BLOKADA' or re.search(KARTA_PROBLEM, tresc):
            problemy.append(f'karta {nr}: {tresc}')
        elif not re.search(KARTA_CICHO, tresc):
            uwagi.append(f'karta {nr}: {tresc}')
    return numery, problemy, uwagi


def publikuj(katalog, sucho=False):
    imd = importer()
    rejestr = json.load(open(REJESTR, encoding='utf-8')) if os.path.exists(REJESTR) else {}
    wszystkie = sorted(p for p in glob.glob(os.path.join(katalog, '*.md')) if not os.path.basename(p).startswith('_'))
    wynik = {'status': 'blad', 'linki': [], 'problemy': [], 'uwagi': []}
    if not wszystkie:
        wynik['problemy'].append('W mailu nie było pliku .md.')
        return wynik
    karty = [p for p in wszystkie if jest_karta(p)]
    pliki = [p for p in wszystkie if p not in karty]
    # karty: najpierw próba na sucho – problemy wstrzymują całą paczkę, tak jak przy artykułach
    numery_kart = []
    if karty:
        numery_kart, problemy_k, uwagi_k = importuj_karty(karty, sucho=True)
        wynik['problemy'] += problemy_k
        wynik['uwagi'] += uwagi_k
    if not pliki:
        if wynik['problemy'] or sucho:
            wynik['status'] = 'sucho' if sucho and not wynik['problemy'] else 'blad'
            wynik['linki'] = [f'{SITE}/zestaw/{nr}/' for nr in numery_kart]
            return wynik
        return zapisz_i_opublikuj(wynik, [], [], numery_kart, karty, rejestr)
    slugi = {p: rejestr.get(klucz_pliku(p), {}).get('slug') for p in pliki}
    # pierwszy przebieg: adresy z tego maila, żeby części cyklu linkowały się między sobą
    czesci, glowne = imd.opublikowane()
    for p in pliki:
        w = imd.importuj(p, slugi[p], zapisuj=False)
        slugi[p] = w['slug']
        if w['cykl'] and w['czesc']:
            czesci[(w['cykl'], w['czesc'])] = f'/artykuly/{w["slug"]}/'
        if w['zestawy']:
            glowne[w['zestawy'][0]] = f'/artykuly/{w["slug"]}/'
    gotowe = []
    for p in pliki:
        w = imd.importuj(p, slugi[p], zapisuj=False, wsad={'czesci': czesci, 'glowne': glowne})
        for u in w['uwagi']:
            lista = 'uwagi' if re.match(TYLKO_UWAGA, u) else 'problemy'
            wynik[lista].append(f'{os.path.basename(p)}: {u}')
        gotowe.append((p, w))
    if wynik['problemy'] or sucho:
        wynik['status'] = 'sucho' if sucho and not wynik['problemy'] else 'blad'
        wynik['linki'] = [f'{SITE}/artykuly/{w["slug"]}/' for _, w in gotowe] + [f'{SITE}/zestaw/{nr}/' for nr in numery_kart]
        return wynik
    return zapisz_i_opublikuj(wynik, gotowe, slugi, numery_kart, karty, rejestr)


def zapisz_i_opublikuj(wynik, gotowe, slugi, numery_kart, karty, rejestr):
    """Zapis artykułów i kart, build, commit, push – wszystko albo nic."""
    imd = importer()
    czesci, glowne = imd.opublikowane()
    dzis = datetime.date.today().isoformat()
    zapisane = []
    for _, w0 in gotowe:  # adresy części z tego samego maila (jak w pierwszym przebiegu publikuj)
        if w0['cykl'] and w0['czesc']:
            czesci[(w0['cykl'], w0['czesc'])] = f'/artykuly/{w0["slug"]}/'
        if w0['zestawy']:
            glowne[w0['zestawy'][0]] = f'/artykuly/{w0["slug"]}/'
    for p, w in gotowe:
        w = imd.importuj(p, slugi[p], zapisuj=True, wsad={'czesci': czesci, 'glowne': glowne})  # zdjęcia na dysk
        cel = os.path.join(ARTYKULY, w['slug'] + '.md')
        md = w['markdown']
        if os.path.exists(cel):
            stary = open(cel, encoding='utf-8').read()
            stara = re.search(r'^data:\s*"?([\d-]+)', stary, re.M)
            if stara:
                md = re.sub(r'^data:\s*"[\d-]+"', f'data: "{stara.group(1)}"\nzaktualizowano: "{dzis}"', md, count=1, flags=re.M)
            # okładkę, pasek i tagi dobrane w sesji przenosimy, jeśli nowa wersja ich nie ma
            for pole in ('okladka', 'okladka_alt', 'pasek_zestaw', 'tagi'):
                wiersz = re.search(rf'^{pole}:.*$', stary.split('\n---', 1)[0], re.M)
                if wiersz and not re.search(rf'^{pole}:', md, re.M):
                    md = re.sub(r'^(kategoria:.*)$', lambda m: m.group(1) + '\n' + wiersz.group(0), md, count=1, flags=re.M)
        with open(cel, 'w', encoding='utf-8') as f:
            f.write(md + '\n')
        zapisane.append(cel)
        wpis = rejestr.get(klucz_pliku(p), {})
        rejestr[klucz_pliku(p)] = {'slug': w['slug'], 'plik': os.path.basename(p),
                                   'opublikowano': wpis.get('opublikowano', dzis), 'aktualizacja': dzis}
        wynik['linki'].append(f'{SITE}/artykuly/{w["slug"]}/')

    if karty:
        numery_kart, problemy_k, _ = importuj_karty(karty, sucho=False)
        if problemy_k:
            git('checkout', '--', 'src/pages/artykuly', KARTY_JSON, check=False)
            wynik['problemy'] += problemy_k
            wynik['linki'] = []
            return wynik
        wynik['linki'] += [f'{SITE}/zestaw/{nr}/' for nr in numery_kart]

    build = subprocess.run(['npm', 'run', 'build'], cwd=REPO, capture_output=True, text=True)
    if build.returncode != 0:
        git('checkout', '--', 'src/pages/artykuly', KARTY_JSON, check=False)
        for c in zapisane:
            if git('ls-files', '--error-unmatch', c, check=False).returncode != 0 and os.path.exists(c):
                os.unlink(c)
        wynik['problemy'].append('Build się nie powiódł: ' + (build.stderr or build.stdout)[-600:])
        wynik['linki'] = []
        return wynik

    with open(REJESTR, 'w', encoding='utf-8') as f:
        f.write(json.dumps(rejestr, ensure_ascii=False, indent=1) + '\n')
    git('add', *zapisane, REJESTR)
    if karty:
        git('add', KARTY_JSON)
    if os.path.isdir(os.path.join(REPO, 'public', 'zdjecia', 'artykuly')):
        git('add', 'public/zdjecia/artykuly')
    tytuly = ', '.join([os.path.basename(c)[:-3] for c in zapisane] + [f'karta {nr}' for nr in numery_kart])
    git('commit', '-q', '-m', f'Teksty Piotra ze skrzynki: {tytuly}\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')
    for proba in range(3):
        if git('push', '-q', 'origin', 'HEAD:main', check=False).returncode == 0:
            wynik['status'] = 'ok'
            wynik['commit'] = git('rev-parse', '--short', 'HEAD').stdout.strip()
            return wynik
        git('fetch', '-q', 'origin', 'main', check=False)
        if git('rebase', '-q', 'origin/main', check=False).returncode != 0:
            git('rebase', '--abort', check=False)
            break
    wynik['problemy'].append('Push na main się nie udał — commit czeka lokalnie w sesji Code.')
    return wynik


# ── powiadom ───────────────────────────────────────────────────────────────
def powiadom(plik_wyniku):
    w = json.load(open(plik_wyniku, encoding='utf-8'))
    odbiorcy = json.load(open(os.path.join(REPO, 'src', 'data', 'raporty_mail.json'), encoding='utf-8'))['zadania']['teksty']['odbiorcy']
    if w['status'] == 'ok':
        nazwy = [('karta ' if '/zestaw/' in l else '') + l.rstrip('/').rsplit('/', 1)[-1] for l in w['linki']]
        temat = 'Opublikowane: ' + ', '.join(nazwy)[:150]
        tresc = '\n'.join(w['linki']) + '\n\nStrona odświeży się w ciągu 2–3 minut.'
        if w.get('uwagi'):
            tresc += '\n\nUwagi (tekst jest na stronie, można poprawić przy następnej wersji):\n' + '\n'.join(f'- {u}' for u in w['uwagi'])
    else:
        temat = 'Tekst nie został opublikowany — do poprawy'
        tresc = 'Nic nie trafiło na stronę. Problemy:\n\n' + '\n'.join(f'- {p}' for p in w['problemy'])
        tresc += '\n\nPopraw plik i wyślij go jeszcze raz na tylkoklockiblog+code@gmail.com (ta sama nazwa pliku).'
    klucz = os.environ.get('RESEND_API_KEY')
    if not klucz:
        raise SystemExit('Brak RESEND_API_KEY.')
    req = urllib.request.Request('https://api.resend.com/emails', method='POST',
                                 data=json.dumps({'from': NADAWCA, 'to': odbiorcy, 'subject': temat, 'text': tresc}).encode(),
                                 headers={'Authorization': f'Bearer {klucz}', 'Content-Type': 'application/json',
                                          'User-Agent': 'tylkoklocki.pl-raporty/1.0'})
    with urllib.request.urlopen(req, timeout=30) as odp:
        print('Wysłano:', ', '.join(odbiorcy), json.loads(odp.read()).get('id'))


if __name__ == '__main__':
    a = sys.argv[1:]
    if a[:1] == ['wyciagnij'] and len(a) == 3:
        wyciagnij(a[1], a[2])
    elif a[:1] == ['publikuj'] and len(a) >= 2:
        print(json.dumps(publikuj(a[1], sucho='--sucho' in a), ensure_ascii=False, indent=1))
    elif a[:1] == ['powiadom'] and len(a) == 2:
        powiadom(a[1])
    else:
        print(__doc__)
        sys.exit(2)
