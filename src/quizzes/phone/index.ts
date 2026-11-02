import type { Bilingual, Distractor, Part, QuizModule, RegionId, QuestionDraft } from '@/core/types';
import { buildOptions } from '@/core/options';
import { chance, pick, randInt } from '@/core/random';
import { REGIONS } from '@/core/regions';
import { ONES, numberWords } from '@/lang/de/numbers';
import { numberNotes } from '@/lang/de/notes';
import { CITY, PHONE } from './sentences';
import { NUMBERING, chunk, normalizePhone, type ChunkStyle } from './numbering';

/** Digits that are easily misheard for each other (zwei/drei, sechs/sieben …). */
const CONFUSABLE: Record<string, string> = {
  '0': '8', '1': '7', '2': '3', '3': '2', '4': '8', '5': '9', '6': '7', '7': '6', '8': '4', '9': '5',
}; // prettier-ignore

/** Wrong versions of one block: swapped digits (43/34) or -zehn/-zig (16/60). */
function blockTraps(block: string): { priority: number; value: string }[] {
  const out: { priority: number; value: string }[] = [];
  if (block.length >= 2 && block[0] !== '0') {
    const r = block.slice(-2);
    const head = block.slice(0, -2);
    const tens = +r[0]!;
    const ones = +r[1]!;
    const rv = +r;
    if (tens >= 2 && ones > 0 && tens !== ones) out.push({ priority: 3, value: head + r[1] + r[0] });
    if (rv >= 13 && rv <= 19) out.push({ priority: 2, value: head + String(rv - 10) + '0' });
    if (rv >= 30 && rv % 10 === 0) out.push({ priority: 2, value: head + '1' + String(rv / 10) });
  }
  return out;
}

function generate(region: RegionId): QuestionDraft {
  const numbering = NUMBERING[region];
  const mobile = chance(0.6);
  let prefix: string;
  let length: number;
  let city: string | null = null;
  if (mobile) {
    prefix = pick(numbering.mobile);
    length = pick(numbering.mobileLengths);
  } else {
    const l = pick(numbering.landlines);
    [prefix, length, city] = [l.prefix, l.length, l.city];
  }
  let subscriber = String(randInt(2, 9));
  while (subscriber.length < length) subscriber += randInt(0, 9);
  const international = chance(0.2);
  const extension = !mobile && chance(0.3) ? String(randInt(10, 999)) : '';

  // Germans often say "zwo" instead of "zwei" on the phone.
  const zwo = region === 'DE' && chance(0.35);
  const digit = (d: string) => (d === '2' && zwo ? 'zwo' : ONES[+d]!);
  const digits = (s: string) => s.split('').map(digit).join(' ');
  const speakBlock = (b: string): string =>
    b.length === 1 ? digit(b) : b[0] === '0' ? digit('0') + ' ' + speakBlock(b.slice(1)) : numberWords(+b);

  const cc = REGIONS[region].countryCode;
  const parts: Part[] = [];
  let head = '';
  const prefixShown = international ? prefix.slice(1) : prefix;
  if (international) {
    const ccWords = pick([`plus ${digits(cc)}`, `plus ${numberWords(+cc)}`, `null null ${digits(cc)}`]);
    parts.push({ spoken: ccWords, written: '+' + cc });
    head = ccWords + ', ';
  }
  const prefixWords = digits(prefixShown);
  parts.push({ spoken: prefixWords, written: prefixShown });
  head += prefixWords;

  const style = pick<ChunkStyle>(['single', 'pairs', 'pairs', 'triples', 'mixed', 'mixed', 'mixed']);
  const blocks = chunk(subscriber, style);
  const blockWords = blocks.map(speakBlock);
  blocks.forEach((b, i) => parts.push({ spoken: blockWords[i]!, written: b }));
  let phrase = head + ', ' + blockWords.join(chance(0.5) ? ', ' : ' ');
  if (extension) {
    const extWords = chance(0.6) ? numberWords(+extension) : digits(extension);
    parts.push({ spoken: 'Durchwahl ' + extWords, written: '-' + extension });
    phrase += ', Durchwahl ' + extWords;
  }

  const display = (bs: readonly string[], ext: string) =>
    (international ? `+${cc} ${prefixShown}` : prefix) + ' ' + bs.join(' ') + (ext ? '-' + ext : '');
  const answer = display(blocks, extension);

  const traps: Distractor[] = [];
  blocks.forEach((b, i) =>
    blockTraps(b).forEach((t) => {
      const bs = blocks.slice();
      bs[i] = t.value;
      traps.push({ priority: t.priority, value: display(bs, extension) });
    }),
  );
  if (extension)
    blockTraps(extension).forEach((t) =>
      traps.push({ priority: t.priority, value: display(blocks, t.value) }),
    );
  const mutate = () => {
    const bs = blocks.slice();
    const i = randInt(0, bs.length - 1);
    const b = bs[i]!;
    const j = randInt(0, b.length - 1);
    const replacement = chance(0.6) ? CONFUSABLE[b[j]!]! : String(randInt(0, 9));
    bs[i] = b.slice(0, j) + replacement + b.slice(j + 1);
    return display(bs, extension);
  };
  for (let k = 0; k < 3; k++) traps.push({ priority: 1, value: mutate() });

  const hints: Bilingual[] = [];
  if (style !== 'single') {
    hints.push({
      de: 'Telefonnummern werden oft in Zweier- oder Dreierblöcken gesprochen. Jeder Block ist eine eigene Zahl.',
      zh: '电话号码常常两位或三位一组读，每组当作一个数字。',
    });
  }
  hints.push(...numberNotes(phrase));
  if (extension)
    hints.push({ de: 'Die Durchwahl ist die Nummer der Person in der Firma.', zh: 'Durchwahl = 分机号' });
  if (international) {
    hints.push({
      de: `+${cc} ist die Vorwahl für ${REGIONS[region].name}. Danach fällt die erste Null weg.`,
      zh: `+${cc} 是${REGIONS[region].zh}的国家代码，后面的区号去掉开头的 0。`,
    });
  }

  const answerDigits = answer.replace(/\D/g, '');
  return {
    phrase,
    sentences: city ? [...PHONE[region], ...CITY.map((t) => t.replace('{city}', city))] : PHONE[region],
    answer,
    options: buildOptions(answer, traps, mutate),
    check: (s) => normalizePhone(s) === normalizePhone(answer),
    toAnswerNotation: (s) => {
      const n = normalizePhone(s);
      return answer.startsWith('+') ? answerDigits.slice(0, 2) + n.replace(/^0/, '') : n;
    },
    hints,
    parts,
    kind:
      (mobile ? 'Handynummer' : 'Festnetz' + (city ? ' ' + city : '')) +
      (international ? ' international' : ''),
    placeholder: numbering.placeholder,
    inputMode: 'tel',
  };
}

export const phoneQuiz: QuizModule = {
  id: 'phone',
  label: { de: 'Telefon', zh: '电话号码' },
  icon: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18h2"/>',
  colors: ['#22E0B4', '#0B8C78'],
  boardPlaceholder: '---- --- ----',
  generate,
  sentenceBank: (region) => [...PHONE[region], ...CITY],
};
