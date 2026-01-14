import type { DnD5eSize } from '@/types/dnd5e';

export const SIZE_OPTIONS: DnD5eSize[] = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];

export const ABILITY_OPTIONS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const;

export const SPELLCASTING_ABILITY_OPTIONS = [
  { value: 'WIS', label: 'Wisdom' },
  { value: 'INT', label: 'Intelligence' },
  { value: 'CHA', label: 'Charisma' },
] as const;

// Common D&D 5e damage types for autocomplete
export const DAMAGE_TYPES = [
  'acid',
  'bludgeoning',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'piercing',
  'poison',
  'psychic',
  'radiant',
  'slashing',
  'thunder',
] as const;

// Common D&D 5e conditions for autocomplete
export const CONDITION_TYPES = [
  'blinded',
  'charmed',
  'deafened',
  'exhaustion',
  'frightened',
  'grappled',
  'incapacitated',
  'invisible',
  'paralyzed',
  'petrified',
  'poisoned',
  'prone',
  'restrained',
  'stunned',
  'unconscious',
] as const;

// D&D 5e skills
export const SKILL_OPTIONS = [
  'Acrobatics',
  'Animal Handling',
  'Arcana',
  'Athletics',
  'Deception',
  'History',
  'Insight',
  'Intimidation',
  'Investigation',
  'Medicine',
  'Nature',
  'Perception',
  'Performance',
  'Persuasion',
  'Religion',
  'Sleight of Hand',
  'Stealth',
  'Survival',
] as const;
