import type { DnD5eCreature, DnD5eAction, DnD5eSpecialAbility, DnD5eLegendaryAction, DnD5eInnateSpell } from '@/types/dnd5e';

export interface NPCFormState {
  // Basic Info
  index: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  cr: number;
  proficiencyBonus: number;
  xp: number;
  languages: string;

  // Abilities
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;

  // Saving Throws
  savingThrows: { [key: string]: { enabled: boolean; value: number } };

  // Skills
  skills: { [skillName: string]: number };

  // AC & HP
  acValue: number;
  acType: string;
  armorItems: { index: string; name: string }[];
  hitPointsRoll: string;

  // Speed
  speedWalk: string;
  speedFly: string;
  speedSwim: string;
  speedClimb: string;
  speedBurrow: string;
  speedHover: boolean;

  // Senses
  passivePerception: number;
  darkvision: string;
  blindsight: string;
  tremorsense: string;
  truesight: string;

  // Defenses
  damageVulnerabilities: string[];
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];

  // Combat
  multiattackDesc: string;
  actions: DnD5eAction[];
  specialAbilities: DnD5eSpecialAbility[];
  legendaryActions: DnD5eLegendaryAction[];
  reactions: DnD5eAction[];

  // Spellcasting
  spellcastingType: 'none' | 'prepared' | 'innate';
  spellAbility: string;
  spellDC: number;
  spellAttackBonus: number;
  spellSlotsLevel1: number;
  spellSlotsLevel2: number;
  spellSlotsLevel3: number;
  spellSlotsLevel4: number;
  spellSlotsLevel5: number;
  spellSlotsLevel6: number;
  spellSlotsLevel7: number;
  spellSlotsLevel8: number;
  spellSlotsLevel9: number;
  atWillSpells: string[];
  cantrips: string[];
  level1Spells: string[];
  level2Spells: string[];
  level3Spells: string[];
  level4Spells: string[];
  level5Spells: string[];
  level6Spells: string[];
  level7Spells: string[];
  level8Spells: string[];
  level9Spells: string[];
  innateAbility: string;
  innateDC: number;
  innateSpells: DnD5eInnateSpell[];
  componentsRequired: string[];
}

