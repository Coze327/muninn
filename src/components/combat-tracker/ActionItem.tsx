'use client';

import { Paper, Group, Stack, Text, Button, Badge, Tooltip } from '@mantine/core';
import { DamageTypeIcon } from './DamageTypeIcon';
import type { ContextMenuState } from './RollContextMenu';

export type Action = {
  name: string;
  desc: string;
  attack_bonus?: number;
  damage?: Array<{
    damage_dice: string;
    damage_type: string;
  }>;
  options?: Array<{
    name: string;
    damage: Array<{
      damage_dice: string;
      damage_type: string;
    }>;
  }>;
  dc?: {
    type: string;
    value: number;
    success: 'none' | 'half';
  };
};

type ActionItemProps = {
  action: Action;
  onAttackRoll?: (notation: string) => void;
  onDamageRoll?: (notation: string, damageTypes: string) => void;
  onAttackContextMenu?: (
    e: React.MouseEvent,
    notation: string,
    actionName: string
  ) => void;
  onDamageContextMenu?: (
    e: React.MouseEvent,
    notation: string,
    rollName: string,
    actionName: string
  ) => void;
};

export function ActionItem({
  action,
  onAttackRoll,
  onDamageRoll,
  onAttackContextMenu,
  onDamageContextMenu,
}: ActionItemProps) {
  const damageData = action.damage || [];
  const damageParts = damageData.map((d) => d.damage_dice);
  const damageTypes = damageData.map((d) => d.damage_type).join(' + ');

  return (
    <Paper withBorder p='sm' mb='sm'>
      <Group justify='space-between' align='flex-start' wrap='nowrap'>
        <Stack gap='xs' style={{ flex: 1, marginRight: '0.5rem' }}>
          <Group gap='xs' align='center'>
            <Text fw={600}>{action.name}</Text>
            {action.dc && (
              <Badge variant='light' color='blue' size='sm'>
                DC {action.dc.value} {action.dc.type} save
              </Badge>
            )}
          </Group>
          <Text size='sm' c='dimmed' style={{ whiteSpace: 'pre-wrap' }}>
            {action.desc}
          </Text>
        </Stack>
        {(action.attack_bonus !== undefined || action.damage || action.dc) && (
          <Stack gap='xs' align='flex-end' style={{ flexShrink: 0 }}>
            <Group gap='sm' wrap='nowrap' align='flex-start'>
              {/* Attack Roll Button */}
              {action.attack_bonus !== undefined && (
                <Stack gap={2} align='center' style={{ alignSelf: 'center' }}>
                  <Text size='xs' c='dimmed' fw={500}>
                    To Hit
                  </Text>
                  <Button
                    size='xs'
                    variant='light'
                    onClick={() => {
                      const notation = `1d20+${action.attack_bonus}`;
                      onAttackRoll?.(notation);
                    }}
                    onContextMenu={(e) => {
                      if (onAttackContextMenu) {
                        e.preventDefault();
                        const notation = `1d20+${action.attack_bonus}`;
                        onAttackContextMenu(e, notation, action.name);
                      }
                    }}>
                    +{action.attack_bonus}
                  </Button>
                </Stack>
              )}

              {/* Damage Roll Buttons */}
              {action.options && action.options.length > 0 ? (
                <Stack gap={2} align='center'>
                  <Text size='xs' c='dimmed' fw={500}>
                    Damage
                  </Text>
                  <Stack gap={4}>
                    {action.options
                      .filter((option) => option.damage && option.damage.length > 0)
                      .map((option, idx) => {
                        const optionDamageParts = option.damage.map(
                          (d) => d.damage_dice
                        );
                        const optionDamageTypes = option.damage
                          .map((d) => d.damage_type)
                          .join(' + ');
                        const optionNotation = optionDamageParts.join('+');

                        return (
                          <Tooltip
                            key={idx}
                            label={`${option.name} (${optionDamageTypes})`}
                            withArrow>
                            <Button
                              size='xs'
                              variant='light'
                              color='red'
                              py={6}
                              h='auto'
                              onClick={() => {
                                onDamageRoll?.(optionNotation, optionDamageTypes);
                              }}
                              onContextMenu={(e) => {
                                if (onDamageContextMenu) {
                                  e.preventDefault();
                                  onDamageContextMenu(
                                    e,
                                    optionNotation,
                                    `${option.name} (${optionDamageTypes})`,
                                    action.name
                                  );
                                }
                              }}>
                              <Stack gap={6}>
                                {option.damage.map((dmg, i) => (
                                  <Group key={i} gap={4} wrap='nowrap'>
                                    <DamageTypeIcon damageType={dmg.damage_type} />
                                    <Text size='xs'>{dmg.damage_dice}</Text>
                                  </Group>
                                ))}
                              </Stack>
                            </Button>
                          </Tooltip>
                        );
                      })}
                  </Stack>
                </Stack>
              ) : action.damage && action.damage.length > 0 ? (
                <Stack gap={2} align='center'>
                  <Text size='xs' c='dimmed' fw={500}>
                    Damage
                  </Text>
                  <Tooltip label={damageTypes} withArrow>
                    <Button
                      size='xs'
                      variant='light'
                      color='red'
                      py={6}
                      h='auto'
                      onClick={() => {
                        const notation = damageParts.join('+');
                        onDamageRoll?.(notation, damageTypes);
                      }}
                      onContextMenu={(e) => {
                        if (onDamageContextMenu) {
                          e.preventDefault();
                          const notation = damageParts.join('+');
                          onDamageContextMenu(
                            e,
                            notation,
                            `Damage (${damageTypes})`,
                            action.name
                          );
                        }
                      }}>
                      <Stack gap={6}>
                        {damageData.map((dmg, i) => (
                          <Group key={i} gap={4} wrap='nowrap'>
                            <DamageTypeIcon damageType={dmg.damage_type} />
                            <Text size='xs'>{dmg.damage_dice}</Text>
                          </Group>
                        ))}
                      </Stack>
                    </Button>
                  </Tooltip>
                </Stack>
              ) : null}
            </Group>
          </Stack>
        )}
      </Group>
    </Paper>
  );
}
