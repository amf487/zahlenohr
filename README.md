# Zahlenohr 德语数字听力

A browser game for practising **listening to German numbers**: times, phone numbers, prices, dates, years and large numbers. Made for learners around level B who understand German well but get lost when someone rattles off a phone number or says "dreiviertel acht".

Everything is in one file, `index.html`. No build step, no server, no API key.

## How to use

Open `index.html` in a browser, pick a mode and a difficulty, and press **Spiel starten**.

- **Rounds of 10 questions.** The clock starts when the sentence has been read out. A correct answer scores 1000 points minus 1 point per 20 ms (30 ms for typed answers), at least 100. Wrong answers score 0, so the maximum per round is 10,000.
- **Difficulty:** Leicht (multiple choice, slower speech), Mittel (multiple choice, normal speed), Schwer (faster speech, no slow replay, about half the answers must be typed)
- **Arcade style:** circular points timer, score pop-ups, star rating (3,000 / 5,500 / 8,000 points), confetti for a new record and short sound effects (can be switched off in the settings)
- **Typed answers are forgiving:** spaces and `-` are ignored, `+43` and `0043` count the same, dates can be typed as `23.3.`, `23. März`, `23 Jänner` or `3月23日`, and a 12-hour time for a 24-hour answer (`7:30` for `19:30`) counts but shows a warning
- **After each answer** the board marks every digit green (heard right), red (wrong, with the typed digit shown small) or gold (12-hour form)
- **Over 200 sentence templates** (shared, Austrian, German and Swiss ones; the settings page shows the exact count per exercise and region) plus short openers, and recently used sentences are not repeated
- **Results** show the points for each question with the spoken sentence and an explanation; the best scores per mode and difficulty are kept in a high score list
- **Modes:** Uhrzeit, Telefon, Zahlen, Preise, Datum, Mix
- **Regions:** German, Austrian or Swiss phrasing, or a mix (e.g. *viertel acht*, *in der Früh*, *Jänner*, *Des macht dann …* vs. *Viertel nach sieben*, *zwo* vs. *Natelnummer*, *Billett*, prices in Franken and Rappen)
- **Phone numbers** come in real Austrian, German and Swiss formats (0664, 01, 030, 079, 044, +43/+49/+41, extensions) and are read as single digits, pairs, triples or mixed blocks
- **Wrong options are typical traps:** 43 vs 34, sechzehn vs sechzig, *halb acht* = 7:30 (not 8:30), Juni vs Juli
- After each answer: the spoken sentence, a word-to-digit breakdown, and hints in German and Chinese (can be switched off)
- Settings page: region, voice (with a preview/stop button and, in Edge, a mode that rotates through all Microsoft voices), speech rate, sound effects, full sentences or only the number, optional station background noise, Chinese hints

## Voices

The app uses the browser's built-in speech synthesis (Web Speech API), so the voices depend on the browser and operating system:

- **Microsoft Edge** has the best voices, including natural Austrian (Ingrid, Jonas) and Swiss ones.
- **Safari** (iPhone/Mac) and **Chrome** have German voices, usually no Austrian one. Austrian sentences are then read with a German voice.
- If nothing plays, install a German voice in the system's language/speech settings.

Settings and high scores are stored in the browser's `localStorage`.
