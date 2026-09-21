import redirects from './data/redirects.json';
import sklepy from './data/sklepy.json';
import obrazy from './data/obrazy.json';
import galerie from './data/galerie.json';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Adresy sklepu z zabawkami, który żył na tej domenie przed nami
    // (/p/<id>/<id>/<slug>.html — Search Console 15.09.2026: Google wciąż je
    // odwiedza, stare linki z zewnątrz też). 410 Gone mówi Google „usunięte na
    // stałe” i wypada z indeksu szybciej niż 404; nie przekierowujemy, bo nie
    // mamy odpowiedników (decyzja Marka 15.09.2026: „wykasuj – zablokuj”).
    if (/^\/p\/\d+\/\d+\/[^/]+\.html$/.test(url.pathname)) {
      return new Response('Ta strona została usunięta na stałe.', {
        status: 410, headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }

    // Alerty cenowe „Obserwuj zestaw" (15.09.2026): POST /obserwuj z formularza
    // huba, GET /obserwuj/potwierdz i /obserwuj/rezygnuj z linków w mailu.
    // Zapis w R2 (_obserwuj/<nr>/<token>.json), mail potwierdzający przez Resend
    // (sekret RESEND_API_KEY workera); alerty wysyła scripts/alerty-cen.mjs.
    if (url.pathname === '/obserwuj' || url.pathname.startsWith('/obserwuj/')) {
      return obserwuj(request, env, url);
    }

    // Zdjęcia zestawów z naszej domeny: /img/<numer>.jpg
    // Kolejność: trwała kopia w R2 -> pobranie ze źródła (sklep/rebrickable)
    // z zapisem przelotowym do R2. Raz zapisane zdjęcie zostaje u nas na zawsze,
    // nawet gdy sklep skasuje oryginał; cache Cloudflare przyspiesza oba przypadki.
    if (url.pathname.startsWith('/img/')) {
      // sam numer = zdjęcie główne (obrazy.json); numer-pozycja = zdjęcie
      // z galerii artykułowej (galerie.json, pozycje liczone od 1)
      const klucz = url.pathname.slice(5).replace(/\.jpg$/, '');
      const dopasowanie = /^([0-9]{4,7})(?:-([1-9][0-9]?))?$/.exec(klucz);
      if (!dopasowanie) return new Response('Brak zdjęcia', { status: 404 });
      const numer = dopasowanie[1];
      const pozycja = dopasowanie[2] ? Number(dopasowanie[2]) : null;
      const naglowki = (typ, zrodlo) => ({
        'content-type': typ ?? 'image/jpeg',
        'cache-control': 'public, max-age=2592000, stale-while-revalidate=86400',
        'x-obraz-zrodlo': zrodlo,
      });

      const kopia = await env.OBRAZY?.get(klucz);
      if (kopia) {
        return new Response(kopia.body, { headers: naglowki(kopia.httpMetadata?.contentType, 'r2') });
      }

      const zrodlo = pozycja ? galerie[numer]?.[pozycja - 1] : obrazy[numer];
      if (!zrodlo) return new Response('Brak zdjęcia', { status: 404 });
      const odp = await fetch(zrodlo, {
        cf: { cacheEverything: true, cacheTtl: 60 * 60 * 24 * 30 },
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; tylkoklocki.pl image cache)' },
      });
      if (!odp.ok) return new Response('Zdjęcie niedostępne', { status: 502 });
      const dane = await odp.arrayBuffer();
      const typ = odp.headers.get('content-type') ?? 'image/jpeg';
      if (env.OBRAZY) {
        ctx.waitUntil(env.OBRAZY.put(klucz, dane, { httpMetadata: { contentType: typ } }));
      }
      return new Response(dane, { headers: naglowki(typ, 'origin') });
    }

    // Przekierowania afiliacyjne: /idz/[sklep]/[numer]
    if (url.pathname.startsWith('/idz/')) {
      const czesci = url.pathname.split('/').filter(Boolean); // ["idz", sklep, numer]
      const sklep = czesci[1] ?? '';
      const numer = czesci[2] ?? '';
      let cel = redirects?.[sklep]?.[numer];

      // Filtr botów (14.09.2026). Pomiar za 7–14.09: 939 kliknięć w /idz/,
      // z tego 867 (92,3%) BEZ referera i spoza Polski, 29 z podrobionym
      // refererem `http://tylkoklocki.pl` (serwis chodzi wyłącznie po HTTPS,
      // więc prawdziwa przeglądarka nigdy tak się nie przedstawi). Realnych
      // przejść było 37. Search Console za ten sam tydzień: 1 kliknięcie.
      //
      // Problem nie jest statystyczny: każde takie przejście szło dalej do
      // Allegro Affiliate, Performers, Tradedoublera i Adtraction, więc z ich
      // perspektywy konto wydawcy generowało setki kliknięć przy zerowej
      // konwersji — typowy powód wstrzymania konta.
      //
      // Kryterium to WYŁĄCZNIE referer, nie kraj: 20 z 66 kliknięć z naszym
      // refererem przyszło z Niemiec, 9 z USA (Polacy za granicą, VPN, testy).
      // Filtr po kraju odciąłby realnych czytelników.
      //
      // Odrzucone żądanie dostaje przekierowanie na hub zestawu zamiast 204:
      // sieć afiliacyjna nie widzi pustego kliknięcia, a człowiek, któremu
      // przeglądarka wycięła referer, ląduje na stronie z tabelą cen i może
      // kliknąć jeszcze raz — normalnie, z refererem.
      const referer = request.headers.get('referer') ?? '';
      // 15.09.2026: sam referer to za mało — przeglądarki z wyłączonym refererem
      // (ustawienia prywatności, część webview) dostawały pętlę „klik → ten sam
      // hub". Nagłówek Sec-Fetch-Site wysyła każda współczesna przeglądarka przy
      // nawigacji i nie da się go wyłączyć w ustawieniach; „same-origin"/„same-site"
      // znaczy, że klik przyszedł z naszej strony. curl i scrapery go nie wysyłają.
      const secFetch = request.headers.get('sec-fetch-site') ?? '';
      // 21.09.2026 (raport Kontrolera): sam host w refererze to za mało. Audyt
      // z 16.09 przeszedł przez filtr z refererem `https://tylkoklocki.pl/zestaw/x/`
      // — strona, która nie istnieje — i 17 sztucznych kliknięć poszło do sieci
      // afiliacyjnych jako ludzkie. Dlatego referer musi wskazywać stronę, z której
      // realnie da się kliknąć w sklep: hub zestawu (wtedy numer w refererze musi
      // być tym samym, który kliknięto), artykuł, prezentownik, deal, seria, listing
      // nowości, wycofania, ekskluzywne, kolekcjoner albo strona główna.
      // Sec-Fetch-Site zostaje jako druga droga dla przeglądarek tnących referer;
      // to nagłówek również do podrobienia z curla, ale prawdziwe przeglądarki
      // go potrzebują — pełne domknięcie wymagałoby podpisanego tokenu w linku.
      const sciezkaReferera = (() => {
        try { return new URL(referer).pathname; } catch { return null; }
      })();
      const hostOk = /^https:\/\/(www\.)?tylkoklocki\.pl(\/|$)/.test(referer);
      const zHubu = sciezkaReferera && /^\/zestaw\/(\d{4,7})\/$/.exec(sciezkaReferera);
      const refererOk =
        hostOk &&
        (zHubu
          ? zHubu[1] === numer
          : /^\/($|artykuly\/|prezentowniki\/|deale\/|serie\/|nowosci\/|wycofania\/|ekskluzywne\/|kolekcjoner\/|kalendarz-promocji-lego\/|zapowiedzi-lego-2027\/|przecieki\/)/.test(sciezkaReferera ?? ''));
      const zNaszejStrony = refererOk || secFetch === 'same-origin' || secFetch === 'same-site';

      // LEGO.com nie ma programu afiliacyjnego w naszym miksie — linkujemy
      // bezpośrednio. lego.com akceptuje sam numer zestawu w adresie produktu
      // i przekierowuje na pełny URL ze slugiem.
      if (!cel && sklep === 'lego' && /^\d{4,7}$/.test(numer)) {
        cel = `https://www.lego.com/pl-pl/product/${numer}`;
      }

      // x-kom: kod partnerski SalesMasters jest uniwersalny — działa doklejony
      // do dowolnego adresu sklepu. Bez wpisu w redirects.json (bezpośredni
      // link produktowy ma pierwszeństwo) kierujemy na wyniki wyszukiwania
      // numeru setu — pokrywa to automatycznie także nowe zestawy.
      if (!cel && sklep === 'xkom' && /^\d{4,7}$/.test(numer)) {
        cel = `https://www.x-kom.pl/szukaj?q=LEGO%20${numer}&sm=Y74rgdCO`;
      }

      // Allegro: własna kampania afiliacyjna. Wpisy w redirects to gotowe
      // item_link z feedu (endpoint /affiliate akceptuje z zewnątrz tylko ścieżki
      // /oferta/... oraz zarejestrowany link kampanii — warianty z /listing
      // odrzuca niezależnie od kodowania). Dla setów spoza feedu kierujemy więc
      // sprawdzonym linkiem kampanii na stronę główną Allegro (cookie prowizyjne
      // się ustawia, klient doszukuje set ręcznie).
      if (!cel && sklep === 'allegro' && /^\d{4,7}$/.test(numer)) {
        cel = 'https://allegro.pl/affiliate?redirect_url=https://allegro.pl?utm_medium%3Dafiliacja%26utm_source%3Dctr_b%26utm_campaign%3D49250116-4827-4f0d-b2b2-f65993d0f372';
      }
      // Smyk: program w Adtraction — deeplink budowany z linku trackingowego
      // kanału (a=Brand AD ID Smyka, as=ID kanału Tylko Klocki) + docelowy URL
      // wyszukiwarki smyk.com w parametrze url. Pokrywa każdy numer setu.
      if (!cel && sklep === 'smyk' && /^\d{4,7}$/.test(numer)) {
        // format celu 1:1 jak z panelowego generatora linków Adtraction:
        // bez schematu https:// i bez percent-encodingu — wersję zakodowaną
        // tracker odrzucał i lądował na stronie głównej
        cel = 'https://go.adt256.com/t/t?a=2030748298&as=2103402418&t=2&tk=1&url=www.smyk.com/pl/pl/zabawki-gry/klocki/lego.html';
      }

      // Empik: program w Tradedoublerze (p=program, a=konto). Deeplink przez
      // parametr url= — przetestowany: cel (wyszukiwarka Empiku) jest zachowany.
      // Regulamin programu wprost dopuszcza "Price comparison", czyli nasz model.
      if (!cel && sklep === 'empik' && /^\d{4,7}$/.test(numer)) {
        const celEmpik = `https://www.empik.com/szukaj/produkt?q=LEGO+${numer}`;
        cel = `https://clk.tradedoubler.com/click?p=289664&a=3494691&url=${encodeURIComponent(celEmpik)}`;
      }

      // Ceneo: program CPS w Tradedoublerze. Linki produktowe (pdt.tradedoubler.com)
      // biorą się z feedu Ceneo_LEGO i siedzą w redirects.json. Dla setów spoza
      // feedu budujemy deeplink na wyszukiwarkę Ceneo tym samym formatem, co Empik.
      if (!cel && sklep === 'ceneo' && /^\d{4,7}$/.test(numer)) {
        const celCeneo = `https://www.ceneo.pl/;szukaj-LEGO+${numer}`;
        cel = `https://clk.tradedoubler.com/click?p=385881&a=3494691&url=${encodeURIComponent(celCeneo)}`;
      }

      // Sklepy bez afiliacji: skoro pokazujemy cenę, dajemy przynajmniej zwykły
      // link — szablon `szukaj` ze sklepy.json ({nr} = numer setu); szablony bez
      // {nr} prowadzą na stronę główną sklepu.
      if (!cel && sklepy[sklep]?.szukaj && /^\d{4,7}$/.test(numer)) {
        cel = sklepy[sklep].szukaj.replace('{nr}', numer);
      }

      // Szczątkowa analityka kliknięć afiliacyjnych (Workers Analytics Engine).
      // Zapis: sklep, numer, czy link istniał, referer (skąd klik), kraj.
      // Odczyt: SQL API, np.
      //   SELECT blob1 AS sklep, blob2 AS numer, SUM(_sample_interval) AS kliki
      //   FROM idz_kliki WHERE timestamp > NOW() - INTERVAL '7' DAY
      //   GROUP BY sklep, numer ORDER BY kliki DESC
      try {
        env.KLIKI?.writeDataPoint({
          // blob6 dodany 14.09.2026 — starsze zapytania (blob1–blob5) działają bez zmian
          blobs: [sklep, numer, cel ? 'ok' : 'brak-linku', referer, request.cf?.country ?? '',
                  zNaszejStrony ? 'human' : 'bot'],
          doubles: [1],
          indexes: [sklep],
        });
      } catch {}

      // Ruch bez referera z naszej domeny nie idzie do sieci afiliacyjnej.
      // Zapis powyżej zostaje, żeby dalej było widać skalę zjawiska.
      if (!zNaszejStrony) {
        // odrzucony klik wraca na hub Z INFORMACJĄ (audyt 15.09: bez niej przycisk
        // wyglądał na zepsuty) — hub pokazuje komunikat i prosi o ponowne kliknięcie
        return Response.redirect(
          /^\d{4,7}$/.test(numer) ? `https://tylkoklocki.pl/zestaw/${numer}/?idz=odrzucony&sklep=${encodeURIComponent(sklep)}#ceny` : 'https://tylkoklocki.pl/',
          302,
        );
      }

      if (cel) {
        return Response.redirect(cel, 302);
      }
      // Brak wpisu w mapie — bezpieczny powrót na stronę główną (nigdy 404)
      return Response.redirect('https://tylkoklocki.pl/', 302);
    }

    // Wszystko inne: statyczne pliki strony
    return env.ASSETS.fetch(request);
  },
};

