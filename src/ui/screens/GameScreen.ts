import type { AppContext, Screen } from '@/app/context';
import type { GameMode, Question } from '@/core/types';
import type { Difficulty } from '@/core/difficulty';
import { DIGITS, markAnswer } from '@/core/marks';
import { chance, pick, random } from '@/core/random';
import { REGIONS, resolveRegion } from '@/core/regions';
import { Round, ROUND_LENGTH, type NewItem, type RoundItem } from '@/core/round';
import { SentenceComposer } from '@/core/sentences';
import { formatPoints } from '@/core/format';
import { chooseVoice } from '@/services/voices';
import { bi, el, esc, q, qa } from '../dom';
import { ICONS, PLAY, svg } from '../icons';
import { hintsHtml, modeStyle, partsHtml, transcriptHtml } from '../explain';
import { countUp } from '../fx';
import { Board } from '../components/Board';
import { RingTimer } from '../components/RingTimer';
import { confirmButton } from '../components/confirmButton';

/** One round of 10 questions: listen, answer, see what was right. */
export class GameScreen implements Screen {
  readonly root = el(`
    <section class="screen screen--game" hidden>
      <div class="hud">
        <span class="hud__pill">Runde <b data-ref="qnum">1</b>/${ROUND_LENGTH}</span>
        <div class="hud__progress" data-ref="progress" aria-hidden="true"></div>
        <span class="hud__pill hud__pill--score"><b data-ref="score">0</b> Pkt.</span>
      </div>
      <div class="card game">
        <div class="game__grid">
          <div class="col" data-ref="main">
            <div class="game__row">
              <div class="game__controls">
                <button class="btn btn--play" type="button" data-ref="play">
                  <span class="btn__disc">${PLAY}</span>
                  <span data-ref="playLabel"></span>
                </button>
                <button class="btn btn--ghost" type="button" data-ref="slow">${svg(ICONS.slow)} Langsam <span class="zh">慢速</span></button>
              </div>
            </div>
            <p class="alert" data-ref="ttsWarning" hidden>Dieser Browser kann keinen Text vorlesen. Bitte Microsoft Edge, Chrome oder Safari verwenden.</p>
            <div class="options" data-ref="options"></div>
            <span class="input-tag" data-ref="inputTag" hidden>Eintippen <span class="zh">输入答案</span></span>
            <form class="answer-form" data-ref="form" hidden autocomplete="off">
              <input data-ref="input" type="text" aria-label="Deine Antwort">
              <button class="btn btn--primary" type="submit" data-ref="check">Prüfen <span class="zh">检查</span></button>
            </form>
          </div>
          <div class="game__side">
            <div class="waiting" data-ref="waiting">
              <span class="waiting__badge" data-ref="badge"></span>
              <strong data-ref="waitTitle"></strong>
              <p>Antworte, sobald du die Zahl erkannt hast. Ab dem Satzende kostet jede Millisekunde Punkte. <span class="zh">听完马上回答，每一毫秒都在扣分。</span></p>
            </div>
            <section class="feedback" data-ref="feedback" hidden aria-live="polite">
              <p class="verdict" data-ref="verdict"></p>
              <p class="warning-note" data-ref="warning" hidden></p>
              <div>
                <span class="label">Gesagt wurde <span class="zh">原句</span></span>
                <p class="transcript" data-ref="transcript"></p>
              </div>
              <div class="parts" data-ref="parts"></div>
              <ul class="hints" data-ref="hints"></ul>
              <div><button class="btn btn--primary" type="button" data-ref="next"></button></div>
            </section>
          </div>
        </div>
      </div>
      <div class="game__footer">
        <button class="btn btn--quiet" type="button" data-ref="quit">Runde abbrechen</button>
        <p class="keys"><kbd>Leertaste</kbd> nochmal · <kbd>L</kbd> langsam · <kbd>1</kbd>–<kbd>4</kbd> antworten · <kbd>Enter</kbd> weiter</p>
      </div>
    </section>`);

  private readonly board = new Board();
  private readonly timer = new RingTimer();
  private readonly composer = new SentenceComposer();
  private round: Round | null = null;
  private readonly ref = <T extends HTMLElement = HTMLElement>(name: string) =>
    q<T>(this.root, `[data-ref="${name}"]`);
  private readonly input = this.ref<HTMLInputElement>('input');
  private readonly quit;

