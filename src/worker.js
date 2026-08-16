import redirects from './data/redirects.json';
import obrazy from './data/obrazy.json';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Zdjęcia zestawów z naszej domeny: /img/<numer>.jpg
    // Źródło (sklepowe/rebrickable) pobieramy raz, kopia żyje w cache Cloudflare —
    // przeglądarki nie hotlinkują już bezpośrednio do cudzych serwerów.
    if (url.pathname.startsWith('/img/')) {
      const numer = url.pathname.slice(5).replace(/\.jpg$/, '');
      const zrodlo = /^[0-9]{4,7}$/.test(numer) ? obrazy[numer] : null;
      if (!zrodlo) return new Response('Brak zdjęcia', { status: 404 });
      const odp = await fetch(zrodlo, {
        cf: { cacheEverything: true, cacheTtl: 60 * 60 * 24 * 30 },
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; tylkoklocki.pl image cache)' },
      });
      if (!odp.ok) return new Response('Zdjęcie niedostępne', { status: 502 });
      return new Response(odp.body, {
        headers: {
          'content-type': odp.headers.get('content-type') ?? 'image/jpeg',
          'cache-control': 'public, max-age=2592000, stale-while-revalidate=86400',
        },
      });
    }

    // Przekierowania afiliacyjne: /idz/[sklep]/[numer]
    if (url.pathname.startsWith('/idz/')) {
      const czesci = url.pathname.split('/').filter(Boolean); // ["idz", sklep, numer]
      const sklep = czesci[1] ?? '';
      const numer = czesci[2] ?? '';
      let cel = redirects?.[sklep]?.[numer];

      // LEGO.com nie ma programu afiliacyjnego w naszym miksie — linkujemy
      // bezpośrednio. lego.com akceptuje sam numer zestawu w adresie produktu
      // i przekierowuje na pełny URL ze slugiem.
      if (!cel && sklep === 'lego' && /^\d{4,7}$/.test(numer)) {
        cel = `https://www.lego.com/pl-pl/product/${numer}`;
      }

      // Szczątkowa analityka kliknięć afiliacyjnych (Workers Analytics Engine).
      // Zapis: sklep, numer, czy link istniał, referer (skąd klik), kraj.
      // Odczyt: SQL API, np.
      //   SELECT blob1 AS sklep, blob2 AS numer, SUM(_sample_interval) AS kliki
      //   FROM idz_kliki WHERE timestamp > NOW() - INTERVAL '7' DAY
      //   GROUP BY sklep, numer ORDER BY kliki DESC
      try {
        env.KLIKI?.writeDataPoint({
          blobs: [sklep, numer, cel ? 'ok' : 'brak-linku', request.headers.get('referer') ?? '', request.cf?.country ?? ''],
          doubles: [1],
          indexes: [sklep],
        });
      } catch {}

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
