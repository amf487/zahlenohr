import type { Bilingual, Distractor, QuestionDraft, QuizModule, RegionId } from '@/core/types';
import { buildOptions } from '@/core/options';
import { chance, randInt } from '@/core/random';
import { ordinalDative } from '@/lang/de/numbers';
import { numberNotes } from '@/lang/de/notes';
import { DATE } from './sentences';
import { DAYS_IN_MONTH, MONTHS, MONTHS_ZH, isValidDate, parseDate } from './calendar';

function monthWord(month: number, region: RegionId): string {
  if (region === 'AT' && month === 1) return 'Jänner';
  if (region === 'AT' && month === 2 && chance(0.35)) return 'Feber';
  return MONTHS[month - 1]!;
}

function generate(region: RegionId): QuestionDraft {
  const mo = randInt(1, 12);
  const d = randInt(1, DAYS_IN_MONTH[mo - 1]!);
  const byName = chance(0.6);
  let mW: string;
  if (byName) mW = monthWord(mo, region);
  else {
    // "am dritten Zehnten" = 3.10.
    const o = ordinalDative(mo);
    mW = o[0]!.toUpperCase() + o.slice(1);
  }
  const dW = ordinalDative(d);
  const phrase = `${dW} ${mW}`;
  const D = (day: number, month: number) => (isValidDate(day, month) ? `${day}.${month}.` : null);

  const traps: Distractor[] = [];
  if (d >= 13 && d <= 19) traps.push({ priority: 3, value: D((d - 10) * 10, mo) });
  if (d === 30) traps.push({ priority: 3, value: D(13, mo) });
  if (d === 20) traps.push({ priority: 2, value: D(12, mo) });
  if (d === 12) traps.push({ priority: 2, value: D(20, mo) });
  if (d > 20 && d % 10) traps.push({ priority: 3, value: D((d % 10) * 10 + Math.floor(d / 10), mo) });
  if (!byName && d !== mo) traps.push({ priority: 3, value: D(mo, d) });
  if (byName && mo === 6) traps.push({ priority: 3, value: D(d, 7) });
  if (byName && mo === 7) traps.push({ priority: 3, value: D(d, 6) });
  traps.push(
    { priority: 1, value: D(d, (mo % 12) + 1) },
    { priority: 1, value: D(d + 1, mo) },
    { priority: 1, value: D(d - 1, mo) },
  );

  const answer = D(d, mo)!;
  const hints: Bilingual[] = [
    { de: `Datum mit Ordinalzahl: „am ${dW}" = der ${d}.`, zh: `日期用序数词：am ${dW} = ${d} 号` },
  ];
  if (!byName)
    hints.push({
      de: `Der Monat als Zahl: „${mW}" = ${mo}. Monat.`,
      zh: `月份也可以用序数词说：${mW} = ${mo} 月`,
    });
  if (mW === 'Jänner')
    hints.push({
      de: 'Jänner ist das österreichische Wort für Januar.',
      zh: 'Jänner = Januar（奥地利说法）',
    });
  if (mW === 'Feber')
    hints.push({
      de: 'Feber sagt man in Österreich umgangssprachlich für Februar.',
      zh: 'Feber = Februar（奥地利口语）',
    });
  if (byName && (mo === 6 || mo === 7)) {
    hints.push({
      de: 'Juni (6) und Juli (7) klingen fast gleich. Manche sagen deshalb „Juno" und „Julei".',
      zh: 'Juni（6月）和 Juli（7月）发音很像，要仔细听。',
    });
  }
  hints.push(...numberNotes(dW));

  return {
    phrase,
    phraseAlone: 'am ' + phrase,
    sentences: DATE[region],
    answer,
    options: buildOptions(answer, traps, () =>
      D(chance(0.5) ? randInt(1, 28) : d, chance(0.5) ? randInt(1, 12) : mo),
    ),
    check: (s) => {
      const p = parseDate(s);
      return !!p && p[0] === d && p[1] === mo;
    },
    toAnswerNotation: (s) => {
      const p = parseDate(s);
      return p ? `${p[0]}${p[1]}` : null;
    },
    hints,
    parts: [
      { spoken: dW, written: d + '.' },
      { spoken: mW, written: mo + '.' + (byName ? ' (' + MONTHS_ZH[mo - 1] + ')' : '') },
    ],
    kind: byName ? 'Datum mit Monatsnamen' : 'Datum mit Monatszahl',
    placeholder: 'z. B. 23.3. oder 23. März',
    inputMode: 'text',
  };
}

export const dateQuiz: QuizModule = {
  id: 'date',
  label: { de: 'Datum', zh: '日期' },
  icon: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  colors: ['#FF6A9A', '#C0215A'],
  boardPlaceholder: '--.--.',
  generate,
  sentenceBank: (region) => DATE[region],
};
