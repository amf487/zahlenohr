import type { Bilingual, Distractor, QuestionDraft, QuizModule, RegionId } from '@/core/types';
import { buildOptions } from '@/core/options';
import { chance, pick, random, randInt } from '@/core/random';
import { formatNumber, numberWords, yearWords } from '@/lang/de/numbers';
import { numberNotes } from '@/lang/de/notes';
import { BIG, NOUN, PLAIN, YEAR, inRegion } from './sentences';

type Kind = 'twoDigit' | 'teenTens' | 'medium' | 'large' | 'year';

const KIND_LABEL: Record<Kind, string> = {
  twoDigit: 'zweistellig',
  teenTens: '-zehn oder -zig',
  medium: 'bis 9999',
  large: 'große Zahl',
  year: 'Jahreszahl',
};

function pickNumber(): [number, Kind] {
  const r = random();
  if (r < 0.3) {
    let n: number;
    do n = randInt(21, 99);
    while (n % 10 === 0);
    return [n, 'twoDigit'];
  }
  if (r < 0.4) return [chance(0.5) ? randInt(13, 19) : randInt(3, 9) * 10, 'teenTens'];
  if (r < 0.65) return [randInt(100, 9999), 'medium'];
  if (r < 0.85) return [randInt(10, 999) * 1000 + (chance(0.6) ? randInt(0, 999) : 0), 'large'];
  return [randInt(1950, 2025), 'year'];
}

function generate(region: RegionId): QuestionDraft {
  const [n, kind] = pickNumber();
  const words = kind === 'year' ? yearWords(n) : numberWords(n);
  const show = (v: number) => (kind === 'year' ? String(v) : formatNumber(v));
  const small = kind === 'twoDigit' || kind === 'teenTens';
  const plausible = (v: number) =>
    v > 0 && v !== n && (!small || (v >= 10 && v <= 99)) && (kind !== 'year' || (v >= 1000 && v <= 2099));

  const traps: { priority: number; value: number }[] = [];
  const groups: [number, number][] = [[n % 1000, 1]];
  if (n >= 1000) groups.push([Math.floor(n / 1000) % 1000, 1000]);
  for (const [g, scale] of groups) {
    const rr = g % 100;
    const tens = Math.floor(rr / 10);
    const ones = rr % 10;
    if (tens >= 2 && ones && tens !== ones)
      traps.push({ priority: 3, value: n + (ones * 10 + tens - rr) * scale });
    if (rr >= 13 && rr <= 19) traps.push({ priority: 3, value: n + ((rr - 10) * 10 - rr) * scale });
    if (rr >= 30 && ones === 0) traps.push({ priority: 3, value: n + (tens + 10 - rr) * scale });
    if (rr === 12) traps.push({ priority: 1, value: n + 8 * scale });
  }
  if (n >= 10000) {
    traps.push(
      { priority: 1, value: Math.round(n / 10) },
      { priority: 1, value: n * 10 > 999999 ? n - 100000 : n * 10 },
    );
  }
  if (n >= 100) traps.push({ priority: 1, value: n + pick([-100, 100]) });
  const distractors: Distractor[] = traps
    .filter((t) => plausible(t.value))
    .map((t) => ({ priority: t.priority, value: show(t.value) }));
  const filler = () => {
    const step = small ? pick([1, 2, 10, 11]) : pick([1, 10, 100, 1000].filter((s) => s * 3 < n || s === 1));
    const v = n + pick([-1, 1]) * step * randInt(1, 3);
    return plausible(v) ? show(v) : null;
  };

  const answer = show(n);
  const hints: Bilingual[] = numberNotes(words);
  if (kind === 'year' && n < 2000) {
    hints.push({
      de: 'Jahre vor 2000 sagt man in Hunderten: neunzehnhundert… = 19…',
      zh: '2000 年以前的年份按“几百”读：neunzehnhundert… = 19…',
    });
  }
  if (kind === 'large') {
    hints.push({
      de: 'Große Zahlen: alles vor „tausend" ist die Tausender-Zahl.',
      zh: '大数字：tausend 前面的部分是“几千”。',
    });
  }
  // Sentences with a noun after the number would need "ein" instead of "eins" (hunderteins Kilometer), so skip them.
  const endsInOne = n % 100 === 1;
  let sentences: readonly string[];
  if (kind === 'year') sentences = YEAR;
  else if (kind === 'large') sentences = endsInOne ? PLAIN : BIG;
  else sentences = endsInOne ? PLAIN : [...PLAIN, ...NOUN];

  return {
    phrase: words,
    sentences: inRegion(sentences, region),
    answer,
    options: buildOptions(answer, distractors, filler),
    check: (s) => String(s).replace(/\D/g, '') === String(n),
    toAnswerNotation: (s) => s.replace(/\D/g, ''),
    hints,
    parts: [{ spoken: words, written: answer }],
    kind: KIND_LABEL[kind],
    placeholder: 'z. B. 3412',
    inputMode: 'numeric',
  };
}

export const numberQuiz: QuizModule = {
  id: 'number',
  label: { de: 'Zahlen', zh: '数字' },
  icon: '<path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"/>',
  colors: ['#C17BFF', '#6A2FD0'],
  boardPlaceholder: '-----',
  generate,
  sentenceBank: (region) => inRegion([...PLAIN, ...NOUN, ...BIG, ...YEAR], region),
};
