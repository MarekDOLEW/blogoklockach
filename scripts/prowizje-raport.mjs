#!/usr/bin/env node
// Prowizje z sieci afiliacyjnych — jedyne źródło PRAWDZIWEGO EPC.
//
// Do 14.09.2026 każdy EPC w raportach Kontrolera był modelowany: cena zestawu ×
// stawka × założona konwersja. Model nie mówi, czy ktokolwiek cokolwiek kupił.
// Ten skrypt czyta panele przez API, więc liczby są zmierzone albo ich nie ma —
// nigdy „oszacowane".
//
// Stan dostępów (sprawdzone 14.09.2026):
//   ADTRACTION_TOKEN     — DZIAŁA. Smyk, Egmont. Endpoint transakcji odpowiada,
//                          w 60 dniach zero konwersji (to wynik, nie awaria).
//   TD_TOKEN             — token PRODUKTOWY (Products API), do niczego innego.
//   TD_REPORT_TOKEN      — token systemu CONVERSIONS (push, webhook). Nie służy
//                          do pobierania transakcji i nie jest tu używany.
//   TD_CLIENT_ID/SECRET  — DZIAŁA (Publisher API, sprawdzone 14.09.2026).
//   + TD_USERNAME/PASSWORD  Empik i Ceneo. UWAGA na dwie pułapki, na których
//                          ten skrypt już raz poległ:
//                          1. adres to /uaa/oauth/token, NIE /uni/oauth2/token —
//                             zmyślona ścieżka oddaje 401 "Full authentication
//                             is required" (Spring Security odbija nieznaną
//                             ścieżkę), co łatwo wziąć za nieaktywnego klienta;
//                          2. klient ma granty `password` i `refresh_token`,
//                             `client_credentials` NIE jest dozwolony.
//                          Access token żyje 900 s, refresh 604800 s i jest
//                          jednorazowy — dlatego bierzemy świeży przez grant
//                          password przy każdym przebiegu zamiast trzymać stan.
//   PERFORMERS_API_KEY   — DZIAŁA (sprawdzone 14.09: 1245 kliknięć, 0 konwersji
//                          w 30 dniach). Dotyczy Media Expertu.
//   Allegro, webePartners— brak API w rejestrze; panel przez przeglądarkę.
//
// Użycie:
//   node scripts/prowizje-raport.mjs            # ostatnie 30 dni
//   node scripts/prowizje-raport.mjs --dni 60

const args = process.argv.slice(2);
const dni = Number(args[args.indexOf('--dni') + 1]) || 30;
const od = new Date(Date.now() - dni * 864e5);
const iso = (d) => d.toISOString().slice(0, 19);

const wynik = { okno_dni: dni, od: iso(od).slice(0, 10), sieci: {} };

// ── Adtraction (Smyk, Egmont) ────────────────────────────────────────────────
// transactionStatus: 0 oczekująca, 1 zatwierdzona, 2 odrzucona — pytamy o wszystkie
async function adtraction() {
  const token = process.env.ADTRACTION_TOKEN;
  if (!token) return { stan: 'brak ADTRACTION_TOKEN' };
  const zbior = [];
  for (const status of [0, 1, 2]) {
    const odp = await fetch('https://api.adtraction.com/v2/affiliate/transactions', {
      method: 'POST',
      headers: { 'X-Token': token, 'content-type': 'application/json' },
      body: JSON.stringify({
        market: 'PL', fromDate: iso(od), toDate: iso(new Date()), transactionStatus: status,
      }),
    });
    const d = await odp.json().catch(() => null);
    if (Array.isArray(d)) zbior.push(...d.map((t) => ({ ...t, _status: status })));
  }
  const suma = zbior.reduce((s, t) => s + (Number(t.commission) || 0), 0);
  return {
    stan: 'ok',
    transakcje: zbior.length,
    prowizja_pln: Math.round(suma * 100) / 100,
    zatwierdzone: zbior.filter((t) => t._status === 1).length,
  };
}

// ── Tradedoubler (Empik, Ceneo) ──────────────────────────────────────────────
// Publisher API na OAuth2. Raport oddaje kwoty w walucie konta (pole
// reportCurrencyCode) — dziś EUR, więc nie wpisujemy ich do prowizja_pln
// bez przeliczenia; podajemy walutę wprost, żeby nikt nie zsumował jabłek
// z gruszkami w podsumowaniu.
const TD_OAUTH = 'https://connect.tradedoubler.com/uaa/oauth/token';
const TD_TRANSAKCJE = 'https://connect.tradedoubler.com/publisher/report/transactions';
const TD_SOURCE_ID = 3494691;   // konto "Tylko Klocki" — to samo co w linkach a=

async function tdToken() {
  const id = process.env.TD_CLIENT_ID;
  const sekret = process.env.TD_CLIENT_SECRET;
  const login = process.env.TD_USERNAME;
  const haslo = process.env.TD_PASSWORD;
  if (!id || !sekret || !login || !haslo) return null;
  const odp = await fetch(TD_OAUTH, {
    method: 'POST',
    headers: {
      authorization: 'Basic ' + Buffer.from(`${id}:${sekret}`).toString('base64'),
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'password', username: login, password: haslo }),
  });
  if (!odp.ok) return { blad: `HTTP ${odp.status}` };
  const d = await odp.json().catch(() => null);
  return d?.access_token ? { token: d.access_token } : { blad: 'brak access_token w odpowiedzi' };
}

