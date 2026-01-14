'use client';

import { Stack, TextInput, Textarea, NumberInput, Grid, Select, ActionIcon, Group, Text, Accordion, Box, Checkbox, Button, Divider } from '@mantine/core';
import { PiTrash } from 'react-icons/pi';
import type { DnD5eAction } from '@/types/dnd5e';
import { DCInput } from './DCInput';
import { DamageInput } from './DamageInput';

type ActionInputProps = {
  action: DnD5eAction;
  index: number;
  onChange: (action: DnD5eAction) => void;
  onRemove: () => void;
};

const USAGE_TYPE_OPTIONS = [
  { value: 'per day', label: 'Per Day' },
  { value: 'recharge on roll', label: 'Recharge on Roll' },
  { value: 'recharge after rest', label: 'Recharge after Rest' },
];

export function ActionInput({ action, index, onChange, onRemove }: ActionInputProps) {
  const handleUsageTypeChange = (value: string | null) => {
    if (!value) {
      const { usage, ...rest } = action;
      onChange(rest);
      return;
    }
    onChange({
      ...action,
      usage: {
        type: value,
        times: value === 'per day' ? 1 : undefined,
        dice: value === 'recharge on roll' ? '1d6' : undefined,
        min_value: value === 'recharge on roll' ? 5 : undefined,
      },
    });
  };

  return (
    <Accordion.Item value={`action-${index}`}>
      <Box style={{ position: 'relative' }}>
        <Accordion.Control>
          <Text fw={500}>{action.name || `Action ${index + 1}`}</Text>
        </Accordion.Control>
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={onRemove}
          aria-label="Remove action"
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
            placeholder="e.g., Longsword"
            value={action.name}
            onChange={(e) => onChange({ ...action, name: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            placeholder="Full text description of the action"
            value={action.desc}
            onChange={(e) => onChange({ ...action, desc: e.target.value })}
            minRows={3}
            required
          />

          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Attack Bonus"
                placeholder="Leave empty if no attack roll"
                min={-5}
                max={20}
                value={action.attack_bonus || ''}
                onChange={(value) => onChange({ ...action, attack_bonus: typeof value === 'number' ? value : undefined })}
              />
            </Grid.Col>
          </Grid>

          <DCInput
            dc={action.dc}
            onChange={(dc) => onChange({ ...action, dc })}
            label="Saving Throw"
          />

          <Checkbox
            label="Has Options (e.g., versatile weapon)"
            checked={!!action.options && action.options.length > 0}
            onChange={(e) => {
              if (e.currentTarget.checked) {
                onChange({
                  ...action,
                  options: [{ name: '', damage: [] }],
                  damage: [], // Clear main damage when options are enabled
                });
              } else {
                const { options, ...rest } = action;
                onChange(rest);
              }
            }}
          />

          {!action.options || action.options.length === 0 ? (
            <DamageInput
              damage={action.damage || []}
              onChange={(damage) => onChange({ ...action, damage })}
            />
          ) : (
            <Stack gap="sm">
              <Text size="sm" fw={500}>
                Action Options
              </Text>
              {action.options.map((option, optionIndex) => (
                <Box key={optionIndex} style={{ border: '1px solid #dee2e6', borderRadius: '4px', padding: '12px' }}>
                  <Group justify="space-between" mb="xs">
                    <TextInput
                      label="Option Name"
                      placeholder="e.g., One-handed"
                      value={option.name}
                      onChange={(e) => {
                        const updated = [...action.options!];
                        updated[optionIndex] = { ...option, name: e.target.value };
                        onChange({ ...action, options: updated });
                      }}
                      style={{ flex: 1 }}
                    />
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => {
                        const updated = action.options!.filter((_, i) => i !== optionIndex);
                        onChange({ ...action, options: updated.length > 0 ? updated : undefined });
                      }}
                      style={{ marginTop: '24px' }}>
                      <PiTrash size={16} />
                    </ActionIcon>
                  </Group>
                  <DamageInput
                    damage={option.damage}
                    onChange={(damage) => {
                      const updated = [...action.options!];
                      updated[optionIndex] = { ...option, damage };
                      onChange({ ...action, options: updated });
                    }}
                  />
                </Box>
              ))}
              <Button
                variant="light"
                size="xs"
                onClick={() => {
                  onChange({
                    ...action,
                    options: [...(action.options || []), { name: '', damage: [] }],
                  });
                }}>
                Add Option
              </Button>
            </Stack>
          )}

          <Divider />

          <Grid>
            <Grid.Col span={4}>
              <Select
                label="Usage Limitation"
                placeholder="None"
                data={USAGE_TYPE_OPTIONS}
                value={action.usage?.type || null}
                onChange={handleUsageTypeChange}
                clearable
              />
            </Grid.Col>
            {action.usage?.type === 'per day' && (
              <Grid.Col span={4}>
                <NumberInput
                  label="Times per Day"
                  min={1}
                  max={10}
                  value={action.usage.times || 1}
                  onChange={(value) =>
                    onChange({
                      ...action,
                      usage: {
                        ...action.usage,
                        type: 'per day',
                        times: typeof value === 'number' ? value : 1,
                      },
                    })
                  }
                />
              </Grid.Col>
            )}
            {action.usage?.type === 'recharge on roll' && (
              <>
                <Grid.Col span={4}>
                  <TextInput
                    label="Recharge Dice"
                    placeholder="e.g., 1d6"
                    value={action.usage.dice || '1d6'}
                    onChange={(e) =>
                      onChange({
                        ...action,
                        usage: {
                          ...action.usage,
                          type: 'recharge on roll',
                          dice: e.target.value,
                        },
                      })
                    }
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <NumberInput
                    label="Min Value"
                    min={1}
                    max={20}
                    value={action.usage.min_value || 5}
                    onChange={(value) =>
                      onChange({
                        ...action,
                        usage: {
                          ...action.usage,
                          type: 'recharge on roll',
                          min_value: typeof value === 'number' ? value : 5,
                        },
                      })
                    }
                  />
                </Grid.Col>
              </>
            )}
          </Grid>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
