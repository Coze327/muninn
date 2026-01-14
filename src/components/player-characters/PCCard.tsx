'use client';

import { Card, Text, Group, Badge, Stack } from '@mantine/core';

type PCCardProps = {
  pc: {
    id: string;
    name: string;
    stats: string;
  };
  onClick: () => void;
};

export function PCCard({ pc, onClick }: PCCardProps) {
  let stats;
  try {
    stats = JSON.parse(pc.stats);
  } catch {
    stats = {};
  }

  const displayClass = stats.class || 'Unknown';
  const displayRace = stats.race || '';
  const level = stats.level || 1;

  return (
    <Card
      withBorder
      padding="md"
      radius="md"
      style={{ cursor: 'pointer' }}
      onClick={onClick}>
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={600} size="lg" truncate>
            {pc.name}
          </Text>
          <Badge variant="light" size="sm">
            Lvl {level}
          </Badge>
        </Group>

        {displayRace && displayClass && (
          <Text size="sm" c="dimmed">
            {displayRace} {displayClass}
          </Text>
        )}

        {stats.attributes && (
          <Group gap="xs">
            <div>
              <Text size="xs" c="dimmed">
                STR
              </Text>
              <Text fw={500} size="sm">{stats.attributes.strength || 10}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                DEX
              </Text>
              <Text fw={500} size="sm">{stats.attributes.dexterity || 10}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                CON
              </Text>
              <Text fw={500} size="sm">{stats.attributes.constitution || 10}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                INT
              </Text>
              <Text fw={500} size="sm">{stats.attributes.intelligence || 10}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                WIS
              </Text>
              <Text fw={500} size="sm">{stats.attributes.wisdom || 10}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                CHA
              </Text>
              <Text fw={500} size="sm">{stats.attributes.charisma || 10}</Text>
            </div>
          </Group>
        )}
      </Stack>
    </Card>
  );
}
