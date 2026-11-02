/**
 * All randomness goes through this module, so tests can make it predictable with `useSeed`.
 */
let source: () => number = Math.random;

/** Replace the random source (e.g. with a seeded generator in tests). */
export function setRandomSource(fn: () => number): void {
  source = fn;
}

/** Deterministic generator (mulberry32) for reproducible tests. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function useSeed(seed: number): void {
  setRandomSource(seeded(seed));
}

export const random = (): number => source();

/** Random integer between `min` and `max`, both included. */
export const randInt = (min: number, max: number): number => min + Math.floor(source() * (max - min + 1));

export const pick = <T>(list: readonly T[]): T => list[Math.floor(source() * list.length)] as T;

export const chance = (probability: number): boolean => source() < probability;

/** Shuffles the array in place and returns it. */
export function shuffle<T>(list: T[]): T[] {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(source() * (i + 1));
    [list[i], list[j]] = [list[j] as T, list[i] as T];
  }
  return list;
}
