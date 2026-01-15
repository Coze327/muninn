"use client";

import {
  Paper,
  Text,
  Group,
  Stack,
  ActionIcon,
  NumberInput,
  Badge,
  ScrollArea,
} from "@mantine/core";
import { PiTrash } from "react-icons/pi";
import type { SelectedCreature } from "@/types/encounter-builder";
import { formatChallengeRating } from "@/types/dnd5e";
import { formatXP } from "@/lib/dnd5e/encounter-calculator";

type SelectedMonsterListProps = {
  creatures: SelectedCreature[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
};

export function SelectedMonsterList({
  creatures,
  onUpdateQuantity,
  onRemove,
}: SelectedMonsterListProps) {
  // Only show monsters (PCs are managed in PartyPanel)
  const monsters = creatures.filter((c) => c.sourceType !== "pc");

  if (monsters.length === 0) {
    return (
      <Paper p="md" withBorder bg="dark.6">
        <Text size="sm" c="dimmed" ta="center">
          No monsters selected. Search below to add monsters to the encounter.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="xs" withBorder>
      <ScrollArea.Autosize mah={200}>
        <Stack gap="xs">
          {monsters.map((monster) => (
            <Group
              key={monster.id}
              justify="space-between"
              wrap="nowrap"
              p="xs"
              style={{
                borderRadius: 4,
                background: "var(--mantine-color-dark-6)",
              }}
            >
              <Group
                gap="sm"
                wrap="nowrap"
                style={{ flex: 1, minWidth: 0 }}
              >
                <Text size="sm" fw={500} truncate style={{ flex: 1 }}>
                  {monster.name}
                </Text>
                {monster.sourceType === "custom" && (
                  <Badge size="xs" color="violet">
                    Custom
                  </Badge>
                )}
                <Badge size="sm" color="red" variant="light">
                  CR {formatChallengeRating(monster.challengeRating ?? 0)}
                </Badge>
                <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                  {formatXP(monster.xp * monster.quantity)} XP
                </Text>
              </Group>

              <Group gap="xs" wrap="nowrap">
                <NumberInput
                  value={monster.quantity}
                  onChange={(val) =>
                    onUpdateQuantity(monster.id, Number(val) || 1)
                  }
                  min={1}
                  max={20}
                  size="xs"
                  w={60}
                  styles={{
                    input: { textAlign: "center" },
                  }}
                />
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => onRemove(monster.id)}
                  size="sm"
                >
                  <PiTrash size={14} />
                </ActionIcon>
              </Group>
            </Group>
          ))}
        </Stack>
      </ScrollArea.Autosize>
    </Paper>
  );
}
