/**
 * D&D 5e Encounter Difficulty Calculator
 * Based on the Dungeon Master's Guide encounter building rules
 */

/** CR to XP conversion table from the DMG */
export const CR_TO_XP: Record<number, number> = {
  0: 10,
  0.125: 25, // CR 1/8
  0.25: 50, // CR 1/4
  0.5: 100, // CR 1/2
  1: 200,
  2: 450,
  3: 700,
  4: 1100,
  5: 1800,
  6: 2300,
  7: 2900,
  8: 3900,
  9: 5000,
  10: 5900,
  11: 7200,
  12: 8400,
  13: 10000,
  14: 11500,
  15: 13000,
  16: 15000,
  17: 18000,
  18: 20000,
  19: 22000,
  20: 25000,
  21: 33000,
  22: 41000,
  23: 50000,
  24: 62000,
  25: 75000,
  26: 90000,
  27: 105000,
  28: 120000,
  29: 135000,
  30: 155000,
};

/** XP thresholds per character level */
export const XP_THRESHOLDS: Record<
  number,
  { easy: number; medium: number; hard: number; deadly: number }
> = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
};

/** Encounter multipliers based on monster count */
const MULTIPLIER_TIERS = [1, 1.5, 2, 2.5, 3, 4];

export type DifficultyRating = "Trivial" | "Easy" | "Medium" | "Hard" | "Deadly";

export type PartyThresholds = {
  easy: number;
  medium: number;
  hard: number;
  deadly: number;
};

/**
 * Get XP value for a given Challenge Rating
 */
export function getXPFromCR(cr: number): number {
  return CR_TO_XP[cr] ?? 0;
}

/**
 * Get base encounter multiplier by monster count
 */
function getBaseMultiplierIndex(monsterCount: number): number {
  if (monsterCount <= 1) return 0; // 1x
  if (monsterCount === 2) return 1; // 1.5x
  if (monsterCount <= 6) return 2; // 2x
  if (monsterCount <= 10) return 3; // 2.5x
  if (monsterCount <= 14) return 4; // 3x
  return 5; // 4x
}

/**
 * Calculate encounter multiplier based on monster count and party size
 * Smaller parties face effectively harder encounters
 * Larger parties face effectively easier encounters
 */
export function getEncounterMultiplier(
  monsterCount: number,
  partySize: number
): number {
  if (monsterCount === 0) return 1;

  let multiplierIndex = getBaseMultiplierIndex(monsterCount);

  // Adjust for party size
  if (partySize < 3) {
    // Small party: bump multiplier up one tier
    multiplierIndex = Math.min(multiplierIndex + 1, MULTIPLIER_TIERS.length - 1);
  } else if (partySize >= 6) {
    // Large party: bump multiplier down one tier
    multiplierIndex = Math.max(multiplierIndex - 1, 0);
  }

  return MULTIPLIER_TIERS[multiplierIndex];
}

/**
 * Calculate total base XP for all monsters
 */
export function calculateTotalXP(
  monsters: { xp: number; quantity: number }[]
): number {
  return monsters.reduce((sum, m) => sum + m.xp * m.quantity, 0);
}

/**
 * Calculate total monster count
 */
export function calculateMonsterCount(
  monsters: { quantity: number }[]
): number {
  return monsters.reduce((sum, m) => sum + m.quantity, 0);
}

/**
 * Calculate adjusted XP (total XP * encounter multiplier)
 */
export function calculateAdjustedXP(
  totalXP: number,
  monsterCount: number,
  partySize: number
): number {
  const multiplier = getEncounterMultiplier(monsterCount, partySize);
  return Math.floor(totalXP * multiplier);
}

/**
 * Calculate party's XP thresholds by summing individual character thresholds
 */
export function calculatePartyThresholds(levels: number[]): PartyThresholds {
  const thresholds = { easy: 0, medium: 0, hard: 0, deadly: 0 };

  for (const level of levels) {
    const clampedLevel = Math.max(1, Math.min(20, level));
    const levelThresholds = XP_THRESHOLDS[clampedLevel];
    thresholds.easy += levelThresholds.easy;
    thresholds.medium += levelThresholds.medium;
    thresholds.hard += levelThresholds.hard;
    thresholds.deadly += levelThresholds.deadly;
  }

  return thresholds;
}

/**
 * Calculate party thresholds from party size and average level
 * (convenience function when individual levels aren't available)
 */
export function calculatePartyThresholdsFromAverage(
  partySize: number,
  averageLevel: number
): PartyThresholds {
  const levels = Array(partySize).fill(Math.round(averageLevel));
  return calculatePartyThresholds(levels);
}

/**
 * Determine encounter difficulty rating based on adjusted XP vs party thresholds
 */
export function getDifficultyRating(
  adjustedXP: number,
  thresholds: PartyThresholds
): DifficultyRating {
  if (adjustedXP >= thresholds.deadly) return "Deadly";
  if (adjustedXP >= thresholds.hard) return "Hard";
  if (adjustedXP >= thresholds.medium) return "Medium";
  if (adjustedXP >= thresholds.easy) return "Easy";
  return "Trivial";
}

/**
 * Get color for difficulty rating (for UI display)
 */
export function getDifficultyColor(rating: DifficultyRating): string {
  switch (rating) {
    case "Trivial":
      return "gray";
    case "Easy":
      return "green";
    case "Medium":
      return "yellow";
    case "Hard":
      return "orange";
    case "Deadly":
      return "red";
  }
}

/**
 * Calculate XP per player (for award purposes, uses base XP not adjusted)
 */
export function calculateXPPerPlayer(
  totalXP: number,
  partySize: number
): number {
  if (partySize === 0) return 0;
  return Math.floor(totalXP / partySize);
}

/**
 * Format XP number with commas for display
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString();
}
