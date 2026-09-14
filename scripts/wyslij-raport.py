#!/usr/bin/env python3
"""Wysyla raport z zadania cyklicznego jako PDF na adresy z src/data/raporty_mail.json.

Wymaga zmiennej srodowiskowej RESEND_API_KEY (nadawca: raporty@tylkoklocki.pl,
domena zweryfikowana w Resend, region eu-west-1).

Uzycie:
  python3 scripts/wyslij-raport.py --zadanie promocje \
      --tytul "Lowca Promocji — 19.08.2026" --plik raport.md \
      [--wstep "Jedno-dwa zdania podsumowania do tresci maila."] \
      [--do adres@example.com]     # nadpisuje odbiorcow z konfiguracji (testy)
      [--tylko-pdf wynik.pdf]      # zapisz PDF i NIE wysylaj

Plik wejsciowy: .md albo .html.

HISTORIA, ktora tlumaczy ksztalt tego skryptu (14.09.2026): przez cztery
tygodnie NIE wyszedl z niego ani jeden mail poza recznym testem z 19.08.
Trzy niezalezne powody: (1) zaden runner nie mial w promptcie kroku wysylki,
(2) runnery nie tworzyly pliku raportu, ktory da sie zalaczyc, (3) skrypt
importowal weasyprint i python-markdown, ktorych nie deklarowal requirements.txt
i ktorych nie instalowal zaden runner — padlby na pierwszym imporcie.
Dlatego PDF robi teraz headless Chromium (jest w kazdym kontenerze, w
/opt/pw-browsers), a markdown zamienia scripts/md-na-pdf.py z tego repo.
Zero zaleznosci do instalowania.

Zwraca kod 0 przy sukcesie, 1 przy bledzie wysylki, 2 przy bledzie konfiguracji.
"""
import argparse, base64, glob, json, os, subprocess, sys, tempfile, urllib.request, urllib.error
from datetime import date
from pathlib import Path

NADAWCA = 'Raporty tylkoklocki.pl <raporty@tylkoklocki.pl>'
REPO = Path(__file__).resolve().parent.parent
KONFIG = REPO / 'src' / 'data' / 'raporty_mail.json'
KONWERTER = REPO / 'scripts' / 'md-na-pdf.py'


def chromium() -> str:
    """Sciezka do headless Chromium. Numer wersji w katalogu sie zmienia,
    wiec nie wpisujemy go na sztywno — bierzemy to, co jest."""
    for wzorzec in ('/opt/pw-browsers/chromium-*/chrome-linux/chrome',
                    '/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell'):
        trafienia = sorted(glob.glob(wzorzec))
        if trafienia:
            return trafienia[-1]
    raise RuntimeError('brak Chromium w /opt/pw-browsers — PDF nie powstanie')


def html_z_pliku(sciezka: Path, tytul: str) -> str:
    if sciezka.suffix.lower() in ('.html', '.htm'):
        return sciezka.read_text(encoding='utf-8')
    # md-na-pdf.py drukuje gotowy dokument HTML ze stylem na stdout
    wynik = subprocess.run([sys.executable, str(KONWERTER), str(sciezka)],
                           capture_output=True, text=True, check=True)
    html = wynik.stdout
    dzis = date.today().strftime('%d.%m.%Y')
    # naglowek raportu tuz po <body>, zeby PDF mial tytul i date
    naglowek = (f'<h1>{tytul}</h1>'
                f'<p style="color:#6b7280;font-size:8.5pt;margin:0 0 14pt">'
                f'tylkoklocki.pl · raport z zadania cyklicznego · wygenerowano {dzis}</p>')
    return html.replace('<body>', '<body>' + naglowek, 1)


def pdf_z_html(html: str) -> bytes:
    with tempfile.TemporaryDirectory() as kat:
        src = Path(kat) / 'raport.html'
        pdf = Path(kat) / 'raport.pdf'
        src.write_text(html, encoding='utf-8')
        subprocess.run([chromium(), '--headless', '--disable-gpu', '--no-sandbox',
                        '--no-pdf-header-footer', f'--print-to-pdf={pdf}', str(src)],
                       capture_output=True, check=True, timeout=60)
        return pdf.read_bytes()


