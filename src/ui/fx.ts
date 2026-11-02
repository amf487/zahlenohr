import { formatPoints } from '@/core/format';
import { pick } from '@/core/random';
import { prefersReducedMotion } from './dom';

/** Animates a number from `from` to `to` (ease-out). */
export function countUp(target: HTMLElement, from: number, to: number, duration: number): void {
  if (prefersReducedMotion() || from === to) {
    target.textContent = formatPoints(to);
    return;
  }
  const t0 = performance.now();
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / duration);
    const eased = 1 - Math.pow(1 - k, 3);
    target.textContent = formatPoints(Math.round(from + (to - from) * eased));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const CONFETTI_COLORS = ['#FFC93C', '#FF6A9A', '#5C86FF', '#22E0B4', '#C17BFF', '#FFFFFF'];

/** A burst of confetti over the whole page (for a new record). */
export function confetti(host: HTMLElement, pieces = 90): void {
  if (prefersReducedMotion()) return;
  let html = '';
  for (let i = 0; i < pieces; i++) {
    const style = [
      `left:${Math.random() * 100}%`,
      `background:${pick(CONFETTI_COLORS)}`,
      `--dx:${(Math.random() - 0.5) * 240}px`,
      `--rot:${Math.round((Math.random() - 0.5) * 1440)}deg`,
      `animation-duration:${1.8 + Math.random() * 1.6}s`,
      `animation-delay:${Math.random() * 0.5}s`,
    ].join(';');
    html += `<i style="${style}"></i>`;
  }
  host.innerHTML = html;
  setTimeout(() => (host.innerHTML = ''), 4500);
}
