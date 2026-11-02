import type { RegionId } from '@/core/types';
import { chance, pick } from '@/core/random';

/** Real-world number formats per country: mobile prefixes and landline area codes. */
export interface Landline {
  prefix: string;
  /** Length of the subscriber number. */
  length: number;
  city: string;
}

export interface Numbering {
  mobile: readonly string[];
  mobileLengths: readonly number[];
  landlines: readonly Landline[];
  placeholder: string;
}

const land = (prefix: string, length: number, city: string): Landline => ({ prefix, length, city });

export const NUMBERING: Readonly<Record<RegionId, Numbering>> = {
  AT: {
    mobile: ['0664', '0650', '0660', '0676', '0677', '0680', '0681', '0699', '0688'],
    mobileLengths: [7, 7, 7, 6, 8],
    landlines: [land('01', 7, 'Wien'), land('0316', 6, 'Graz'), land('0732', 6, 'Linz'), land('0662', 6, 'Salzburg'), land('0512', 6, 'Innsbruck')],
    placeholder: 'z. B. 0664 1234567',
  },
  DE: {
    mobile: ['0151', '0152', '0157', '0160', '0162', '0170', '0171', '0172', '0173', '0175', '0176', '0177', '0178', '0179'],
    mobileLengths: [7, 8, 8],
    landlines: [land('030', 8, 'Berlin'), land('040', 8, 'Hamburg'), land('089', 8, 'München'), land('0221', 7, 'Köln'), land('069', 8, 'Frankfurt')],
    placeholder: 'z. B. 0171 12345678',
  },
  CH: {
    mobile: ['075', '076', '077', '078', '079'],
    mobileLengths: [7],
    landlines: [land('044', 7, 'Zürich'), land('031', 7, 'Bern'), land('061', 7, 'Basel'), land('022', 7, 'Genf'), land('041', 7, 'Luzern')],
    placeholder: 'z. B. 079 123 45 67',
  },
}; // prettier-ignore

export type ChunkStyle = 'single' | 'pairs' | 'triples' | 'mixed';

/** Splits the subscriber number into the blocks that are spoken: 1234567 → 12 34 567 … */
export function chunk(digits: string, style: ChunkStyle): string[] {
  const n = digits.length;
  const sizes: number[] = [];
  let rem = n;
  if (style === 'single') {
    for (let i = 0; i < n; i++) sizes.push(1);
  } else if (style === 'pairs') {
    if (rem % 2) {
      const first = chance(0.5) ? 1 : 3;
      sizes.push(first);
      rem -= first;
    }
    while (rem > 0) {
      sizes.push(2);
      rem -= 2;
    }
  } else if (style === 'triples') {
    while (rem > 0) {
      if (rem === 4) {
        sizes.push(2, 2);
        rem = 0;
      } else if (rem <= 2) {
        sizes.push(rem);
        rem = 0;
      } else {
        sizes.push(3);
        rem -= 3;
      }
    }
  } else {
    while (rem > 0) {
      let s = pick([2, 2, 3, 3, 1]);
      if (s > rem) s = rem;
      if (rem - s === 1 && s > 1 && chance(0.7)) s = rem <= 3 ? rem : s - 1;
      sizes.push(s);
      rem -= s;
    }
  }
  const out: string[] = [];
  let i = 0;
  for (const s of sizes) {
    out.push(digits.slice(i, i + s));
    i += s;
  }
  return out;
}

/** "+" and "00" are the same; +43 0664 …, 0043 664 … and 0664 … all become 0664 … */
export function normalizePhone(input: string): string {
  const s = String(input).trim();
  let d = s.replace(/\D/g, '');
  if (s.startsWith('+')) d = '00' + d;
  if (/^00(43|49|41)/.test(d)) d = '0' + d.slice(4).replace(/^0+/, '');
  return d;
}
