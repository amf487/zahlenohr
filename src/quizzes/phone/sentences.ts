import { regional } from '@/core/regions';

export const PHONE = regional(
  [
    'Sie erreichen mich unter {x}.', 'Schreib dir die Nummer auf: {x}.', 'Meine Nummer ist {x}.',
    'Rufen Sie bitte unter {x} zurück.', 'Die Nummer lautet {x}.', 'Ich wiederhole: {x}.',
    'Unter {x} bin ich den ganzen Tag erreichbar.', 'Haben Sie was zum Schreiben? {x}.',
    'Wenn was ist, ruf einfach {x} an.', 'Für Rückfragen: {x}.', 'Die Hotline erreichen Sie unter {x}.',
    'Bitte melden Sie sich unter {x}.', 'Neue Nummer, bitte speichern: {x}.', 'Die Nummer von meinem Kollegen ist {x}.',
    'Bei Fragen wählen Sie bitte {x}.', 'Für Notfälle gilt die Nummer {x}.', 'Die Zentrale hat die Nummer {x}.',
  ],
  {
    AT: [
      'Meine Handynummer is {x}.', 'Servus, ruf mich bitte zurück unter {x}.', 'Grüß Gott, Sie erreichen uns unter {x}.',
      'Schreib da die Nummer auf: {x}.', 'Ruf mich halt an, {x}.',
    ],
    DE: [
      'Meine Handynummer ist {x}.', 'Hallo, ruf mich bitte zurück unter {x}.', 'Guten Tag, Sie erreichen uns unter {x}.',
      'Moin, meine Nummer ist {x}.', 'Ruf mich einfach an, {x}.',
    ],
    CH: [
      'Meine Natelnummer ist {x}.', 'Grüezi, Sie erreichen uns unter {x}.', 'Rufen Sie mich doch unter {x} an, merci.',
      'Hallo zusammen, meine Nummer ist {x}.', 'Ruf mich einfach an, {x}.',
    ],
  },
); // prettier-ignore

/** Used for landline numbers; `{city}` is replaced by the city of the area code. */
export const CITY = [
  'Die Nummer vom Büro in {city} ist {x}.',
  'Unser Standort in {city} hat die Nummer {x}.',
  'Die Filiale in {city} erreichen Sie unter {x}.',
] as const;
