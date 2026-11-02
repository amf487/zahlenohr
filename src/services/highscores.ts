import { readJson, writeJson } from './storage';

export interface HighscoreEntry {
  id: string;
  score: number;
  correct: number;
  mode: string;
  /** Difficulty id (field name kept from the single-file version). */
  diff: string;
  date: number;
}

export interface AddResult {
  entry: HighscoreEntry;
  /** Position among scores of the same mode and difficulty (1 = best). */
  rank: number;
  /** Best score before this one, or -1 if there was none. */
  previousBest: number;
}

/** Scores are out of 10,000 (per-millisecond scoring). */
const KEY = 'zahlenohr.highscores.v2';
const KEEP_PER_LIST = 10;

/** Best scores per mode and difficulty, stored in this browser only. */
export class HighscoreStore {
  private entries: HighscoreEntry[];

  constructor() {
    const stored = readJson<unknown>(KEY, []);
    this.entries = Array.isArray(stored) ? (stored as HighscoreEntry[]) : [];
  }

  top(mode: string, difficulty: string, count = 5): HighscoreEntry[] {
    return this.list(mode, difficulty).slice(0, count);
  }

  add(score: number, correct: number, mode: string, difficulty: string): AddResult {
    const same = this.list(mode, difficulty);
    const previousBest = same.length ? same[0]!.score : -1;
    const rank = same.filter((h) => h.score > score).length + 1;
    const entry: HighscoreEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      score,
      correct,
      mode,
      diff: difficulty,
      date: Date.now(),
    };
    const others = this.entries.filter((h) => h.mode !== mode || h.diff !== difficulty);
    this.entries = [...others, ...[...same, entry].sort((a, b) => b.score - a.score).slice(0, KEEP_PER_LIST)];
    writeJson(KEY, this.entries);
    return { entry, rank, previousBest };
  }

  clear(): void {
    this.entries = [];
    writeJson(KEY, this.entries);
  }

  private list(mode: string, difficulty: string): HighscoreEntry[] {
    return this.entries
      .filter((h) => h.mode === mode && h.diff === difficulty)
      .sort((a, b) => b.score - a.score);
  }
}
