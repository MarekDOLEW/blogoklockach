// Formatowanie dat do wyświetlenia: „2026-09-09" -> „09.09.2026".
// W atrybucie <time datetime> zostaje ISO, czytelnik widzi zapis polski.
export function dataPl(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? ''));
  return m ? `${m[3]}.${m[2]}.${m[1]}` : String(iso ?? '');
}
