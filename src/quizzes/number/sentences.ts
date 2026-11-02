import type { RegionId } from '@/core/types';

/** The number stands at the end, so any number fits. */
export const PLAIN = [
  'Ihre Wartenummer ist {x}.', 'Die richtige Antwort ist {x}.', 'Ihr Zimmer hat die Nummer {x}.', 'Das Ergebnis ist {x}.',
  'Die Zahl lautet {x}.', 'Notier dir bitte: {x}.', 'Unsere Kundennummer ist {x}.', 'Der Code ist {x}.', 'Insgesamt sind es {x}.',
] as const; // prettier-ignore

/** A noun follows the number. */
export const NOUN = [
  'Das sind ungefähr {x} Kilometer.', 'Zum Konzert kamen {x} Leute.', 'Wir haben {x} Stück bestellt.',
  'Das Buch hat {x} Seiten.', 'Die Strecke ist {x} Meter lang.', 'Im Saal ist Platz für {x} Personen.',
  'Heute haben {x} Leute angerufen.', 'Das Paket wiegt {x} Gramm.', 'Es haben schon {x} Menschen unterschrieben.',
] as const; // prettier-ignore

/** For large numbers. */
export const BIG = [
  'Die Stadt hat {x} Einwohner.', 'Das Auto hat {x} Kilometer drauf.', 'Das Haus kostet {x} Euro.',
  'Das Video hat {x} Aufrufe.', 'Im Stadion waren {x} Zuschauer.', 'Die Firma hat letztes Jahr {x} Euro Umsatz gemacht.',
  'Der Kredit beträgt {x} Euro.', 'Die Wohnung kostet {x} Euro.',
] as const; // prettier-ignore

export const YEAR = [
  'Ich bin {x} geboren.', 'Das Haus wurde {x} gebaut.', 'Das war im Jahr {x}.', 'Wir haben {x} geheiratet.',
  'Die Firma wurde {x} gegründet.', 'Ich bin {x} hierher gezogen.', 'Seit {x} wohne ich in dieser Stadt.',
  'Das Album ist {x} erschienen.', 'Ich habe {x} mit dem Studium angefangen.', 'Das Auto ist Baujahr {x}.',
] as const; // prettier-ignore

/** In Switzerland amounts are in Franken. */
export const inRegion = (list: readonly string[], region: RegionId): readonly string[] =>
  region === 'CH' ? list.map((t) => t.replace('Euro', 'Franken')) : list;
