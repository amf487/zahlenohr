/**
 * Helpers for the typical listening mistakes with German numbers, used to build wrong options.
 */

/** 43 → 34 (ones and tens swapped, "dreiundvierzig"). Null if not a sensible swap. */
export function swapDigits(n: number): number | null {
  const t = Math.floor(n / 10);
  const o = n % 10;
  return t >= 2 && o && t !== o ? o * 10 + t : null;
}

/** 16 ↔ 60, 30 → 13 ("sechzehn" vs "sechzig"). Null if not applicable. */
export function teenTensSwap(n: number): number | null {
  if (n >= 13 && n <= 19) return (n - 10) * 10;
  if (n >= 30 && n <= 90 && n % 10 === 0) return n / 10 + 10;
  return null;
}
