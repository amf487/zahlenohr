import type { VoiceParams } from '@/core/types';

type Listener = () => void;

export interface SpeakOptions extends VoiceParams {
  /** Called once when the text has been read out (or speaking failed / was cut off by the guard). */
  onDone?: () => void;
  /** Called right before speaking starts and after it ends, e.g. to play background noise. */
  onStart?: () => void;
  onStop?: () => void;
}

/**
 * Text-to-speech with the browser's Web Speech API, limited to German voices.
 * Keeps track of the current utterance so a newer one always wins.
 */
export class SpeechService {
  readonly supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  private list: SpeechSynthesisVoice[] = [];
  private voiceListeners = new Set<Listener>();
  private speakingListeners = new Set<(speaking: boolean) => void>();
  private id = 0;
  private guard: ReturnType<typeof setTimeout> | undefined;
  private stopHook: (() => void) | undefined;

  constructor() {
    if (!this.supported) return;
    const load = () => this.loadVoices();
    load();
    speechSynthesis.addEventListener?.('voiceschanged', load);
    // Some browsers fill the list late and never fire the event.
    setTimeout(load, 600);
    setTimeout(load, 2000);
  }

  get voices(): readonly SpeechSynthesisVoice[] {
    return this.list;
  }

  findVoice(uri: string | null): SpeechSynthesisVoice | undefined {
    return uri ? this.list.find((v) => v.voiceURI === uri) : undefined;
  }

  onVoicesChanged(l: Listener): () => void {
    this.voiceListeners.add(l);
    return () => this.voiceListeners.delete(l);
  }

  onSpeakingChanged(l: (speaking: boolean) => void): () => void {
    this.speakingListeners.add(l);
    return () => this.speakingListeners.delete(l);
  }

  speak(text: string, opts: SpeakOptions): void {
    if (!this.supported) {
      opts.onDone?.();
      return;
    }
    const id = ++this.id;
    const u = new SpeechSynthesisUtterance(text);
    const voice = this.findVoice(opts.voiceURI);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else u.lang = 'de-DE';
    u.rate = Math.max(0.5, Math.min(1.6, opts.rate));
    u.pitch = opts.pitch || 1;
    let finished = false;
    const done = () => {
      if (finished || id !== this.id) return;
      finished = true;
      clearTimeout(this.guard);
      this.finish();
      opts.onDone?.();
    };
    u.onend = done;
    u.onerror = done;
    this.stopHook = opts.onStop;
    opts.onStart?.();
    this.emitSpeaking(true);
    clearTimeout(this.guard);
    // Safety net: some browsers never fire onend.
    this.guard = setTimeout(done, 2500 + (text.length * 85) / u.rate);
    const go = () => {
      if (id !== this.id) return;
      try {
        speechSynthesis.resume();
      } catch {
        /* ignore */
      }
      speechSynthesis.speak(u);
    };
    // Speak inside the click handler when possible: iOS Safari only allows speech started directly by a tap.
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
      setTimeout(go, 80);
    } else go();
  }

  stop(): void {
    this.id++;
    clearTimeout(this.guard);
    if (this.supported) speechSynthesis.cancel();
    this.finish();
  }

  private finish(): void {
    this.stopHook?.();
    this.stopHook = undefined;
    this.emitSpeaking(false);
  }

  private emitSpeaking(on: boolean): void {
    this.speakingListeners.forEach((l) => l(on));
  }

  private loadVoices(): void {
    this.list = speechSynthesis.getVoices().filter((v) => /^de([-_]|$)/i.test(v.lang));
    this.voiceListeners.forEach((l) => l());
  }
}