def wyslij(klucz: str, odbiorcy: list, temat: str, tekst: str, nazwa_pdf: str, pdf: bytes) -> None:
    ladunek = json.dumps({
        'from': NADAWCA,
        'to': odbiorcy,
        'subject': temat,
        'text': tekst,
        'attachments': [{'filename': nazwa_pdf,
                         'content': base64.b64encode(pdf).decode('ascii')}],
    }).encode('utf-8')
    zadanie = urllib.request.Request(
        'https://api.resend.com/emails', data=ladunek, method='POST',
        headers={'Authorization': f'Bearer {klucz}', 'Content-Type': 'application/json',
                 # bez tego naglowka Cloudflare przed API Resend odrzuca urllib (403, kod 1010)
                 'User-Agent': 'tylkoklocki.pl-raporty/1.0'})
    with urllib.request.urlopen(zadanie, timeout=30) as odp:
        wynik = json.loads(odp.read())
    print(f"Wyslano do: {', '.join(odbiorcy)} (id: {wynik.get('id')})")


def main() -> int:
    p = argparse.ArgumentParser(description='Wysylka raportu PDF z zadania cyklicznego.')
    p.add_argument('--zadanie', required=True, help='klucz z raporty_mail.json (promocje/nowosci/wycofania/konkurencja)')
    p.add_argument('--tytul', required=True, help='tytul raportu (naglowek PDF i temat maila)')
    p.add_argument('--plik', required=True, help='sciezka do raportu .md albo .html')
    p.add_argument('--wstep', default='', help='1-2 zdania do tresci maila (PDF w zalaczniku)')
    p.add_argument('--do', action='append', default=[], metavar='ADRES',
                   help='wyslij TYLKO na ten adres zamiast odbiorcow z konfiguracji (mozna powtarzac); do testow')
    p.add_argument('--tylko-pdf', metavar='PLIK.pdf', help='zapisz PDF pod ta sciezka i nie wysylaj niczego')
    a = p.parse_args()

    konfig = json.loads(KONFIG.read_text(encoding='utf-8'))
    zadanie = konfig.get('zadania', {}).get(a.zadanie)
    if not zadanie:
        print(f"BLAD: nieznane zadanie '{a.zadanie}'. Dostepne: {', '.join(konfig.get('zadania', {}))}", file=sys.stderr)
        return 2
    odbiorcy = a.do or zadanie.get('odbiorcy') or []
    if not odbiorcy and not a.tylko_pdf:
        print(f"BLAD: brak odbiorcow dla zadania '{a.zadanie}'.", file=sys.stderr)
        return 2

    zrodlo = Path(a.plik)
    if not zrodlo.is_file():
        print(f'BLAD: nie ma pliku {zrodlo}', file=sys.stderr)
        return 2

    try:
        pdf = pdf_z_html(html_z_pliku(zrodlo, a.tytul))
    except (RuntimeError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
        print(f'BLAD generowania PDF: {e}', file=sys.stderr)
        return 2

    if a.tylko_pdf:
        Path(a.tylko_pdf).write_bytes(pdf)
        print(f'PDF zapisany: {a.tylko_pdf} ({len(pdf)} B), nic nie wyslano.')
        return 0

    klucz = os.environ.get('RESEND_API_KEY')
    if not klucz:
        print('BLAD: brak RESEND_API_KEY w srodowisku.', file=sys.stderr)
        return 2

    nazwa = f"{a.zadanie}-{date.today().isoformat()}.pdf"
    tresc = (a.wstep or f"Raport „{zadanie['nazwa']}” w załączniku (PDF).").strip()
    tresc += '\n\n---\nRaport wygenerowany automatycznie przez zadanie cykliczne tylkoklocki.pl.'

    try:
        wyslij(klucz, odbiorcy, a.tytul, tresc, nazwa, pdf)
    except urllib.error.HTTPError as e:
        print(f'BLAD wysylki ({e.code}): {e.read().decode("utf-8", "replace")[:400]}', file=sys.stderr)
        return 1
    except Exception as e:  # siec, timeout itp.
        print(f'BLAD wysylki: {e}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
