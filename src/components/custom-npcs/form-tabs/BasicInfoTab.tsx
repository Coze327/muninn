'use client';

import { Stack, Grid, TextInput, Select, NumberInput } from '@mantine/core';
import type { DnD5eSize } from '@/types/dnd5e';
import { SIZE_OPTIONS } from '../form-constants';

export interface BasicInfoTabProps {
  name: string;
  setName: (value: string) => void;
  index: string;
  setIndex: (value: string) => void;
  size: DnD5eSize;
  setSize: (value: DnD5eSize) => void;
  type: string;
  setType: (value: string) => void;
  alignment: string;
  setAlignment: (value: string) => void;
  cr: number;
  setCr: (value: number) => void;
  proficiencyBonus: number;
  setProficiencyBonus: (value: number) => void;
  xp: number;
  setXp: (value: number) => void;
  languages: string;
  setLanguages: (value: string) => void;
}

export function BasicInfoTab(props: BasicInfoTabProps) {
  const {
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
  } = props;

  return (
    <Stack gap="md">
      <Grid>
        <Grid.Col span={8}>
          <TextInput
            label="Name"
            placeholder="e.g., Goblin Boss"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <TextInput
            label="Index"
            placeholder="Auto-generated"
            value={index}
            onChange={(e) => setIndex(e.target.value)}
            required
          />
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={4}>
          <Select
            label="Size"
            data={SIZE_OPTIONS}
            value={size}
            onChange={(value) => setSize(value as DnD5eSize)}
            required
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <TextInput
            label="Type"
            placeholder="e.g., humanoid"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <TextInput
            label="Alignment"
            placeholder="e.g., chaotic evil"
            value={alignment}
            onChange={(e) => setAlignment(e.target.value)}
            required
          />
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={4}>
          <NumberInput
            label="Challenge Rating"
            min={0}
            max={30}
            step={0.125}
            decimalScale={3}
            value={cr}
            onChange={(value) => setCr(typeof value === 'number' ? value : 0.5)}
            required
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            label="Proficiency Bonus"
            min={2}
            max={9}
            value={proficiencyBonus}
            onChange={(value) => setProficiencyBonus(typeof value === 'number' ? value : 2)}
            required
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            label="XP"
            min={0}
            value={xp}
            onChange={(value) => setXp(typeof value === 'number' ? value : 0)}
            required
          />
        </Grid.Col>
      </Grid>

      <TextInput
        label="Languages"
        placeholder="e.g., Common, Goblin"
        value={languages}
        onChange={(e) => setLanguages(e.target.value)}
        required
      />
    </Stack>
  );
}
