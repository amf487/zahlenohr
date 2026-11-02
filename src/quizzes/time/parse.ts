import type { Bilingual, CheckResult } from '@/core/types';

/** Minutes since midnight → "7:05" (24 h). */
export const format24 = (t: number): string => {
  t = ((t % 1440) + 1440) % 1440;
  return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
};

/** Minutes since midnight → "7:05" (12 h, 19:05 → 7:05). */
export const format12 = (t: number): string => {
  t = ((t % 1440) + 1440) % 1440;
  const h = Math.floor(t / 60);
  return (h % 12 || 12) + ':' + String(t % 60).padStart(2, '0');
};

/** Reads 7:30, 7.30, 7,30, 7h30, 730, "7 30", 7-30 and 7. Spaces and "-" are ignored. */
export function parseTime(input: string): [number, number] | null {
  const s = String(input).trim();
  const m = s.match(/^(\d{1,2})\s*[:.,h]\s*(\d{1,2})/);
  if (m) return [+m[1]!, +m[2]!];
  const d = s.replace(/[\s-]/g, '').replace(/\D/g, '');
  if (d.length === 3 || d.length === 4) return [+d.slice(0, -2), +d.slice(-2)];
  if (d.length >= 1 && d.length <= 2) return [+d, 0];
  return null;
}

/**
 * `exact`: the time of day is known (24 h or "am Abend"), so 19:30 is expected.
 * A 12-hour answer (7:30) still counts, but with a warning.
 */
export function checkTime(
  input: string,
  h24: number,
  minute: number,
  exact: boolean,
  why: Bilingual,
): CheckResult {
  const p = parseTime(input);
  if (!p || p[1] !== minute) return false;
  const h = p[0] === 24 ? 0 : p[0];
  if (!exact) return h % 12 === h24 % 12;
  if (h === h24) return true;
  if (h % 12 === h24 % 12) {
    const t = format24(h24 * 60 + minute);
    return {
      ok: true,
      warning: { de: `Fast: gemeint war ${t}. ${why.de}`, zh: `注意：正确答案是 ${t}。${why.zh}` },
    };
  }
  return false;
}

/** The typed time in the notation of the answer, for the board marks. */
export function timeNotation(input: string, exact: boolean): string | null {
  const p = parseTime(input);
  if (!p) return null;
  const h = exact ? (p[0] === 24 ? 0 : p[0]) : p[0] % 12 || 12;
  return `${h}${String(p[1]).padStart(2, '0')}`;
}
