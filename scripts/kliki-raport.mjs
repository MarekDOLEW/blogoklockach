// Raport kliknięć afiliacyjnych z Workers Analytics Engine.
//
// Worker zapisuje każde wejście na /idz/<sklep>/<numer> do datasetu `idz_kliki`
// (wiązanie KLIKI w wrangler.jsonc). Ten skrypt czyta je przez SQL API
// Cloudflare i liczy to, czego Kontroler potrzebuje: kliki per sklep, per set
// i udział kliknięć, które trafiły w brak linku.
//
// Wymaga dwóch zmiennych środowiskowych (NIE w repo):
//   CF_ACCOUNT_ID  — identyfikator konta Cloudflare (panel -> Workers -> po prawej)
//   CF_API_TOKEN   — token API z uprawnieniem „Account Analytics: Read"
//                    (My Profile -> API Tokens -> Create Token -> Custom token)
//
// Użycie:
//   node scripts/kliki-raport.mjs --test      # sam test dostępu do datasetu
//   node scripts/kliki-raport.mjs             # raport 7 dni (JSON na stdout)
//   node scripts/kliki-raport.mjs --dni 30
//
// Dane w Analytics Engine żyją 90 dni. Zapis jest próbkowany przy dużym ruchu,
// dlatego liczby sumujemy przez _sample_interval — inaczej zaniżylibyśmy kliki.

const DATASET = 'idz_kliki';

const konto = process.env.CF_ACCOUNT_ID;
const token = process.env.CF_API_TOKEN;
if (!konto || !token) {
  console.error(
    'BRAK dostępu do Cloudflare. Ustaw CF_ACCOUNT_ID i CF_API_TOKEN ' +
      '(token z uprawnieniem "Account Analytics: Read").',
  );
  process.exit(2);
}

const dni = Number(process.argv[process.argv.indexOf('--dni') + 1]) || 7;

async function sql(zapytanie) {
  const odp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${konto}/analytics_engine/sql`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'text/plain' },
    body: zapytanie,
  });
  const tekst = await odp.text();
  if (!odp.ok) throw new Error(`SQL API ${odp.status}: ${tekst.slice(0, 400)}`);
  try {
    return JSON.parse(tekst).data ?? [];
  } catch {
    throw new Error(`SQL API zwróciło nie-JSON: ${tekst.slice(0, 400)}`);
  }
}

const OKNO = `timestamp > NOW() - INTERVAL '${dni}' DAY`;

if (process.argv.includes('--test')) {
  const r = await sql(`SELECT SUM(_sample_interval) AS kliki FROM ${DATASET} WHERE ${OKNO}`);
  const n = Number(r[0]?.kliki ?? 0);
  console.log('POŁĄCZENIE OK. Kliknięć w oknie', dni, 'dni:', n);
  if (n === 0) {
    console.log(
      'Zero kliknięć nie musi znaczyć błędu: dataset zaczyna się zapełniać dopiero od pierwszego\n' +
        'deploya z wiązaniem KLIKI w wrangler.jsonc, a dane historyczne nie powstają wstecz.',
    );
  }
  process.exit(0);
}

// blob1=sklep, blob2=numer setu, blob3=ok|brak-linku, blob4=referer, blob5=kraj
const [suma, perSklep, perSet, perStan, perKraj] = await Promise.all([
  sql(`SELECT SUM(_sample_interval) AS kliki FROM ${DATASET} WHERE ${OKNO}`),
  sql(`SELECT blob1 AS sklep, SUM(_sample_interval) AS kliki FROM ${DATASET} WHERE ${OKNO} GROUP BY sklep ORDER BY kliki DESC`),
  sql(`SELECT blob1 AS sklep, blob2 AS numer, SUM(_sample_interval) AS kliki FROM ${DATASET} WHERE ${OKNO} GROUP BY sklep, numer ORDER BY kliki DESC LIMIT 30`),
  sql(`SELECT blob3 AS stan, SUM(_sample_interval) AS kliki FROM ${DATASET} WHERE ${OKNO} GROUP BY stan`),
  sql(`SELECT blob5 AS kraj, SUM(_sample_interval) AS kliki FROM ${DATASET} WHERE ${OKNO} GROUP BY kraj ORDER BY kliki DESC LIMIT 10`),
]);

const liczba = (x) => Number(x ?? 0);
console.log(
  JSON.stringify(
    {
      okno_dni: dni,
      kliki_lacznie: liczba(suma[0]?.kliki),
      per_sklep: perSklep.map((r) => ({ sklep: r.sklep, kliki: liczba(r.kliki) })),
      // „brak-linku" = ktoś kliknął, a worker nie miał dokąd go wysłać.
      // Każde takie kliknięcie to utracona prowizja — warto trzymać przy zerze.
      stan_linku: perStan.map((r) => ({ stan: r.stan, kliki: liczba(r.kliki) })),
      top_sety: perSet.map((r) => ({ sklep: r.sklep, numer: r.numer, kliki: liczba(r.kliki) })),
      kraje: perKraj.map((r) => ({ kraj: r.kraj || '(nieznany)', kliki: liczba(r.kliki) })),
    },
    null,
    1,
  ),
);
