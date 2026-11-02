import { describe, expect, it } from 'vitest';
import type { CheckResult, QuestionDraft, RegionId } from '@/core/types';
import { REGION_IDS } from '@/core/regions';
import { DIGITS, markAnswer } from '@/core/marks';
import { MODES, QUIZZES } from '@/quizzes';
import { MONTHS } from '@/quizzes/date/calendar';

/** Generates many questions per quiz and region and checks the general rules every quiz must follow. */
const RUNS = 600;
const ok = (r: CheckResult) => r === true || (typeof r === 'object' && r.ok);

function sample(quizId: string, region: RegionId, runs = RUNS): QuestionDraft[] {
  const quiz = QUIZZES.find((q) => q.id === quizId)!;
  return Array.from({ length: runs }, () => quiz.generate(region));
}

describe.each(QUIZZES.map((q) => q.id))('quiz "%s"', (quizId) => {
  it.each(REGION_IDS)('follows the quiz contract in %s', (region) => {
    const quiz = QUIZZES.find((q) => q.id === quizId)!;
    for (const q of sample(quizId, region)) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain(q.answer);
      expect(`${q.phrase}${q.answer}${q.options.join()}`).not.toMatch(/undefined|NaN/);
      expect(ok(q.check(q.answer))).toBe(true);
      expect(q.sentences.length).toBeGreaterThan(0);
      for (const s of q.sentences) expect(s).toContain('{x}');
      // typing the answer itself must light up every tile green
      const given = q.toAnswerNotation(q.answer);
      const marks = markAnswer({
        answer: q.answer,
        given,
        correct: false,
        warned: false,
        pattern: quiz.markPattern ?? DIGITS,
      });
      expect(marks.every((m) => m.state === 'hit')).toBe(true);
    }
    expect(quiz.sentenceBank(region).length).toBeGreaterThan(0);
  });
});

describe('forgiving typed answers', () => {
  it.each(REGION_IDS)('numbers ignore spaces and dashes (%s)', (region) => {
    for (const q of sample('number', region, 300)) {
      const digits = q.answer.replace(/\D/g, '');
      expect(ok(q.check(digits.split('').join(' ')))).toBe(true);
      expect(ok(q.check(digits.slice(0, 2) + '-' + digits.slice(2)))).toBe(true);
    }
  });

  it.each(REGION_IDS)('phone numbers treat + and 00 the same (%s)', (region) => {
    for (const q of sample('phone', region, 300)) {
      const a = q.answer;
      expect(ok(q.check(a.replace('+', '00')))).toBe(true);
      expect(ok(q.check(a.replace(/\s/g, '-')))).toBe(true);
      const wrongLast = a.replace(/\d(?=\D*$)/, (d) => String((+d + 1) % 10));
      expect(ok(q.check(wrongLast))).toBe(false);
    }
  });

  it.each(REGION_IDS)('dates accept month names and Chinese notation (%s)', (region) => {
    for (const q of sample('date', region, 300)) {
      const [d, m] = q.answer.split('.').map(Number) as [number, number];
      for (const v of [
        `${d}.${m}.`,
        `${d}. ${MONTHS[m - 1]}`,
        `${d} ${MONTHS[m - 1]!.toLowerCase()}`,
        `${m}月${d}日`,
        `${d}/${m}`,
      ]) {
        expect(ok(q.check(v))).toBe(true);
      }
      expect(ok(q.check(`${d}. ${MONTHS[m % 12]}`))).toBe(false);
    }
  });

  it.each(REGION_IDS)('12-hour times count for 24-hour answers with a warning (%s)', (region) => {
    let warned = 0;
    for (const q of sample('time', region)) {
      const [h, mm] = q.answer.split(':').map(Number) as [number, number];
      expect(ok(q.check(q.answer.replace(':', ' ')))).toBe(true);
      if (h > 12) {
        const r = q.check(`${h - 12}:${String(mm).padStart(2, '0')}`);
        expect(ok(r)).toBe(true);
        if (typeof r === 'object') warned++;
      }
    }
    expect(warned).toBeGreaterThan(0);
  });
});

describe('regional details', () => {
  it('Swiss prices are in francs and end in 0 or 5 Rappen', () => {
    for (const q of sample('price', 'CH')) {
      expect(q.answer).toMatch(/^CHF \d+\.\d[05]$/);
      expect(q.phrase).not.toMatch(/Euro|Cent/);
    }
  });

  it('only Germany says "zwo", only Austria says "Jänner"', () => {
    for (const region of ['AT', 'CH'] as const) {
      for (const q of sample('phone', region)) expect(q.phrase).not.toMatch(/\bzwo\b/);
    }
    expect(sample('phone', 'DE').some((q) => /\bzwo\b/.test(q.phrase))).toBe(true);
    for (const q of sample('date', 'DE')) expect(q.phrase).not.toContain('Jänner');
  });

  it('Switzerland has no "viertel acht"', () => {
    for (const q of sample('time', 'CH')) expect(q.phrase).not.toMatch(/(^|\s)(drei)?viertel [a-z]/);
  });
});

describe('modes', () => {
  it('has one mode per quiz plus mix', () => {
    expect(MODES.map((m) => m.id)).toEqual([...QUIZZES.map((q) => q.id), 'mix']);
    expect(MODES.at(-1)!.quizzes).toHaveLength(QUIZZES.length);
  });
});
