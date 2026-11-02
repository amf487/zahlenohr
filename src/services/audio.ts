/**
 * Web Audio: short game sound effects and the optional station background noise.
 * The AudioContext is created lazily on first use (browsers require a user gesture).
 */
export type Effect = 'ok' | 'bad' | 'end' | 'record';

const NOTES: Record<Effect, [frequency: number, delay: number][]> = {
  ok: [[660, 0], [880, 0.08], [1320, 0.16]],
  bad: [[200, 0], [150, 0.13]],
  end: [[523, 0], [659, 0.11], [784, 0.22], [1047, 0.34]],
  record: [[523, 0], [784, 0.1], [1047, 0.2], [1319, 0.3], [1568, 0.42]],
}; // prettier-ignore

type AudioCtor = typeof AudioContext;

export class AudioService {
  private ctx: AudioContext | null = null;
  private noise: AudioBufferSourceNode | null = null;

  private context(): AudioContext | null {
    try {
      if (!this.ctx) {
        const Ctor: AudioCtor | undefined =
          window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
        if (!Ctor) return null;
        this.ctx = new Ctor();
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    } catch {
      return null;
    }
  }

  play(effect: Effect): void {
    const ctx = this.context();
    if (!ctx) return;
    const t = ctx.currentTime;
    const harsh = effect === 'bad';
    for (const [f, d] of NOTES[effect]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = harsh ? 'sawtooth' : 'triangle';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, t + d);
      gain.gain.exponentialRampToValueAtTime(harsh ? 0.09 : 0.16, t + d + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + d + (harsh ? 0.22 : 0.18));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + d);
      osc.stop(t + d + 0.25);
    }
  }

  /** Brown noise, a bit like a busy station hall. */
  startNoise(): void {
    const ctx = this.context();
    if (!ctx) return;
    this.stopNoise();
    const length = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5 + white * 0.04;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0.32;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    this.noise = src;
  }

  stopNoise(): void {
    try {
      this.noise?.stop();
    } catch {
      /* already stopped */
    }
    this.noise = null;
  }
}
