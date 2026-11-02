import type { GameMode, QuizModule, VoiceParams } from '@/core/types';
import type { Effect } from '@/services/audio';
import type { AudioService } from '@/services/audio';
import type { HighscoreStore } from '@/services/highscores';
import type { SettingsStore } from '@/services/settings';
import type { SpeechService } from '@/services/speech';

export type ScreenName = 'start' | 'game' | 'result' | 'settings';

/** Everything the screens share. Created once in `App`. */
export interface AppContext {
  settings: SettingsStore;
  highscores: HighscoreStore;
  speech: SpeechService;
  audio: AudioService;
  modes: readonly GameMode[];
  quizzes: readonly QuizModule[];
  navigate(screen: ScreenName): void;
  /** Speaks a text, with background noise if that option is on. */
  say(text: string, voice: VoiceParams, onDone?: () => void): void;
  stopSpeaking(): void;
  /** Plays a sound effect if sound effects are on. */
  sound(effect: Effect): void;
}

export interface Screen {
  readonly root: HTMLElement;
  /** Called every time the screen becomes visible. */
  enter?(): void;
  /** Called when another screen takes over. */
  leave?(): void;
}
