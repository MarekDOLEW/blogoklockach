import base64
from pathlib import Path

REPO = Path('/home/user/blogoklockach')
S = Path('/tmp/claude-0/-home-user-blogoklockach/7bc39f44-7207-58cb-999c-eb466d2f2ed5/scratchpad/social')
FONTY = REPO / '.claude/skills/canvas-design/canvas-fonts'


def b64(p, mime):
    return f"data:{mime};base64," + base64.b64encode(Path(p).read_bytes()).decode()


def img(nazwa):
    return b64(S / 'img' / f'{nazwa}.jpg', 'image/jpeg')


LOGO = b64(REPO / 'public/logo.svg', 'image/svg+xml')
LOGO_B = b64(REPO / 'public/logo-biale.svg', 'image/svg+xml')

CSS = f"""
@font-face {{ font-family: 'Archivo'; src: url('{b64(FONTY / 'Archivo-Variable.ttf', 'font/ttf')}') format('truetype'); font-weight: 100 900; }}
@font-face {{ font-family: 'Instrument'; src: url('{b64(FONTY / 'InstrumentSans-Regular.ttf', 'font/ttf')}') format('truetype'); font-weight: 400; }}
@font-face {{ font-family: 'Instrument'; src: url('{b64(FONTY / 'InstrumentSans-Bold.ttf', 'font/ttf')}') format('truetype'); font-weight: 700; }}
:root {{ --papier:#f6f7f9; --karta:#fff; --granat:#17233f; --granat60:#4a5670; --zolty:#ffc933; --czerwien:#e0312f; --zielen:#0f7a43; --linia:#dde1e8; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{ background: #ccc; }}
.slajd {{ width: 1080px; height: 1350px; position: relative; overflow: hidden; background: var(--papier); color: var(--granat);
  font-family: 'Instrument', sans-serif; margin: 0 0 20px; }}
.ciemny {{ background: var(--granat); color: #fff; }}
h1, h2, .liczba {{ font-family: 'Archivo', sans-serif; font-weight: 800; letter-spacing: -0.015em; line-height: 1.08; }}
h1 {{ font-size: 84px; }}
h2 {{ font-size: 66px; }}
p {{ font-size: 34px; line-height: 1.5; }}
.tag {{ display: inline-block; font-family: 'Archivo'; font-weight: 700; font-size: 26px; letter-spacing: 0.08em; text-transform: uppercase;
  background: var(--zolty); color: var(--granat); padding: 10px 22px; border-radius: 10px; }}
.wypustki {{ position: absolute; top: 0; left: 0; right: 0; height: 22px; background: var(--zolty); }}
.logo {{ position: absolute; left: 80px; bottom: 64px; height: 44px; }}
.licznik {{ position: absolute; right: 80px; bottom: 66px; font-family: 'Archivo'; font-weight: 700; font-size: 28px; color: var(--granat60); }}
.ciemny .licznik {{ color: #b9c2d6; }}
.foto {{ position: absolute; left: 80px; right: 80px; border-radius: 28px; overflow: hidden; background: var(--karta); }}
.foto img {{ width: 100%; height: 100%; object-fit: cover; display: block; }}
.foto.contain img {{ object-fit: contain; }}
.tresc {{ position: absolute; left: 80px; right: 80px; }}
.stara {{ font-family: 'Archivo'; font-weight: 700; font-size: 44px; color: var(--granat60); text-decoration: line-through; text-decoration-color: var(--czerwien); text-decoration-thickness: 5px; }}
.cena {{ font-family: 'Archivo'; font-weight: 800; font-size: 150px; color: var(--czerwien); line-height: 1; letter-spacing: -0.02em; }}
.rabat {{ display: inline-block; background: var(--czerwien); color: #fff; font-family: 'Archivo'; font-weight: 800; font-size: 54px; padding: 8px 22px; border-radius: 14px; }}
.minimum {{ display: inline-block; background: var(--zielen); color: #fff; font-family: 'Archivo'; font-weight: 700; font-size: 28px; padding: 12px 22px; border-radius: 12px; }}
.oznaczenie {{ font-size: 24px; color: var(--granat60); }}
.ciemny .oznaczenie {{ color: #b9c2d6; }}
ul {{ list-style: none; }}
li {{ font-size: 34px; line-height: 1.45; padding-left: 46px; position: relative; margin-bottom: 18px; }}
li::before {{ content: ''; position: absolute; left: 0; top: 14px; width: 24px; height: 24px; border-radius: 50%; background: var(--zolty); }}
.drabina {{ border-radius: 24px; overflow: hidden; border: 3px solid var(--linia); background: var(--karta); }}
.drabina div {{ display: flex; justify-content: space-between; align-items: center; padding: 26px 36px; font-size: 34px; border-bottom: 3px solid var(--linia); }}
.drabina div:last-child {{ border-bottom: 0; }}
.drabina b {{ font-family: 'Archivo'; font-weight: 800; font-size: 40px; }}
.drabina .prog {{ background: var(--zolty); }}
"""


