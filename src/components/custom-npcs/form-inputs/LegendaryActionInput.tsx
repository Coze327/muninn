'use client';

import { Stack, TextInput, Textarea, NumberInput, ActionIcon, Accordion, Box, Text } from '@mantine/core';
import { PiTrash } from 'react-icons/pi';
import type { DnD5eLegendaryAction } from '@/types/dnd5e';
import { DamageInput } from './DamageInput';

type LegendaryActionInputProps = {
  action: DnD5eLegendaryAction;
  index: number;
  onChange: (action: DnD5eLegendaryAction) => void;
  onRemove: () => void;
};

export function LegendaryActionInput({ action, index, onChange, onRemove }: LegendaryActionInputProps) {
  return (
    <Accordion.Item value={`legendary-action-${index}`}>
      <Box style={{ position: 'relative' }}>
        <Accordion.Control>
          <Text fw={500}>{action.name || `Legendary Action ${index + 1}`}</Text>
        </Accordion.Control>
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={onRemove}
          aria-label="Remove legendary action"
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
            placeholder="e.g., Wing Attack"
            value={action.name}
            onChange={(e) => onChange({ ...action, name: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            placeholder="Full text description of the legendary action"
            value={action.desc}
            onChange={(e) => onChange({ ...action, desc: e.target.value })}
            minRows={3}
            required
          />

          <NumberInput
            label="Attack Bonus (Optional)"
            placeholder="e.g., +8"
            min={-5}
            max={20}
            value={action.attack_bonus || 0}
            onChange={(value) =>
              onChange({ ...action, attack_bonus: typeof value === 'number' ? value : undefined })
            }
          />

          <DamageInput
            damage={action.damage || []}
            onChange={(damage) => onChange({ ...action, damage: damage.length > 0 ? damage : undefined })}
          />
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
