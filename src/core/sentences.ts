import type { QuestionDraft, RegionId } from './types';
import { REGIONS } from './regions';
import { chance, pick } from './random';

/**
 * Wraps a quiz phrase into a full sentence. Remembers the last few sentences so the same
 * one does not come up again too soon.
 */
export class SentenceComposer {
  private recent: string[] = [];

  constructor(
    private readonly memory = 8,
    private readonly openerChance = 0.2,
  ) {}

  compose(draft: QuestionDraft, region: RegionId, fullSentence: boolean): string {
    if (!fullSentence || draft.sentences.length === 0) return draft.phraseAlone ?? draft.phrase;
    const opener = chance(this.openerChance) ? pick(REGIONS[region].openers) : '';
    return opener + this.pickTemplate(draft.sentences).replace('{x}', draft.phrase);
  }

  private pickTemplate(list: readonly string[]): string {
    let t = pick(list);
    for (let guard = 0; this.recent.includes(t) && guard < 30; guard++) t = pick(list);
    this.recent.push(t);
    if (this.recent.length > this.memory) this.recent.shift();
    return t;
  }
}
