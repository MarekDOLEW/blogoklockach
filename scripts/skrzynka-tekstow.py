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

Rejestr `redakcja/skrzynka.json` pamięta, pod jakim adresem stoi tekst o danym numerze
(0025, Recenzje_011): poprawiona wersja z tą samą nazwą pliku zastępuje tekst pod tym samym
adresem, zachowuje datę publikacji i dostaje datę aktualizacji.
"""

import base64, datetime, email, email.policy, glob, importlib.util, json, os, re, subprocess, sys, urllib.request

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REJESTR = os.path.join(REPO, 'redakcja', 'skrzynka.json')
ARTYKULY = os.path.join(REPO, 'src', 'pages', 'artykuly')
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
        if not re.search(r'\.(md|jpe?g|png|webp)$', nazwa, re.I):
            continue
        with open(os.path.join(katalog, nazwa), 'wb') as f:
            f.write(czesc.get_payload(decode=True))
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


def publikuj(katalog, sucho=False):
    imd = importer()
    rejestr = json.load(open(REJESTR, encoding='utf-8')) if os.path.exists(REJESTR) else {}
    pliki = sorted(glob.glob(os.path.join(katalog, '*.md')))
    wynik = {'status': 'blad', 'linki': [], 'problemy': [], 'uwagi': []}
    if not pliki:
        wynik['problemy'].append('W mailu nie było pliku .md.')
        return wynik
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
        wynik['linki'] = [f'{SITE}/artykuly/{w["slug"]}/' for _, w in gotowe]
        return wynik

    dzis = datetime.date.today().isoformat()
    zapisane = []
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

    build = subprocess.run(['npm', 'run', 'build'], cwd=REPO, capture_output=True, text=True)
    if build.returncode != 0:
        git('checkout', '--', 'src/pages/artykuly', check=False)
        for c in zapisane:
            if git('ls-files', '--error-unmatch', c, check=False).returncode != 0 and os.path.exists(c):
                os.unlink(c)
        wynik['problemy'].append('Build się nie powiódł: ' + (build.stderr or build.stdout)[-600:])
        wynik['linki'] = []
        return wynik

    with open(REJESTR, 'w', encoding='utf-8') as f:
        f.write(json.dumps(rejestr, ensure_ascii=False, indent=1) + '\n')
    git('add', *zapisane, REJESTR)
    if os.path.isdir(os.path.join(REPO, 'public', 'zdjecia', 'artykuly')):
        git('add', 'public/zdjecia/artykuly')
    tytuly = ', '.join(os.path.basename(c)[:-3] for c in zapisane)
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
        temat = 'Opublikowane: ' + ', '.join(l.rstrip('/').rsplit('/', 1)[-1] for l in w['linki'])[:150]
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
