'use client';

import { Stack, Grid, Select, NumberInput, TagsInput, Radio, Group, Button, Accordion, Checkbox } from '@mantine/core';
import type { DnD5eInnateSpell } from '@/types/dnd5e';
import { SPELLCASTING_ABILITY_OPTIONS } from '../form-constants';
import { InnateSpellInput } from '../form-inputs/InnateSpellInput';

export interface SpellcastingTabProps {
  spellcastingType: 'none' | 'prepared' | 'innate';
  setSpellcastingType: (value: 'none' | 'prepared' | 'innate') => void;

  // Prepared spellcasting
  spellAbility: string;
  setSpellAbility: (value: string) => void;
  spellDC: number;
  setSpellDC: (value: number) => void;
  spellAttackBonus: number;
  setSpellAttackBonus: (value: number) => void;
  spellSlotsLevel1: number;
  setSpellSlotsLevel1: (value: number) => void;
  spellSlotsLevel2: number;
  setSpellSlotsLevel2: (value: number) => void;
  spellSlotsLevel3: number;
  setSpellSlotsLevel3: (value: number) => void;
  spellSlotsLevel4: number;
  setSpellSlotsLevel4: (value: number) => void;
  spellSlotsLevel5: number;
  setSpellSlotsLevel5: (value: number) => void;
  spellSlotsLevel6: number;
  setSpellSlotsLevel6: (value: number) => void;
  spellSlotsLevel7: number;
  setSpellSlotsLevel7: (value: number) => void;
  spellSlotsLevel8: number;
  setSpellSlotsLevel8: (value: number) => void;
  spellSlotsLevel9: number;
  setSpellSlotsLevel9: (value: number) => void;
  atWillSpells: string[];
  setAtWillSpells: (value: string[]) => void;
  cantrips: string[];
  setCantrips: (value: string[]) => void;
  level1Spells: string[];
  setLevel1Spells: (value: string[]) => void;
  level2Spells: string[];
  setLevel2Spells: (value: string[]) => void;
  level3Spells: string[];
  setLevel3Spells: (value: string[]) => void;
  level4Spells: string[];
  setLevel4Spells: (value: string[]) => void;
  level5Spells: string[];
  setLevel5Spells: (value: string[]) => void;
  level6Spells: string[];
  setLevel6Spells: (value: string[]) => void;
  level7Spells: string[];
  setLevel7Spells: (value: string[]) => void;
  level8Spells: string[];
  setLevel8Spells: (value: string[]) => void;
  level9Spells: string[];
  setLevel9Spells: (value: string[]) => void;

  // Innate spellcasting
  innateAbility: string;
  setInnateAbility: (value: string) => void;
  innateDC: number;
  setInnateDC: (value: number) => void;
  innateSpells: DnD5eInnateSpell[];
  setInnateSpells: (value: DnD5eInnateSpell[]) => void;
  componentsRequired: string[];
  setComponentsRequired: (value: string[]) => void;
}

