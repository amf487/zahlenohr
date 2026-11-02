import { formatPoints, formatSeconds } from '@/core/format';
import { MAX_POINTS, MIN_POINTS, pointsFor } from '@/core/scoring';
import { el, q } from '../dom';

/** The gold ring that counts down the points still possible, plus the elapsed time. */
export class RingTimer {
  readonly root = el(`
    <div class="timer is-waiting">
      <div class="timer__ring"><div class="timer__inner"><b data-ref="points">1000</b><span data-ref="label">möglich</span></div></div>
      <div class="timer__info"><span class="timer__time" data-ref="time">hör zu …</span><span class="timer__caption">Zeit</span></div>
    </div>`);
  private readonly points = q(this.root, '[data-ref="points"]');
  private readonly label = q(this.root, '[data-ref="label"]');
  private readonly time = q(this.root, '[data-ref="time"]');
  private frame = 0;

  reset(): void {
    cancelAnimationFrame(this.frame);
    this.root.classList.add('is-waiting');
    this.time.textContent = 'hör zu …';
    this.setProgress(1);
    this.points.textContent = formatPoints(MAX_POINTS);
    this.label.textContent = 'möglich';
  }

  /** Starts ticking from `start` (performance.now() time) until `stop()`. */
  run(start: number, typed: boolean): void {
    this.root.classList.remove('is-waiting');
    const tick = () => {
      const ms = performance.now() - start;
      const p = pointsFor(ms, typed);
      this.time.textContent = formatSeconds(ms);
      this.points.textContent = formatPoints(p);
      this.setProgress((p - MIN_POINTS) / (MAX_POINTS - MIN_POINTS));
      this.frame = requestAnimationFrame(tick);
    };
    tick();
  }

  stop(): void {
    cancelAnimationFrame(this.frame);
  }

  /** Shows the final time and the points scored. */
  finish(ms: number, points: number, correct: boolean): void {
    this.stop();
    this.root.classList.remove('is-waiting');
    this.setProgress(correct ? points / MAX_POINTS : 0);
    this.time.textContent = formatSeconds(ms);
    this.points.textContent = formatPoints(points);
    this.label.textContent = 'Punkte';
  }

  private setProgress(p: number): void {
    this.root.style.setProperty('--p', String(p));
  }
}
