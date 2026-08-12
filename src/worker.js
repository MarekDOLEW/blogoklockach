import redirects from './data/redirects.json';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Przekierowania afiliacyjne: /idz/[sklep]/[numer]
    if (url.pathname.startsWith('/idz/')) {
      const czesci = url.pathname.split('/').filter(Boolean); // ["idz", sklep, numer]
      const sklep = czesci[1];
      const numer = czesci[2];
      const cel = redirects?.[sklep]?.[numer];

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
