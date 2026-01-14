'use client';

import { Stack, TextInput, Textarea, ActionIcon, Accordion, Box, Text } from '@mantine/core';
import { PiTrash } from 'react-icons/pi';
import type { DnD5eSpecialAbility } from '@/types/dnd5e';
import { DCInput } from './DCInput';
import { DamageInput } from './DamageInput';

type SpecialAbilityInputProps = {
  ability: DnD5eSpecialAbility;
  index: number;
  onChange: (ability: DnD5eSpecialAbility) => void;
  onRemove: () => void;
};

export function SpecialAbilityInput({ ability, index, onChange, onRemove }: SpecialAbilityInputProps) {
  return (
    <Accordion.Item value={`ability-${index}`}>
      <Box style={{ position: 'relative' }}>
        <Accordion.Control>
          <Text fw={500}>{ability.name || `Special Ability ${index + 1}`}</Text>
        </Accordion.Control>
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={onRemove}
          aria-label="Remove special ability"
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
            label="Name"
            placeholder="e.g., Pack Tactics"
            value={ability.name}
            onChange={(e) => onChange({ ...ability, name: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            placeholder="Full text description of the special ability"
            value={ability.desc}
            onChange={(e) => onChange({ ...ability, desc: e.target.value })}
            minRows={3}
            required
          />

          <DCInput
            dc={ability.dc}
            onChange={(dc) => onChange({ ...ability, dc })}
            label="Saving Throw (Optional)"
          />

          <DamageInput
            damage={ability.damage || []}
            onChange={(damage) => onChange({ ...ability, damage })}
          />
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
