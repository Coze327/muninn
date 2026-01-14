'use client';

import { Grid, Select, NumberInput } from '@mantine/core';
import type { DnD5eDC } from '@/types/dnd5e';

type DCInputProps = {
  dc: DnD5eDC | undefined;
  onChange: (dc: DnD5eDC | undefined) => void;
  label?: string;
};

const ABILITY_OPTIONS = [
  { value: 'STR', label: 'STR' },
  { value: 'DEX', label: 'DEX' },
  { value: 'CON', label: 'CON' },
  { value: 'INT', label: 'INT' },
  { value: 'WIS', label: 'WIS' },
  { value: 'CHA', label: 'CHA' },
];

const SUCCESS_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'half', label: 'Half Damage' },
];

export function DCInput({ dc, onChange, label = 'Saving Throw' }: DCInputProps) {
  const handleTypeChange = (value: string | null) => {
    if (!value) {
      onChange(undefined);
      return;
    }
    onChange({
      type: value,
      value: dc?.value || 10,
      success: dc?.success || 'none',
    });
  };

  const handleValueChange = (value: number | string) => {
    if (!dc) return;
    onChange({
      ...dc,
      value: typeof value === 'number' ? value : parseInt(value) || 10,
    });
  };

  const handleSuccessChange = (value: string | null) => {
    if (!dc || !value) return;
    onChange({
      ...dc,
      success: value as 'none' | 'half',
    });
  };

  return (
    <Grid>
      <Grid.Col span={4}>
        <Select
          label={label}
          placeholder="None"
          data={ABILITY_OPTIONS}
          value={dc?.type || null}
          onChange={handleTypeChange}
          clearable
        />
      </Grid.Col>
      {dc && (
        <>
          <Grid.Col span={4}>
            <NumberInput
              label="DC Value"
              min={1}
              max={30}
              value={dc.value}
              onChange={handleValueChange}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="On Success"
              data={SUCCESS_OPTIONS}
              value={dc.success}
              onChange={handleSuccessChange}
            />
          </Grid.Col>
        </>
      )}
    </Grid>
  );
}
