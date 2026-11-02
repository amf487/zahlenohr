import type { Bilingual, Distractor, Part, QuestionDraft, QuizModule, RegionId } from '@/core/types';
import { buildOptions } from '@/core/options';
import { pick, random, randInt } from '@/core/random';
import { numberWords } from '@/lang/de/numbers';
import { numberNotes } from '@/lang/de/notes';
import { swapDigits, teenTensSwap } from '@/lang/de/traps';
import { PRICE } from './sentences';
import { currencyFor, parsePrice } from './currency';

function pickAmount(): [number, number] {
  const r = random();
  let euros: number;
  if (r < 0.12) euros = 0;
  else if (r < 0.5) euros = randInt(1, 9);
  else if (r < 0.9) euros = randInt(10, 99);
  else {
    do euros = randInt(100, 999);
    while (euros % 100 === 1);
  }
  let cents =
    euros === 0
      ? pick([10, 20, 30, 40, 50, 60, 70, 80, 90, 15, 45, 95, 99, 49, 19, 35, 55, 65, 75])
      : pick([0, 50, 90, 95, 99, 49, 20, 80, 40, 30, randInt(10, 99), randInt(10, 99)]);
  if (cents > 0 && cents < 10) cents += 10;
  return [euros, cents];
}

function generate(region: RegionId): QuestionDraft {
  const cur = currencyFor(region);
  const [e, picked] = pickAmount();
  let c = picked;
  if (cur.step > 1) c = Math.min(100 - cur.step, Math.round(c / cur.step) * cur.step);
  const cents = e * 100 + c;
  const eNum = e ? numberWords(e) : '';
  // accusative: "Das kostet einen Euro"
  const eW = e === 1 ? 'einen' : eNum;
  const cW = c ? numberWords(c) : '';
  let phrase: string;
  let majorSaid = true;
  if (c === 0) phrase = `${eW} ${cur.major}`;
  else if (e === 0) phrase = `${cW} ${cur.minor}`;
  else {
    const v = random();
    if (v < 0.45) phrase = `${eW} ${cur.major} ${cW}`;
    else if (v < 0.85) {
      phrase = `${e === 1 ? 'eins' : eNum} ${cW}`;
      majorSaid = false;
    } else phrase = `${eW} ${cur.major} und ${cW} ${cur.minor}`;
  }

  const P = cur.format;
  const traps: Distractor[] = [];
  if (e >= 10 && e <= 99) {
    const s = swapDigits(e);
    if (s) traps.push({ priority: 3, value: P(s * 100 + c) });
    const t = teenTensSwap(e);
    if (t) traps.push({ priority: 3, value: P(t * 100 + c) });
  }
  if (e >= 100) {
    const rr = e % 100;
    const s = swapDigits(rr);
    if (s) traps.push({ priority: 3, value: P((e - rr + s) * 100 + c) });
  }
  if (c) {
    const s = swapDigits(c);
    if (s) traps.push({ priority: 3, value: P(e * 100 + s) });
    const t = teenTensSwap(c);
    if (t) traps.push({ priority: 3, value: P(e * 100 + t) });
  }
  if (e >= 3 && e <= 9) traps.push({ priority: 2, value: P((e + 10) * 100 + c) });
  traps.push({ priority: 1, value: P(cents + 100) });
  if (cents > 100) traps.push({ priority: 1, value: P(cents - 100) });

  const answer = P(cents);
  const hints: Bilingual[] = [];
  if (!majorSaid) {
    hints.push({
      de: `Oft lässt man „${cur.major}" weg: erst die ${cur.major}, dann die ${cur.minor}.`,
      zh: `常常省略 ${cur.major}：${phrase} = ${answer}`,
    });
  } else if (e && c) {
    hints.push({
      de: `Die Zahl nach „${cur.major}" sind die ${cur.minor}.`,
      zh: `${cur.major} 后面的数字是 ${cur.minor}：${answer}`,
    });
  }
  if (region === 'CH') {
    hints.push({
      de: 'In der Schweiz zahlt man in Franken und Rappen. Preise enden immer auf 0 oder 5 Rappen.',
      zh: '瑞士用法郎（Franken）和生丁（Rappen），1 Franken = 100 Rappen。',
    });
  }
  hints.push(...numberNotes(phrase));
  const parts: Part[] = [];
  if (e) parts.push({ spoken: eW, written: `${e} ${cur.majorShort}` });
  if (c) parts.push({ spoken: cW, written: `${c} ${cur.minorShort}` });

  return {
    phrase,
    sentences: PRICE[region],
    answer,
    options: buildOptions(answer, traps, () => {
      const v = cents + pick([-1, 1]) * pick([5, 10, 50, 100, 200, 1000]);
      return v >= 10 ? P(v) : null;
    }),
    check: (s) => parsePrice(s) === cents,
    toAnswerNotation: (s) => {
      const v = parsePrice(s);
      return v == null ? null : P(v).replace(/\D/g, '');
    },
    hints,
    parts,
    kind: majorSaid ? 'Preis' : `Preis ohne „${cur.major}"`,
    placeholder: cur.placeholder,
    inputMode: 'decimal',
  };
}

export const priceQuiz: QuizModule = {
  id: 'price',
  label: { de: 'Preise', zh: '价格' },
  icon: '<path d="M17 6.5a7 7 0 1 0 0 11"/><path d="M4 10h9M4 14h9"/>',
  colors: ['#FFA947', '#E0491F'],
  boardPlaceholder: '--,-- €',
  generate,
  sentenceBank: (region) => PRICE[region],
};
