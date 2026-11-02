import { chance } from '@/core/random';

/**
 * German number words as they are spoken. Where German allows variants
 * ("hundert" / "einhundert"), one is picked at random for variety.
 */
export const ONES: readonly string[] = [
  'null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun',
  'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn',
]; // prettier-ignore

export const TENS: readonly string[] = [
  '', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig',
]; // prettier-ignore

/** 0–99. `inner` = used inside a bigger word, where 1 becomes "ein" (einhundert, einundzwanzig). */
export function under100(n: number, inner = false): string {
  if (n < 20) return n === 1 && inner ? 'ein' : ONES[n]!;
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o ? (o === 1 ? 'ein' : ONES[o]!) + 'und' + TENS[t]! : TENS[t]!;
}

/** 0–999 (returns '' for 0). */
export function under1000(n: number, inner = false): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  let s = '';
  if (h) s += (h === 1 ? (chance(0.5) ? 'ein' : '') : ONES[h]!) + 'hundert';
  if (r) s += under100(r, inner);
  return s;
}

/** Any number below 1 billion, e.g. 257840 → "zweihundertsiebenundfünfzigtausendachthundertvierzig". */
export function numberWords(n: number): string {
  if (n === 0) return 'null';
  const millions = Math.floor(n / 1e6);
  const thousands = Math.floor(n / 1000) % 1000;
  const rest = n % 1000;
  const parts: string[] = [];
  if (millions) parts.push(millions === 1 ? 'eine Million' : under1000(millions) + ' Millionen');
  let s = '';
  if (thousands) s += (thousands === 1 ? (chance(0.6) ? 'ein' : '') : under1000(thousands, true)) + 'tausend';
  if (rest) s += under1000(rest);
  if (s) parts.push(s);
  return parts.join(' ');
}

/** Years before 2000 are spoken in hundreds: 1987 → "neunzehnhundertsiebenundachtzig". */
export function yearWords(year: number): string {
  if (year >= 1100 && year < 2000) {
    const c = Math.floor(year / 100);
    const r = year % 100;
    return ONES[c]! + 'hundert' + (r ? under100(r) : '');
  }
  return numberWords(year);
}

/** Dative ordinal as in "am dritten Mai": 1 → "ersten", 3 → "dritten", 21 → "einundzwanzigsten". */
export function ordinalDative(n: number): string {
  const special: Record<number, string> = { 1: 'ersten', 3: 'dritten', 7: 'siebten', 8: 'achten' };
  if (n < 20) return special[n] ?? ONES[n]! + 'ten';
  return under100(n) + 'sten';
}

/** 257840 → "257.840"; numbers below 10000 stay unformatted. */
export const formatNumber = (n: number): string =>
  n >= 10000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : String(n);
