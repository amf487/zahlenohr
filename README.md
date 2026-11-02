# Zahlenohr 德语数字听力

A browser game for practising **listening to German numbers**: times, phone numbers, prices, dates and large numbers, as they are said in Germany, Austria and Switzerland. Made for learners around level B who understand German well but get lost when someone rattles off a phone number or says "dreiviertel acht".

## Playing

Pick a mode and a difficulty and press **Spiel starten**. Each round has 10 questions.

- **Scoring:** the clock starts when the sentence has been read out. A correct answer scores 1000 points minus 1 point per 20 ms (30 ms for typed answers), at least 100. Wrong answers score 0, so a round is worth up to 10,000. 3,000 / 5,500 / 8,000 points give one to three stars.
- **Difficulty:** Leicht (multiple choice, slower speech), Mittel (multiple choice), Schwer (faster speech, no slow replay, about half the answers typed).
- **Typed answers are forgiving:** spaces and `-` are ignored, `+43` and `0043` count the same, dates can be typed as `23.3.`, `23. März`, `23 Jänner` or `3月23日`, and a 12-hour time for a 24-hour answer (`7:30` for `19:30`) counts with a warning.
- **After each answer** the board marks every digit green (heard right), red (wrong, with the typed digit shown small) or gold (12-hour form). Wrong answers show the sentence, a word-to-digit breakdown and hints in German and Chinese.
- **Regions:** German, Austrian or Swiss wording, or a mix (_viertel acht_, _Jänner_, _Des macht dann …_, _zwo_, _Natelnummer_, prices in Franken and Rappen). Over 200 sentence templates; the settings show how many per quiz and region.
- **Settings:** region, voice (with preview, and in Edge a mode that rotates through all Microsoft voices), speed, sound effects, full sentences or only the number, station background noise, Chinese hints.

### Voices

The app uses the browser's built-in speech synthesis (Web Speech API), so the voices depend on browser and system. **Microsoft Edge** has the best ones, including natural Austrian (Ingrid, Jonas) and Swiss voices. Safari and Chrome usually only have German voices. If nothing plays, install a German voice in the system settings.

## Development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev          # local dev server with hot reload
```

| Script                 | What it does                                                              |
| ---------------------- | ------------------------------------------------------------------------- |
| `npm run dev`          | Dev server (Vite)                                                         |
| `npm run build`        | Type check and production build into `dist/`                              |
| `npm run build:single` | Everything inlined into one file, `dist-single/index.html`, works offline |
| `npm run preview`      | Serve the production build                                                |
| `npm test`             | Unit tests (Vitest)                                                       |
| `npm run test:e2e`     | End-to-end tests in Chromium (Playwright)                                 |
| `npm run lint`         | ESLint                                                                    |
| `npm run format`       | Prettier                                                                  |
| `npm run check`        | Type check, lint, format check and unit tests in one go                   |

Tech stack: TypeScript (strict), Vite, SCSS, Vitest, Playwright, ESLint, Prettier. No UI framework; the screens are small TypeScript classes.

## Project structure

```
src/
  core/        Quiz engine: types, round, scoring, distractors, per-character marks, regions, difficulty
  lang/de/     German number words, ordinals, learning notes, typical listening traps
  quizzes/     One folder per quiz type (time, phone, number, price, date) + registry
  services/    Settings, high scores, speech, voices, sound effects, storage
  ui/          Screens (start, game, result, settings), components (board, timer, modal), helpers
  app/         App shell: creates services, switches screens
  styles/      SCSS: tokens, mixins, base, components, screens
tests/
  unit/        Logic tests, including thousands of generated questions per quiz and region
  e2e/         Full rounds in a real browser
```

See [docs/architecture.md](docs/architecture.md) for how the parts fit together and **how to add a new quiz type**, including quizzes that are not about numbers.

## Deployment

Pushes to `main` are built and deployed to GitHub Pages by `.github/workflows/deploy.yml`. In the repository settings, set **Pages → Source** to **GitHub Actions** once. `.github/workflows/ci.yml` runs all checks and tests on every push and pull request.

Settings and high scores are stored in the browser's `localStorage`.
