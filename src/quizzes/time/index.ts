import type { Bilingual, Distractor, QuestionDraft, QuizModule, RegionId } from '@/core/types';
import { buildOptions } from '@/core/options';
import { chance, pick, randInt } from '@/core/random';
import { numberWords } from '@/lang/de/numbers';
import { numberNotes } from '@/lang/de/notes';
import { COLLOQUIAL, OFFICIAL } from './sentences';
import { checkTime, format12, format24, timeNotation } from './parse';

type Kind =
  | 'full' | 'nach' | 'vor' | 'viertelX' | 'viertelNach' | 'viertelVor'
  | 'dreiviertel' | 'halb' | 'vorHalb' | 'nachHalb'; // prettier-ignore

/** How likely "viertel acht" / "dreiviertel acht" is used instead of "Viertel nach / vor". */
const VIERTEL_STYLE: Record<RegionId, number> = { AT: 0.75, DE: 0.15, CH: 0 };

/** "in der Früh", "am Abend" … with the Chinese meaning. */
function dayPart(h: number, region: RegionId): [string, string] {
  if (region === 'CH') {
    if (h < 10) return ['am Morgen', '早上'];
    if (h < 12) return ['am Vormittag', '上午'];
    if (h < 14) return ['am Mittag', '中午'];
    if (h < 18) return ['am Nachmittag', '下午'];
    if (h < 23) return ['am Abend', '晚上'];
    return ['in der Nacht', '夜里'];
  }
  const at = region === 'AT';
  if (h < 10) return [at ? 'in der Früh' : pick(['morgens', 'am Morgen']), '早上'];
  if (h < 12) return [at ? 'am Vormittag' : pick(['vormittags', 'am Vormittag']), '上午'];
  if (h < 14) return [at ? 'zu Mittag' : 'mittags', '中午'];
  if (h < 18) return [at ? 'am Nachmittag' : pick(['nachmittags', 'am Nachmittag']), '下午'];
  if (h < 23) return [at ? 'am Abend' : pick(['abends', 'am Abend']), '晚上'];
  return [at ? 'in der Nacht' : 'nachts', '夜里'];
}

/** "siebzehn Uhr dreißig" → 17:30 */
function officialTime(region: RegionId): QuestionDraft {
  const h = randInt(0, 23);
  const m = chance(0.5) ? randInt(0, 11) * 5 : randInt(0, 59);
  const t = h * 60 + m;
  const H = h === 1 ? 'ein' : numberWords(h);
  const phrase = m ? `${H} Uhr ${numberWords(m)}` : `${H} Uhr`;
  const traps: Distractor[] = [];
  const mt = Math.floor(m / 10);
  const mo = m % 10;
  if (mt >= 2 && mo && mo !== mt && mo <= 5)
    traps.push({ priority: 3, value: format24(h * 60 + mo * 10 + mt) });
  if (m >= 13 && m <= 15) traps.push({ priority: 3, value: format24(h * 60 + (m - 10) * 10) });
  if (m >= 30 && m % 10 === 0) traps.push({ priority: 3, value: format24(h * 60 + mt + 10) });
  if (h >= 13 && h <= 19) traps.push({ priority: 2, value: format24(t - 600) });
  if (h >= 3 && h <= 9) traps.push({ priority: 2, value: format24(t + 600) });
  if (h === 21) traps.push({ priority: 2, value: format24(12 * 60 + m) });
  if (h === 12) traps.push({ priority: 2, value: format24(21 * 60 + m) });
  traps.push({ priority: 1, value: format24(t + 60) }, { priority: 1, value: format24(t - 60) });
  const answer = format24(t);
  const why: Bilingual = {
    de: 'Offizielle Uhrzeiten werden im 24-Stunden-Format gesagt.',
    zh: '正式时间用24小时制。',
  };
  return {
    phrase,
    sentences: OFFICIAL[region],
    answer,
    options: buildOptions(answer, traps, () =>
      format24(t + pick([-1, 1]) * pick([1, 2, 5, 10, 12, 20, 60, 120])),
    ),
    check: (s) => checkTime(s, h, m, true, why),
    toAnswerNotation: (s) => timeNotation(s, true),
    hints: [
      {
        de: 'Offizielle Uhrzeit (24 h): erst die Stunde, dann „Uhr", dann die Minuten.',
        zh: `正式说法（24小时制）：小时 + Uhr + 分钟 → ${answer}`,
      },
      ...numberNotes(phrase),
    ],
    parts: [],
    kind: 'offiziell (24 h)',
    placeholder: 'z. B. 17:30',
    inputMode: 'decimal',
  };
}

