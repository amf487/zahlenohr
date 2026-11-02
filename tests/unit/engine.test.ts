import { describe, expect, it } from 'vitest';
import { markAnswer } from '@/core/marks';
import { MAX_POINTS, MIN_POINTS, pointsFor, starsFor } from '@/core/scoring';
import { Round, ROUND_LENGTH, type NewItem } from '@/core/round';
import { DIFFICULTIES } from '@/core/difficulty';
import { buildOptions } from '@/core/options';
import { SentenceComposer } from '@/core/sentences';
import { formatPoints, formatSeconds } from '@/core/format';
import type { QuestionDraft, QuizModule } from '@/core/types';

const states = (marks: { state: string; typed?: string }[]) =>
  marks.map((m) => m.state[0] + (m.typed ?? '')).join(' ');

describe('markAnswer', () => {
  it('marks everything green when correct', () => {
    expect(states(markAnswer({ answer: '12:30', given: '12:30', correct: true, warned: false }))).toBe(
      'h h h h',
    );
  });

  it('shows swapped digits with the typed digit', () => {
    const m = markAnswer({
      answer: '0664 12 34 567',
      given: '0664 12 43 567',
      correct: false,
      warned: false,
    });
    expect(states(m)).toBe('h h h h h h m4 m3 h h h');
  });

  it('aligns answers of different length', () => {
    expect(states(markAnswer({ answer: '3412', given: '34', correct: false, warned: false }))).toBe(
      'h h m m',
    );
  });

  it('uses "near" for correct answers with a warning', () => {
    expect(states(markAnswer({ answer: '19:30', given: '730', correct: true, warned: true }))).toBe(
      'n n h h',
    );
  });

  it('marks everything red when the answer could not be read', () => {
    expect(states(markAnswer({ answer: '23.3.', given: null, correct: false, warned: false }))).toBe('m m m');
  });

  it('supports other characters than digits', () => {
    const m = markAnswer({ answer: 'Haus', given: 'Hans', correct: false, warned: false, pattern: /\p{L}/u });
    expect(states(m)).toBe('h h mn h');
  });
});

describe('scoring', () => {
  it('deducts a point every 20 ms (30 ms when typed), at least 100', () => {
    expect(pointsFor(0, false)).toBe(MAX_POINTS);
    expect(pointsFor(3000, false)).toBe(850);
    expect(pointsFor(3000, true)).toBe(900);
    expect(pointsFor(60000, false)).toBe(MIN_POINTS);
  });

  it('gives stars for the round total', () => {
    expect([0, 2999, 3000, 5500, 7999, 8000].map(starsFor)).toEqual([0, 0, 1, 2, 2, 3]);
  });

  it('formats points and seconds the German way', () => {
    expect(formatPoints(10000)).toBe('10.000');
    expect(formatSeconds(3482)).toBe('3,48 s');
  });
});

const fakeQuiz: QuizModule = {
  id: 'fake',
  label: { de: 'Test', zh: '测试' },
  icon: '',
  colors: ['#000', '#fff'],
  boardPlaceholder: '--',
  generate: () => draft,
  sentenceBank: () => ['Das ist {x}.'],
};
const draft: QuestionDraft = {
  phrase: 'zweiundvierzig',
  sentences: ['Das ist {x}.'],
  answer: '42',
  options: ['42', '24', '52', '41'],
  check: (s) => s.replace(/\D/g, '') === '42',
  toAnswerNotation: (s) => s,
  hints: [],
  parts: [],
  kind: 'test',
  placeholder: '',
  inputMode: 'numeric',
};

describe('Round', () => {
  const make = (input: 'choice' | 'typed'): NewItem => ({
    question: { ...draft, quiz: fakeQuiz, region: 'DE', text: 'Das ist zweiundvierzig.' },
    input,
    voice: { voiceURI: null, rate: 1, pitch: 1 },
  });

  it('plays ten questions and adds up the points', () => {
    const round = new Round('fake', DIFFICULTIES.medium, () => make('choice'));
    for (let i = 0; i < ROUND_LENGTH; i++) {
      expect(round.next()).not.toBeNull();
      round.startClock(1000);
      const item = round.submit(i % 2 ? '24' : '42', 1000 + 2000)!;
      expect(item.correct).toBe(i % 2 === 0);
    }
    expect(round.next()).toBeNull();
    expect(round.finished).toBe(true);
    expect(round.score).toBe(5 * 900);
    expect(round.summary()).toEqual({ correct: 5, averageMs: 2000 });
  });

  it('checks typed answers with the quiz and ignores double submits', () => {
    const round = new Round('fake', DIFFICULTIES.hard, () => make('typed'));
    round.next();
    expect(round.submit('4-2', 0)!.correct).toBe(true);
    expect(round.submit('42', 0)).toBeNull();
  });

  it('starts the clock only once', () => {
    const round = new Round('fake', DIFFICULTIES.easy, () => make('choice'));
    round.next();
    expect(round.startClock(100)).toBe(true);
    expect(round.startClock(500)).toBe(false);
    expect(round.current!.clockStart).toBe(100);
  });
});

describe('buildOptions and sentences', () => {
  it('returns four unique options including the answer', () => {
    let n = 0;
    const opts = buildOptions(
      '5',
      [
        { priority: 3, value: '6' },
        { priority: 3, value: '6' },
        { priority: 1, value: null },
      ],
      () => String(n++),
    );
    expect(opts).toHaveLength(4);
    expect(new Set(opts).size).toBe(4);
    expect(opts).toContain('5');
    expect(opts).toContain('6');
  });

  it('does not repeat recent sentences', () => {
    const composer = new SentenceComposer(2, 0);
    const d = { ...draft, sentences: ['A {x}', 'B {x}', 'C {x}'] };
    const seen = [0, 1, 2].map(() => composer.compose(d, 'DE', true));
    expect(new Set(seen).size).toBe(3);
    expect(composer.compose(d, 'DE', false)).toBe('zweiundvierzig');
  });
});
