import type { DnD5eCreature } from '@/types/dnd5e';

/**
 * Generate index from name (lowercase, hyphens)
 * e.g., "Ancient Red Dragon" -> "ancient-red-dragon"
 */
export function generateIndex(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Calculate proficiency bonus from CR
 */
export function getProficiencyFromCR(cr: number): number {
  if (cr < 0.25) return 2;
  if (cr <= 4) return 2;
  if (cr <= 8) return 3;
  if (cr <= 12) return 4;
  if (cr <= 16) return 5;
  if (cr <= 20) return 6;
  if (cr <= 24) return 7;
  if (cr <= 28) return 8;
  return 9;
}

/**
 * Calculate XP from CR
 */
export function getXPFromCR(cr: number): number {
  const xpTable: Record<number, number> = {
    0: 10,
    0.125: 25,
    0.25: 50,
    0.5: 100,
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
  return xpTable[cr] || 0;
}

/**
 * Validate required fields for a D&D 5e creature
 * Returns array of error messages (empty if valid)
 */
export function validateCreature(creature: Partial<DnD5eCreature>): string[] {
  const errors: string[] = [];

  // Required fields
  if (!creature.index) errors.push('Index is required');
  if (!creature.name) errors.push('Name is required');
  if (!creature.size) errors.push('Size is required');
  if (!creature.type) errors.push('Type is required');
  if (!creature.alignment) errors.push('Alignment is required');
  if (!creature.languages) errors.push('Languages is required');
  if (creature.challenge_rating === undefined || creature.challenge_rating === null) {
    errors.push('Challenge rating is required');
  }
  if (creature.proficiency_bonus === undefined || creature.proficiency_bonus === null) {
    errors.push('Proficiency bonus is required');
  }
  if (creature.xp === undefined || creature.xp === null) {
    errors.push('XP is required');
  }

  // Armor class
  if (!creature.armor_class || creature.armor_class.length === 0) {
    errors.push('At least one armor class entry is required');
  }

  // Hit points
  if (!creature.hit_points_roll) {
    errors.push('Hit points roll is required');
  }

  // Speed
  if (!creature.speed || Object.keys(creature.speed).length === 0) {
    errors.push('At least one speed value is required');
  }

  // Abilities
  if (!creature.abilities) {
    errors.push('Abilities are required');
  } else {
    if (creature.abilities.STR === undefined) errors.push('STR is required');
    if (creature.abilities.DEX === undefined) errors.push('DEX is required');
    if (creature.abilities.CON === undefined) errors.push('CON is required');
    if (creature.abilities.INT === undefined) errors.push('INT is required');
    if (creature.abilities.WIS === undefined) errors.push('WIS is required');
    if (creature.abilities.CHA === undefined) errors.push('CHA is required');
  }

  // Senses
  if (!creature.senses) {
    errors.push('Senses are required');
  } else if (creature.senses.passive_perception === undefined) {
    errors.push('Passive perception is required');
  }

  // Arrays (must exist, but can be empty)
  if (creature.actions === undefined) {
    errors.push('Actions array is required (can be empty)');
  }
  if (creature.special_abilities === undefined) {
    errors.push('Special abilities array is required (can be empty)');
  }
  if (creature.damage_vulnerabilities === undefined) {
    errors.push('Damage vulnerabilities array is required (can be empty)');
  }
  if (creature.damage_resistances === undefined) {
    errors.push('Damage resistances array is required (can be empty)');
  }
  if (creature.damage_immunities === undefined) {
    errors.push('Damage immunities array is required (can be empty)');
  }
  if (creature.condition_immunities === undefined) {
    errors.push('Condition immunities array is required (can be empty)');
  }

  return errors;
}
