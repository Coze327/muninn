'use client';

import { Stack, Group, Button, Accordion, Alert } from '@mantine/core';
import { PiPlus } from 'react-icons/pi';
import type { DnD5eSpecialAbility } from '@/types/dnd5e';
import { SpecialAbilityInput } from '../form-inputs/SpecialAbilityInput';

export interface SpecialAbilitiesTabProps {
  specialAbilities: DnD5eSpecialAbility[];
  setSpecialAbilities: (value: DnD5eSpecialAbility[]) => void;
}

export function SpecialAbilitiesTab(props: SpecialAbilitiesTabProps) {
  const { specialAbilities, setSpecialAbilities } = props;

  return (
    <Stack gap="md">
      <Group justify="space-between" mb="xs">
        <p style={{ fontSize: 14, fontWeight: 500 }}>Special Abilities</p>
        <Button
          size="xs"
          variant="light"
          leftSection={<PiPlus size={16} />}
          onClick={() => setSpecialAbilities([...specialAbilities, { name: '', desc: '' }])}>
          Add Special Ability
        </Button>
      </Group>

      {specialAbilities.length > 0 ? (
        <Accordion>
          {specialAbilities.map((ability, index) => (
            <SpecialAbilityInput
              key={index}
              ability={ability}
              index={index}
              onChange={(updatedAbility) =>
                setSpecialAbilities(specialAbilities.map((a, i) => (i === index ? updatedAbility : a)))
              }
              onRemove={() => setSpecialAbilities(specialAbilities.filter((_, i) => i !== index))}
            />
          ))}
        </Accordion>
      ) : (
        <Alert variant="light">No special abilities added yet</Alert>
      )}
    </Stack>
  );
}
