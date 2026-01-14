'use client';

import { Stack, Group, TextInput, Button, ActionIcon } from '@mantine/core';
import { PiTrash } from 'react-icons/pi';
import type { DnD5eDamage } from '@/types/dnd5e';

type DamageInputProps = {
  damage: DnD5eDamage[];
  onChange: (damage: DnD5eDamage[]) => void;
  label?: string;
};

export function DamageInput({ damage, onChange, label = 'Damage' }: DamageInputProps) {
  const handleAddDamage = () => {
    onChange([...damage, { damage_dice: '', damage_type: '' }]);
  };

  const handleRemoveDamage = (index: number) => {
    onChange(damage.filter((_, i) => i !== index));
  };

  const handleUpdateDamage = (index: number, field: 'damage_dice' | 'damage_type', value: string) => {
    onChange(
      damage.map((d, i) =>
        i === index ? { ...d, [field]: value } : d
      )
    );
  };

  return (
    <Stack gap="xs">
      {damage.map((d, index) => (
        <Group key={index} wrap="nowrap" align="flex-end">
          <TextInput
            label={index === 0 ? `${label} Dice` : undefined}
            placeholder="e.g., 2d6+3"
            value={d.damage_dice}
            onChange={(e) => handleUpdateDamage(index, 'damage_dice', e.target.value)}
            style={{ flex: 1 }}
          />
          <TextInput
            label={index === 0 ? 'Type' : undefined}
            placeholder="e.g., Piercing"
            value={d.damage_type}
            onChange={(e) => handleUpdateDamage(index, 'damage_type', e.target.value)}
            style={{ flex: 1 }}
          />
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => handleRemoveDamage(index)}
            aria-label="Remove damage">
            <PiTrash size={16} />
          </ActionIcon>
        </Group>
      ))}
      <Button onClick={handleAddDamage} variant="light" size="xs">
        + Add Damage
      </Button>
    </Stack>
  );
}
