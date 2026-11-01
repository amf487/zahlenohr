# Zahlenohr 德语数字听力

A browser game for practising **listening to German numbers**: times, phone numbers, prices, dates, years and large numbers. Made for learners around level B who understand German well but get lost when someone rattles off a phone number or says "dreiviertel acht".

Everything is in one file, `index.html`. No build step, no server, no API key.

## How to use

Open `index.html` in a browser, press **Anhören**, and pick (or type) what you heard.

- **Modes:** Uhrzeit, Telefon, Zahlen, Preise, Datum, Mix
- **Regions:** German or Austrian phrasing, or a mix of both (e.g. *viertel acht*, *in der Früh*, *Jänner*, *Des macht dann …* vs. *Viertel nach sieben*, *zwo*)
- **Phone numbers** come in real Austrian/German formats (0664, 01, 030, +43, extensions) and are read as single digits, pairs, triples or mixed blocks
- **Wrong options are typical traps:** 43 vs 34, sechzehn vs sechzig, *halb acht* = 7:30 (not 8:30), Juni vs Juli
- After each answer: the spoken sentence, a word-to-digit breakdown, and hints in German and Chinese (can be switched off)
- Replay, slow replay, speech rate, optional station background noise, keyboard shortcuts

## Voices

The app uses the browser's built-in speech synthesis (Web Speech API), so the voices depend on the browser and operating system:

- **Microsoft Edge** has the best voices, including natural Austrian (Ingrid, Jonas) and Swiss ones.
- **Safari** (iPhone/Mac) and **Chrome** have German voices, usually no Austrian one. Austrian sentences are then read with a German voice.
- If nothing plays, install a German voice in the system's language/speech settings.

Settings and best streak are stored in the browser's `localStorage`.
