'use client';

import { Stack, Textarea, Group, Button, Accordion, Alert } from '@mantine/core';
import { PiPlus } from 'react-icons/pi';
import type { DnD5eAction } from '@/types/dnd5e';
import { ActionInput } from '../form-inputs/ActionInput';

export interface ActionsTabProps {
  multiattackDesc: string;
  setMultiattackDesc: (value: string) => void;
  actions: DnD5eAction[];
  setActions: (value: DnD5eAction[]) => void;
}

export function ActionsTab(props: ActionsTabProps) {
  const { multiattackDesc, setMultiattackDesc, actions, setActions } = props;

  return (
    <Stack gap="md">
      <Textarea
        label="Multiattack"
        placeholder="Description of multiattack (leave empty if none)"
        value={multiattackDesc}
        onChange={(e) => setMultiattackDesc(e.target.value)}
        minRows={2}
      />

      <div>
        <Group justify="space-between" mb="xs">
          <p style={{ fontSize: 14, fontWeight: 500 }}>Actions</p>
          <Button
            size="xs"
            variant="light"
            leftSection={<PiPlus size={16} />}
            onClick={() => setActions([...actions, { name: '', desc: '', damage: [] }])}>
            Add Action
          </Button>
        </Group>

        {actions.length > 0 ? (
          <Accordion>
            {actions.map((action, index) => (
              <ActionInput
                key={index}
                action={action}
                index={index}
                onChange={(updated) => setActions(actions.map((a, i) => (i === index ? updated : a)))}
                onRemove={() => setActions(actions.filter((_, i) => i !== index))}
              />
            ))}
          </Accordion>
        ) : (
          <Alert variant="light">No actions added yet</Alert>
        )}
      </div>
    </Stack>
  );
}
