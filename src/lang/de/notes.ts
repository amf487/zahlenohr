import type { Bilingual } from '@/core/types';

const UNIT: Record<string, number> = {
  ein: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9,
}; // prettier-ignore
const TEN: Record<string, number> = {
  zwanzig: 20, dreißig: 30, vierzig: 40, fünfzig: 50, sechzig: 60, siebzig: 70, achtzig: 80, neunzig: 90,
}; // prettier-ignore

/**
 * Learning notes for the typical traps in spoken German numbers, based on the words that were said.
 */
export function numberNotes(words: string): Bilingual[] {
  const notes: Bilingual[] = [];
  const m = words.match(
    /(ein|zwei|drei|vier|fünf|sechs|sieben|acht|neun)und(zwanzig|dreißig|vierzig|fünfzig|sechzig|siebzig|achtzig|neunzig)/,
  );
  if (m) {
    const o = UNIT[m[1]!]!;
    const t = TEN[m[2]!]!;
    notes.push({
      de: `„${m[0]}" = ${o} + ${t} = ${t + o}. Erst die Einer, dann die Zehner.`,
      zh: `德语先说个位再说十位：${m[0]} = ${o} + ${t} = ${t + o}`,
    });
  }
  if (
    /(drei|vier|fünf|sech|sieb|acht|neun)zehn/.test(words) ||
    /(?<!und)(dreißig|vierzig|fünfzig|sechzig|siebzig|achtzig|neunzig)/.test(words)
  ) {
    notes.push({
      de: '„-zehn" heißt 13 bis 19, „-zig" / „-ßig" heißt 20 bis 90: sechzehn (16) ist nicht sechzig (60).',
      zh: '-zehn 是十几（13–19），-zig/-ßig 是几十（20–90）：sechzehn = 16，sechzig = 60。',
    });
  }
  if (/\bzwo\b/.test(words)) {
    notes.push({
      de: '„zwo" ist zwei. Am Telefon sagt man oft zwo, damit es nicht wie drei klingt.',
      zh: 'zwo = zwei（打电话时常用，避免和 drei 混淆）',
    });
  }
  return notes;
}
