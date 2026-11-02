import type { RegionId } from '@/core/types';

export interface Currency {
  /** "Euro" / "Franken" */
  major: string;
  /** "Cent" / "Rappen" */
  minor: string;
  majorShort: string;
  minorShort: string;
  /** Smallest step in cents (Swiss prices end in 0 or 5 Rappen). */
  step: number;
  format(cents: number): string;
  placeholder: string;
}

const pad = (c: number) => String(c % 100).padStart(2, '0');

export const EURO: Currency = {
  major: 'Euro',
  minor: 'Cent',
  majorShort: '€',
  minorShort: 'ct',
  step: 1,
  format: (c) => `${Math.floor(c / 100)},${pad(c)} €`,
  placeholder: 'z. B. 14,90',
};

export const FRANC: Currency = {
  major: 'Franken',
  minor: 'Rappen',
  majorShort: 'Fr.',
  minorShort: 'Rp.',
  step: 5,
  format: (c) => `CHF ${Math.floor(c / 100)}.${pad(c)}`,
  placeholder: 'z. B. 14.90',
};

export const currencyFor = (region: RegionId): Currency => (region === 'CH' ? FRANC : EURO);

/** Reads 14,90 / 14.90 / 14,90 € / CHF 14.90 / 14,- into cents. Spaces and "-" are ignored. */
export function parsePrice(input: string): number | null {
  const s = String(input)
    .replace(/€|euro?|chf|franken|fr\.|rappen|rp\./gi, '')
    .replace(/\s/g, '')
    .replace(/,-+$/, '')
    .replace(/-/g, '');
  if (/^\d+([.,]\d{1,2})?$/.test(s)) return Math.round(parseFloat(s.replace(',', '.')) * 100);
  return null;
}
