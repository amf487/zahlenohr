import { regional } from '@/core/regions';

/** Colloquial times: `{x}` is e.g. "halb acht am Abend", without "um". */
export const COLLOQUIAL = regional(
  [
    'Treffen wir uns um {x}?', 'Passt dir {x}?', 'Ich hol dich um {x} ab.', 'Es ist schon {x}.',
    'Wir sehen uns dann um {x}.', 'Der Film fängt um {x} an.', 'Ich bin ungefähr um {x} zu Hause.',
    'Kannst du mich um {x} anrufen?', 'Das Meeting ist um {x}.', 'Mein Bus fährt um {x}.',
    'Wir essen heute um {x}.', 'Der Laden macht um {x} zu.', 'Ich hab den Wecker auf {x} gestellt.',
    'Komm bitte nicht später als {x}.', 'Um {x} geht es los.', 'Spätestens um {x} muss ich weg.',
    'Sagen wir {x}?', 'Der Kurs beginnt um {x}.', 'Die Party fängt so um {x} an.',
    'Ich hab um {x} einen Termin beim Arzt.', 'Das Training ist heute erst um {x}.',
    'Kannst du die Kinder um {x} abholen?', 'Ich ruf dich um {x} zurück.', 'Wir müssen um {x} am Bahnhof sein.',
    'Die Pizza kommt so um {x}.', 'Mama hat gesagt, um {x} gibt es Essen.',
  ],
  {
    AT: [
      'Geht sich {x} für dich aus?', 'Die Ordination sperrt um {x} auf.', 'Gemma um {x} auf einen Kaffee?',
      'Die Bim kommt um {x}.', 'Der Heurige sperrt um {x} auf.', 'Die Trafik sperrt um {x} zu.',
      'Servus, kannst du um {x}?', 'Treff ma uns um {x} beim Würstelstand?', 'Die Jause gibt es um {x}.',
      'Um {x} bin ich beim Billa.',
    ],
    DE: [
      'Die Praxis macht um {x} auf.', 'Die Bahn kommt um {x}.', 'Lass uns um {x} beim Bäcker treffen.',
      'Moin, passt dir {x}?', 'Der Kiosk macht um {x} zu.', 'Ich bin um {x} im Büro.',
      'Das Abendbrot gibt es um {x}.', 'Um {x} bin ich beim Edeka.',
    ],
    CH: [
      'Grüezi, passt Ihnen {x}?', 'Das Tram kommt um {x}.', 'Treffen wir uns um {x} am Bahnhof?',
      'Ich nehme den Zug um {x}.', 'Der Laden schliesst um {x}.', 'Wir gehen um {x} an den See.',
      'Um {x} bin ich im Coop.', 'Kommst du um {x} mit dem Velo?',
    ],
  },
); // prettier-ignore

/** Official times: `{x}` is e.g. "siebzehn Uhr dreißig". */
export const OFFICIAL = regional(
  [
    'Ihr Termin ist am Dienstag um {x}.', 'Der Flug landet planmäßig um {x}.', 'Die Vorstellung beginnt um {x}.',
    'Es ist jetzt {x}.', 'Beim nächsten Ton ist es {x}.', 'Die Sprechstunde endet um {x}.',
    'Das Geschäft ist bis {x} geöffnet.', 'Ihr Paket wird bis {x} zugestellt.', 'Die Besprechung wurde auf {x} verschoben.',
    'Abfahrt ist um {x}.', 'Der Check-in schließt um {x}.', 'Bitte seien Sie spätestens um {x} da.',
    'Die Bibliothek schließt heute um {x}.', 'Das Boarding beginnt um {x}.', 'Ihr Tisch ist für {x} reserviert.',
    'Die Prüfung beginnt pünktlich um {x}.', 'Die Durchsage für den Flug nach Berlin kommt um {x}.',
  ],
  {
    AT: [
      'Der Zug nach Wien fährt um {x} ab.', 'Der Railjet nach Salzburg kommt heute erst um {x}.',
      'Die Ordination ist heute bis {x} geöffnet.', 'Ihr Termin am Magistrat ist um {x}.', 'Die U-Bahn fährt heute bis {x}.',
    ],
    DE: [
      'Der Zug nach Hamburg fährt um {x} ab.', 'Der ICE nach München kommt heute erst um {x}.',
      'Ihr Termin beim Bürgeramt ist um {x}.', 'Die S-Bahn fährt heute bis {x}.', 'Die Praxis ist heute bis {x} geöffnet.',
    ],
    CH: [
      'Der Zug nach Zürich fährt um {x} ab.', 'Der Intercity nach Bern kommt heute erst um {x}.',
      'Ihr Termin auf der Gemeinde ist um {x}.', 'Das Postauto fährt um {x}.', 'Die Praxis ist heute bis {x} geöffnet.',
    ],
  },
); // prettier-ignore
