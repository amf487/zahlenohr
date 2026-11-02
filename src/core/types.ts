/**
 * Shared types of the quiz engine. Nothing in here knows about numbers, German or the DOM,
 * so new quiz types (vocabulary, articles, listening comprehension …) can plug into the same game.
 */

export type RegionId = 'DE' | 'AT' | 'CH';
export type RegionChoice = RegionId | 'mix';

/** A text in German with a Chinese translation for learners. */
export interface Bilingual {
  de: string;
  zh: string;
}

/** One spoken piece of the answer and how it is written, e.g. "dreiundvierzig" → "43". */
export interface Part {
  spoken: string;
  written: string;
}

export type InputMode = 'text' | 'decimal' | 'numeric' | 'tel';

/** `true`/`false`, or correct with a warning (e.g. 7:30 typed for 19:30). */
export type CheckResult = boolean | { ok: true; warning: Bilingual };

/** A wrong answer option; higher priority = more typical mistake. */
export interface Distractor {
  priority: number;
  value: string | null;
}

/** What a quiz module produces for one question. The engine adds the sentence and the voice. */
export interface QuestionDraft {
  /** The key phrase that is spoken and highlighted in the transcript. */
  phrase: string;
  /** Spoken instead of a full sentence when sentences are switched off (defaults to `phrase`). */
  phraseAlone?: string;
  /** Sentence templates; `{x}` is replaced by the phrase. */
  sentences: readonly string[];
  /** The correct answer as it is shown. */
  answer: string;
  /** Answer options for multiple choice, including the correct one. */
  options: string[];
  /** Checks a typed answer. Multiple-choice answers are compared with `answer` directly. */
  check(input: string): CheckResult;
  /** Converts a typed answer into the answer's own notation so the board can mark each character. */
  toAnswerNotation(input: string): string | null;
  hints: Bilingual[];
  parts: Part[];
  /** Short description of the question type, e.g. "Handynummer". */
  kind: string;
  placeholder: string;
  inputMode: InputMode;
}

/** A self-contained quiz type. Register it in `src/quizzes/index.ts`. */
export interface QuizModule {
  id: string;
  label: Bilingual;
  /** Inner SVG markup of a 24×24 stroke icon. */
  icon: string;
  /** Two colours for the card gradient. */
  colors: readonly [string, string];
  /** What the board shows before the answer is revealed. */
  boardPlaceholder: string;
  /** Characters of the answer that are compared on the board (default: digits). */
  markPattern?: RegExp;
  generate(region: RegionId): QuestionDraft;
  /** Every sentence template the quiz can use in a region, for the overview in the settings. */
  sentenceBank(region: RegionId): readonly string[];
}

/** A selectable game mode: one quiz, or a mix of several. */
export interface GameMode {
  id: string;
  label: Bilingual;
  icon: string;
  colors: readonly [string, string];
  quizzes: readonly QuizModule[];
}

/** A finished question, ready to be played. */
export interface Question extends QuestionDraft {
  quiz: QuizModule;
  region: RegionId;
  /** The full sentence that is spoken. */
  text: string;
}

export interface VoiceParams {
  voiceURI: string | null;
  rate: number;
  pitch: number;
}
