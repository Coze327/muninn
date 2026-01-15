"use client";

import { Group, Text, Stack, Paper } from "@mantine/core";
import { formatXP } from "@/lib/dnd5e/encounter-calculator";

type XPBudgetSummaryProps = {
  totalXP: number;
  adjustedXP: number;
  multiplier: number;
  xpPerPlayer: number;
  partySize: number;
};

export function XPBudgetSummary({
  totalXP,
  adjustedXP,
  multiplier,
  xpPerPlayer,
  partySize,
}: XPBudgetSummaryProps) {
  return (
    <Paper p="sm" withBorder>
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Total XP
          </Text>
          <Text size="sm" fw={500}>
            {formatXP(totalXP)}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Adjusted XP
          </Text>
          <Text size="sm" fw={500}>
            {formatXP(adjustedXP)}{" "}
            <Text span c="dimmed" size="xs">
              ({multiplier}x)
            </Text>
          </Text>
        </Group>

        {partySize > 0 && (
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              XP per player
            </Text>
            <Text size="sm" fw={500}>
              {formatXP(xpPerPlayer)}
            </Text>
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
