/** Days per month (February without leap years, so every generated date exists). */
export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

export const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
] as const; // prettier-ignore

export const MONTHS_ZH = [
  '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月',
] as const; // prettier-ignore

const MONTH_KEYS: readonly (readonly string[])[] = [
  ['jan', 'jän', 'jaen'], ['feb'], ['mär', 'mar', 'maer'], ['apr'], ['mai', 'may'], ['jun'],
  ['jul'], ['aug'], ['sep'], ['okt', 'oct'], ['nov'], ['dez', 'dec'],
]; // prettier-ignore

export const isValidDate = (day: number, month: number): boolean =>
  month >= 1 && month <= 12 && day >= 1 && day <= DAYS_IN_MONTH[month - 1]!;

/** "März", "jänner", "Feber" … → 3, 1, 2 (0 if unknown). */
export function monthFromWord(word: string): number {
  const w = word.toLowerCase();
  for (let i = 0; i < 12; i++) if (MONTH_KEYS[i]!.some((k) => w.startsWith(k))) return i + 1;
  return 0;
}

/** Reads 23.3., 23/3, 23 3, 23-3, 23. März, 23 Jänner and 3月23日 into [day, month]. */
export function parseDate(input: string): [number, number] | null {
  const s = String(input).trim();
  let m = s.match(/(\d{1,2})\s*月\s*(\d{1,2})/);
  if (m) return [+m[2]!, +m[1]!];
  m = s.match(/(\d{1,2})\s*\.?\s*([A-Za-zÄÖÜäöü]{3,})/);
  if (m) {
    const month = monthFromWord(m[2]!);
    return month ? [+m[1]!, month] : null;
  }
  m = s.match(/(\d{1,2})\s*[./\-\s]\s*(\d{1,2})/);
  return m ? [+m[1]!, +m[2]!] : null;
}
