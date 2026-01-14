'use client';

import { Tabs } from '@mantine/core';
import { BasicInfoTab } from './form-tabs/BasicInfoTab';
import { AttributesTab } from './form-tabs/AttributesTab';
import { SensesDefensesTab } from './form-tabs/SensesDefensesTab';
import { ActionsTab } from './form-tabs/ActionsTab';
import { SpecialAbilitiesTab } from './form-tabs/SpecialAbilitiesTab';
import { SpellcastingTab } from './form-tabs/SpellcastingTab';
import { AdvancedTab } from './form-tabs/AdvancedTab';
import type { useNPCForm } from './useNPCForm';

type NPCFormTabsProps = {
  formState: ReturnType<typeof useNPCForm>;
};

export function NPCFormTabs({ formState }: NPCFormTabsProps) {
  return (
    <Tabs defaultValue="basic">
      <Tabs.List>
        <Tabs.Tab value="basic">Basic Info</Tabs.Tab>
        <Tabs.Tab value="attributes">Attributes</Tabs.Tab>
        <Tabs.Tab value="senses">Senses & Defenses</Tabs.Tab>
        <Tabs.Tab value="actions">Actions</Tabs.Tab>
        <Tabs.Tab value="abilities">Special Abilities</Tabs.Tab>
        <Tabs.Tab value="spells">Spellcasting</Tabs.Tab>
        <Tabs.Tab value="advanced">Advanced</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="basic" pt="md">
        <BasicInfoTab
          name={formState.name}
          setName={formState.setName}
          index={formState.index}
          setIndex={formState.setIndex}
          size={formState.size}
          setSize={formState.setSize}
          type={formState.type}
          setType={formState.setType}
          alignment={formState.alignment}
          setAlignment={formState.setAlignment}
          cr={formState.cr}
          setCr={formState.setCr}
          proficiencyBonus={formState.proficiencyBonus}
          setProficiencyBonus={formState.setProficiencyBonus}
          xp={formState.xp}
          setXp={formState.setXp}
          languages={formState.languages}
          setLanguages={formState.setLanguages}
        />
      </Tabs.Panel>

      <Tabs.Panel value="attributes" pt="md">
        <AttributesTab
          str={formState.str}
          setStr={formState.setStr}
          dex={formState.dex}
          setDex={formState.setDex}
          con={formState.con}
          setCon={formState.setCon}
          int={formState.int}
          setInt={formState.setInt}
          wis={formState.wis}
          setWis={formState.setWis}
          cha={formState.cha}
          setCha={formState.setCha}
          savingThrows={formState.savingThrows}
          setSavingThrows={formState.setSavingThrows}
          proficiencyBonus={formState.proficiencyBonus}
          skills={formState.skills}
          setSkills={formState.setSkills}
          acValue={formState.acValue}
          setAcValue={formState.setAcValue}
          acType={formState.acType}
          setAcType={formState.setAcType}
          armorItems={formState.armorItems}
          setArmorItems={formState.setArmorItems}
          hitPointsRoll={formState.hitPointsRoll}
          setHitPointsRoll={formState.setHitPointsRoll}
          speedWalk={formState.speedWalk}
          setSpeedWalk={formState.setSpeedWalk}
          speedFly={formState.speedFly}
          setSpeedFly={formState.setSpeedFly}
          speedSwim={formState.speedSwim}
          setSpeedSwim={formState.setSpeedSwim}
          speedClimb={formState.speedClimb}
          setSpeedClimb={formState.setSpeedClimb}
          speedBurrow={formState.speedBurrow}
          setSpeedBurrow={formState.setSpeedBurrow}
          speedHover={formState.speedHover}
          setSpeedHover={formState.setSpeedHover}
        />
      </Tabs.Panel>

      <Tabs.Panel value="senses" pt="md">
        <SensesDefensesTab
          passivePerception={formState.passivePerception}
          setPassivePerception={formState.setPassivePerception}
          darkvision={formState.darkvision}
          setDarkvision={formState.setDarkvision}
          blindsight={formState.blindsight}
          setBlindsight={formState.setBlindsight}
          tremorsense={formState.tremorsense}
          setTremorsense={formState.setTremorsense}
          truesight={formState.truesight}
          setTruesight={formState.setTruesight}
          damageVulnerabilities={formState.damageVulnerabilities}
          setDamageVulnerabilities={formState.setDamageVulnerabilities}
          damageResistances={formState.damageResistances}
          setDamageResistances={formState.setDamageResistances}
          damageImmunities={formState.damageImmunities}
          setDamageImmunities={formState.setDamageImmunities}
          conditionImmunities={formState.conditionImmunities}
          setConditionImmunities={formState.setConditionImmunities}
        />
      </Tabs.Panel>

      <Tabs.Panel value="actions" pt="md">
        <ActionsTab
          multiattackDesc={formState.multiattackDesc}
          setMultiattackDesc={formState.setMultiattackDesc}
          actions={formState.actions}
          setActions={formState.setActions}
        />
      </Tabs.Panel>

      <Tabs.Panel value="abilities" pt="md">
        <SpecialAbilitiesTab
          specialAbilities={formState.specialAbilities}
          setSpecialAbilities={formState.setSpecialAbilities}
        />
      </Tabs.Panel>

      <Tabs.Panel value="spells" pt="md">
        <SpellcastingTab
          spellcastingType={formState.spellcastingType}
          setSpellcastingType={formState.setSpellcastingType}
          spellAbility={formState.spellAbility}
          setSpellAbility={formState.setSpellAbility}
          spellDC={formState.spellDC}
          setSpellDC={formState.setSpellDC}
          spellAttackBonus={formState.spellAttackBonus}
          setSpellAttackBonus={formState.setSpellAttackBonus}
          spellSlotsLevel1={formState.spellSlotsLevel1}
          setSpellSlotsLevel1={formState.setSpellSlotsLevel1}
          spellSlotsLevel2={formState.spellSlotsLevel2}
          setSpellSlotsLevel2={formState.setSpellSlotsLevel2}
          spellSlotsLevel3={formState.spellSlotsLevel3}
          setSpellSlotsLevel3={formState.setSpellSlotsLevel3}
          spellSlotsLevel4={formState.spellSlotsLevel4}
          setSpellSlotsLevel4={formState.setSpellSlotsLevel4}
          spellSlotsLevel5={formState.spellSlotsLevel5}
          setSpellSlotsLevel5={formState.setSpellSlotsLevel5}
          spellSlotsLevel6={formState.spellSlotsLevel6}
          setSpellSlotsLevel6={formState.setSpellSlotsLevel6}
          spellSlotsLevel7={formState.spellSlotsLevel7}
          setSpellSlotsLevel7={formState.setSpellSlotsLevel7}
          spellSlotsLevel8={formState.spellSlotsLevel8}
          setSpellSlotsLevel8={formState.setSpellSlotsLevel8}
          spellSlotsLevel9={formState.spellSlotsLevel9}
          setSpellSlotsLevel9={formState.setSpellSlotsLevel9}
          atWillSpells={formState.atWillSpells}
          setAtWillSpells={formState.setAtWillSpells}
          cantrips={formState.cantrips}
          setCantrips={formState.setCantrips}
          level1Spells={formState.level1Spells}
          setLevel1Spells={formState.setLevel1Spells}
          level2Spells={formState.level2Spells}
          setLevel2Spells={formState.setLevel2Spells}
          level3Spells={formState.level3Spells}
          setLevel3Spells={formState.setLevel3Spells}
          level4Spells={formState.level4Spells}
          setLevel4Spells={formState.setLevel4Spells}
          level5Spells={formState.level5Spells}
          setLevel5Spells={formState.setLevel5Spells}
          level6Spells={formState.level6Spells}
          setLevel6Spells={formState.setLevel6Spells}
          level7Spells={formState.level7Spells}
          setLevel7Spells={formState.setLevel7Spells}
          level8Spells={formState.level8Spells}
          setLevel8Spells={formState.setLevel8Spells}
          level9Spells={formState.level9Spells}
          setLevel9Spells={formState.setLevel9Spells}
          innateAbility={formState.innateAbility}
          setInnateAbility={formState.setInnateAbility}
          innateDC={formState.innateDC}
          setInnateDC={formState.setInnateDC}
          innateSpells={formState.innateSpells}
          setInnateSpells={formState.setInnateSpells}
          componentsRequired={formState.componentsRequired}
          setComponentsRequired={formState.setComponentsRequired}
        />
      </Tabs.Panel>

      <Tabs.Panel value="advanced" pt="md">
        <AdvancedTab
          legendaryActions={formState.legendaryActions}
          setLegendaryActions={formState.setLegendaryActions}
          reactions={formState.reactions}
          setReactions={formState.setReactions}
        />
      </Tabs.Panel>
    </Tabs>
  );
}
