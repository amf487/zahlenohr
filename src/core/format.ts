/** 10000 → "10.000" (German thousands separator). */
export const formatPoints = (n: number): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** 3482 ms → "3,48 s". */
export const formatSeconds = (ms: number): string => (ms / 1000).toFixed(2).replace('.', ',') + ' s';
