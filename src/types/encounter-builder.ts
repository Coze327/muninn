/**
 * Types for the Encounter Builder feature
 */

export type SelectedCreature = {
  /** Unique ID for this selection (for React keys) */
  id: string;
  /** ID of the source creature/custom creature/PC */
  sourceId: string;
  /** Type of source */
  sourceType: "creature" | "custom" | "pc";
  /** Creature/PC name */
  name: string;
  /** Challenge rating (decimal, e.g., 0.25 for CR 1/4) - null for PCs */
  challengeRating: number | null;
  /** XP value for one creature - 0 for PCs */
  xp: number;
  /** Number of this creature to add (always 1 for PCs) */
  quantity: number;
  /** Full stats JSON string */
  stats: string;
  /** PC level (only for PCs) */
  level?: number;
  /** PC class (only for PCs) */
  class?: string;
};

/** @deprecated Use SelectedCreature instead */
export type SelectedMonster = SelectedCreature;

export type PartyConfig = {
  /** Number of party members */
  size: number;
  /** Average party level (1-20) */
  averageLevel: number;
  /** Individual character levels (when available) */
  levels: number[];
  /** Whether manual override is enabled */
  isOverridden: boolean;
};

export type PCData = {
  id: string;
  name: string;
  level: number;
  class?: string;
  stats: string;
};

export type MonsterSearchResult = {
  id: string;
  index: string | null;
  name: string;
  size: string | null;
  type: string | null;
  challengeRating: number | null;
  sourceType: "creature" | "custom" | "pc";
  stats: string;
};
