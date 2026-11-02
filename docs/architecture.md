# Architecture

Zahlenohr is split into layers that only depend downwards:

```
app/        App shell, wires everything together
  ↓
ui/         Screens and components (DOM)
  ↓
services/   Browser APIs: speech, audio, localStorage
  ↓
quizzes/    Quiz types, each self-contained
  ↓
lang/de/    German language helpers
  ↓
core/       Engine and types, no DOM, no German
```

`core/` and `quizzes/` have no DOM dependencies, so they are fully unit-tested in Node.

## The quiz contract

Every quiz type is a `QuizModule` (see `src/core/types.ts`):

```ts
interface QuizModule {
  id: string; // used in settings and high scores
  label: { de: string; zh: string }; // shown on the mode card
  icon: string; // inner SVG of a 24×24 stroke icon
  colors: [string, string]; // card gradient
  boardPlaceholder: string; // board before the answer is revealed, e.g. "--:--"
  markPattern?: RegExp; // which characters the board compares (default: digits)
  generate(region): QuestionDraft; // one new question
  sentenceBank(region): string[]; // all sentence templates, for the overview
}
```

`generate` returns a `QuestionDraft`:

| Field                              | Meaning                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `phrase`                           | The key phrase that is spoken and highlighted, e.g. `halb acht am Abend`   |
| `sentences`                        | Templates with `{x}`, e.g. `Treffen wir uns um {x}?`                       |
| `answer`                           | The correct answer as shown, e.g. `19:30`                                  |
| `options`                          | Four multiple-choice options including the answer (use `buildOptions`)     |
| `check(input)`                     | Checks a typed answer: `true`, `false` or `{ ok: true, warning }`          |
| `toAnswerNotation`                 | Converts a typed answer into the answer's notation, for the per-tile marks |
| `hints`, `parts`                   | Explanations shown after a wrong answer                                    |
| `kind`, `placeholder`, `inputMode` | Description and input field setup                                          |

The engine does the rest: it wraps the phrase in a random sentence (`core/sentences.ts`, with openers and no repeats), picks a voice, runs the clock, scores (`core/scoring.ts`), and the UI marks every character on the board (`core/marks.ts`).

## Adding a quiz type

1. Create `src/quizzes/<name>/index.ts` that exports a `QuizModule`. Put sentence templates in `sentences.ts` and parsing in its own file, so they are easy to test.
2. Add it to `QUIZZES` in `src/quizzes/index.ts`. It then appears as its own mode card, is part of "Mix", gets its own high score lists and shows up in the sentence overview.
3. Run `npm test`: `tests/unit/quizzes.test.ts` automatically checks every registered quiz in every region (four unique options, the answer passes its own check, every sentence has `{x}`, typing the answer marks every tile green).

### Not about numbers?

Nothing in the engine assumes numbers. A quiz about articles, for example:

```ts
export const articleQuiz: QuizModule = {
  id: 'article',
  label: { de: 'Artikel', zh: '冠词' },
  icon: '<path d="M4 6h16M4 12h10M4 18h7"/>',
  colors: ['#22E0B4', '#5C86FF'],
  boardPlaceholder: '---',
  markPattern: /\p{L}/u, // compare letters on the board instead of digits
  generate: () => {
    const [noun, article] = pick([
      ['Tisch', 'der'],
      ['Lampe', 'die'],
      ['Buch', 'das'],
    ]);
    return {
      phrase: `${article} ${noun}`,
      sentences: ['Hörst du es? {x}.'],
      answer: article,
      options: shuffle(['der', 'die', 'das', 'den']),
      check: (s) => s.trim().toLowerCase() === article,
      toAnswerNotation: (s) => s.trim().toLowerCase(),
      hints: [],
      parts: [],
      kind: 'Artikel',
      placeholder: 'der, die oder das',
      inputMode: 'text',
    };
  },
  sentenceBank: () => ['Hörst du es? {x}.'],
};
```

Things that are specific to German numbers live in `src/lang/de/` and can be reused by number-like quizzes (house numbers, postcodes, percentages …).

## Regions

`core/regions.ts` defines Germany, Austria and Switzerland (name, country code, sentence openers). Quizzes receive the region in `generate(region)` and decide themselves what changes, e.g. `regional(common, { DE, AT, CH })` for sentence lists. A new region needs an entry there and in every `regional(...)` call (TypeScript will point out the missing ones).

## UI

The UI is plain TypeScript without a framework. Each screen (`src/ui/screens/`) is a class with a `root` element, `enter()` and `leave()`. `App` (`src/app/App.ts`) creates the services and screens and switches between them. Screens get an `AppContext` with the services and helpers like `say()` and `sound()`.

Styles are SCSS partials in `src/styles/`, named after the BEM-style classes they define (`.board`, `.board__tiles`, `.tile--hit`). Colours and fonts are CSS custom properties in `abstracts/_tokens.scss`; breakpoints and shared patterns (the chunky 3D press effect, display type) are mixins in `abstracts/_mixins.scss`. Each mode's colours come from its quiz module and are set inline as `--a` / `--b`.

## Storage

Settings (`zahlenohr.settings.v2`) and high scores (`zahlenohr.highscores.v2`) are kept in `localStorage`, under the same keys as the earlier single-file version, so nothing is lost when updating. Old field names (`diff`, `context`, `zh`, `sfx`) are read and migrated.

## Tests

- `tests/unit/` (Vitest, Node): number words, parsers, marks, scoring, the round engine, storage, and generated-question checks for every quiz and region.
- `tests/e2e/` (Playwright, Chromium): full rounds against the production build with speech stubbed, checking that every screen fits 1440×760 without scrolling.

`window.__zahlenohr` exposes the registered quizzes and the current question for automated tests.
