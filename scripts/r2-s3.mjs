// Minimalny klient S3 dla kubełka R2 — bez zależności, podpis SigV4 własny.
//
// Po co (8.10.2026): REST API Cloudflare (`/accounts/.../r2/buckets/.../objects`)
// podlega globalnemu limitowi ~1 200 żądań na 5 minut, więc wgranie kilkudziesięciu
// tysięcy wariantów zdjęć trwałoby godzinami. Interfejs S3 R2 takiego limitu nie
// ma. Poświadczenia S3 wynikają z tego samego tokena, co REST: Access Key ID to
// identyfikator tokena (`/user/tokens/verify`), Secret to SHA-256 wartości tokena —
// tak dokumentuje to Cloudflare, nie trzeba zakładać osobnych kluczy.
//
// Wymaga CF_ACCOUNT_ID i CF_R2_TOKEN (ten sam token, co w r2-obrazy.mjs).

import { createHash, createHmac } from 'node:crypto';

const KUBELEK = 'tylkoklocki-obrazy';
const { CF_ACCOUNT_ID, CF_R2_TOKEN } = process.env;

let poswiadczenia = null;
async function kluczeS3() {
  if (poswiadczenia) return poswiadczenia;
  if (!CF_ACCOUNT_ID || !CF_R2_TOKEN) throw new Error('Brak CF_ACCOUNT_ID albo CF_R2_TOKEN');
  const r = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', { headers: { authorization: `Bearer ${CF_R2_TOKEN}` } });
  const d = await r.json();
  if (!d.success || d.result?.status !== 'active') throw new Error(`Token R2 nieaktywny: ${JSON.stringify(d.errors ?? d.result).slice(0, 160)}`);
  poswiadczenia = { keyId: d.result.id, secret: createHash('sha256').update(CF_R2_TOKEN).digest('hex'), host: `${CF_ACCOUNT_ID}.r2.cloudflarestorage.com` };
  return poswiadczenia;
}

const sha = (d) => createHash('sha256').update(d).digest('hex');
const hmac = (k, d) => createHmac('sha256', k).update(d).digest();
const koduj = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

function podpisz({ keyId, secret, host }, metoda, sciezka, zapytanie, cialo, naglowkiDodatkowe = {}) {
  const teraz = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const data = teraz.slice(0, 8);
  const hashCiala = cialo ? sha(cialo) : 'UNSIGNED-PAYLOAD';
  const n = { host, 'x-amz-content-sha256': hashCiala, 'x-amz-date': teraz, ...naglowkiDodatkowe };
  const podpisane = Object.keys(n).map((k) => k.toLowerCase()).sort();
  const kanoniczne = [metoda, sciezka, zapytanie, ...podpisane.map((k) => `${k}:${String(n[k] ?? n[Object.keys(n).find((x) => x.toLowerCase() === k)]).trim()}`), '', podpisane.join(';'), hashCiala].join('\n');
  const zakres = `${data}/auto/s3/aws4_request`;
  const doPodpisu = ['AWS4-HMAC-SHA256', teraz, zakres, sha(kanoniczne)].join('\n');
  const klucz = hmac(hmac(hmac(hmac(`AWS4${secret}`, data), 'auto'), 's3'), 'aws4_request');
  n.authorization = `AWS4-HMAC-SHA256 Credential=${keyId}/${zakres}, SignedHeaders=${podpisane.join(';')}, Signature=${hmac(klucz, doPodpisu).toString('hex')}`;
  return n;
}

async function zapytaj(metoda, klucz, { zapytanie = '', cialo = null, naglowki = {}, proby = 4 } = {}) {
  const p = await kluczeS3();
  const sciezka = `/${KUBELEK}/${klucz ? klucz.split('/').map(koduj).join('/') : ''}`;
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(`https://${p.host}${sciezka}${zapytanie ? `?${zapytanie}` : ''}`, { method: metoda, headers: podpisz(p, metoda, sciezka, zapytanie, cialo, naglowki), body: cialo });
      if (r.status >= 500 && i < proby) { await r.arrayBuffer(); await new Promise((res) => setTimeout(res, 500 * i)); continue; }
      return r;
    } catch (e) {
      if (i >= proby) throw e;
      await new Promise((res) => setTimeout(res, 500 * i));
    }
  }
}

/** Wszystkie klucze w kubełku (opcjonalnie pod prefiksem) jako Map klucz → rozmiar. */
export async function listujR2(prefiks = '') {
  const wynik = new Map();
  let token = '';
  while (true) {
    // parametry posortowane po nazwie — tego wymaga kanoniczna postać zapytania w SigV4
    const q = [['list-type', '2'], ['max-keys', '1000'], ...(prefiks ? [['prefix', prefiks]] : []), ...(token ? [['continuation-token', token]] : [])]
      .sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${koduj(v)}`).join('&');
    const r = await zapytaj('GET', '', { zapytanie: q });
    const xml = await r.text();
    if (!r.ok) throw new Error(`Listowanie R2: ${r.status} ${xml.slice(0, 200)}`);
    for (const m of xml.matchAll(/<Key>([^<]+)<\/Key><Size>(\d+)<\/Size>/g)) wynik.set(m[1].replace(/&amp;/g, '&'), Number(m[2]));
    const nast = /<NextContinuationToken>([^<]+)<\/NextContinuationToken>/.exec(xml);
    if (!nast) break;
    token = nast[1].replace(/&amp;/g, '&');
  }
  return wynik;
}

/** Pobiera obiekt; zwraca { dane: Buffer, typ } albo null, gdy go nie ma. */
export async function pobierzR2(klucz) {
  const r = await zapytaj('GET', klucz);
  if (r.status === 404) { await r.arrayBuffer(); return null; }
  if (!r.ok) throw new Error(`GET ${klucz}: ${r.status}`);
  return { dane: Buffer.from(await r.arrayBuffer()), typ: r.headers.get('content-type') ?? 'application/octet-stream' };
}

/** Wgrywa obiekt z podanym Content-Type. */
export async function wgrajR2(klucz, dane, typ) {
  const r = await zapytaj('PUT', klucz, { cialo: dane, naglowki: { 'content-type': typ, 'content-length': String(dane.length) } });
  await r.arrayBuffer();
  if (!r.ok) throw new Error(`PUT ${klucz}: ${r.status}`);
}

export { KUBELEK };

/** Usuwa obiekt (brak obiektu nie jest błędem). */
export async function usunR2(klucz) {
  const r = await zapytaj('DELETE', klucz);
  await r.arrayBuffer();
  if (!r.ok && r.status !== 404) throw new Error(`DELETE ${klucz}: ${r.status}`);
}
