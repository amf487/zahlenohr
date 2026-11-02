import { regional } from '@/core/regions';

/** Every template keeps the price in the accusative ("einen Euro"). */
export const PRICE = regional(
  [
    'Das kostet {x}.', 'Das macht {x}, bitte.', 'Der Eintritt kostet {x}.', 'Im Angebot nur {x}.',
    'Das Ticket kostet {x}.', 'Macht {x}. Zahlen Sie bar oder mit Karte?', 'Die Rechnung beträgt {x}.',
    'Heute nur {x}!', 'Pro Person kostet das {x}.', 'Das Porto kostet {x}.', 'Für dich nur {x}.',
    'Zusammen macht das {x}.', 'Der Haarschnitt kostet {x}.', 'Die Fahrt kostet {x}.', 'Ich bekomme noch {x} von dir.',
    'Der Parkplatz kostet {x} pro Stunde.', 'Mit Rabatt zahlen Sie nur {x}.',
  ],
  {
    AT: [
      'Des macht dann {x}, bitte.', 'Die Melange kostet {x}.', 'Ein Krügerl kostet hier {x}.', 'Die Semmel kostet {x}.',
      'Das Schnitzel kostet {x}.', 'Zahlen, bitte! Des macht {x}.', 'Die Leberkässemmel kostet {x}.',
    ],
    DE: [
      'Das macht dann {x}, bitte.', 'Der Kaffee kostet {x}.', 'Ein Brötchen kostet {x}.', 'Die Currywurst kostet {x}.',
      'Ein Bier kostet hier {x}.', 'Die Brezel kostet {x}.',
    ],
    CH: [
      'Das macht {x}, merci.', 'Das Billett kostet {x}.', 'Ein Kafi kostet {x}.', 'Das Gipfeli kostet {x}.',
      'Die Rösti kostet {x}.', 'Zusammen macht das {x}, merci vielmal.',
    ],
  },
); // prettier-ignore
