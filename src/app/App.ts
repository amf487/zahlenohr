import type { AppContext, Screen, ScreenName } from './context';
import type { VoiceParams } from '@/core/types';
import type { Round } from '@/core/round';
import { DIFFICULTIES } from '@/core/difficulty';
import { MODES, QUIZZES, findMode } from '@/quizzes';
import { AudioService, type Effect } from '@/services/audio';
import { HighscoreStore } from '@/services/highscores';
import { SettingsStore } from '@/services/settings';
import { SpeechService } from '@/services/speech';
import { el, q } from '@/ui/dom';
import { ICONS, svg } from '@/ui/icons';
import { StartScreen } from '@/ui/screens/StartScreen';
import { GameScreen } from '@/ui/screens/GameScreen';
import { ResultScreen } from '@/ui/screens/ResultScreen';
import { SettingsScreen } from '@/ui/screens/SettingsScreen';

/** Builds the page, owns the services and switches between the screens. */
export class App {
  private readonly ctx: AppContext;
  private readonly screens: Record<ScreenName, Screen>;
  private readonly game: GameScreen;
  private readonly start: StartScreen;
  private readonly result: ResultScreen;
  private current: ScreenName = 'start';
  private previous: ScreenName = 'start';
  private readonly header = el(`
    <header class="header">
      <button class="header__brand" type="button" data-ref="home"><span class="header__logo">12</span>Zahlenohr <span class="zh">德语数字听力</span></button>
      <button class="btn btn--icon tip tip--below" type="button" data-ref="settings" aria-label="Einstellungen" data-tip="Einstellungen">${svg(ICONS.settings)}</button>
    </header>`);

  constructor(root: HTMLElement) {
    const settings = new SettingsStore((id) => !!findMode(id));
    const speech = new SpeechService();
    const audio = new AudioService();
    this.ctx = {
      settings,
      highscores: new HighscoreStore(),
      speech,
      audio,
      modes: MODES,
      quizzes: QUIZZES,
      navigate: (name) => this.show(name),
      say: (text: string, voice: VoiceParams, onDone?: () => void) =>
        speech.speak(text, {
          ...voice,
          onDone,
          onStart: () => settings.get('noise') && audio.startNoise(),
          onStop: () => audio.stopNoise(),
        }),
      stopSpeaking: () => speech.stop(),
      sound: (effect: Effect) => settings.get('soundEffects') && audio.play(effect),
    };

    const confettiHost = el('<div class="confetti" aria-hidden="true"></div>');
    this.start = new StartScreen(this.ctx, () => this.startGame());
    this.game = new GameScreen(
      this.ctx,
      (round) => this.finishGame(round),
      () => this.show('start'),
    );
    this.result = new ResultScreen(this.ctx, confettiHost, {
      again: () => this.startGame(),
      toStart: () => {
        this.ctx.stopSpeaking();
        this.show('start');
      },
    });
    const settingsScreen = new SettingsScreen(this.ctx, () => this.show(this.previous));
    this.screens = { start: this.start, game: this.game, result: this.result, settings: settingsScreen };

    const shell = el('<div class="app"></div>');
    shell.append(this.header, ...Object.values(this.screens).map((s) => s.root));
    const version = el(`<div class="app-version" title="Version">v${__APP_VERSION__}</div>`);
    root.append(shell, confettiHost, version);

    q(this.header, '[data-ref="home"]').addEventListener('click', () => {
      if (this.current === 'game') return;
      this.ctx.stopSpeaking();
      this.show('start');
    });
    q(this.header, '[data-ref="settings"]').addEventListener('click', () => this.show('settings'));
    speech.onSpeakingChanged((on) =>
      this.game.root.querySelector('.btn--play')?.classList.toggle('is-speaking', on),
    );
    settings.subscribe((s) => document.body.classList.toggle('no-chinese', !s.chinese));
    document.body.classList.toggle('no-chinese', !settings.get('chinese'));

    this.show('start');
    this.exposeTestHook();
  }

  private show(name: ScreenName): void {
    if (name !== 'settings') this.previous = name;
    const leaving = this.screens[this.current];
    if (leaving !== this.screens[name]) leaving.leave?.();
    this.current = name;
    for (const [key, screen] of Object.entries(this.screens)) screen.root.hidden = key !== name;
    q(this.header, '[data-ref="settings"]').hidden = name === 'game' || name === 'settings';
    this.screens[name].enter?.();
    window.scrollTo(0, 0);
  }

  private startGame(): void {
    const s = this.ctx.settings.current;
    const mode = findMode(s.mode) ?? MODES[0]!;
    this.show('game');
    this.game.start(mode, DIFFICULTIES[s.difficulty]);
  }

  private finishGame(round: Round): void {
    const { correct } = round.summary();
    const saved = this.ctx.highscores.add(round.score, correct, round.modeId, round.difficulty.id);
    this.start.freshEntryId = saved.entry.id;
    this.result.show(round, saved);
  }

  /** Read-only hook for automated tests. */
  private exposeTestHook(): void {
    (window as unknown as { __zahlenohr: unknown }).__zahlenohr = {
      quizzes: QUIZZES,
      current: () => this.game.current,
    };
  }
}