  constructor(
    private readonly ctx: AppContext,
    private readonly onFinish: (round: Round) => void,
    private readonly onQuit: () => void,
  ) {
    const main = this.ref('main');
    main.prepend(this.board.root);
    q(main, '.game__row').prepend(this.timer.root);
    this.bind();
    this.quit = confirmButton(
      this.ref<HTMLButtonElement>('quit'),
      { idle: 'Runde abbrechen', armed: 'Wirklich abbrechen? Nochmal tippen.' },
      () => {
        this.ctx.stopSpeaking();
        this.timer.stop();
        this.round = null;
        this.onQuit();
      },
    );
  }

  /** The round being played (for tests and the result screen). */
  get current(): RoundItem | null {
    return this.round?.current ?? null;
  }

  start(mode: GameMode, difficulty: Difficulty): void {
    this.round = new Round(mode.id, difficulty, () => this.createItem(mode, difficulty));
    this.ref('progress').innerHTML = '<i></i>'.repeat(ROUND_LENGTH);
    this.ref('score').textContent = '0';
    this.ref('ttsWarning').hidden = this.ctx.speech.supported;
    this.quit.reset();
    this.next();
  }

  leave(): void {
    this.timer.stop();
  }

  private createItem(mode: GameMode, difficulty: Difficulty): NewItem {
    const s = this.ctx.settings.current;
    const quiz = pick(mode.quizzes);
    const region = resolveRegion(s.region);
    const draft = quiz.generate(region);
    const question: Question = {
      ...draft,
      quiz,
      region,
      text: this.composer.compose(draft, region, s.sentences),
    };
    const voice = chooseVoice(this.ctx.speech.voices, region, s.voice);
    return {
      question,
      voice: {
        voiceURI: voice?.voiceURI ?? null,
        rate: s.rate * difficulty.rate * (1 + (random() - 0.5) * 0.08),
        pitch: 0.94 + random() * 0.12,
      },
      input: chance(difficulty.typedShare) ? 'typed' : 'choice',
    };
  }

  private next(): void {
    const round = this.round;
    if (!round) return;
    const item = round.next();
    if (!item) {
      this.ctx.stopSpeaking();
      this.onFinish(round);
      return;
    }
    const q = item.question;
    const typed = item.input === 'typed';
    this.ref('qnum').textContent = String(round.index + 1);
    [...this.ref('progress').children].forEach((dot, i) => {
      dot.className =
        i < round.index
          ? round.items[i]!.correct
            ? 'is-ok'
            : 'is-bad'
          : i === round.index
            ? 'is-current'
            : '';
    });
    this.board.setTitle(bi(q.quiz.label.de, q.quiz.label.zh), REGIONS[q.region].name);
    this.board.showPlaceholder(q.quiz.boardPlaceholder);
    this.ref('feedback').hidden = true;
    this.ref('waiting').hidden = false;
    const badge = this.ref('badge');
    badge.setAttribute('style', modeStyle(q.quiz.colors));
    badge.innerHTML = svg(q.quiz.icon);
    this.ref('waitTitle').textContent = typed ? 'Hör zu und tipp die Antwort ein' : 'Hör gut zu';
    this.ref('slow').hidden = !round.difficulty.slowReplay;
    this.ref('playLabel').innerHTML = bi('Anhören', '听');
    this.timer.reset();

    const options = this.ref('options');
    options.hidden = typed;
    this.ref('form').hidden = !typed;
    this.ref('inputTag').hidden = !typed;
    if (typed) {
      this.input.value = '';
      this.input.className = '';
      this.input.placeholder = q.placeholder;
      this.input.setAttribute('inputmode', q.inputMode);
      this.input.disabled = false;
      this.ref<HTMLButtonElement>('check').disabled = false;
    } else {
      options.className = 'options' + (q.answer.length > 11 ? ' options--long' : '');
      options.innerHTML = q.options
        .map(
          (o, i) =>
            `<button type="button" class="option" data-value="${esc(o)}"><span class="option__key">${i + 1}</span><span>${esc(o)}</span></button>`,
        )
        .join('');
    }
    this.play(false);
    if (typed) setTimeout(() => this.input.focus({ preventScroll: true }), 60);
  }

  private play(slow: boolean): void {
    const round = this.round;
    const item = round?.current;
    if (!round || !item) return;
    this.ref('playLabel').innerHTML = bi('Nochmal', '再听');
    const voice = { ...item.voice, rate: item.voice.rate * (slow ? 0.7 : 1) };
    this.ctx.say(item.question.text, voice, () => {
      // The clock starts when the sentence has been read out the first time.
      if (round.current === item && round.startClock(performance.now())) {
        this.timer.run(item.clockStart, item.input === 'typed');
      }
    });
  }

