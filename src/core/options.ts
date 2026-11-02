import type { Distractor } from './types';
import { shuffle } from './random';

/**
 * Builds the multiple-choice options: the answer, up to two "typical mistake" distractors
 * (priority ≥ 2) and other plausible wrong answers, shuffled.
 */
export function buildOptions(
  answer: string,
  distractors: readonly Distractor[],
  filler: () => string | null,
  count = 4,
): string[] {
  const seen = new Set([answer]);
  const out = [answer];
  const sorted = shuffle(distractors.slice()).sort((a, b) => b.priority - a.priority);
  let typical = 0;
  for (const d of sorted) {
    if (out.length >= count) break;
    if (d.value == null || seen.has(d.value)) continue;
    if (d.priority >= 2) {
      if (typical >= 2) continue;
      typical++;
    }
    seen.add(d.value);
    out.push(d.value);
  }
  for (let guard = 0; out.length < count && guard < 400; guard++) {
    const v = filler();
    if (v != null && !seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return shuffle(out);
}