export function SpellcastingTab(props: SpellcastingTabProps) {
  const {
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
  } = props;

  return (
    <Stack gap="md">
      <Radio.Group
        label="Spellcasting Type"
        value={spellcastingType}
        onChange={(value) => setSpellcastingType(value as 'none' | 'prepared' | 'innate')}>
        <Group mt="xs">
          <Radio value="none" label="None" />
          <Radio value="prepared" label="Prepared Spells" />
          <Radio value="innate" label="Innate Spellcasting" />
        </Group>
      </Radio.Group>

      {spellcastingType === 'prepared' && (
        <Stack gap="md">
          <Grid>
            <Grid.Col span={4}>
              <Select
                label="Spellcasting Ability"
                data={SPELLCASTING_ABILITY_OPTIONS}
                value={spellAbility}
                onChange={(value) => setSpellAbility(value || 'WIS')}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Spell Save DC"
                min={1}
                max={30}
                value={spellDC}
                onChange={(value) => setSpellDC(typeof value === 'number' ? value : 10)}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Spell Attack Bonus"
                min={0}
                max={20}
                value={spellAttackBonus}
                onChange={(value) => setSpellAttackBonus(typeof value === 'number' ? value : 0)}
              />
            </Grid.Col>
          </Grid>

          <TagsInput
            label="At Will Spells"
            placeholder="Enter spell names"
            value={atWillSpells}
            onChange={setAtWillSpells}
          />

          <TagsInput
            label="Cantrips (Level 0)"
            placeholder="Enter spell names"
            value={cantrips}
            onChange={setCantrips}
          />

          <TagsInput
            label="1st Level Spells"
            placeholder="Enter spell names"
            value={level1Spells}
            onChange={setLevel1Spells}
          />

          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Level 1 Slots"
                min={0}
                value={spellSlotsLevel1}
                onChange={(value) => setSpellSlotsLevel1(typeof value === 'number' ? value : 0)}
              />
            </Grid.Col>
          </Grid>

          <TagsInput
            label="2nd Level Spells"
            placeholder="Enter spell names"
            value={level2Spells}
            onChange={setLevel2Spells}
          />

          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Level 2 Slots"
                min={0}
                value={spellSlotsLevel2}
                onChange={(value) => setSpellSlotsLevel2(typeof value === 'number' ? value : 0)}
              />
            </Grid.Col>
          </Grid>

          <TagsInput
            label="3rd Level Spells"
            placeholder="Enter spell names"
            value={level3Spells}
            onChange={setLevel3Spells}
          />

          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Level 3 Slots"
                min={0}
                value={spellSlotsLevel3}
                onChange={(value) => setSpellSlotsLevel3(typeof value === 'number' ? value : 0)}
              />
            </Grid.Col>
          </Grid>

          <TagsInput
            label="4th Level Spells"
            placeholder="Enter spell names"
            value={level4Spells}
            onChange={setLevel4Spells}
          />

          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Level 4 Slots"
                min={0}
                value={spellSlotsLevel4}
                onChange={(value) => setSpellSlotsLevel4(typeof value === 'number' ? value : 0)}
              />
            </Grid.Col>
          </Grid>

          <TagsInput
            label="5th Level Spells"
            placeholder="Enter spell names"
            value={level5Spells}
            onChange={setLevel5Spells}
          />

          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Level 5 Slots"
                min={0}
                value={spellSlotsLevel5}
                onChange={(value) => setSpellSlotsLevel5(typeof value === 'number' ? value : 0)}
              />
            </Grid.Col>
          </Grid>

          <TagsInput
            label="6th Level Spells"
            placeholder="Enter spell names"
            value={level6Spells}
            onChange={setLevel6Spells}
          />

          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Level 6 Slots"
                min={0}
                value={spellSlotsLevel6}
                onChange={(value) => setSpellSlotsLevel6(typeof value === 'number' ? value : 0)}
              />
            </Grid.Col>
          </Grid>

          <TagsInput
            label="7th Level Spells"
            placeholder="Enter spell names"
            value={level7Spells}
            onChange={setLevel7Spells}
          />

          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Level 7 Slots"
                min={0}
                value={spellSlotsLevel7}
                onChange={(value) => setSpellSlotsLevel7(typeof value === 'number' ? value : 0)}
              />
            </Grid.Col>
          </Grid>

          <TagsInput
            label="8th Level Spells"
            placeholder="Enter spell names"
            value={level8Spells}
            onChange={setLevel8Spells}
          />

          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Level 8 Slots"
                min={0}
                value={spellSlotsLevel8}
                onChange={(value) => setSpellSlotsLevel8(typeof value === 'number' ? value : 0)}
              />
            </Grid.Col>
          </Grid>

          <TagsInput
            label="9th Level Spells"
            placeholder="Enter spell names"
            value={level9Spells}
            onChange={setLevel9Spells}
          />

          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Level 9 Slots"
                min={0}
                value={spellSlotsLevel9}
                onChange={(value) => setSpellSlotsLevel9(typeof value === 'number' ? value : 0)}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      )}

      {spellcastingType === 'innate' && (
        <Stack gap="md">
          <Grid>
            <Grid.Col span={6}>
              <Select
                label="Innate Ability"
                data={SPELLCASTING_ABILITY_OPTIONS}
                value={innateAbility}
                onChange={(value) => setInnateAbility(value || 'CHA')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Spell Save DC"
                min={1}
                max={30}
                value={innateDC}
                onChange={(value) => setInnateDC(typeof value === 'number' ? value : 10)}
              />
            </Grid.Col>
          </Grid>

          <Checkbox.Group
            label="Components Required"
            value={componentsRequired}
            onChange={setComponentsRequired}>
            <Group mt="xs">
              <Checkbox value="V" label="Verbal" />
              <Checkbox value="S" label="Somatic" />
              <Checkbox value="M" label="Material" />
            </Group>
          </Checkbox.Group>

          {innateSpells.length > 0 && (
            <Accordion variant="contained">
              {innateSpells.map((spell, index) => (
                <InnateSpellInput
                  key={index}
                  spell={spell}
                  index={index}
                  onChange={(updatedSpell) => {
                    const updated = [...innateSpells];
                    updated[index] = updatedSpell;
                    setInnateSpells(updated);
                  }}
                  onRemove={() => {
                    const updated = innateSpells.filter((_, i) => i !== index);
                    setInnateSpells(updated);
                  }}
                />
              ))}
            </Accordion>
          )}

          <Button
            variant="light"
            onClick={() => {
              setInnateSpells([
                ...innateSpells,
                {
                  name: '',
                  level: 0,
                  usage: { type: 'at will' },
                },
              ]);
            }}>
            Add Innate Spell
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
