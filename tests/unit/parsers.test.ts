import { describe, expect, it } from 'vitest';
import { checkTime, format12, format24, parseTime, timeNotation } from '@/quizzes/time/parse';
import { normalizePhone, chunk } from '@/quizzes/phone/numbering';
import { parsePrice, EURO, FRANC } from '@/quizzes/price/currency';
import { parseDate, monthFromWord } from '@/quizzes/date/calendar';

describe('times', () => {
  it.each(['7:30', '7.30', '7,30', '7h30', '730', '7 30', '07:30', ' 7 : 30 '])('reads %s', (s) =>
    expect(parseTime(s)).toEqual([7, 30]),
  );

  it('formats minutes since midnight', () => {
    expect(format24(19 * 60 + 5)).toBe('19:05');
    expect(format12(19 * 60 + 5)).toBe('7:05');
    expect(format24(-30)).toBe('23:30');
  });

  it('accepts both halves of the day when no time of day was said', () => {
    expect(checkTime('7:30', 19, 30, false, { de: '', zh: '' })).toBe(true);
    expect(checkTime('19:30', 19, 30, false, { de: '', zh: '' })).toBe(true);
    expect(checkTime('8:30', 19, 30, false, { de: '', zh: '' })).toBe(false);
  });

  it('accepts a 12-hour answer for a 24-hour time, with a warning', () => {
    const r = checkTime('7:30', 19, 30, true, { de: 'Grund.', zh: '原因。' });
    expect(r).toMatchObject({ ok: true });
    expect(typeof r === 'object' && r.warning.de).toContain('19:30');
    expect(checkTime('19:30', 19, 30, true, { de: '', zh: '' })).toBe(true);
    expect(checkTime('0:15', 0, 15, true, { de: '', zh: '' })).toBe(true);
    expect(checkTime('24:15', 0, 15, true, { de: '', zh: '' })).toBe(true);
  });

  it('converts typed times into the answer notation', () => {
    expect(timeNotation('19:30', false)).toBe('730');
    expect(timeNotation('7:30', true)).toBe('730');
    expect(timeNotation('abc', true)).toBeNull();
  });
});

describe('phone numbers', () => {
  it.each(['+43 664 12 34 567', '0043 664 1234567', '0664-12-34-567', '+43 0664 1234567', '0664 1234567'])(
    'treats %s as the same number',
    (s) => expect(normalizePhone(s)).toBe('06641234567'),
  );

  it('handles Switzerland and Germany', () => {
    expect(normalizePhone('+41 79 123 45 67')).toBe('0791234567');
    expect(normalizePhone('0049 171 1234567')).toBe('01711234567');
  });

  it('splits subscriber numbers into blocks', () => {
    expect(chunk('1234567', 'single')).toHaveLength(7);
    expect(chunk('1234567', 'triples')).toEqual(['123', '45', '67']);
    expect(chunk('123456', 'triples')).toEqual(['123', '456']);
    expect(chunk('12345678', 'pairs')).toEqual(['12', '34', '56', '78']);
    expect(chunk('1234567', 'mixed').join('')).toBe('1234567');
  });
});

describe('prices', () => {
  it.each([
    ['14,90', 1490],
    ['14.90', 1490],
    ['14,9', 1490],
    ['14,90 €', 1490],
    ['14 , 90', 1490],
    ['CHF 14.90', 1490],
    ['14,-', 1400],
    ['0,99', 99],
    ['abc', null],
  ])('%s → %s cents', (s, cents) => expect(parsePrice(s)).toBe(cents));

  it('formats euros and francs', () => {
    expect(EURO.format(1490)).toBe('14,90 €');
    expect(FRANC.format(1495)).toBe('CHF 14.95');
  });
});

describe('dates', () => {
  it.each(['23.3.', '23.3', '23/3', '23 3', '23-3', '23. März', '23 märz', '23 Maerz', '3月23日'])(
    'reads %s',
    (s) => expect(parseDate(s)).toEqual([23, 3]),
  );

  it('knows Austrian month names', () => {
    expect(monthFromWord('Jänner')).toBe(1);
    expect(monthFromWord('Feber')).toBe(2);
    expect(monthFromWord('Juni')).toBe(6);
    expect(monthFromWord('Juli')).toBe(7);
    expect(parseDate('5. Foo')).toBeNull();
  });
});