  private submit(value: string): void {
    const round = this.round;
    const current = round?.current;
    if (!round || !current || current.answered) return;
    if (current.input === 'typed' && !value.trim()) return;
    const now = performance.now();
    this.ctx.stopSpeaking();
    const before = round.score;
    const item = round.submit(value, now)!;
    const q = item.question;
    countUp(this.ref('score'), before, round.score, 700);
    this.board.popScore(item.points, item.correct);
    this.ctx.sound(item.correct ? 'ok' : 'bad');
    this.timer.finish(item.ms, item.points, item.correct);
    this.ref('progress').children[round.index]!.className = item.correct ? 'is-ok' : 'is-bad';

    if (item.input === 'choice') {
      const options = this.ref('options');
      options.classList.add('is-done');
      qa<HTMLButtonElement>(options, '.option').forEach((b) => {
        b.disabled = true;
        if (b.dataset.value === q.answer) b.classList.add('is-correct');
        else if (b.dataset.value === value) b.classList.add('is-wrong');
      });
    } else {
      this.input.disabled = true;
      this.ref<HTMLButtonElement>('check').disabled = true;
      this.input.classList.add(item.correct ? 'is-ok' : 'is-bad');
    }
    const pattern = q.quiz.markPattern ?? DIGITS;
    const given = item.input === 'choice' ? item.given : q.toAnswerNotation(item.given);
    this.board.reveal(
      q.answer,
      markAnswer({ answer: q.answer, given, correct: item.correct, warned: !!item.warning, pattern }),
      pattern,
    );

    const verdict = this.ref('verdict');
    verdict.className = 'verdict ' + (item.correct ? 'is-ok' : 'is-bad');
    verdict.innerHTML = item.correct
      ? `${bi(`Richtig! +${formatPoints(item.points)}`, '答对了')}`
      : bi('Falsch!', '答错了');
    const warning = this.ref('warning');
    warning.hidden = !item.warning;
    warning.innerHTML = item.warning
      ? `<span>⚠ ${esc(item.warning.de)}</span><span class="zh">${esc(item.warning.zh)}</span>`
      : '';
    this.ref('transcript').innerHTML = transcriptHtml(q);
    // Explanations only after a mistake, to keep the round quick.
    const parts = this.ref('parts');
    parts.innerHTML = item.correct ? '' : partsHtml(q);
    parts.hidden = item.correct || !q.parts.length;
    const hints = this.ref('hints');
    hints.innerHTML = item.correct ? '' : hintsHtml(q);
    hints.hidden = item.correct;
    this.ref('next').innerHTML = round.isLastQuestion
      ? `${bi('Ergebnis ansehen', '看成绩')} →`
      : `${bi('Weiter', '下一题')} →`;
    this.ref('waiting').hidden = true;
    this.ref('feedback').hidden = false;
    setTimeout(() => this.ref('next').focus({ preventScroll: true }), 30);
  }

  private bind(): void {
    // Replaying keeps the cursor in the answer field, so typing can continue right away.
    const typing = () => {
      const item = this.round?.current;
      return !!item && item.input === 'typed' && !item.answered;
    };
    const refocus = () => {
      if (typing()) this.input.focus({ preventScroll: true });
    };
    for (const [name, slow] of [
      ['play', false],
      ['slow', true],
    ] as const) {
      const b = this.ref(name);
      b.addEventListener('mousedown', (e) => {
        if (typing()) e.preventDefault();
      });
      b.addEventListener('click', () => {
        this.play(slow);
        refocus();
      });
    }
    this.ref('next').addEventListener('click', () => this.next());
    this.ref('options').addEventListener('click', (e) => {
      const b = (e.target as Element).closest<HTMLButtonElement>('.option');
      if (b && !b.disabled) this.submit(b.dataset.value!);
    });
    this.ref('form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit(this.input.value);
    });
    document.addEventListener('keydown', (e) => this.onKey(e));
  }

  private onKey(e: KeyboardEvent): void {
    if (this.root.hidden || !this.round) return;
    const target = e.target as HTMLElement;
    const tag = target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const item = this.round.current;
    if (!item) return;
    if (e.key === ' ') {
      e.preventDefault();
      this.play(false);
    } else if ((e.key === 'l' || e.key === 'L') && this.round.difficulty.slowReplay) this.play(true);
    else if (e.key === 'Enter' && item.answered && tag !== 'button') {
      e.preventDefault();
      this.next();
    } else if (/^[1-4]$/.test(e.key) && item.input === 'choice' && !item.answered) {
      const b = qa<HTMLButtonElement>(this.ref('options'), '.option')[+e.key - 1];
      if (b) this.submit(b.dataset.value!);
    }
  }
}
