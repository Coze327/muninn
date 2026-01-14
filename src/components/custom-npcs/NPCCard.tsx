'use client';

import { Card, Text, Group, Badge, Stack } from '@mantine/core';
import { formatChallengeRating, getArmorClass, parseHitPoints } from '@/types/dnd5e';
import type { DnD5eCreature } from '@/types/dnd5e';

type NPCCardProps = {
  npc: {
    id: string;
    name: string;
    stats: string;
  };
  onClick: () => void;
};

export function NPCCard({ npc, onClick }: NPCCardProps) {
  let stats: Partial<DnD5eCreature>;
  try {
    stats = JSON.parse(npc.stats);
  } catch {
    stats = {};
  }

  const size = stats.size || 'Medium';
  const type = stats.type || 'Unknown';
  const cr = stats.challenge_rating !== undefined ? formatChallengeRating(stats.challenge_rating) : '0';
  const ac = stats.armor_class ? getArmorClass(stats.armor_class) : 10;
  const hp = stats.hit_points_roll ? parseHitPoints(stats.hit_points_roll).average : 0;

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
            {npc.name}
          </Text>
          <Badge variant="light" size="sm" color="red">
            CR {cr}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed">
          {size} {type}
        </Text>

        <Group gap="md">
          <div>
            <Text size="xs" c="dimmed">
              AC
            </Text>
            <Text fw={500} size="sm">{ac}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              HP
            </Text>
            <Text fw={500} size="sm">{hp}</Text>
          </div>
        </Group>
      </Stack>
    </Card>
  );
}
