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
//   TD_TOKEN             — token PRODUKTOWY, do raportów daje 403 „Token not
//                          authorized for request". Raporty wymagają osobnego
//                          tokenu z panelu TD (Account → Manage tokens).
//                          Dotyczy Empiku i Ceneo.
//   PERFORMERS_API_KEY   — API istnieje i host odpowiada (HasOffers/TUNE,
//                          NetworkId=wld); klucz dodany 14.09, do sprawdzenia
//                          w pierwszej nowej sesji. Dotyczy Media Expertu.
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
async function tradedoubler() {
  const token = process.env.TD_REPORT_TOKEN ?? process.env.TD_TOKEN;
  if (!token) return { stan: 'brak TD_REPORT_TOKEN' };
  const odp = await fetch(`https://api.tradedoubler.com/1.0/reports.json?token=${token}`);
  if (odp.status === 403) {
    return {
      stan: 'token bez uprawnień do raportów',
      co_zrobic: 'panel TD → Account → Manage tokens → token raportowy → zmienna TD_REPORT_TOKEN',
    };
  }
  if (!odp.ok) return { stan: `HTTP ${odp.status}` };
  return { stan: 'ok', raporty: await odp.json().catch(() => null) };
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
    + `&fields[]=Stat.conversions&fields[]=Stat.payout&fields[]=Stat.date`
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
  return { stan: 'ok', konwersje: konw, prowizja_pln: Math.round(suma * 100) / 100 };
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
  prowizja_zmierzona_pln: zmierzone.reduce((s, [, v]) => s + (v.prowizja_pln ?? 0), 0),
};
console.log(JSON.stringify(wynik, null, 1));
