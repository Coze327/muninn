/**
 * D&D 5th Edition Type Definitions
 * Based on SRD data structure from 5e-srd-api
 */

// ============================================
// CREATURE TYPES
// ============================================

export type DnD5eSize = "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";

export type DnD5eAbilities = {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
};

export type DnD5eArmorClass = {
  type: string; // "natural", "dex", "armor", etc.
  value: number;
  armor?: { index: string; name: string }[];
};

export type DnD5eSpeed = {
  walk?: string;
  fly?: string;
  swim?: string;
  burrow?: string;
  climb?: string;
  hover?: boolean;
};

export type DnD5eDamage = {
  damage_dice: string;
  damage_type: string;
};

export type DnD5eDC = {
  type: string; // "CON", "WIS", "DEX", etc.
  value: number;
  success: "none" | "half";
};

export type DnD5eActionOption = {
  name: string;
  damage: DnD5eDamage[];
};

export type DnD5eAction = {
  name: string;
  desc: string;
  attack_bonus?: number;
  dc?: DnD5eDC;
  damage?: DnD5eDamage[];
  options?: DnD5eActionOption[];
  usage?: {
    type: string; // "per day", "recharge on roll", etc.
    times?: number;
    dice?: string;
    min_value?: number;
  };
};

export type DnD5eSpecialAbility = {
  name: string;
  desc: string;
  dc?: DnD5eDC;
  damage?: DnD5eDamage[];
  usage?: {
    type: string;
    times?: number;
    rest_types?: string[];
  };
  spellcasting?: DnD5eSpellcasting;
};

export type DnD5eSpellcasting = {
  ability: string; // "WIS", "INT", "CHA"
  dc: number;
  attack_bonus: number;
  slots?: Record<string, number>; // { "1": 4, "2": 3, ... }
  at_will?: string[]; // Spells castable at will
  [key: string]: any; // Allow numeric keys like "0", "1", "2" for spell lists
};

export type DnD5eInnateSpell = {
  name: string;
  level: number;
  usage: {
    type: string; // "at will" | "per day"
    times?: number; // Number of times per day (omitted for "at will")
  };
};

export type DnD5eInnateSpellcasting = {
  ability: string; // "WIS", "INT", "CHA"
  dc: number;
  components_required?: string[]; // ["V", "S"], ["V"], etc.
  spells: DnD5eInnateSpell[]; // Array of innate spells
};

export type DnD5eLegendaryAction = {
  name: string;
  desc: string;
  attack_bonus?: number;
  damage?: DnD5eDamage[];
};

export type DnD5eSenses = {
  blindsight?: string;
  darkvision?: string;
  tremorsense?: string;
  truesight?: string;
  passive_perception: number;
};

export type DnD5eCreature = {
  index: string;
  name: string;
  size: DnD5eSize;
  type: string; // "humanoid", "beast", "aberration", etc.
  alignment: string;
  armor_class: DnD5eArmorClass[];
  hit_points_roll: string; // "2d8+4"
  speed: DnD5eSpeed;
  abilities: DnD5eAbilities;
  saving_throws?: Partial<Record<keyof DnD5eAbilities, number>>;
  skills?: Record<string, number>;
  damage_vulnerabilities: string[];
  damage_resistances: string[];
  damage_immunities: string[];
  condition_immunities: string[];
  senses: DnD5eSenses;
  languages: string;
  challenge_rating: number;
  proficiency_bonus: number;
  xp: number;
  multiattack?: { desc: string };
  actions: DnD5eAction[];
  special_abilities: DnD5eSpecialAbility[];
  legendary_actions?: DnD5eLegendaryAction[];
  reactions?: DnD5eAction[];
  forms?: unknown[]; // For creatures with alternate forms
  spellcasting?: DnD5eSpellcasting; // For prepared spellcasters
  innate_spellcasting?: DnD5eInnateSpellcasting; // For innate spellcasters
};

// ============================================
// SPELL TYPES
// ============================================

export type DnD5eSpellSchool =
  | "abjuration"
  | "conjuration"
  | "divination"
  | "enchantment"
  | "evocation"
  | "illusion"
  | "necromancy"
  | "transmutation";

export type DnD5eSpellComponent = "V" | "S" | "M";

export type DnD5eSpell = {
  index: string;
  name: string;
  desc: string[];
  range: string;
  components: DnD5eSpellComponent[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number; // 0 = cantrip
  school: { index: DnD5eSpellSchool };
  classes: { index: string }[];
  subclasses?: { index: string }[];
  higher_level?: string[];
  attack_type?: "melee" | "ranged";
  damage?: {
    damage_type?: { index: string };
    damage_at_slot_level?: Record<string, string>;
    damage_at_character_level?: Record<string, string>;
  };
  dc?: {
    dc_type: { index: string };
    dc_success: "none" | "half" | "other";
  };
  heal_at_slot_level?: Record<string, string>;
  area_of_effect?: {
    type: "sphere" | "cone" | "cube" | "line" | "cylinder";
    size: number;
  };
};

// ============================================
// COMBAT CREATURE (instance in combat)
// ============================================

export type DnD5eCombatCreature = {
  id: string;
  name: string;
  identifier?: string; // "Boss", "Alpha", custom label
  initiative: number;
  currentHp: number;
  maxHp: number;
  tempHp?: number;
  armorClass: number;
  statusEffects: string[];
  isConcentrating: boolean;
  concentrationNote?: string;
  spellSlots?: Record<string, { max: number; used: number }>;
  turnNumber: number;
  sortOrder: number;

  // Source reference
  sourceType: "creature" | "custom" | "pc";
  sourceId?: string;

  // Full stats snapshot (frozen at time of adding)
  stats: DnD5eCreature;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate ability modifier from ability score
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Format modifier as string (+2, -1, etc.)
 */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Get the primary AC value from armor_class array
 */
export function getArmorClass(armorClass: DnD5eArmorClass[]): number {
  return armorClass[0]?.value ?? 10;
}

/**
 * Parse hit dice string to get average HP
 * e.g., "2d8+4" -> 13
 */
export function parseHitPoints(hitDice: string): { average: number; max: number } {
  const match = hitDice.match(/(\d+)d(\d+)(?:\+(\d+))?(?:-(\d+))?/);
  if (!match) return { average: 0, max: 0 };

  const [, count, die, bonus = "0", penalty = "0"] = match;
  const numDice = parseInt(count);
  const dieSize = parseInt(die);
  const modifier = parseInt(bonus) - parseInt(penalty);

  const averagePerDie = (dieSize + 1) / 2;
  const average = Math.floor(numDice * averagePerDie + modifier);
  const max = numDice * dieSize + modifier;

  return { average, max };
}

/**
 * Format challenge rating (handles fractional CRs)
 */
export function formatChallengeRating(cr: number): string {
  if (cr === 0.125) return "1/8";
  if (cr === 0.25) return "1/4";
  if (cr === 0.5) return "1/2";
  return cr.toString();
}