export function buildCreatureStats(formState: NPCFormState): Partial<DnD5eCreature> {
  const {
    index,
    name,
    size,
    type,
    alignment,
    cr,
    proficiencyBonus,
    xp,
    languages,
    str,
    dex,
    con,
    int,
    wis,
    cha,
    savingThrows,
    skills,
    acValue,
    acType,
    armorItems,
    hitPointsRoll,
    speedWalk,
    speedFly,
    speedSwim,
    speedClimb,
    speedBurrow,
    speedHover,
    passivePerception,
    darkvision,
    blindsight,
    tremorsense,
    truesight,
    damageVulnerabilities,
    damageResistances,
    damageImmunities,
    conditionImmunities,
    multiattackDesc,
    actions,
    specialAbilities,
    legendaryActions,
    reactions,
    spellcastingType,
    spellAbility,
    spellDC,
    spellAttackBonus,
    spellSlotsLevel1,
    spellSlotsLevel2,
    spellSlotsLevel3,
    spellSlotsLevel4,
    spellSlotsLevel5,
    spellSlotsLevel6,
    spellSlotsLevel7,
    spellSlotsLevel8,
    spellSlotsLevel9,
    atWillSpells,
    cantrips,
    level1Spells,
    level2Spells,
    level3Spells,
    level4Spells,
    level5Spells,
    level6Spells,
    level7Spells,
    level8Spells,
    level9Spells,
    innateAbility,
    innateDC,
    innateSpells,
    componentsRequired,
  } = formState;

  // Build speed object
  const speed: any = { walk: speedWalk };
  if (speedFly) speed.fly = speedFly;
  if (speedSwim) speed.swim = speedSwim;
  if (speedClimb) speed.climb = speedClimb;
  if (speedBurrow) speed.burrow = speedBurrow;
  if (speedHover) speed.hover = true;

  // Build senses object
  const senses: any = { passive_perception: passivePerception };
  if (darkvision) senses.darkvision = darkvision;
  if (blindsight) senses.blindsight = blindsight;
  if (tremorsense) senses.tremorsense = tremorsense;
  if (truesight) senses.truesight = truesight;

  // Build saving throws
  const savingThrowsObj: any = {};
  Object.entries(savingThrows).forEach(([ability, { enabled, value }]) => {
    if (enabled) savingThrowsObj[ability] = value;
  });

  // Build spellcasting object
  let spellcasting: any = undefined;
  if (spellcastingType === 'prepared') {
    const slots: any = {};
    if (spellSlotsLevel1 > 0) slots['1'] = spellSlotsLevel1;
    if (spellSlotsLevel2 > 0) slots['2'] = spellSlotsLevel2;
    if (spellSlotsLevel3 > 0) slots['3'] = spellSlotsLevel3;
    if (spellSlotsLevel4 > 0) slots['4'] = spellSlotsLevel4;
    if (spellSlotsLevel5 > 0) slots['5'] = spellSlotsLevel5;
    if (spellSlotsLevel6 > 0) slots['6'] = spellSlotsLevel6;
    if (spellSlotsLevel7 > 0) slots['7'] = spellSlotsLevel7;
    if (spellSlotsLevel8 > 0) slots['8'] = spellSlotsLevel8;
    if (spellSlotsLevel9 > 0) slots['9'] = spellSlotsLevel9;

    spellcasting = {
      ability: spellAbility,
      dc: spellDC,
      attack_bonus: spellAttackBonus,
      slots,
    };

    if (atWillSpells.length > 0) spellcasting.at_will = atWillSpells;
    if (cantrips.length > 0) spellcasting['0'] = cantrips;
    if (level1Spells.length > 0) spellcasting['1'] = level1Spells;
    if (level2Spells.length > 0) spellcasting['2'] = level2Spells;
    if (level3Spells.length > 0) spellcasting['3'] = level3Spells;
    if (level4Spells.length > 0) spellcasting['4'] = level4Spells;
    if (level5Spells.length > 0) spellcasting['5'] = level5Spells;
    if (level6Spells.length > 0) spellcasting['6'] = level6Spells;
    if (level7Spells.length > 0) spellcasting['7'] = level7Spells;
    if (level8Spells.length > 0) spellcasting['8'] = level8Spells;
    if (level9Spells.length > 0) spellcasting['9'] = level9Spells;
  }

  // Build innate spellcasting object
  let innate_spellcasting: any = undefined;
  if (spellcastingType === 'innate') {
    innate_spellcasting = {
      ability: innateAbility,
      dc: innateDC,
      spells: innateSpells,
    };
    if (componentsRequired.length > 0) {
      innate_spellcasting.components_required = componentsRequired;
    }
  }

  // Build armor_class object
  const armorClass: any = { type: acType, value: acValue };
  if (armorItems.length > 0) {
    armorClass.armor = armorItems;
  }

  // Build creature stats
  const stats: Partial<DnD5eCreature> = {
    index,
    name,
    size: size as any,
    type,
    alignment,
    armor_class: [armorClass],
    hit_points_roll: hitPointsRoll,
    speed,
    abilities: { STR: str, DEX: dex, CON: con, INT: int, WIS: wis, CHA: cha },
    saving_throws: Object.keys(savingThrowsObj).length > 0 ? savingThrowsObj : undefined,
    skills: Object.keys(skills).length > 0 ? skills : undefined,
    damage_vulnerabilities: damageVulnerabilities,
    damage_resistances: damageResistances,
    damage_immunities: damageImmunities,
    condition_immunities: conditionImmunities,
    senses,
    languages,
    challenge_rating: cr,
    proficiency_bonus: proficiencyBonus,
    xp,
    multiattack: multiattackDesc ? { desc: multiattackDesc } : undefined,
    actions,
    special_abilities: specialAbilities,
    spellcasting,
    innate_spellcasting,
    legendary_actions: legendaryActions.length > 0 ? legendaryActions : undefined,
    reactions: reactions.length > 0 ? reactions : undefined,
    forms: [],
  };

  return stats;
}