/** "viertel acht am Abend" → 19:15 (or 7:15 when no time of day is said) */
function colloquialTime(region: RegionId): QuestionDraft {
  const h24 = randInt(6, 22);
  const mm = randInt(0, 11) * 5;
  const t = h24 * 60 + mm;
  const h12 = h24 % 12 || 12;
  const nx = (h12 % 12) + 1;
  const W = (n: number) => (n === 1 ? 'eins' : numberWords(n));
  const viertelX = VIERTEL_STYLE[region];
  let p: string;
  let kind: Kind;
  switch (mm) {
    case 0:
      p = chance(0.5) ? `${h12 === 1 ? 'ein' : numberWords(h12)} Uhr` : W(h12);
      kind = 'full';
      break;
    case 5:
    case 10:
      p = `${numberWords(mm)} nach ${W(h12)}`;
      kind = 'nach';
      break;
    case 15:
      if (chance(viertelX)) [p, kind] = [`viertel ${W(nx)}`, 'viertelX'];
      else [p, kind] = [`Viertel nach ${W(h12)}`, 'viertelNach'];
      break;
    case 20:
      if (chance(0.5)) [p, kind] = [`zwanzig nach ${W(h12)}`, 'nach'];
      else [p, kind] = [`zehn vor halb ${W(nx)}`, 'vorHalb'];
      break;
    case 25:
      [p, kind] = [`fünf vor halb ${W(nx)}`, 'vorHalb'];
      break;
    case 30:
      [p, kind] = [`halb ${W(nx)}`, 'halb'];
      break;
    case 35:
      [p, kind] = [`fünf nach halb ${W(nx)}`, 'nachHalb'];
      break;
    case 40:
      if (chance(0.5)) [p, kind] = [`zwanzig vor ${W(nx)}`, 'vor'];
      else [p, kind] = [`zehn nach halb ${W(nx)}`, 'nachHalb'];
      break;
    case 45:
      if (chance(viertelX)) [p, kind] = [`dreiviertel ${W(nx)}`, 'dreiviertel'];
      else [p, kind] = [`Viertel vor ${W(nx)}`, 'viertelVor'];
      break;
    default:
      [p, kind] = [`${numberWords(60 - mm)} vor ${W(nx)}`, 'vor'];
  }
  const dp = chance(0.5) ? dayPart(h24, region) : null;
  const phrase = dp ? `${p} ${dp[0]}` : p;
  const exact = !!dp;
  const F = exact ? format24 : format12;
  // Typical mistakes per phrase type, as minute offsets (most typical first).
  const offsets: Record<Kind, number[]> = {
    full: [60, -60, 30],
    nach: [-2 * mm, 60, 30],
    vor: [2 * (60 - mm), -60, -30],
    viertelX: [60, 30, -30],
    viertelNach: [30, -30, 60],
    viertelVor: [-30, 30, -60],
    dreiviertel: [60, -30, 30],
    halb: [60, -60, -30],
    vorHalb: [60, 2 * (30 - mm), 30],
    nachHalb: [60, -2 * (mm - 30), -30],
  };
  const traps: Distractor[] = offsets[kind].map((o, i) => ({ priority: 3 - i, value: F(t + o) }));
  if (exact) traps.push({ priority: 1, value: format24(h24 < 12 ? t + 720 : t - 720) });
  const answer = F(t);
  const A = format12(t);
  const explanation: Record<Kind, [string, string]> = {
    full: [`„${W(h12)}" = ${A}, also genau zur vollen Stunde.`, `${h12} 点整`],
    nach: [`„${numberWords(mm)} nach ${W(h12)}" = ${A}`, `${h12} 点过 ${mm} 分 = ${A}`],
    vor: [`„${numberWords(60 - mm)} vor ${W(nx)}" = ${A}`, `差 ${60 - mm} 分 ${nx} 点 = ${A}`],
    viertelX: [
      `„viertel ${W(nx)}" = ${A}. Die erste Viertelstunde auf dem Weg zu ${nx} Uhr ist vorbei. Typisch für Österreich und Ostdeutschland.`,
      `奥地利 / 德国东部说法：往 ${nx} 点走了一刻钟 = ${A}`,
    ],
    dreiviertel: [
      `„dreiviertel ${W(nx)}" = ${A}. Drei Viertelstunden auf dem Weg zu ${nx} Uhr sind vorbei.`,
      `往 ${nx} 点走了三刻钟 = ${A}`,
    ],
    viertelNach: [`„Viertel nach ${W(h12)}" = ${A}`, `${h12} 点过一刻 = ${A}`],
    viertelVor: [`„Viertel vor ${W(nx)}" = ${A}`, `差一刻 ${nx} 点 = ${A}`],
    halb: [
      `„halb ${W(nx)}" = ${A}. „halb" zeigt immer auf die nächste Stunde.`,
      `halb ${nx} = 差半小时到 ${nx} 点 = ${A}（不是 ${nx}:30！）`,
    ],
    vorHalb: [
      `„… vor halb ${W(nx)}" = ${30 - mm} Minuten vor ${h12}:30, also ${A}.`,
      `${h12}:30 前 ${30 - mm} 分钟 = ${A}`,
    ],
    nachHalb: [
      `„… nach halb ${W(nx)}" = ${mm - 30} Minuten nach ${h12}:30, also ${A}.`,
      `${h12}:30 后 ${mm - 30} 分钟 = ${A}`,
    ],
  };
  const [de, zh] = explanation[kind];
  const hints: Bilingual[] = [{ de, zh }];
  if (dp) {
    hints.push({
      de: `„${dp[0]}" sagt dir die Tageszeit, also ${format24(t)}.`,
      zh: `${dp[0]} = ${dp[1]}，所以是 ${format24(t)}`,
    });
  } else {
    const am = format24(t % 720);
    const pm = format24((t % 720) + 720);
    hints.push({
      de: `Keine Tageszeit genannt: ${am} und ${pm} zählen beide.`,
      zh: `没说早上还是晚上，所以 ${am} 和 ${pm} 都算对。`,
    });
  }
  const why: Bilingual = dp
    ? { de: `„${dp[0]}" heißt ${dp[1]}.`, zh: `${dp[0]} = ${dp[1]}。` }
    : { de: '', zh: '' };
  return {
    phrase,
    sentences: COLLOQUIAL[region],
    answer,
    options: buildOptions(answer, traps, () => F(t + pick([-1, 1]) * pick([5, 10, 15, 30, 60, 90]))),
    check: (s) => checkTime(s, h24, mm, exact, why),
    toAnswerNotation: (s) => timeNotation(s, exact),
    hints,
    parts: [],
    kind: 'umgangssprachlich' + (dp ? ' mit Tageszeit' : ''),
    placeholder: exact ? 'z. B. 19:30' : 'z. B. 7:15',
    inputMode: 'decimal',
  };
}

export const timeQuiz: QuizModule = {
  id: 'time',
  label: { de: 'Uhrzeit', zh: '时间' },
  icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  colors: ['#5C86FF', '#2B3FD0'],
  boardPlaceholder: '--:--',
  generate: (region) => (chance(0.35) ? officialTime(region) : colloquialTime(region)),
  sentenceBank: (region) => [...COLLOQUIAL[region], ...OFFICIAL[region]],
};
