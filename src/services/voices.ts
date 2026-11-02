import type { RegionId } from '@/core/types';
import { pick } from '@/core/random';

/** The voice-related part of the settings: "auto", "random", "microsoft" or a voiceURI. */
export type VoicePreference = string;

export const isEdge = (): boolean => /\bEdg\//.test(navigator.userAgent);

export function voiceRegion(v: SpeechSynthesisVoice): RegionId {
  const lang = v.lang.toUpperCase().replace('_', '-');
  if (lang.endsWith('-AT')) return 'AT';
  if (lang.endsWith('-CH')) return 'CH';
  return 'DE';
}

/** Natural/neural voices sound much better than the old system voices. */
export function voiceQuality(v: SpeechSynthesisVoice): number {
  if (/natural|neural|premium|enhanced|online/i.test(v.name)) return 2;
  if (/google/i.test(v.name)) return 1;
  return 0;
}

export const microsoftVoices = (voices: readonly SpeechSynthesisVoice[]) =>
  voices.filter((v) => /microsoft/i.test(v.name));

/** Picks a voice for a question in the given region, following the user's preference. */
export function chooseVoice(
  voices: readonly SpeechSynthesisVoice[],
  region: RegionId,
  preference: VoicePreference,
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const ms = microsoftVoices(voices);
  if (preference === 'microsoft' && ms.length) return pick(ms);
  if (!['auto', 'random', 'microsoft'].includes(preference)) {
    const exact = voices.find((v) => v.voiceURI === preference);
    if (exact) return exact;
  }
  let pool = preference === 'random' ? [...voices] : voices.filter((v) => voiceRegion(v) === region);
  if (!pool.length) pool = voices.filter((v) => voiceRegion(v) === 'DE');
  if (!pool.length) pool = [...voices];
  const best = Math.max(...pool.map(voiceQuality));
  return pick(pool.filter((v) => voiceQuality(v) === best));
}
