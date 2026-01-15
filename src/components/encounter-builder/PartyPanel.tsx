"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  Paper,
  Text,
  Group,
  Stack,
  Checkbox,
  NumberInput,
  Loader,
  ScrollArea,
} from "@mantine/core";
import { PiUsers } from "react-icons/pi";
import type { PartyConfig, PCData, SelectedCreature } from "@/types/encounter-builder";

type PartyPanelProps = {
  campaignId: string;
  selectedCreatures: SelectedCreature[];
  onPartyChange: (config: PartyConfig) => void;
  onPCToggle: (pc: PCData, selected: boolean) => void;
};

export function PartyPanel({
  campaignId,
  selectedCreatures,
  onPartyChange,
  onPCToggle,
}: PartyPanelProps) {
  const [loading, setLoading] = useState(true);
  const [pcs, setPcs] = useState<PCData[]>([]);
  const [isOverridden, setIsOverridden] = useState(false);
  const [manualSize, setManualSize] = useState(4);
  const [manualLevel, setManualLevel] = useState(1);
  const initializedRef = useRef(false);

  // Memoize selected PCs to avoid recalculating on every render
  const selectedPCs = useMemo(
    () => selectedCreatures.filter((c) => c.sourceType === "pc"),
    [selectedCreatures]
  );
  const selectedPCIds = useMemo(
    () => new Set(selectedPCs.map((c) => c.sourceId)),
    [selectedPCs]
  );

  // Fetch campaign PCs (only once)
  useEffect(() => {
    async function fetchPCs() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/player-characters?campaignId=${campaignId}`
        );
        if (response.ok) {
          const data = await response.json();
          const pcData: PCData[] = (data.data || []).map(
            (pc: { id: string; name: string; stats: string }) => {
              let stats: Record<string, unknown> = {};
              try {
                stats = JSON.parse(pc.stats);
              } catch {
                stats = {};
              }
              return {
                id: pc.id,
                name: pc.name,
                level: (stats.level as number) || 1,
                class: stats.class as string | undefined,
                stats: pc.stats,
              };
            }
          );
          setPcs(pcData);

          // Initialize manual values from auto-detected
          if (pcData.length > 0) {
            const avgLevel = Math.round(
              pcData.reduce((sum, pc) => sum + pc.level, 0) / pcData.length
            );
            setManualSize(pcData.length);
            setManualLevel(avgLevel);
          }
        }
      } catch (error) {
        console.error("Failed to fetch PCs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPCs();
  }, [campaignId]);

  // Auto-select all PCs after initial load (only once)
  useEffect(() => {
    if (!loading && pcs.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      pcs.forEach((pc) => {
        onPCToggle(pc, true);
      });
    }
  }, [loading, pcs, onPCToggle]);

  // Update party config when selection changes or override changes
  useEffect(() => {
    // Skip during initial load
    if (loading) return;

    if (isOverridden) {
      onPartyChange({
        size: manualSize,
        averageLevel: manualLevel,
        levels: Array(manualSize).fill(manualLevel),
        isOverridden: true,
      });
    } else {
      const levels = selectedPCs.map((pc) => pc.level ?? 1);
      const avgLevel =
        levels.length > 0
          ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length)
          : 1;
      onPartyChange({
        size: selectedPCs.length,
        averageLevel: avgLevel,
        levels,
        isOverridden: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isOverridden, manualSize, manualLevel, selectedPCs.length]);

  // Computed values for display (based on selected PCs)
  const displaySize = isOverridden ? manualSize : selectedPCs.length;
  const displayLevel = isOverridden
    ? manualLevel
    : selectedPCs.length > 0
      ? Math.round(
          selectedPCs.reduce((sum, pc) => sum + (pc.level ?? 1), 0) /
            selectedPCs.length
        )
      : 1;

  const handlePCCheckboxChange = (pc: PCData, checked: boolean) => {
    onPCToggle(pc, checked);
  };

  return (
    <Paper p="sm" withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <PiUsers size={16} />
            <Text size="sm" fw={500}>
              Party
            </Text>
          </Group>
          {loading && <Loader size="xs" />}
        </Group>

        {!loading && pcs.length === 0 && !isOverridden && (
          <Text size="sm" c="dimmed">
            No PCs in campaign. Use manual entry for difficulty calculation.
          </Text>
        )}

        {!loading && pcs.length > 0 && (
          <ScrollArea.Autosize mah={150}>
            <Stack gap="xs">
              {pcs.map((pc) => (
                <Checkbox
                  key={pc.id}
                  checked={selectedPCIds.has(pc.id)}
                  onChange={(e) =>
                    handlePCCheckboxChange(pc, e.currentTarget.checked)
                  }
                  label={
                    <Group gap="xs">
                      <Text size="sm">{pc.name}</Text>
                      <Text size="xs" c="dimmed">
                        {pc.class ? `${pc.class} ` : ""}Lv {pc.level}
                      </Text>
                    </Group>
                  }
                  size="sm"
                />
              ))}
            </Stack>
          </ScrollArea.Autosize>
        )}

        <Text size="xs" c="dimmed">
          {displaySize} player{displaySize !== 1 ? "s" : ""} selected
          {displaySize > 0 ? `, Avg Lv ${displayLevel}` : ""}
        </Text>

        <Checkbox
          label="Override party size/level"
          checked={isOverridden}
          onChange={(e) => setIsOverridden(e.currentTarget.checked)}
          size="xs"
        />

        {isOverridden && (
          <Group grow>
            <NumberInput
              label="Party size"
              value={manualSize}
              onChange={(val) => setManualSize(Number(val) || 1)}
              min={1}
              max={10}
              size="xs"
            />
            <NumberInput
              label="Average level"
              value={manualLevel}
              onChange={(val) => setManualLevel(Number(val) || 1)}
              min={1}
              max={20}
              size="xs"
            />
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
