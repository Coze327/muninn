"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TextInput,
  Paper,
  Text,
  Group,
  Stack,
  Button,
  Badge,
  ScrollArea,
  Loader,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { PiMagnifyingGlass } from "react-icons/pi";
import type {
  SelectedCreature,
  MonsterSearchResult,
} from "@/types/encounter-builder";
import { formatChallengeRating } from "@/types/dnd5e";
import { getXPFromCR, formatXP } from "@/lib/dnd5e/encounter-calculator";

type MonsterSearchProps = {
  gameSystem: string;
  selectedCreatures: SelectedCreature[];
  onAddMonster: (monster: SelectedCreature) => void;
};

export function MonsterSearch({
  gameSystem,
  selectedCreatures,
  onAddMonster,
}: MonsterSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);
  const [results, setResults] = useState<MonsterSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Track which monsters are already selected (exclude PCs from this check)
  const selectedMonsterIds = new Set(
    selectedCreatures
      .filter((c) => c.sourceType !== "pc")
      .map((m) => m.sourceId)
  );

  // Search for monsters
  const searchMonsters = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/creatures/search?q=${encodeURIComponent(query)}&gameSystem=${gameSystem}&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        // Filter out PCs - only show creatures and custom creatures
        const monsters = (data.data || []).filter(
          (r: MonsterSearchResult) => r.sourceType !== "pc"
        );
        setResults(monsters);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }, [gameSystem]);

  useEffect(() => {
    searchMonsters(debouncedQuery);
  }, [debouncedQuery, searchMonsters]);

  // Handle adding a monster
  const handleAddMonster = (result: MonsterSearchResult) => {
    const cr = result.challengeRating ?? 0;
    const xp = getXPFromCR(cr);

    const newMonster: SelectedCreature = {
      id: `${result.id}-${Date.now()}`, // Unique ID for React key
      sourceId: result.id,
      sourceType: result.sourceType as "creature" | "custom",
      name: result.name,
      challengeRating: cr,
      xp,
      quantity: 1,
      stats: result.stats,
    };

    onAddMonster(newMonster);
  };

  return (
    <Stack gap="xs">
      <TextInput
        placeholder="Search monsters..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        leftSection={<PiMagnifyingGlass size={16} />}
        rightSection={loading ? <Loader size="xs" /> : null}
      />

      {results.length > 0 && (
        <Paper p="xs" withBorder>
          <ScrollArea.Autosize mah={200}>
            <Stack gap="xs">
              {results.map((result) => {
                const isSelected = selectedMonsterIds.has(result.id);
                const cr = result.challengeRating ?? 0;
                const xp = getXPFromCR(cr);

                return (
                  <Group
                    key={result.id}
                    justify="space-between"
                    wrap="nowrap"
                    p="xs"
                    style={{
                      borderRadius: 4,
                      background: "var(--mantine-color-dark-6)",
                    }}
                  >
                    <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={500} truncate style={{ flex: 1 }}>
                        {result.name}
                      </Text>
                      {result.sourceType === "custom" && (
                        <Badge size="xs" color="violet">
                          Custom
                        </Badge>
                      )}
                      <Badge size="sm" color="red" variant="light">
                        CR {formatChallengeRating(cr)}
                      </Badge>
                      <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                        {formatXP(xp)} XP
                      </Text>
                    </Group>

                    <Button
                      size="xs"
                      variant={isSelected ? "light" : "filled"}
                      color={isSelected ? "gray" : "blue"}
                      onClick={() => handleAddMonster(result)}
                    >
                      {isSelected ? "Add Another" : "Add"}
                    </Button>
                  </Group>
                );
              })}
            </Stack>
          </ScrollArea.Autosize>
        </Paper>
      )}

      {searchQuery && !loading && results.length === 0 && (
        <Text size="sm" c="dimmed" ta="center">
          No monsters found for &ldquo;{searchQuery}&rdquo;
        </Text>
      )}
    </Stack>
  );
}
