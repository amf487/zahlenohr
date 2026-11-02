import { regional } from '@/core/regions';

/** `{x}` is e.g. "dritten Mai"; every template keeps the dative ending (-ten). */
export const DATE = regional(
  [
    'Der Termin ist am {x}.', 'Wir fliegen am {x}.', 'Die Prüfung ist am {x}.', 'Ich ziehe am {x} um.',
    'Die Rechnung ist bis zum {x} zu bezahlen.', 'Das Fest findet am {x} statt.', 'Mein Urlaub beginnt am {x}.',
    'Der Kurs startet am {x}.', 'Die Wohnung ist ab dem {x} frei.', 'Bitte melden Sie sich bis zum {x} an.',
    'Wir haben am {x} unseren Jahrestag.', 'Das Paket kommt voraussichtlich am {x}.', 'Seit dem {x} wohne ich hier.',
    'Die Frist endet am {x}.', 'Der Vertrag läuft bis zum {x}.', 'Am {x} fängt mein neuer Job an.',
    'Das Konzert ist am {x}.', 'Die Hochzeit ist am {x}.',
  ],
  {
    AT: ['Ich hab am {x} Geburtstag.', 'Der Termin auf der Gemeinde ist am {x}.', 'Am {x} gemma zum Heurigen.'],
    DE: ['Ich habe am {x} Geburtstag.', 'Der Termin beim Amt ist am {x}.', 'Am {x} gehen wir in den Biergarten.'],
    CH: ['Ich habe am {x} Geburtstag.', 'Der Termin auf der Gemeinde ist am {x}.', 'Am {x} machen wir ein Picknick am See.'],
  },
); // prettier-ignore
