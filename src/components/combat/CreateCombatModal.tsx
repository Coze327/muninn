"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Alert,
  Group,
  Grid,
  Text,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  DifficultyDisplay,
  XPBudgetSummary,
  PartyPanel,
  SelectedMonsterList,
  MonsterSearch,
} from "@/components/encounter-builder";
import type {
  PartyConfig,
  SelectedCreature,
  PCData,
} from "@/types/encounter-builder";
import {
  calculateTotalXP,
  calculateMonsterCount,
  calculateAdjustedXP,
  calculatePartyThresholds,
  getEncounterMultiplier,
  calculateXPPerPlayer,
} from "@/lib/dnd5e/encounter-calculator";

type Combat = {
  id: string;
  name: string | null;
  status: string;
  round: number;
  createdAt: string;
  updatedAt: string;
};

type CreateCombatModalProps = {
  opened: boolean;
  onClose: () => void;
  onCreated: (combat: Combat) => void;
  campaignId: string;
  gameSystem?: string;
};

export function CreateCombatModal({
  opened,
  onClose,
  onCreated,
  campaignId,
  gameSystem = "5E",
}: CreateCombatModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCreatures, setSelectedCreatures] = useState<SelectedCreature[]>(
    []
  );
  const [partyConfig, setPartyConfig] = useState<PartyConfig>({
    size: 4,
    averageLevel: 1,
    levels: [1, 1, 1, 1],
    isOverridden: false,
  });

  const form = useForm({
    initialValues: {
      name: "",
    },
  });

  // Separate PCs and monsters for calculations
  const selectedPCs = selectedCreatures.filter((c) => c.sourceType === "pc");
  const selectedMonsters = selectedCreatures.filter(
    (c) => c.sourceType !== "pc"
  );

  // Calculate encounter metrics (only monsters contribute to XP/difficulty)
  const encounterMetrics = useMemo(() => {
    const monstersForCalc = selectedMonsters.map((m) => ({
      xp: m.xp,
      quantity: m.quantity,
    }));

    const totalXP = calculateTotalXP(monstersForCalc);
    const monsterCount = calculateMonsterCount(monstersForCalc);
    const multiplier = getEncounterMultiplier(monsterCount, partyConfig.size);
    const adjustedXP = calculateAdjustedXP(
      totalXP,
      monsterCount,
      partyConfig.size
    );
    const thresholds = calculatePartyThresholds(partyConfig.levels);
    const xpPerPlayer = calculateXPPerPlayer(totalXP, partyConfig.size);

    return {
      totalXP,
      monsterCount,
      multiplier,
      adjustedXP,
      thresholds,
      xpPerPlayer,
    };
  }, [selectedMonsters, partyConfig]);

  // Handle party config changes
  const handlePartyChange = useCallback((config: PartyConfig) => {
    setPartyConfig(config);
  }, []);

  // Handle PC toggle (checkbox in PartyPanel)
  const handlePCToggle = useCallback((pc: PCData, selected: boolean) => {
    if (selected) {
      // Add PC to selected creatures
      const newPC: SelectedCreature = {
        id: `pc-${pc.id}`,
        sourceId: pc.id,
        sourceType: "pc",
        name: pc.name,
        challengeRating: null,
        xp: 0,
        quantity: 1,
        stats: pc.stats,
        level: pc.level,
        class: pc.class,
      };
      setSelectedCreatures((prev) => [...prev, newPC]);
    } else {
      // Remove PC from selected creatures
      setSelectedCreatures((prev) =>
        prev.filter((c) => !(c.sourceType === "pc" && c.sourceId === pc.id))
      );
    }
  }, []);

  // Handle adding a monster
  const handleAddMonster = useCallback((monster: SelectedCreature) => {
    setSelectedCreatures((prev) => {
      // Check if we already have this monster (by sourceId, exclude PCs)
      const existing = prev.find(
        (m) => m.sourceId === monster.sourceId && m.sourceType !== "pc"
      );
      if (existing) {
        // Increment quantity of existing
        return prev.map((m) =>
          m.sourceId === monster.sourceId && m.sourceType !== "pc"
            ? { ...m, quantity: Math.min(m.quantity + 1, 20) }
            : m
        );
      }
      // Add new monster
      return [...prev, monster];
    });
  }, []);

  // Handle updating monster quantity
  const handleUpdateQuantity = useCallback((id: string, quantity: number) => {
    setSelectedCreatures((prev) =>
      prev.map((m) => (m.id === id ? { ...m, quantity } : m))
    );
  }, []);

  // Handle removing a creature (PC or monster)
  const handleRemoveCreature = useCallback((id: string) => {
    setSelectedCreatures((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Submit handler - create encounter with optional creatures
  const handleSubmit = async (
    values: typeof form.values,
    includeCreatures: boolean
  ) => {
    setError(null);
    setLoading(true);

    try {
      const payload: {
        campaignId: string;
        name: string | null;
        creatures?: Array<{
          sourceId: string;
          sourceType: string;
          quantity: number;
          stats: string;
          name: string;
        }>;
      } = {
        campaignId,
        name: values.name || null,
      };

      if (includeCreatures && selectedCreatures.length > 0) {
        payload.creatures = selectedCreatures.map((c) => ({
          sourceId: c.sourceId,
          sourceType: c.sourceType,
          quantity: c.quantity,
          stats: c.stats,
          name: c.name,
        }));
      }

      const response = await fetch("/api/combats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      handleClose();
      onCreated(result.data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setError(null);
    setSelectedCreatures([]);
    onClose();
  };

  const hasCreatures = selectedCreatures.length > 0;

  // Build button label
  const getCreateButtonLabel = () => {
    const parts: string[] = [];
    if (selectedPCs.length > 0) {
      parts.push(`${selectedPCs.length} PC${selectedPCs.length !== 1 ? "s" : ""}`);
    }
    if (encounterMetrics.monsterCount > 0) {
      parts.push(
        `${encounterMetrics.monsterCount} Monster${encounterMetrics.monsterCount !== 1 ? "s" : ""}`
      );
    }
    if (parts.length === 0) {
      return "Create";
    }
    return `Create with ${parts.join(" & ")}`;
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="New Encounter"
      size="xl"
    >
      <Stack gap="md">
        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        {/* Party and Difficulty Section */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <PartyPanel
              campaignId={campaignId}
              selectedCreatures={selectedCreatures}
              onPartyChange={handlePartyChange}
              onPCToggle={handlePCToggle}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="sm">
              <DifficultyDisplay
                adjustedXP={encounterMetrics.adjustedXP}
                thresholds={encounterMetrics.thresholds}
              />
              <XPBudgetSummary
                totalXP={encounterMetrics.totalXP}
                adjustedXP={encounterMetrics.adjustedXP}
                multiplier={encounterMetrics.multiplier}
                xpPerPlayer={encounterMetrics.xpPerPlayer}
                partySize={partyConfig.size}
              />
            </Stack>
          </Grid.Col>
        </Grid>

        <Divider />

        {/* Selected Monsters */}
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Monsters ({encounterMetrics.monsterCount})
          </Text>
          <SelectedMonsterList
            creatures={selectedCreatures}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveCreature}
          />
        </Stack>

        {/* Monster Search */}
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Add Monsters
          </Text>
          <MonsterSearch
            gameSystem={gameSystem}
            selectedCreatures={selectedCreatures}
            onAddMonster={handleAddMonster}
          />
        </Stack>

        <Divider />

        {/* Encounter Name */}
        <TextInput
          label="Encounter Name"
          placeholder="e.g., Goblin Ambush (optional)"
          {...form.getInputProps("name")}
        />

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="light"
            onClick={() => handleSubmit(form.values, false)}
            loading={loading}
          >
            Create Empty
          </Button>
          {hasCreatures && (
            <Button
              onClick={() => handleSubmit(form.values, true)}
              loading={loading}
            >
              {getCreateButtonLabel()}
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
