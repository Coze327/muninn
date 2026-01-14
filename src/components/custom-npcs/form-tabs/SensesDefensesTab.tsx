'use client';

import { Stack, Grid, NumberInput, TextInput, TagsInput } from '@mantine/core';

export interface SensesDefensesTabProps {
  // Senses
  passivePerception: number;
  setPassivePerception: (value: number) => void;
  darkvision: string;
  setDarkvision: (value: string) => void;
  blindsight: string;
  setBlindsight: (value: string) => void;
  tremorsense: string;
  setTremorsense: (value: string) => void;
  truesight: string;
  setTruesight: (value: string) => void;

  // Defenses
  damageVulnerabilities: string[];
  setDamageVulnerabilities: (value: string[]) => void;
  damageResistances: string[];
  setDamageResistances: (value: string[]) => void;
  damageImmunities: string[];
  setDamageImmunities: (value: string[]) => void;
  conditionImmunities: string[];
  setConditionImmunities: (value: string[]) => void;
}

export function SensesDefensesTab(props: SensesDefensesTabProps) {
  const {
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
    damageVulnerabilities,
    setDamageVulnerabilities,
    damageResistances,
    setDamageResistances,
    damageImmunities,
    setDamageImmunities,
    conditionImmunities,
    setConditionImmunities,
  } = props;

  return (
    <Stack gap="md">
      <NumberInput
        label="Passive Perception"
        min={1}
        max={30}
        value={passivePerception}
        onChange={(value) => setPassivePerception(typeof value === 'number' ? value : 10)}
        required
      />

      <Grid>
        <Grid.Col span={6}>
          <TextInput
            label="Darkvision"
            placeholder="e.g., 60 ft."
            value={darkvision}
            onChange={(e) => setDarkvision(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Blindsight"
            placeholder="e.g., 30 ft."
            value={blindsight}
            onChange={(e) => setBlindsight(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Tremorsense"
            placeholder="e.g., 60 ft."
            value={tremorsense}
            onChange={(e) => setTremorsense(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Truesight"
            placeholder="e.g., 120 ft."
            value={truesight}
            onChange={(e) => setTruesight(e.target.value)}
          />
        </Grid.Col>
      </Grid>

      <TagsInput
        label="Damage Vulnerabilities"
        placeholder="Enter damage types"
        value={damageVulnerabilities}
        onChange={setDamageVulnerabilities}
      />

      <TagsInput
        label="Damage Resistances"
        placeholder="Enter damage types"
        value={damageResistances}
        onChange={setDamageResistances}
      />

      <TagsInput
        label="Damage Immunities"
        placeholder="Enter damage types"
        value={damageImmunities}
        onChange={setDamageImmunities}
      />

      <TagsInput
        label="Condition Immunities"
        placeholder="Enter conditions"
        value={conditionImmunities}
        onChange={setConditionImmunities}
      />
    </Stack>
  );
}
