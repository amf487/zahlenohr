import type { RegionChoice } from '@/core/types';
import { isDifficultyId, type DifficultyId } from '@/core/difficulty';
import { readJson, writeJson } from './storage';

export interface Settings {
  /** Selected game mode id (a quiz id or "mix"). */
  mode: string;
  difficulty: DifficultyId;
  region: RegionChoice;
  /** "auto", "random", "microsoft" or a voiceURI. */
  voice: string;
  rate: number;
  /** Speak full sentences instead of only the phrase. */
  sentences: boolean;
  noise: boolean;
  chinese: boolean;
  soundEffects: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  mode: 'time',
  difficulty: 'medium',
  region: 'mix',
  voice: 'auto',
  rate: 1,
  sentences: true,
  noise: false,
  chinese: true,
  soundEffects: true,
};

/** Same key as the single-file version, so saved settings carry over. */
const KEY = 'zahlenohr.settings.v2';

/** Old field names of the single-file version. */
interface LegacySettings {
  diff?: DifficultyId;
  context?: boolean;
  zh?: boolean;
  sfx?: boolean;
}

type Listener = (settings: Readonly<Settings>) => void;

export class SettingsStore {
  private value: Settings;
  private listeners = new Set<Listener>();

  constructor(private readonly isValidMode: (id: string) => boolean) {
    const stored = readJson<Partial<Settings> & LegacySettings>(KEY, {});
    const merged: Settings = {
      ...DEFAULT_SETTINGS,
      ...stored,
      difficulty: stored.difficulty ?? stored.diff ?? DEFAULT_SETTINGS.difficulty,
      sentences: stored.sentences ?? stored.context ?? DEFAULT_SETTINGS.sentences,
      chinese: stored.chinese ?? stored.zh ?? DEFAULT_SETTINGS.chinese,
      soundEffects: stored.soundEffects ?? stored.sfx ?? DEFAULT_SETTINGS.soundEffects,
    };
    if (!this.isValidMode(merged.mode)) merged.mode = DEFAULT_SETTINGS.mode;
    if (!isDifficultyId(merged.difficulty)) merged.difficulty = DEFAULT_SETTINGS.difficulty;
    this.value = merged;
  }

  get current(): Readonly<Settings> {
    return this.value;
  }

  get<K extends keyof Settings>(key: K): Settings[K] {
    return this.value[key];
  }

  set<K extends keyof Settings>(key: K, v: Settings[K]): void {
    if (this.value[key] === v) return;
    this.value = { ...this.value, [key]: v };
    const { mode, difficulty, region, voice, rate, sentences, noise, chinese, soundEffects } = this.value;
    writeJson(KEY, { mode, difficulty, region, voice, rate, sentences, noise, chinese, soundEffects });
    this.listeners.forEach((l) => l(this.value));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
