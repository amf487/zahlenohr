# Zahlenohr 德语数字听力

A browser game for practising **listening to German numbers**: times, phone numbers, prices, dates, years and large numbers. Made for learners around level B who understand German well but get lost when someone rattles off a phone number or says "dreiviertel acht".

Everything is in one file, `index.html`. No build step, no server, no API key.

## How to use

Open `index.html` in a browser, pick a mode and a difficulty, and press **Spiel starten**.

- **Rounds of 10 questions.** The timer starts when the sentence has been read out. A correct answer within 3 s scores 100 points, then the score drops to 10 points at 20 s (typed answers: 6 s and 30 s). Wrong answers score 0, so the maximum per round is 1000.
- **Difficulty:** Leicht (multiple choice, slower speech), Mittel (multiple choice, normal speed), Schwer (faster speech, no slow replay, about half the answers must be typed)
- **Results** show the points for each question with the spoken sentence and an explanation; the best scores per mode and difficulty are kept in a high score list
- **Modes:** Uhrzeit, Telefon, Zahlen, Preise, Datum, Mix
- **Regions:** German or Austrian phrasing, or a mix of both (e.g. *viertel acht*, *in der Früh*, *Jänner*, *Des macht dann …* vs. *Viertel nach sieben*, *zwo*)
- **Phone numbers** come in real Austrian/German formats (0664, 01, 030, +43, extensions) and are read as single digits, pairs, triples or mixed blocks
- **Wrong options are typical traps:** 43 vs 34, sechzehn vs sechzig, *halb acht* = 7:30 (not 8:30), Juni vs Juli
- After each answer: the spoken sentence, a word-to-digit breakdown, and hints in German and Chinese (can be switched off)
- Settings page: region, voice, speech rate, full sentences or only the number, optional station background noise, Chinese hints

## Voices

The app uses the browser's built-in speech synthesis (Web Speech API), so the voices depend on the browser and operating system:

- **Microsoft Edge** has the best voices, including natural Austrian (Ingrid, Jonas) and Swiss ones.
- **Safari** (iPhone/Mac) and **Chrome** have German voices, usually no Austrian one. Austrian sentences are then read with a German voice.
- If nothing plays, install a German voice in the system's language/speech settings.

Settings and high scores are stored in the browser's `localStorage`.
