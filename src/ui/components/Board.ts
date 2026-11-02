import type { Mark } from '@/core/marks';
import { formatPoints } from '@/core/format';
import { el, esc, q } from '../dom';

/**
 * The split-flap board: shows a placeholder while listening, then flips to the answer
 * and colours every compared character (green = heard right, red = wrong, gold = near).
 */
export class Board {
  readonly root = el(`
    <div class="board">
      <div class="board__head"><span data-ref="title"></span><span data-ref="info"></span></div>
      <div class="board__tiles" data-ref="tiles"></div>
      <span class="score-pop" data-ref="pop" aria-hidden="true"></span>
    </div>`);
  private readonly title = q(this.root, '[data-ref="title"]');
  private readonly info = q(this.root, '[data-ref="info"]');
  private readonly tiles = q(this.root, '[data-ref="tiles"]');
  private readonly pop = q(this.root, '[data-ref="pop"]');

  setTitle(html: string, info: string): void {
    this.title.innerHTML = html;
    this.info.textContent = info;
  }

  showPlaceholder(text: string): void {
    this.render(text, false);
  }

  /** Reveals the answer. `marks` holds one entry per character that matches `pattern`. */
  reveal(answer: string, marks: readonly Mark[], pattern: RegExp): void {
    this.render(answer, true, marks, pattern);
    this.info.innerHTML =
      '<span class="board__legend"><span><i class="is-ok"></i>richtig</span><span><i class="is-bad"></i>falsch</span></span>';
  }

  popScore(points: number, correct: boolean): void {
    this.pop.textContent = correct ? '+' + formatPoints(points) : '0';
    this.pop.className = 'score-pop ' + (correct ? 'is-ok' : 'is-bad');
    void this.pop.offsetWidth; // restart the animation
    this.pop.classList.add('is-shown');
  }

  private render(text: string, reveal: boolean, marks?: readonly Mark[], pattern = /\d/): void {
    const chars = [...text];
    this.tiles.style.setProperty('--n', String(Math.max(chars.length, 5)));
    let i = 0;
    let m = 0;
    this.tiles.innerHTML = chars
      .map((ch) => {
        if (ch === ' ') return '<span class="tile tile--gap"></span>';
        const compared = pattern.test(ch);
        const mark = compared && marks ? marks[m++] : undefined;
        const cls = [
          'tile',
          compared ? '' : 'tile--sym',
          reveal ? 'tile--flip' : '',
          !reveal && ch === '-' ? 'tile--dim' : '',
          mark ? `tile--${mark.state}` : '',
        ]
          .filter(Boolean)
          .join(' ');
        const typed = mark?.typed != null ? ` data-typed="${esc(mark.typed)}"` : '';
        const shown = reveal || !compared ? (ch === '-' && !reveal ? '·' : ch) : '·';
        return `<span class="${cls}"${typed} style="--i:${i++}">${esc(shown)}</span>`;
      })
      .join('');
  }
}
