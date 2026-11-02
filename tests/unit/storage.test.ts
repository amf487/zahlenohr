import { beforeEach, describe, expect, it } from 'vitest';
import { HighscoreStore } from '@/services/highscores';
import { SettingsStore } from '@/services/settings';

/** Minimal in-memory localStorage for the node test environment. */
function fakeStorage() {
  const data = new Map<string, string>();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
    clear: () => data.clear(),
    key: () => null,
    length: 0,
  };
  return data;
}

describe('SettingsStore', () => {
  let data: Map<string, string>;
  beforeEach(() => (data = fakeStorage()));

  it('reads settings saved by the single-file version', () => {
    data.set(
      'zahlenohr.settings.v2',
      JSON.stringify({ mode: 'phone', diff: 'hard', context: false, zh: false, sfx: false }),
    );
    const s = new SettingsStore(() => true);
    expect(s.current).toMatchObject({
      mode: 'phone',
      difficulty: 'hard',
      sentences: false,
      chinese: false,
      soundEffects: false,
    });
  });

  it('falls back to defaults for unknown values and notifies listeners', () => {
    data.set('zahlenohr.settings.v2', JSON.stringify({ mode: 'gone', difficulty: 'impossible' }));
    const s = new SettingsStore((id) => id !== 'gone');
    expect(s.current.mode).toBe('time');
    expect(s.current.difficulty).toBe('medium');
    let calls = 0;
    s.subscribe(() => calls++);
    s.set('rate', 1.2);
    s.set('rate', 1.2);
    expect(calls).toBe(1);
    expect(JSON.parse(data.get('zahlenohr.settings.v2')!).rate).toBe(1.2);
  });
});

describe('HighscoreStore', () => {
  beforeEach(() => fakeStorage());

  it('ranks scores per mode and difficulty', () => {
    const hs = new HighscoreStore();
    expect(hs.add(5000, 7, 'time', 'medium')).toMatchObject({ rank: 1, previousBest: -1 });
    expect(hs.add(7000, 9, 'time', 'medium')).toMatchObject({ rank: 1, previousBest: 5000 });
    expect(hs.add(6000, 8, 'time', 'medium')).toMatchObject({ rank: 2, previousBest: 7000 });
    expect(hs.add(100, 1, 'time', 'hard').rank).toBe(1);
    expect(hs.top('time', 'medium').map((h) => h.score)).toEqual([7000, 6000, 5000]);
    expect(new HighscoreStore().top('time', 'medium')).toHaveLength(3);
  });

  it('keeps the best ten per list and can be cleared', () => {
    const hs = new HighscoreStore();
    for (let i = 0; i < 15; i++) hs.add(i * 100, 5, 'mix', 'easy');
    expect(hs.top('mix', 'easy', 20)).toHaveLength(10);
    hs.clear();
    expect(hs.top('mix', 'easy')).toHaveLength(0);
  });
});
