import { afterEach, describe, expect, it } from 'vitest';
import { setRandomSource } from '@/core/random';
import { formatNumber, numberWords, ordinalDative, yearWords } from '@/lang/de/numbers';
import { numberNotes } from '@/lang/de/notes';
import { swapDigits, teenTensSwap } from '@/lang/de/traps';

// Always pick the first variant ("hundert" rather than "einhundert") for exact comparisons.
const noVariants = () => setRandomSource(() => 0.99);
afterEach(() => setRandomSource(Math.random));

describe('numberWords', () => {
  it.each([
    [0, 'null'],
    [1, 'eins'],
    [16, 'sechzehn'],
    [21, 'einundzwanzig'],
    [47, 'siebenundvierzig'],
    [60, 'sechzig'],
    [101, 'hunderteins'],
    [312, 'dreihundertzwölf'],
    [3412, 'dreitausendvierhundertzwölf'],
    [21000, 'einundzwanzigtausend'],
    [101000, 'hunderteintausend'],
    [257840, 'zweihundertsiebenundfünfzigtausendachthundertvierzig'],
    [1_000_000, 'eine Million'],
  ])('%i → %s', (n, words) => {
    noVariants();
    expect(numberWords(n)).toBe(words);
  });

  it('says "einhundert" or "hundert" at random', () => {
    setRandomSource(() => 0.1);
    expect(numberWords(100)).toBe('einhundert');
    setRandomSource(() => 0.9);
    expect(numberWords(100)).toBe('hundert');
  });
});

describe('years and ordinals', () => {
  it('reads years before 2000 in hundreds', () => {
    noVariants();
    expect(yearWords(1987)).toBe('neunzehnhundertsiebenundachtzig');
    expect(yearWords(1900)).toBe('neunzehnhundert');
    expect(yearWords(2024)).toBe('zweitausendvierundzwanzig');
  });

  it.each([
    [1, 'ersten'],
    [3, 'dritten'],
    [7, 'siebten'],
    [12, 'zwölften'],
    [20, 'zwanzigsten'],
    [31, 'einunddreißigsten'],
  ])('%i → am %s', (n, word) => expect(ordinalDative(n)).toBe(word));

  it('formats large numbers with dots', () => {
    expect(formatNumber(3412)).toBe('3412');
    expect(formatNumber(257840)).toBe('257.840');
  });
});

describe('learning notes', () => {
  it('explains the ones-before-tens order', () => {
    const notes = numberNotes('dreiundvierzig');
    expect(notes[0]?.de).toContain('= 3 + 40 = 43');
  });

  it('warns about -zehn vs -zig and zwo', () => {
    expect(numberNotes('sechzehn').some((n) => n.de.includes('-zehn'))).toBe(true);
    expect(numberNotes('null eins sieben eins zwo').some((n) => n.de.includes('zwo'))).toBe(true);
    expect(numberNotes('dreiundvierzig').some((n) => n.de.includes('-zehn'))).toBe(false);
  });

  it('finds typical mistakes', () => {
    expect(swapDigits(43)).toBe(34);
    expect(swapDigits(44)).toBeNull();
    expect(swapDigits(40)).toBeNull();
    expect(teenTensSwap(16)).toBe(60);
    expect(teenTensSwap(30)).toBe(13);
  });
});
