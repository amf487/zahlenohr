import type { AppContext, Screen } from '@/app/context';
import { DIFFICULTIES, type DifficultyId } from '@/core/difficulty';
import { formatPoints } from '@/core/format';
import { bi, el, esc, q } from '../dom';
import { PLAY, svg } from '../icons';
import { modeStyle } from '../explain';
import { Modal } from '../components/Modal';

/** Mode and difficulty selection, high score list and the scoring rules. */
export class StartScreen implements Screen {
  readonly root = el(`
    <section class="screen screen--split screen--start" hidden>
      <div class="card">
        <div class="intro">
          <h1>Hör genau hin. <em>Jede Millisekunde zählt.</em></h1>
          <p>10 Fragen pro Runde. Je schneller du richtig antwortest, desto mehr Punkte. <span class="zh">每轮 10 题，答得越快分数越高。</span></p>
        </div>
        <div class="field">
          <span class="field__label">Spielmodus <span class="zh">练习内容</span></span>
          <div class="mode-grid" data-ref="modes"></div>
        </div>
        <div class="field">
          <span class="field__label">Schwierigkeit <span class="zh">难度</span></span>
          <div class="segmented segmented--big" data-ref="difficulty"></div>
        </div>
        <button class="btn btn--start" type="button" data-ref="start">${PLAY} Spiel starten <span class="zh">开始</span></button>
        <button class="btn btn--link" type="button" data-ref="rules"><span class="btn__dot">i</span> So zählt es <span class="zh">计分规则</span></button>
      </div>
      <div class="col">
        <div class="card">
          <h2>Bestenliste <span class="zh">最高分</span> <span class="tag" data-ref="hsLabel"></span></h2>
          <ol class="highscores" data-ref="hsList"></ol>
          <p class="note" data-ref="hsEmpty">Noch keine Runde in dieser Kombination. Dein erstes Ergebnis landet hier. <span class="zh">还没有成绩。</span></p>
        </div>
      </div>
    </section>`);

  private readonly rules = new Modal(
    'So zählt es <span class="zh">计分规则</span>',
    `<div class="rules">
      <span><span class="rules__icon">⏱</span><span>Die Uhr läuft, sobald der Satz zu Ende ist.</span></span>
      <span><span class="rules__icon">✓</span><span>Richtig: <b>1000</b> Punkte minus 1 Punkt pro <b data-ref="ruleMs">20</b> ms, mindestens <b>100</b>.</span></span>
      <span><span class="rules__icon">✗</span><span>Falsch: <b>0</b> Punkte. Maximal <b>10.000</b> pro Runde.</span></span>
      <span><span class="rules__icon">⌨</span><span>Leerzeichen und „-" beim Tippen sind egal. Bei Uhrzeiten zählt auch die 12-Stunden-Form, du bekommst dann aber einen Hinweis.</span></span>
      <span class="zh">句子读完后开始计时，每过一毫秒都会扣分。答错 0 分。</span>
    </div>`,
    'Alles klar <span class="zh">明白了</span>',
  );

  /** Highlights the entry of the round that was just played. */
  freshEntryId: string | null = null;

  constructor(
    private readonly ctx: AppContext,
    private readonly onStart: () => void,
  ) {
    this.root.append(this.rules.root);
    q(this.root, '[data-ref="start"]').addEventListener('click', () => this.onStart());
    q(this.root, '[data-ref="rules"]').addEventListener('click', () => this.rules.open());
    q(this.root, '[data-ref="modes"]').addEventListener('click', (e) => {
      const b = (e.target as Element).closest<HTMLElement>('[data-mode]');
      if (b) this.ctx.settings.set('mode', b.dataset.mode!);
    });
    q(this.root, '[data-ref="difficulty"]').addEventListener('click', (e) => {
      const b = (e.target as Element).closest<HTMLElement>('[data-difficulty]');
      if (b) this.ctx.settings.set('difficulty', b.dataset.difficulty as DifficultyId);
    });
    this.ctx.settings.subscribe(() => {
      if (!this.root.hidden) this.render();
    });
  }

  enter(): void {
    this.render();
  }

  leave(): void {
    this.freshEntryId = null;
  }

  private render(): void {
    const { mode, difficulty, chinese } = this.ctx.settings.current;
    // A photo at public/img/<mode>.jpg is used as card background when present; otherwise the illustration shows.
    q(this.root, '[data-ref="modes"]').innerHTML = this.ctx.modes
      .map(
        (
          m,
        ) => `<button type="button" class="mode-card" data-mode="${m.id}" style="${modeStyle(m.colors)}" aria-pressed="${mode === m.id}">
          <img class="mode-card__photo" src="img/${m.id}.jpg" alt="" onerror="this.nextElementSibling.remove();this.remove()"><span class="mode-card__shade"></span>
          ${svg(m.icon, 'mode-card__art')}
          <span class="mode-card__title">${bi(m.label.de, m.label.zh)}</span>
        </button>`,
      )
      .join('');
    q(this.root, '[data-ref="difficulty"]').innerHTML = Object.values(DIFFICULTIES)
      .map((d) => {
        const tip = d.note.de + (chinese ? ' ' + d.note.zh : '');
        return `<button type="button" class="tip" data-tip="${esc(tip)}" data-difficulty="${d.id}" aria-pressed="${difficulty === d.id}">${bi(d.label.de, d.label.zh)}</button>`;
      })
      .join('');
    q(this.rules.root, '[data-ref="ruleMs"]').textContent =
      difficulty === 'hard' ? '20 (eingetippt: 30)' : '20';
    this.renderHighscores();
  }

  private renderHighscores(): void {
    const { mode, difficulty } = this.ctx.settings.current;
    const list = this.ctx.highscores.top(mode, difficulty);
    const label = this.ctx.modes.find((m) => m.id === mode)?.label.de ?? mode;
    q(this.root, '[data-ref="hsLabel"]').textContent = `${label} · ${DIFFICULTIES[difficulty].label.de}`;
    q(this.root, '[data-ref="hsEmpty"]').hidden = list.length > 0;
    q(this.root, '[data-ref="hsList"]').innerHTML = list
      .map((h) => {
        const when = new Date(h.date).toLocaleDateString('de-AT', { day: 'numeric', month: 'short' });
        return `<li class="${h.id === this.freshEntryId ? 'is-fresh' : ''}"><span class="highscores__points">${formatPoints(h.score)}</span> <span class="highscores__meta">${h.correct}/10 richtig · ${esc(when)}</span></li>`;
      })
      .join('');
  }
}
