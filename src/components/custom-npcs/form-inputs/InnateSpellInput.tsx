'use client';

import { Stack, TextInput, NumberInput, Select, ActionIcon, Accordion, Box, Text, Grid } from '@mantine/core';
import { PiTrash } from 'react-icons/pi';
import type { DnD5eInnateSpell } from '@/types/dnd5e';

type InnateSpellInputProps = {
  spell: DnD5eInnateSpell;
  index: number;
  onChange: (spell: DnD5eInnateSpell) => void;
  onRemove: () => void;
};

export function InnateSpellInput({ spell, index, onChange, onRemove }: InnateSpellInputProps) {
  return (
    <Accordion.Item value={`innate-spell-${index}`}>
      <Box style={{ position: 'relative' }}>
        <Accordion.Control>
          <Text fw={500}>{spell.name || `Innate Spell ${index + 1}`}</Text>
        </Accordion.Control>
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={onRemove}
          aria-label="Remove innate spell"
          style={{
            position: 'absolute',
            top: '8px',
            right: '40px',
            zIndex: 1,
          }}>
          <PiTrash size={16} />
        </ActionIcon>
      </Box>
      <Accordion.Panel>
        <Stack gap="md">
          <TextInput
            label="Spell Name"
            placeholder="e.g., Misty Step"
            value={spell.name}
            onChange={(e) => onChange({ ...spell, name: e.target.value })}
            required
          />

          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Spell Level"
                placeholder="0-9"
                min={0}
                max={9}
                value={spell.level}
                onChange={(value) => onChange({ ...spell, level: typeof value === 'number' ? value : 0 })}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Usage Type"
                placeholder="Select usage type"
                data={[
                  { value: 'at will', label: 'At Will' },
                  { value: 'per day', label: 'Per Day' },
                ]}
                value={spell.usage.type}
                onChange={(value) =>
                  onChange({ ...spell, usage: { ...spell.usage, type: value || 'at will' } })
                }
                required
              />
            </Grid.Col>
          </Grid>

          {spell.usage.type === 'per day' && (
            <NumberInput
              label="Times Per Day"
              placeholder="1-9"
              min={1}
              max={9}
              value={spell.usage.times || 1}
              onChange={(value) =>
                onChange({ ...spell, usage: { ...spell.usage, times: typeof value === 'number' ? value : 1 } })
              }
              required
            />
          )}
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