// ---------------------------------------------------------------------------
// „Obserwuj zestaw" — zapis, potwierdzenie (double opt-in) i rezygnacja.
// Obiekt w R2: { nr, email, token, kiedy, potwierdzony, potwierdzono?, ostatnia_cena, ostatni_alert }.
// Bez RESEND_API_KEY worker nic nie zapisuje i odsyła na hub ze stanem „niedostepne".
const DOMENA = 'https://tylkoklocki.pl';
const NADAWCA_ALERTOW = 'tylkoklocki.pl <alerty@tylkoklocki.pl>';
const naHub = (nr, stan) => Response.redirect(`${DOMENA}/zestaw/${nr}/?obserwuj=${stan}#obserwuj`, 303);

// Linki z maila (potwierdzenie, rezygnacja) dostają własną stronę zamiast
// przekierowania: 15.09.2026 Marek zobaczył po kliknięciu „nie ma takiej strony"
// (przekierowanie 303 + kotwica + komunikat rysowany skryptem to za dużo ogniw
// dla klienta poczty). Prosta strona HTML bez skryptu działa wszędzie.
const KOMUNIKATY_STRONY = {
  ok: ['Alerty włączone', 'Napiszemy, gdy cena tego zestawu spadnie co najmniej 20% poniżej ceny katalogowej albo zanotujemy nową najniższą cenę. W każdej wiadomości jest link do rezygnacji.'],
  koniec: ['Alerty wyłączone', 'Adres e-mail został usunięty. Możesz zapisać się ponownie na stronie zestawu.'],
  brak: ['Ten link już nie działa', 'Zapis mógł zostać usunięty (niepotwierdzone adresy kasujemy po tygodniu). Możesz zapisać się ponownie na stronie zestawu.'],
};
function stronaStanu(nr, stan) {
  const [tytul, tresc] = KOMUNIKATY_STRONY[stan] ?? KOMUNIKATY_STRONY.brak;
  const html = `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${tytul} – tylkoklocki.pl</title><style>body{font-family:system-ui,sans-serif;background:#f6f7fb;color:#17233f;margin:0;padding:40px 16px}main{max-width:520px;margin:0 auto;background:#fff;border-radius:14px;padding:28px 26px;box-shadow:0 2px 12px rgba(23,35,63,.08)}h1{font-size:1.4rem;margin:0 0 10px}p{line-height:1.5;margin:0 0 14px}a.btn{display:inline-block;background:#17233f;color:#ffc933;font-weight:700;text-decoration:none;padding:10px 18px;border-radius:999px}small{opacity:.7}</style></head><body><main><h1>${tytul}</h1><p>${tresc}</p><p><a class="btn" href="${DOMENA}/zestaw/${nr}/">Strona zestawu LEGO ${nr} →</a></p><p><small>tylkoklocki.pl · <a href="${DOMENA}/polityka-prywatnosci/#obserwuj">polityka prywatności</a></small></p></main></body></html>`;
  return new Response(html, { status: stan === 'brak' ? 404 : 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

async function obserwuj(request, env, url) {
  const akcja = url.pathname.split('/').filter(Boolean)[1] ?? '';
  if (!env.OBRAZY) return new Response('Alerty niedostępne', { status: 503 });

  if (request.method === 'POST' && !akcja) {
    let dane;
    try { dane = await request.formData(); } catch { return new Response('Złe żądanie', { status: 400 }); }
    const nr = String(dane.get('nr') ?? '').trim();
    const email = String(dane.get('email') ?? '').trim().toLowerCase();
    if (!/^\d{4,7}$/.test(nr)) return new Response('Zły numer zestawu', { status: 400 });
    if (String(dane.get('www') ?? '')) return naHub(nr, 'wyslano'); // honeypot: bot dostaje „sukces", nic nie zapisujemy
    // formularz żyje tylko na naszej domenie — POST z obcym Origin to nie czytelnik
    const origin = request.headers.get('origin');
    if (origin && !/^https:\/\/(www\.)?tylkoklocki\.pl$/.test(origin)) return new Response('Złe źródło', { status: 403 });
    if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return naHub(nr, 'zly-email');
    if (!env.RESEND_API_KEY) return naHub(nr, 'niedostepne');
    // Limit (decyzja Marka 15.09.2026): 10 zapisów na dobę z jednego adresu IP
    // i 10 na jeden e-mail. Bez tego pętla z jednego skryptu wysyłałaby maile
    // „Potwierdź alerty" na cudze adresy z naszej domeny, aż Resend zablokuje konto.
    // Liczniki w R2 pod _obserwuj/_limit/<dzień>/<hash>.json; skrypt alertów
    // kasuje dni starsze niż wczorajszy.
    const ip = request.headers.get('cf-connecting-ip') ?? '0.0.0.0';
    if (!(await limitOk(env, ip)) || !(await limitOk(env, email))) return naHub(nr, 'limit');
    const token = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
    const wpis = { nr, email, token, kiedy: new Date().toISOString(), potwierdzony: false, ostatnia_cena: null, ostatni_alert: null };
    await env.OBRAZY.put(`_obserwuj/${nr}/${token}.json`, JSON.stringify(wpis), { httpMetadata: { contentType: 'application/json' } });
    const potwierdz = `${DOMENA}/obserwuj/potwierdz?nr=${nr}&t=${token}`;
    const tekst = [
      `Ktoś (mamy nadzieję, że Ty) poprosił o alerty cenowe zestawu LEGO ${nr} na tylkoklocki.pl.`,
      '',
      'Żeby je włączyć, kliknij ten link (albo skopiuj go w całości do przeglądarki):',
      '',
      potwierdz,
      '',
      'Jeśli to nie Ty – zignoruj tę wiadomość; bez kliknięcia adres zostanie usunięty w ciągu tygodnia.',
      `Strona zestawu: ${DOMENA}/zestaw/${nr}/`,
    ].join('\n');
    const wyslano = await mailResend(env, email, `Potwierdź alerty cenowe LEGO ${nr}`, tekst);
    return naHub(nr, wyslano ? 'wyslano' : 'blad');
  }

  if (request.method === 'GET' && (akcja === 'potwierdz' || akcja === 'rezygnuj')) {
    const nr = url.searchParams.get('nr') ?? '';
    const t = url.searchParams.get('t') ?? '';
    if (!/^\d{4,7}$/.test(nr) || !/^[0-9a-f]{32}$/.test(t)) return new Response('Zły link', { status: 400 });
    const klucz = `_obserwuj/${nr}/${t}.json`;
    const obiekt = await env.OBRAZY.get(klucz);
    if (!obiekt) return stronaStanu(nr, 'brak');
    if (akcja === 'rezygnuj') { await env.OBRAZY.delete(klucz); return stronaStanu(nr, 'koniec'); }
    const wpis = await obiekt.json();
    if (!wpis.potwierdzony) {
      wpis.potwierdzony = true;
      wpis.potwierdzono = new Date().toISOString();
      await env.OBRAZY.put(klucz, JSON.stringify(wpis), { httpMetadata: { contentType: 'application/json' } });
    }
    return stronaStanu(nr, 'ok');
  }
  return new Response('Nie znaleziono', { status: 404 });
}

const LIMIT_NA_DOBE = 10;
async function limitOk(env, klucz) {
  const dzien = new Date().toISOString().slice(0, 10);
  const skrot = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(klucz)))].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
  const sciezka = `_obserwuj/_limit/${dzien}/${skrot}.json`;
  const obiekt = await env.OBRAZY.get(sciezka);
  const stan = obiekt ? await obiekt.json() : { n: 0 };
  if (stan.n >= LIMIT_NA_DOBE) return false;
  await env.OBRAZY.put(sciezka, JSON.stringify({ n: stan.n + 1 }), { httpMetadata: { contentType: 'application/json' } });
  return true;
}

async function mailResend(env, odbiorca, temat, tekst) {
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: NADAWCA_ALERTOW, to: [odbiorca], subject: temat, text: tekst }),
    });
    return r.ok;
  } catch {
    return false;
  }
}