async function tradedoubler() {
  const t = await tdToken();
  if (!t) {
    return {
      stan: 'brak kluczy',
      co_zrobic: 'TD_CLIENT_ID, TD_CLIENT_SECRET, TD_USERNAME, TD_PASSWORD w zmiennych środowiska',
    };
  }
  if (t.blad) return { stan: 'logowanie odrzucone', powod: t.blad };

  // okno raportu: API przyjmuje maksymalnie 92 dni
  const dniTd = Math.min(dni, 92);
  const data = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');
  const q = new URLSearchParams({
    fromDate: data(new Date(Date.now() - dniTd * 864e5)),
    toDate: data(new Date()),
    sourceId: String(TD_SOURCE_ID),
    status: 'A,P,D',     // zatwierdzone, oczekujące, odrzucone
    limit: '100',
  });

  const wszystkie = [];
  let waluta = null;
  for (let offset = 0; offset < 2000; offset += 100) {
    q.set('offset', String(offset));
    const odp = await fetch(`${TD_TRANSAKCJE}?${q}`, {
      headers: { authorization: `Bearer ${t.token}` },
    });
    if (!odp.ok) return { stan: `HTTP ${odp.status}`, pobrano_przed_bledem: wszystkie.length };
    const d = await odp.json().catch(() => null);
    const partia = d?.items ?? [];
    waluta = d?.reportCurrencyCode ?? waluta;
    wszystkie.push(...partia);
    if (partia.length < 100) break;
  }

  const perProgram = {};
  for (const tr of wszystkie) {
    const k = tr.programName || String(tr.programId);
    const p = (perProgram[k] ??= { transakcje: 0, obrot: 0, prowizja: 0, zatwierdzone: 0 });
    p.transakcje += 1;
    p.obrot += Number(tr.orderValue) || 0;
    p.prowizja += Number(tr.commission) || 0;
    if (tr.status === 'A') p.zatwierdzone += 1;
  }
  for (const p of Object.values(perProgram)) {
    p.obrot = Math.round(p.obrot * 100) / 100;
    p.prowizja = Math.round(p.prowizja * 100) / 100;
    p.stawka_efektywna = p.obrot ? `${(p.prowizja / p.obrot * 100).toFixed(2)}%` : null;
  }

  return {
    stan: 'ok',
    okno_dni: dniTd,
    waluta,
    transakcje: wszystkie.length,
    prowizja: Math.round(wszystkie.reduce((s, tr) => s + (Number(tr.commission) || 0), 0) * 100) / 100,
    programy: perProgram,
  };
}

// ── Performers (Media Expert) ────────────────────────────────────────────────
async function performers() {
  const klucz = process.env.PERFORMERS_API_KEY;
  if (!klucz) {
    return {
      stan: 'brak PERFORMERS_API_KEY',
      co_zrobic: 'panel Performers → API → klucz → zmienna PERFORMERS_API_KEY',
    };
  }
  // UWAGA: HasOffers/TUNE oddaje HTTP 200 także przy błędzie — prawdę mówi
  // dopiero `response.status` (1 = ok, -1 = błąd) i lista `response.errors`.
  // Sprawdzanie samego kodu HTTP pokazywałoby sukces przy złym kluczu.
  const url = `https://wld.api.hasoffers.com/Apiv3/json?NetworkId=wld&Target=Affiliate_Report&Method=getStats&api_key=${klucz}`
    + `&fields[]=Stat.conversions&fields[]=Stat.payout&fields[]=Stat.clicks`
    + `&data_start=${iso(od).slice(0, 10)}&data_end=${new Date().toISOString().slice(0, 10)}`;
  const odp = await fetch(url);
  if (!odp.ok) return { stan: `HTTP ${odp.status}` };
  const d = await odp.json().catch(() => null);
  const r = d?.response;
  if (!r || r.status !== 1) {
    return {
      stan: 'API odrzuciło zapytanie',
      powod: r?.errors?.map((e) => e.publicMessage).join('; ') || r?.errorMessage || 'nieznany',
    };
  }
  const wiersze = Array.isArray(r.data?.data) ? r.data.data : [];
  const suma = wiersze.reduce((s, w) => s + (Number(w?.Stat?.payout) || 0), 0);
  const konw = wiersze.reduce((s, w) => s + (Number(w?.Stat?.conversions) || 0), 0);
  const kliki = wiersze.reduce((s, w) => s + (Number(w?.Stat?.clicks) || 0), 0);
  return { stan: 'ok', kliki, konwersje: konw, prowizja_pln: Math.round(suma * 100) / 100 };
}

wynik.sieci.adtraction = await adtraction();
wynik.sieci.tradedoubler = await tradedoubler();
wynik.sieci.performers = await performers();
wynik.sieci.allegro = { stan: 'brak API w rejestrze — panel przez przeglądarkę' };
wynik.sieci.webepartners = { stan: 'brak API w rejestrze — panel przez przeglądarkę' };

const zmierzone = Object.entries(wynik.sieci).filter(([, v]) => v.stan === 'ok');
wynik.podsumowanie = {
  sieci_zmierzone: zmierzone.length,
  sieci_bez_dostepu: Object.keys(wynik.sieci).length - zmierzone.length,
  // sumujemy TYLKO złotówki — TD raportuje w EUR i ma własne pole `prowizja`
  prowizja_zmierzona_pln: zmierzone.reduce((s, [, v]) => s + (v.prowizja_pln ?? 0), 0),
};
console.log(JSON.stringify(wynik, null, 1));
