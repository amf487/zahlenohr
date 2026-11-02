import type { Bilingual } from './types';

export type DifficultyId = 'easy' | 'medium' | 'hard';

export interface Difficulty {
  id: DifficultyId;
  label: Bilingual;
  /** Shown as a tooltip on the start screen. */
  note: Bilingual;
  /** Speech rate multiplier. */
  rate: number;
  /** Whether the "Langsam" button is offered. */
  slowReplay: boolean;
  /** Share of questions that must be typed instead of picked (0–1). */
  typedShare: number;
}

export const DIFFICULTIES: Readonly<Record<DifficultyId, Difficulty>> = {
  easy: {
    id: 'easy',
    label: { de: 'Leicht', zh: '简单' },
    note: { de: 'Vier Antworten zur Auswahl, etwas langsamer gesprochen.', zh: '四选一，语速稍慢。' },
    rate: 0.88,
    slowReplay: true,
    typedShare: 0,
  },
  medium: {
    id: 'medium',
    label: { de: 'Mittel', zh: '中等' },
    note: { de: 'Vier Antworten zur Auswahl, normales Tempo.', zh: '四选一，正常语速。' },
    rate: 1,
    slowReplay: true,
    typedShare: 0,
  },
  hard: {
    id: 'hard',
    label: { de: 'Schwer', zh: '困难' },
    note: {
      de: 'Schneller gesprochen, kein Langsam-Knopf, und etwa jede zweite Antwort musst du eintippen.',
      zh: '语速更快，没有慢速，大约一半的题要自己输入。',
    },
    rate: 1.1,
    slowReplay: false,
    typedShare: 0.5,
  },
};

export const isDifficultyId = (v: unknown): v is DifficultyId => typeof v === 'string' && v in DIFFICULTIES;
