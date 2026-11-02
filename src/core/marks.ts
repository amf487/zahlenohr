/**
 * Per-character feedback on the board: which characters of the answer did the player get right?
 * Works for any quiz; the quiz decides which characters count (default: digits).
 */
export type MarkState = 'hit' | 'miss' | 'near';

export interface Mark {
  state: MarkState;
  /** The character the player gave instead (only when lengths match). */
  typed?: string;
}

export interface MarkInput {
  answer: string;
  /** The player's answer in the answer's notation, or null if it could not be read. */
  given: string | null;
  correct: boolean;
  /** Correct, but with a warning: differences are shown as "near" instead of "miss". */
  warned: boolean;
  pattern?: RegExp;
}

export const DIGITS = /\d/;

export const keepMatching = (text: string, pattern: RegExp = DIGITS): string =>
  [...text].filter((c) => pattern.test(c)).join('');

export function markAnswer({ answer, given, correct, warned, pattern = DIGITS }: MarkInput): Mark[] {
  const a = keepMatching(answer, pattern);
  if (correct && !warned) return [...a].map(() => ({ state: 'hit' }));
  const wrong: MarkState = warned ? 'near' : 'miss';
  const u = given == null ? '' : keepMatching(given, pattern);
  if (!u) return [...a].map(() => ({ state: 'miss' }));
  if (u.length === a.length) {
    return [...a].map((c, i) => (c === u[i] ? { state: 'hit' } : { state: wrong, typed: u[i] as string }));
  }
  // Different lengths: the longest common subsequence decides which characters were heard.
  const n = a.length;
  const m = u.length;
  const L: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      L[i]![j] = a[i] === u[j] ? L[i + 1]![j + 1]! + 1 : Math.max(L[i + 1]![j]!, L[i]![j + 1]!);
    }
  }
  const out: Mark[] = [...a].map(() => ({ state: wrong }));
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === u[j]) {
      out[i] = { state: 'hit' };
      i++;
      j++;
    } else if (L[i + 1]![j]! >= L[i]![j + 1]!) i++;
    else j++;
  }
  return out;
}