def strona(slajdy, tytul):
    return f"<!doctype html><html lang='pl'><head><meta charset='utf-8'><title>{tytul}</title><style>{CSS}</style></head><body>{''.join(slajdy)}</body></html>"


# ── post statyczny: zestaw dnia ───────────────────────────────────────────
post = f"""
<section class="slajd">
  <div class="wypustki"></div>
  <div class="tresc" style="top:70px"><span class="tag">Okazja dnia · Black Weeks w x-kom</span></div>
  <div class="foto contain" style="top:150px;height:500px;"><img src="{img('75446-3')}"></div>
  <div class="tresc" style="top:686px">
    <h2 style="font-size:52px">LEGO Star Wars 75446<br>Grogu (uczeń Mandalorianina)</h2>
    <div style="display:flex;align-items:flex-end;gap:30px;margin-top:26px">
      <div class="cena">319 zł</div>
      <div style="padding-bottom:12px"><div class="stara">559,99 zł</div><div class="rabat" style="margin-top:18px">−43%</div></div>
    </div>
    <div style="margin-top:24px;display:flex;gap:16px;align-items:center;flex-wrap:wrap">
      <span class="minimum">najniższa cena w naszych notowaniach</span>
    </div>
    <p style="font-size:30px;margin-top:20px">x-kom · kod <b>black-weeks2</b> w koszyku · cena z 26.10.2026</p>
    <div style="margin-top:22px"><span class="tag" style="font-size:30px;text-transform:none;letter-spacing:0">Link do sklepu w bio →</span></div>
  </div>
  <img class="logo" src="{LOGO}">
  <div class="licznik oznaczenie" style="font-size:22px;bottom:72px">#materiałpartnerski · linki afiliacyjne</div>
</section>"""

# ── karuzela: recenzja 75439 ──────────────────────────────────────────────
N = 7
def stopka(i, ciemny=False):
    return f'<img class="logo" src="{LOGO_B if ciemny else LOGO}"><div class="licznik">{i}/{N}</div>'

