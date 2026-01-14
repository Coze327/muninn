'use client';

import { Stack, TextInput, Textarea, NumberInput, ActionIcon, Accordion, Box, Text } from '@mantine/core';
import { PiTrash } from 'react-icons/pi';
import type { DnD5eAction } from '@/types/dnd5e';
import { DCInput } from './DCInput';
import { DamageInput } from './DamageInput';

type ReactionInputProps = {
  reaction: DnD5eAction;
  index: number;
  onChange: (reaction: DnD5eAction) => void;
  onRemove: () => void;
};

export function ReactionInput({ reaction, index, onChange, onRemove }: ReactionInputProps) {
  return (
    <Accordion.Item value={`reaction-${index}`}>
      <Box style={{ position: 'relative' }}>
        <Accordion.Control>
          <Text fw={500}>{reaction.name || `Reaction ${index + 1}`}</Text>
        </Accordion.Control>
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={onRemove}
          aria-label="Remove reaction"
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
            placeholder="e.g., Parry"
            value={reaction.name}
            onChange={(e) => onChange({ ...reaction, name: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            placeholder="Full text description of the reaction"
            value={reaction.desc}
            onChange={(e) => onChange({ ...reaction, desc: e.target.value })}
            minRows={3}
            required
          />

          <NumberInput
            label="Attack Bonus (Optional)"
            placeholder="e.g., +5"
            min={-5}
            max={20}
            value={reaction.attack_bonus || 0}
            onChange={(value) =>
              onChange({ ...reaction, attack_bonus: typeof value === 'number' ? value : undefined })
            }
          />

          <DCInput
            dc={reaction.dc}
            onChange={(dc) => onChange({ ...reaction, dc })}
            label="Saving Throw (Optional)"
          />

          <DamageInput
            damage={reaction.damage || []}
            onChange={(damage) => onChange({ ...reaction, damage: damage.length > 0 ? damage : undefined })}
          />
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
