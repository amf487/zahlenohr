import type { Bilingual, Question, VoiceParams } from './types';
import type { Difficulty } from './difficulty';
import { pointsFor } from './scoring';

export const ROUND_LENGTH = 10;

export type AnswerInput = 'choice' | 'typed';

export interface RoundItem {
  question: Question;
  input: AnswerInput;
  voice: VoiceParams;
  /** When the clock started (end of the first playback), in `performance.now()` time. */
  clockStart: number;
  answered: boolean;
  given: string;
  correct: boolean;
  warning: Bilingual | null;
  ms: number;
  points: number;
}

export interface NewItem {
  question: Question;
  input: AnswerInput;
  voice: VoiceParams;
}

/**
 * One round of the game: a fixed number of questions, the clock and the score.
 * Pure state; the UI drives it and renders the result.
 */
export class Round {
  readonly items: RoundItem[] = [];
  index = -1;
  score = 0;

  constructor(
    readonly modeId: string,
    readonly difficulty: Difficulty,
    private readonly createItem: () => NewItem,
    readonly length = ROUND_LENGTH,
  ) {}

  get current(): RoundItem | null {
    return this.items[this.index] ?? null;
  }

  get isLastQuestion(): boolean {
    return this.index === this.length - 1;
  }

  get finished(): boolean {
    return this.index >= this.length;
  }

  /** Moves to the next question; returns null when the round is over. */
  next(): RoundItem | null {
    this.index++;
    if (this.finished) return null;
    const item: RoundItem = {
      ...this.createItem(),
      clockStart: 0,
      answered: false,
      given: '',
      correct: false,
      warning: null,
      ms: 0,
      points: 0,
    };
    this.items.push(item);
    return item;
  }

  /** Starts the clock for the current question (only once). */
  startClock(now: number): boolean {
    const item = this.current;
    if (!item || item.answered || item.clockStart) return false;
    item.clockStart = now;
    return true;
  }

  submit(value: string, now: number): RoundItem | null {
    const item = this.current;
    if (!item || item.answered) return null;
    const q = item.question;
    item.answered = true;
    item.ms = item.clockStart ? now - item.clockStart : 0;
    item.given = value.trim();
    const result = item.input === 'choice' ? value === q.answer : q.check(value);
    item.correct = result === true || (typeof result === 'object' && result.ok);
    item.warning = typeof result === 'object' ? result.warning : null;
    item.points = item.correct ? pointsFor(item.ms, item.input === 'typed') : 0;
    this.score += item.points;
    return item;
  }

  summary(): { correct: number; averageMs: number } {
    const right = this.items.filter((i) => i.correct);
    const averageMs = right.length ? right.reduce((sum, i) => sum + i.ms, 0) / right.length : 0;
    return { correct: right.length, averageMs };
  }
}
