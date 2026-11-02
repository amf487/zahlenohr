import type { Bilingual } from './types';

/**
 * A correct answer is worth 1000 points minus 1 point per 20 ms (30 ms for typed answers),
 * counted from the end of the sentence, and at least 100. Wrong answers score 0.
 */
export const MAX_POINTS = 1000;
export const MIN_POINTS = 100;

export const msPerPoint = (typed: boolean): number => (typed ? 30 : 20);

export function pointsFor(ms: number, typed: boolean): number {
  return Math.max(MIN_POINTS, Math.round(MAX_POINTS - ms / msPerPoint(typed)));
}

/** 0–3 stars for a round total. */
export const STAR_THRESHOLDS = [3000, 5500, 8000] as const;

export function starsFor(score: number): 0 | 1 | 2 | 3 {
  return STAR_THRESHOLDS.filter((t) => score >= t).length as 0 | 1 | 2 | 3;
}

export const GRADES: readonly Bilingual[] = [
  { de: 'Weiter üben!', zh: '继续加油！' },
  { de: 'Gut gemacht!', zh: '不错！' },
  { de: 'Stark!', zh: '很厉害！' },
  { de: 'Perfekt gehört!', zh: '完美！' },
];