k = []
k.append(f"""
<section class="slajd ciemny">
  <div class="foto" style="top:80px;left:190px;right:190px;height:700px;background:#000"><img src="{img('75439-5-t')}"></div>
  <div class="tresc" style="top:830px">
    <span class="tag">Recenzja · LEGO 75439</span>
    <h1 style="margin-top:26px;font-size:76px">Hełm prawie bez zarzutu.<br>Za 209,99 zł — za drogo.</h1>
    <p style="margin-top:22px;color:#dfe4ee">Dziś jest za 148,94 zł, czyli poniżej naszego progu zakupu. Przesuń →</p>
  </div>
  {stopka(1, True)}
</section>""")
k.append(f"""
<section class="slajd">
  <div class="wypustki"></div>
  <div class="foto contain" style="top:80px;height:640px"><img src="{img('75439-1')}"></div>
  <div class="tresc" style="top:770px">
    <h2>Co jest w pudełku</h2>
    <ul style="margin-top:28px">
      <li><b>349 elementów</b>, oznaczenie 18+</li>
      <li><b>18 cm</b> wysokości, 14 cm szerokości</li>
      <li><b>Bez naklejek</b>: nos i kratki maski są nadrukowane</li>
      <li>Minifigurka Vadera z czerwonym mieczem</li>
    </ul>
  </div>
  {stopka(2)}
</section>""")
k.append(f"""
<section class="slajd">
  <div class="wypustki"></div>
  <div class="foto" style="top:80px;height:680px"><img src="{img('75439-7-t')}" style="object-position:center 30%"></div>
  <div class="tresc" style="top:810px">
    <h2>Najmocniejsza strona: hełm</h2>
    <p style="margin-top:24px">Gładkie, zakrzywione elementy, z przodu prawie bez wypustek. Łuki brwiowe zbudowano z nadkoli od pojazdów. Dają groźny cień wokół oczu.</p>
  </div>
  {stopka(3)}
</section>""")
k.append(f"""
<section class="slajd ciemny">
  <div class="foto" style="top:80px;height:680px;background:#000"><img src="{img('75439-8-t')}" style="object-position:center 40%"></div>
  <div class="tresc" style="top:810px">
    <h2>Vader nie stoi sztywno</h2>
    <p style="margin-top:24px;color:#dfe4ee">Głowa obraca się na boki i trzyma ustawienie. Całe popiersie kręci się na podstawce, a górę można zdjąć i postawić osobno.</p>
  </div>
  {stopka(4, True)}
</section>""")
k.append(f"""
<section class="slajd">
  <div class="wypustki"></div>
  <div class="foto contain" style="top:80px;height:680px"><img src="{img('75439-4')}"></div>
  <div class="tresc" style="top:810px">
    <h2>Gdzie traci punkty</h2>
    <p style="margin-top:24px">Pasiasta płyta na piersi jest ciemnoszara, a powinna być srebrna. Oczy osadzono płasko. To drobiazgi, które zauważy głównie ktoś, kto porównuje model z filmem.</p>
  </div>
  {stopka(5)}
</section>""")
k.append(f"""
<section class="slajd">
  <div class="wypustki"></div>
  <div class="tresc" style="top:110px">
    <span class="tag">Ile zapłacić</span>
    <h2 style="margin-top:26px">Kupuj poniżej 150 zł</h2>
    <div class="drabina" style="margin-top:44px">
      <div><span>Cena katalogowa</span><b style="text-decoration:line-through;text-decoration-color:var(--czerwien)">209,99 zł</b></div>
      <div><span>Typowo w dużych sklepach</span><b>150–170 zł</b></div>
      <div class="prog"><span><b style="font-size:34px">Nasz próg zakupu</b></span><b>ok. 150 zł</b></div>
      <div><span>Bardzo dobra cena</span><b>poniżej 140 zł</b></div>
    </div>
    <div style="margin-top:56px;display:flex;align-items:flex-end;gap:28px">
      <div class="cena" style="font-size:120px">148,94 zł</div>
      <div class="rabat" style="margin-bottom:12px">−29%</div>
    </div>
    <p style="margin-top:14px">Media Expert, 26.10.2026: dziś poniżej progu.</p>
  </div>
  {stopka(6)}
</section>""")
k.append(f"""
<section class="slajd ciemny">
  <div class="tresc" style="top:150px">
    <span class="tag">Werdykt</span>
    <h1 style="margin-top:34px;font-size:80px">Tak, dla dorosłego fana Star Wars, który chce Vadera na biurko.</h1>
    <p style="margin-top:34px;color:#dfe4ee">Za pełne 209,99 zł lepiej poczekać. Przy ok. 150 zł to po prostu dobry zakup.</p>
    <div style="margin-top:70px;background:var(--zolty);color:var(--granat);border-radius:24px;padding:40px 44px">
      <div style="font-family:Archivo;font-weight:800;font-size:52px;line-height:1.15">Pełna recenzja i ceny we wszystkich sklepach</div>
      <div style="font-family:Archivo;font-weight:700;font-size:40px;margin-top:14px">→ link w bio</div>
    </div>
    <p class="oznaczenie" style="margin-top:36px">#materiałpartnerski · linki afiliacyjne</p>
  </div>
  {stopka(7, True)}
</section>""")

(S / 'post-75446.html').write_text(strona([post], 'Okazja dnia 75446'), encoding='utf-8')
(S / 'karuzela-75439.html').write_text(strona(k, 'Recenzja 75439'), encoding='utf-8')
print('ok')
