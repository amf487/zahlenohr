import type { AppContext, Screen } from '@/app/context';
import type { Round } from '@/core/round';
import type { AddResult } from '@/services/highscores';
import { formatSeconds, formatPoints } from '@/core/format';
import { GRADES, MAX_POINTS, starsFor } from '@/core/scoring';
import { bi, el, esc, q } from '../dom';
import { ICONS, STAR, svg } from '../icons';
import { hintsHtml, modeStyle, partsHtml, transcriptHtml } from '../explain';
import { confetti, countUp } from '../fx';

/** Total, stars, record badge and the list of all ten answers. */
export class ResultScreen implements Screen {
  readonly root = el(`
    <section class="screen screen--split screen--result" hidden>
      <div class="card result">
        <span class="result__badge" data-ref="badge"></span>
        <span class="label" data-ref="label"></span>
        <div class="stars" data-ref="stars" aria-hidden="true"></div>
        <p class="result__grade" data-ref="grade"></p>
        <div class="result__total"><span data-ref="total">0</span><small>von 10.000 Punkten</small></div>
        <p class="result__record" data-ref="record" hidden></p>
        <p class="result__summary" data-ref="summary"></p>
        <div class="button-row">
          <button class="btn btn--start" type="button" data-ref="again">Nochmal <span class="zh">再玩一次</span></button>
          <button class="btn btn--ghost" type="button" data-ref="toStart">Zum Start</button>
        </div>
      </div>
      <div class="card">
        <h2>Deine Antworten <span class="zh">每题得分</span></h2>
        <ol class="answers" data-ref="list"></ol>
      </div>
    </section>`);
  private round: Round | null = null;
  private readonly ref = (name: string) => q(this.root, `[data-ref="${name}"]`);

  constructor(
    private readonly ctx: AppContext,
    private readonly confettiHost: HTMLElement,
    actions: { again: () => void; toStart: () => void },
  ) {
    this.ref('again').addEventListener('click', actions.again);
    this.ref('toStart').addEventListener('click', actions.toStart);
    this.ref('list').addEventListener('click', (e) => {
      if (!this.round) return;
      const target = e.target as Element;
      const say = target.closest<HTMLElement>('.answers__say');
      if (say) {
        const item = this.round.items[+say.dataset.i!]!;
        this.ctx.say(item.question.text, item.voice);
        return;
      }
      const more = target.closest<HTMLElement>('.answers__more');
      if (more) {
        const detail = q(this.root, `#answer-detail-${more.dataset.i}`);
        detail.hidden = !detail.hidden;
        more.setAttribute('aria-expanded', String(!detail.hidden));
      }
    });
  }

  show(round: Round, saved: AddResult): void {
    this.round = round;
    const mode = this.ctx.modes.find((m) => m.id === round.modeId)!;
    const { correct, averageMs } = round.summary();
    const badge = this.ref('badge');
    badge.setAttribute('style', modeStyle(mode.colors));
    badge.innerHTML = svg(mode.icon);
    this.ref('label').textContent = `${mode.label.de} · ${round.difficulty.label.de}`;
    this.ref('total').textContent = '0';
    const stars = starsFor(round.score);
    this.ref('stars').innerHTML = [0, 1, 2]
      .map((i) => STAR.replace('<svg', `<svg class="${i < stars ? 'is-on' : ''}"`))
      .join('');
    const grade = GRADES[stars]!;
    this.ref('grade').innerHTML = bi(grade.de, grade.zh);

    const isRecord = round.score > saved.previousBest && round.score > 0;
    const record = this.ref('record');
    if (isRecord) record.innerHTML = bi('Neuer Rekord!', '新纪录！');
    else if (saved.rank <= 5 && round.score > 0)
      record.innerHTML = bi(`Platz ${saved.rank} in der Bestenliste`, `第 ${saved.rank} 名`);
    record.hidden = !(isRecord || (saved.rank <= 5 && round.score > 0));
    this.ref('summary').innerHTML =
      `${correct} von ${round.length} richtig` +
      (correct ? ` · im Schnitt ${formatSeconds(averageMs)}` : '') +
      ` <span class="zh">答对 ${correct} 题</span>`;

    this.ref('list').innerHTML = round.items
      .map((item, i) => {
        const q = item.question;
        const meta = `${q.quiz.label.de}${item.input === 'typed' ? ' · getippt' : ''}${item.warning ? ' · ⚠ 12 h' : ''} · ${formatSeconds(item.ms)}`;
        return `<li class="${item.correct ? 'is-ok' : 'is-bad'}">
          <div class="answers__row">
            <span class="answers__num">${i + 1}</span>
            <span class="answers__answer" title="${esc(q.answer)}">${esc(q.answer)}${item.correct ? '' : `<span class="answers__given">du: ${esc(item.given || '–')}</span>`}<span class="answers__bar"><i style="width:${(item.points / MAX_POINTS) * 100}%"></i></span></span>
            <span class="answers__meta">${esc(meta)}</span>
            <span class="answers__actions">
              <button type="button" class="answers__say" data-i="${i}" aria-label="Noch einmal anhören">${svg(ICONS.speaker)}</button>
              <button type="button" class="answers__more" data-i="${i}" aria-expanded="false" aria-label="Erklärung"><span class="answers__more-long">Warum?</span><span class="answers__more-short">?</span></button>
            </span>
            <span class="answers__points">${formatPoints(item.points)}</span>
          </div>
          <div class="answers__detail" id="answer-detail-${i}" hidden>
            <p class="transcript">${transcriptHtml(q)}</p>${q.parts.length ? `<div class="parts">${partsHtml(q)}</div>` : ''}<ul class="hints">${hintsHtml(q)}</ul>
          </div>
        </li>`;
      })
      .join('');

    this.ctx.navigate('result');
    countUp(this.ref('total'), 0, round.score, 1400);
    this.ctx.sound(isRecord ? 'record' : 'end');
    if (isRecord) setTimeout(() => confetti(this.confettiHost), 600);
  }
}
