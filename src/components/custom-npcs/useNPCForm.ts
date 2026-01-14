import { useState, useEffect } from 'react';
import type {
  DnD5eCreature,
  DnD5eSize,
  DnD5eAction,
  DnD5eSpecialAbility,
  DnD5eLegendaryAction,
  DnD5eInnateSpell,
} from '@/types/dnd5e';
import { generateIndex, getProficiencyFromCR, getXPFromCR } from '@/lib/utils/npc-form-helpers';

export interface UseNPCFormOptions {
  templateData?: DnD5eCreature | null;
  isEditing?: boolean;
}

export function useNPCForm({ templateData, isEditing = false }: UseNPCFormOptions = {}) {
  // Basic Info
  const [name, setName] = useState('');
  const [index, setIndex] = useState('');
  const [size, setSize] = useState<DnD5eSize>('Medium');
  const [type, setType] = useState('');
  const [alignment, setAlignment] = useState('');
  const [cr, setCr] = useState<number>(0.5);
  const [proficiencyBonus, setProficiencyBonus] = useState(2);
  const [xp, setXp] = useState(100);
  const [languages, setLanguages] = useState('');

  // Attributes & Defenses
  const [str, setStr] = useState(10);
  const [dex, setDex] = useState(10);
  const [con, setCon] = useState(10);
  const [int, setInt] = useState(10);
  const [wis, setWis] = useState(10);
  const [cha, setCha] = useState(10);

  const [savingThrows, setSavingThrows] = useState<{
    [key: string]: { enabled: boolean; value: number };
  }>({
    STR: { enabled: false, value: 0 },
    DEX: { enabled: false, value: 0 },
    CON: { enabled: false, value: 0 },
    INT: { enabled: false, value: 0 },
    WIS: { enabled: false, value: 0 },
    CHA: { enabled: false, value: 0 },
  });

  const [skills, setSkills] = useState<{ [skillName: string]: number }>({});

  const [acValue, setAcValue] = useState(10);
  const [acType, setAcType] = useState('natural');
  const [armorItems, setArmorItems] = useState<{ index: string; name: string }[]>([]);
  const [hitPointsRoll, setHitPointsRoll] = useState('2d8');
  const [speedWalk, setSpeedWalk] = useState('30 ft.');
  const [speedFly, setSpeedFly] = useState('');
  const [speedSwim, setSpeedSwim] = useState('');
  const [speedClimb, setSpeedClimb] = useState('');
  const [speedBurrow, setSpeedBurrow] = useState('');
  const [speedHover, setSpeedHover] = useState(false);

  // Senses & Defenses
  const [passivePerception, setPassivePerception] = useState(10);
  const [darkvision, setDarkvision] = useState('');
  const [blindsight, setBlindsight] = useState('');
  const [tremorsense, setTremorsense] = useState('');
  const [truesight, setTruesight] = useState('');
  const [damageVulnerabilities, setDamageVulnerabilities] = useState<string[]>([]);
  const [damageResistances, setDamageResistances] = useState<string[]>([]);
  const [damageImmunities, setDamageImmunities] = useState<string[]>([]);
  const [conditionImmunities, setConditionImmunities] = useState<string[]>([]);

  // Actions
  const [multiattackDesc, setMultiattackDesc] = useState('');
  const [actions, setActions] = useState<DnD5eAction[]>([]);

  // Special Abilities
  const [specialAbilities, setSpecialAbilities] = useState<DnD5eSpecialAbility[]>([]);

  // Spellcasting
  const [spellcastingType, setSpellcastingType] = useState<'none' | 'prepared' | 'innate'>('none');
  // Prepared spellcasting
  const [spellAbility, setSpellAbility] = useState('WIS');
  const [spellDC, setSpellDC] = useState(10);
  const [spellAttackBonus, setSpellAttackBonus] = useState(0);
  const [spellSlotsLevel1, setSpellSlotsLevel1] = useState(0);
  const [spellSlotsLevel2, setSpellSlotsLevel2] = useState(0);
  const [spellSlotsLevel3, setSpellSlotsLevel3] = useState(0);
  const [spellSlotsLevel4, setSpellSlotsLevel4] = useState(0);
  const [spellSlotsLevel5, setSpellSlotsLevel5] = useState(0);
  const [spellSlotsLevel6, setSpellSlotsLevel6] = useState(0);
  const [spellSlotsLevel7, setSpellSlotsLevel7] = useState(0);
  const [spellSlotsLevel8, setSpellSlotsLevel8] = useState(0);
  const [spellSlotsLevel9, setSpellSlotsLevel9] = useState(0);
  const [atWillSpells, setAtWillSpells] = useState<string[]>([]);
  const [cantrips, setCantrips] = useState<string[]>([]);
  const [level1Spells, setLevel1Spells] = useState<string[]>([]);
  const [level2Spells, setLevel2Spells] = useState<string[]>([]);
  const [level3Spells, setLevel3Spells] = useState<string[]>([]);
  const [level4Spells, setLevel4Spells] = useState<string[]>([]);
  const [level5Spells, setLevel5Spells] = useState<string[]>([]);
  const [level6Spells, setLevel6Spells] = useState<string[]>([]);
  const [level7Spells, setLevel7Spells] = useState<string[]>([]);
  const [level8Spells, setLevel8Spells] = useState<string[]>([]);
  const [level9Spells, setLevel9Spells] = useState<string[]>([]);
  // Innate spellcasting
  const [innateAbility, setInnateAbility] = useState('CHA');
  const [innateDC, setInnateDC] = useState(10);
  const [innateSpells, setInnateSpells] = useState<DnD5eInnateSpell[]>([]);
  const [componentsRequired, setComponentsRequired] = useState<string[]>([]);

  // Advanced
  const [legendaryActions, setLegendaryActions] = useState<DnD5eLegendaryAction[]>([]);
  const [reactions, setReactions] = useState<DnD5eAction[]>([]);

  // Auto-calculate saving throws when abilities or proficiency changes
  useEffect(() => {
    const calculateModifier = (abilityScore: number) => Math.floor((abilityScore - 10) / 2);

    const abilities = { STR: str, DEX: dex, CON: con, INT: int, WIS: wis, CHA: cha };

    setSavingThrows((current) => {
      const updated = { ...current };
      Object.entries(abilities).forEach(([ability, score]) => {
        if (updated[ability]?.enabled) {
          const modifier = calculateModifier(score);
          updated[ability] = {
            enabled: true,
            value: modifier + proficiencyBonus,
          };
        }
      });
      return updated;
    });
  }, [str, dex, con, int, wis, cha, proficiencyBonus]);

  // Auto-calculate passive perception when WIS changes
  useEffect(() => {
    const wisModifier = Math.floor((wis - 10) / 2);
    setPassivePerception(10 + wisModifier);
  }, [wis]);

  // Auto-update index when name changes
  useEffect(() => {
    if (name && !templateData) {
      setIndex(generateIndex(name));
    }
  }, [name, templateData]);

  // Auto-calculate proficiency and XP when CR changes
  useEffect(() => {
    if (!templateData) {
      setProficiencyBonus(getProficiencyFromCR(cr));
      setXp(getXPFromCR(cr));
    }
  }, [cr, templateData]);

  // Function to populate all fields from template data
  const populateFromTemplate = (data: DnD5eCreature, preserveNameAndIndex = false) => {
    if (preserveNameAndIndex) {
      setName(data.name);
      setIndex(data.index);
    } else {
      const copyName = `${data.name} COPY`;
      setName(copyName);
      setIndex(generateIndex(copyName));
    }
    setSize(data.size);
    setType(data.type);
    setAlignment(data.alignment);
    setCr(data.challenge_rating);
    setProficiencyBonus(data.proficiency_bonus);
    setXp(data.xp);
    setLanguages(data.languages);

    setStr(data.abilities.STR);
    setDex(data.abilities.DEX);
    setCon(data.abilities.CON);
    setInt(data.abilities.INT);
    setWis(data.abilities.WIS);
    setCha(data.abilities.CHA);

    // Populate saving throws
    if (data.saving_throws) {
      setSavingThrows({
        STR: { enabled: 'STR' in data.saving_throws, value: data.saving_throws.STR || 0 },
        DEX: { enabled: 'DEX' in data.saving_throws, value: data.saving_throws.DEX || 0 },
        CON: { enabled: 'CON' in data.saving_throws, value: data.saving_throws.CON || 0 },
        INT: { enabled: 'INT' in data.saving_throws, value: data.saving_throws.INT || 0 },
        WIS: { enabled: 'WIS' in data.saving_throws, value: data.saving_throws.WIS || 0 },
        CHA: { enabled: 'CHA' in data.saving_throws, value: data.saving_throws.CHA || 0 },
      });
    }

    // Populate skills
    if (data.skills) {
      setSkills(data.skills);
    }

    if (data.armor_class[0]) {
      setAcValue(data.armor_class[0].value);
      setAcType(data.armor_class[0].type);
    }

    setHitPointsRoll(data.hit_points_roll);

    setSpeedWalk(data.speed.walk || '30 ft.');
    setSpeedFly(data.speed.fly || '');
    setSpeedSwim(data.speed.swim || '');
    setSpeedClimb(data.speed.climb || '');
    setSpeedBurrow(data.speed.burrow || '');
    setSpeedHover(data.speed.hover || false);

    setPassivePerception(data.senses.passive_perception);
    setDarkvision(data.senses.darkvision || '');
    setBlindsight(data.senses.blindsight || '');
    setTremorsense(data.senses.tremorsense || '');
    setTruesight(data.senses.truesight || '');

    setDamageVulnerabilities(data.damage_vulnerabilities);
    setDamageResistances(data.damage_resistances);
    setDamageImmunities(data.damage_immunities);
    setConditionImmunities(data.condition_immunities);

    setMultiattackDesc(data.multiattack?.desc || '');
    setActions(data.actions);
    setSpecialAbilities(data.special_abilities);

    if (data.legendary_actions) {
      setLegendaryActions(data.legendary_actions);
    }
    if (data.reactions) {
      setReactions(data.reactions);
    }

    // Populate armor items if present
    if (data.armor_class[0]?.armor) {
      setArmorItems(data.armor_class[0].armor);
    }

    // Populate spellcasting
    if (data.spellcasting) {
      setSpellcastingType('prepared');
      setSpellAbility(data.spellcasting.ability || 'WIS');
      setSpellDC(data.spellcasting.dc || 10);
      setSpellAttackBonus(data.spellcasting.attack_bonus || 0);

      // Set spell slots
      if (data.spellcasting.slots) {
        setSpellSlotsLevel1(data.spellcasting.slots['1'] || 0);
        setSpellSlotsLevel2(data.spellcasting.slots['2'] || 0);
        setSpellSlotsLevel3(data.spellcasting.slots['3'] || 0);
        setSpellSlotsLevel4(data.spellcasting.slots['4'] || 0);
        setSpellSlotsLevel5(data.spellcasting.slots['5'] || 0);
        setSpellSlotsLevel6(data.spellcasting.slots['6'] || 0);
        setSpellSlotsLevel7(data.spellcasting.slots['7'] || 0);
        setSpellSlotsLevel8(data.spellcasting.slots['8'] || 0);
        setSpellSlotsLevel9(data.spellcasting.slots['9'] || 0);
      }

      // Set spell lists
      setAtWillSpells(data.spellcasting.at_will || []);
      setCantrips(data.spellcasting['0'] || []);
      setLevel1Spells(data.spellcasting['1'] || []);
      setLevel2Spells(data.spellcasting['2'] || []);
      setLevel3Spells(data.spellcasting['3'] || []);
      setLevel4Spells(data.spellcasting['4'] || []);
      setLevel5Spells(data.spellcasting['5'] || []);
      setLevel6Spells(data.spellcasting['6'] || []);
      setLevel7Spells(data.spellcasting['7'] || []);
      setLevel8Spells(data.spellcasting['8'] || []);
      setLevel9Spells(data.spellcasting['9'] || []);
    } else if (data.innate_spellcasting) {
      setSpellcastingType('innate');
      setInnateAbility(data.innate_spellcasting.ability || 'CHA');
      setInnateDC(data.innate_spellcasting.dc || 10);
      setInnateSpells(data.innate_spellcasting.spells || []);
      setComponentsRequired(data.innate_spellcasting.components_required || []);
    }
  };

  // Pre-populate from template data prop
  useEffect(() => {
    if (templateData) {
      populateFromTemplate(templateData, isEditing);
    }
  }, [templateData, isEditing]);

  // Reset all fields
  const resetForm = () => {
    setName('');
    setIndex('');
    setSize('Medium');
    setType('');
    setAlignment('');
    setCr(0.5);
    setProficiencyBonus(2);
    setXp(100);
    setLanguages('');
    setStr(10);
    setDex(10);
    setCon(10);
    setInt(10);
    setWis(10);
    setCha(10);
    setSavingThrows({
      STR: { enabled: false, value: 0 },
      DEX: { enabled: false, value: 0 },
      CON: { enabled: false, value: 0 },
      INT: { enabled: false, value: 0 },
      WIS: { enabled: false, value: 0 },
      CHA: { enabled: false, value: 0 },
    });
    setSkills({});
    setAcValue(10);
    setAcType('natural');
    setArmorItems([]);
    setHitPointsRoll('2d8');
    setSpeedWalk('30 ft.');
    setSpeedFly('');
    setSpeedSwim('');
    setSpeedClimb('');
    setSpeedBurrow('');
    setSpeedHover(false);
    setPassivePerception(10);
    setDarkvision('');
    setBlindsight('');
    setTremorsense('');
    setTruesight('');
    setDamageVulnerabilities([]);
    setDamageResistances([]);
    setDamageImmunities([]);
    setConditionImmunities([]);
    setMultiattackDesc('');
    setActions([]);
    setSpecialAbilities([]);
    setSpellcastingType('none');
    setComponentsRequired([]);
    setLegendaryActions([]);
    setReactions([]);
  };

  return {
    // Basic Info
    name,
    setName,
    index,
    setIndex,
    size,
    setSize,
    type,
    setType,
    alignment,
    setAlignment,
    cr,
    setCr,
    proficiencyBonus,
    setProficiencyBonus,
    xp,
    setXp,
    languages,
    setLanguages,

    // Attributes
    str,
    setStr,
    dex,
    setDex,
    con,
    setCon,
    int,
    setInt,
    wis,
    setWis,
    cha,
    setCha,

    // Saving Throws
    savingThrows,
    setSavingThrows,

    // Skills
    skills,
    setSkills,

    // AC & HP
    acValue,
    setAcValue,
    acType,
    setAcType,
    armorItems,
    setArmorItems,
    hitPointsRoll,
    setHitPointsRoll,

    // Speed
    speedWalk,
    setSpeedWalk,
    speedFly,
    setSpeedFly,
    speedSwim,
    setSpeedSwim,
    speedClimb,
    setSpeedClimb,
    speedBurrow,
    setSpeedBurrow,
    speedHover,
    setSpeedHover,

    // Senses
    passivePerception,
    setPassivePerception,
    darkvision,
    setDarkvision,
    blindsight,
    setBlindsight,
    tremorsense,
    setTremorsense,
    truesight,
    setTruesight,

    // Defenses
    damageVulnerabilities,
    setDamageVulnerabilities,
    damageResistances,
    setDamageResistances,
    damageImmunities,
    setDamageImmunities,
    conditionImmunities,
    setConditionImmunities,

    // Combat
    multiattackDesc,
    setMultiattackDesc,
    actions,
    setActions,
    specialAbilities,
    setSpecialAbilities,

    // Spellcasting
    spellcastingType,
    setSpellcastingType,
    spellAbility,
    setSpellAbility,
    spellDC,
    setSpellDC,
    spellAttackBonus,
    setSpellAttackBonus,
    spellSlotsLevel1,
    setSpellSlotsLevel1,
    spellSlotsLevel2,
    setSpellSlotsLevel2,
    spellSlotsLevel3,
    setSpellSlotsLevel3,
    spellSlotsLevel4,
    setSpellSlotsLevel4,
    spellSlotsLevel5,
    setSpellSlotsLevel5,
    spellSlotsLevel6,
    setSpellSlotsLevel6,
    spellSlotsLevel7,
    setSpellSlotsLevel7,
    spellSlotsLevel8,
    setSpellSlotsLevel8,
    spellSlotsLevel9,
    setSpellSlotsLevel9,
    atWillSpells,
    setAtWillSpells,
    cantrips,
    setCantrips,
    level1Spells,
    setLevel1Spells,
    level2Spells,
    setLevel2Spells,
    level3Spells,
    setLevel3Spells,
    level4Spells,
    setLevel4Spells,
    level5Spells,
    setLevel5Spells,
    level6Spells,
    setLevel6Spells,
    level7Spells,
    setLevel7Spells,
    level8Spells,
    setLevel8Spells,
    level9Spells,
    setLevel9Spells,
    innateAbility,
    setInnateAbility,
    innateDC,
    setInnateDC,
    innateSpells,
    setInnateSpells,
    componentsRequired,
    setComponentsRequired,

    // Advanced
    legendaryActions,
    setLegendaryActions,
    reactions,
    setReactions,

    // Helper functions
    resetForm,
    populateFromTemplate,
  };
}
