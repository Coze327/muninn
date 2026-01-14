/**
 * Daggerheart Type Definitions
 * Placeholder - expand when Daggerheart data is available
 */

// ============================================
// CREATURE TYPES
// ============================================

export type DaggerheartTier = 1 | 2 | 3 | 4;

export type DaggerheartDomain =
  | "Arcana"
  | "Blade"
  | "Bone"
  | "Codex"
  | "Grace"
  | "Midnight"
  | "Sage"
  | "Splendor"
  | "Valor";

export type DaggerheartCreature = {
  index: string;
  name: string;
  tier: DaggerheartTier;
  description?: string;

  // Core stats
  hitPoints: number;
  stress: number;
  evasion: number;
  thresholds: {
    minor: number;
    major: number;
    severe: number;
  };

  // Traits
  traits?: string[];

  // Actions
  actions: DaggerheartAction[];

  // Special features
  features?: DaggerheartFeature[];

  // Optional fields
  instinct?: string;
  fear?: string;
};

export type DaggerheartAction = {
  name: string;
  type: "attack" | "ability" | "reaction";
  description: string;
  damage?: string;
  range?: string;
  cost?: string; // Stress cost or other resource
};

export type DaggerheartFeature = {
  name: string;
  description: string;
  domain?: DaggerheartDomain;
};

// ============================================
// COMBAT CREATURE (instance in combat)
// ============================================

export type DaggerheartCombatCreature = {
  id: string;
  name: string;
  identifier?: string;

  // Action tracker (Daggerheart uses action tokens)
  actionTokens: number;

  // Health tracking
  currentHp: number;
  maxHp: number;
  currentStress: number;
  maxStress: number;

  // Defense
  evasion: number;

  // Status
  conditions: string[];
  markedTargets?: string[]; // IDs of marked creatures

  // Turn tracking
  initiative: number;
  turnNumber: number;
  sortOrder: number;

  // Source reference
  sourceType: "creature" | "custom" | "pc";
  sourceId?: string;

  // Full stats snapshot
  stats: DaggerheartCreature;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get difficulty tier label
 */
export function getTierLabel(tier: DaggerheartTier): string {
  const labels: Record<DaggerheartTier, string> = {
    1: "Tier 1 (Level 1-4)",
    2: "Tier 2 (Level 5-8)",
    3: "Tier 3 (Level 9-12)",
    4: "Tier 4 (Level 13+)",
  };
  return labels[tier];
}
