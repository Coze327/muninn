"use client";

import { Progress, Text, Group, Stack, Badge } from "@mantine/core";
import {
  type PartyThresholds,
  getDifficultyRating,
  getDifficultyColor,
} from "@/lib/dnd5e/encounter-calculator";

type DifficultyDisplayProps = {
  adjustedXP: number;
  thresholds: PartyThresholds;
};

export function DifficultyDisplay({
  adjustedXP,
  thresholds,
}: DifficultyDisplayProps) {
  const rating = getDifficultyRating(adjustedXP, thresholds);
  const color = getDifficultyColor(rating);

  // Calculate progress percentage (cap at deadly * 1.5 for display)
  const maxDisplay = thresholds.deadly * 1.5;
  const progressPercent = Math.min((adjustedXP / maxDisplay) * 100, 100);

  // Calculate segment widths as percentages of maxDisplay
  const easyWidth = (thresholds.easy / maxDisplay) * 100;
  const mediumWidth = ((thresholds.medium - thresholds.easy) / maxDisplay) * 100;
  const hardWidth = ((thresholds.hard - thresholds.medium) / maxDisplay) * 100;
  const deadlyWidth = ((thresholds.deadly - thresholds.hard) / maxDisplay) * 100;

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          Difficulty
        </Text>
        <Badge color={color} size="lg" variant="filled">
          {rating}
        </Badge>
      </Group>

      <Progress.Root size="xl">
        <Progress.Section
          value={Math.min(progressPercent, easyWidth)}
          color="green"
        />
        <Progress.Section
          value={Math.max(
            0,
            Math.min(progressPercent - easyWidth, mediumWidth)
          )}
          color="yellow"
        />
        <Progress.Section
          value={Math.max(
            0,
            Math.min(progressPercent - easyWidth - mediumWidth, hardWidth)
          )}
          color="orange"
        />
        <Progress.Section
          value={Math.max(
            0,
            Math.min(
              progressPercent - easyWidth - mediumWidth - hardWidth,
              deadlyWidth
            )
          )}
          color="red"
        />
        <Progress.Section
          value={Math.max(
            0,
            progressPercent - easyWidth - mediumWidth - hardWidth - deadlyWidth
          )}
          color="red.9"
        />
      </Progress.Root>

      <Group justify="space-between" gap="xs">
        <Text size="xs" c="dimmed">
          Easy
        </Text>
        <Text size="xs" c="dimmed">
          Medium
        </Text>
        <Text size="xs" c="dimmed">
          Hard
        </Text>
        <Text size="xs" c="dimmed">
          Deadly
        </Text>
      </Group>
    </Stack>
  );
}
