// Ustawienia serwisu czytane przez layouty.
//
// AUTOR – osoba podpisująca teksty w danych strukturalnych (schema.org Article →
// author: Person z linkiem do /o-nas/). Google ocenia E-E-A-T lepiej, gdy za
// tekstem stoi osoba, a nie sama nazwa serwisu. Pole `imie` jest puste do
// czasu decyzji redakcji, kto się podpisuje (Marek? Piotr? oboje?) – przy
// pustym imieniu layouty zostają przy autorze-organizacji, żeby nie wysyłać
// do Google placeholdera. Artykuł może nadpisać autora we frontmatterze:
//   autor: "Imię Nazwisko"
export const AUTOR = {
  imie: '',
  url: 'https://tylkoklocki.pl/o-nas/',
};

export const WYDAWCA = { '@type': 'Organization', name: 'tylkoklocki.pl', url: 'https://tylkoklocki.pl/' };

/** Węzeł `author` do schema Article: Person, gdy znamy imię; inaczej organizacja. */
export function autorJsonld(imie = AUTOR.imie) {
  const nazwa = String(imie ?? '').trim();
  return nazwa ? { '@type': 'Person', name: nazwa, url: AUTOR.url } : WYDAWCA;
}
