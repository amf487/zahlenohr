import type { RegionChoice, RegionId } from './types';
import { pick } from './random';

export interface Region {
  id: RegionId;
  name: string;
  zh: string;
  countryCode: string;
  /** Short sentence openers like "Also." that make the voice output more varied. */
  openers: readonly string[];
}

export const REGIONS: Readonly<Record<RegionId, Region>> = {
  DE: {
    id: 'DE',
    name: 'Deutschland',
    zh: '德国',
    countryCode: '49',
    openers: ['Also. ', 'Okay. ', 'Moment. ', 'Na gut. ', 'Alles klar. ', 'Gut. ', 'So. '],
  },
  AT: {
    id: 'AT',
    name: 'Österreich',
    zh: '奥地利',
    countryCode: '43',
    openers: ['Also. ', 'Okay. ', 'Moment. ', 'Na gut. ', 'Passt. ', 'Gut. ', 'So. '],
  },
  CH: {
    id: 'CH',
    name: 'Schweiz',
    zh: '瑞士',
    countryCode: '41',
    openers: ['Also. ', 'Okay. ', 'Moment. ', 'Gut. ', 'Alles klar. ', 'So. ', 'Super. '],
  },
};

export const REGION_IDS: readonly RegionId[] = ['DE', 'AT', 'CH'];

export const resolveRegion = (choice: RegionChoice): RegionId =>
  choice === 'mix' ? pick(REGION_IDS) : choice;

/** Builds per-region lists: shared entries plus each region's own. */
export function regional<T>(common: readonly T[], own: Readonly<Record<RegionId, readonly T[]>>) {
  return {
    DE: [...common, ...own.DE],
    AT: [...common, ...own.AT],
    CH: [...common, ...own.CH],
  } as Readonly<Record<RegionId, readonly T[]>>;
}
