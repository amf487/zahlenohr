import type { Question } from '@/core/types';
import { esc } from './dom';

/** The spoken sentence with the key phrase highlighted. */
export function transcriptHtml(q: Question): string {
  const i = q.text.indexOf(q.phrase);
  const inner =
    i >= 0
      ? esc(q.text.slice(0, i)) +
        '<mark>' +
        esc(q.phrase) +
        '</mark>' +
        esc(q.text.slice(i + q.phrase.length))
      : esc(q.text);
  return '„' + inner + '"';
}

/** "dreiundvierzig → 43" chips. */
export const partsHtml = (q: Question): string =>
  q.parts
    .map(
      (p) =>
        `<span class="part"><span class="part__spoken">${esc(p.spoken)}</span><span class="part__written">${esc(p.written)}</span></span>`,
    )
    .join('');

export const hintsHtml = (q: Question): string =>
  q.hints.map((h) => `<li><span>${esc(h.de)}</span><span class="zh">${esc(h.zh)}</span></li>`).join('');

/** Small square with the mode's gradient and icon. */
export const modeStyle = (colors: readonly [string, string]): string => `--a:${colors[0]};--b:${colors[1]}`;
