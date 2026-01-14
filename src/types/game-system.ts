/**
 * Common Game System Types
 * Unified interfaces that work across D&D 5e and Daggerheart
 */

import type { DnD5eCreature, DnD5eCombatCreature, DnD5eSpell } from "./dnd5e";
import type { DaggerheartCreature, DaggerheartCombatCreature } from "./daggerheart";

// ============================================
// GAME SYSTEM IDENTIFIERS
// ============================================

export type GameSystem = "DND5E" | "DAGGERHEART";

export const GAME_SYSTEM_LABELS: Record<GameSystem, string> = {
  DND5E: "D&D 5th Edition",
  DAGGERHEART: "Daggerheart",
};

export const GAME_SYSTEM_SHORT_LABELS: Record<GameSystem, string> = {
  DND5E: "D&D 5e",
  DAGGERHEART: "Daggerheart",
};

// ============================================
// UNIFIED CREATURE TYPE
// ============================================

export type Creature = DnD5eCreature | DaggerheartCreature;
export type CombatCreature = DnD5eCombatCreature | DaggerheartCombatCreature;

// Type guards
export function isDnD5eCreature(creature: Creature): creature is DnD5eCreature {
  return "armor_class" in creature && "abilities" in creature;
}

export function isDaggerheartCreature(creature: Creature): creature is DaggerheartCreature {
  return "tier" in creature && "thresholds" in creature;
}

export function isDnD5eCombatCreature(
  creature: CombatCreature
): creature is DnD5eCombatCreature {
  return "armorClass" in creature && "stats" in creature && "abilities" in creature.stats;
}

export function isDaggerheartCombatCreature(
  creature: CombatCreature
): creature is DaggerheartCombatCreature {
  return "actionTokens" in creature && "evasion" in creature;
}

// ============================================
// COMBAT STATE
// ============================================

export type CombatStatus = "PREP" | "ACTIVE" | "COMPLETED";

export type Combat = {
  id: string;
  name?: string;
  status: CombatStatus;
  round: number;
  turnIndex: number;
  creatures: CombatCreature[];
  campaignId: string;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================
// PLAYER CHARACTER (simplified, cross-system)
// ============================================

export type PlayerCharacter = {
  id: string;
  name: string;
  gameSystem: GameSystem;
  userId: string;
  imageUrl?: string;
  stats: PlayerCharacterStats;
  createdAt: Date;
  updatedAt: Date;
};

export type PlayerCharacterStats = {
  // Common fields
  level: number;
  class: string;
  race?: string; // D&D
  ancestry?: string; // Daggerheart

  // Health
  maxHp: number;
  currentHp?: number;

  // Defense
  armorClass?: number; // D&D
  evasion?: number; // Daggerheart

  // Abilities (D&D)
  abilities?: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };

  // Passives
  passivePerception?: number;
  passiveInsight?: number;

  // Additional data
  [key: string]: unknown;
};

// ============================================
// INITIATIVE HELPERS
// ============================================

/**
 * Sort creatures by initiative (descending), then by sortOrder
 */
export function sortByInitiative<T extends { initiative: number; sortOrder: number }>(
  creatures: T[]
): T[] {
  return [...creatures].sort((a, b) => {
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative;
    }
    return a.sortOrder - b.sortOrder;
  });
}

/**
 * Get the creature whose turn it is
 */
export function getCurrentCreature(
  creatures: CombatCreature[],
  turnIndex: number
): CombatCreature | undefined {
  const sorted = sortByInitiative(creatures);
  return sorted[turnIndex];
}

/**
 * Advance to the next turn, wrapping to next round if needed
 */
export function advanceTurn(
  turnIndex: number,
  creatureCount: number,
  currentRound: number
): { turnIndex: number; round: number } {
  const nextIndex = turnIndex + 1;
  if (nextIndex >= creatureCount) {
    return { turnIndex: 0, round: currentRound + 1 };
  }
  return { turnIndex: nextIndex, round: currentRound };
}

// ============================================
// STATUS EFFECTS
// ============================================

export const DND5E_CONDITIONS = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Invisible",
  "Paralyzed",
  "Petrified",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious",
  "Exhaustion 1",
  "Exhaustion 2",
  "Exhaustion 3",
  "Exhaustion 4",
  "Exhaustion 5",
  "Exhaustion 6",
] as const;

export type DnD5eCondition = (typeof DND5E_CONDITIONS)[number];

export const DAGGERHEART_CONDITIONS = [
  "Frightened",
  "Restrained",
  "Vulnerable",
  "Hidden",
  "Marked",
] as const;

export type DaggerheartCondition = (typeof DAGGERHEART_CONDITIONS)[number];

/**
 * Get available conditions for a game system
 */
export function getConditionsForSystem(system: GameSystem): readonly string[] {
  switch (system) {
    case "DND5E":
      return DND5E_CONDITIONS;
    case "DAGGERHEART":
      return DAGGERHEART_CONDITIONS;
  }
}
