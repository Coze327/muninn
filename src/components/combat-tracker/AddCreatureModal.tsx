"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  Text,
  Paper,
  Badge,
  NumberInput,
  ScrollArea,
  Loader,
  Center,
  Divider,
  ActionIcon,
  Box,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";

type SearchResult = {
  id: string;
  index: string | null;
  name: string;
  size: string | null;
  type: string | null;
  challengeRating: number | null;
  sourceType: "creature" | "custom" | "pc";
  stats: string;
};

type SelectedCreature = SearchResult & {
  quantity: number;
};

type AddCreatureModalProps = {
  opened: boolean;
  onClose: () => void;
  onAdd: (creatures: SelectedCreature[]) => Promise<void>;
  onUseAsTemplate?: (id: string, sourceType: string) => void;
  gameSystem: string;
};

// Format challenge rating for display
function formatCR(cr: number | null): string {
  if (cr === null) return "—";
  if (cr === 0.125) return "1/8";
  if (cr === 0.25) return "1/4";
  if (cr === 0.5) return "1/2";
  return String(cr);
}

export function AddCreatureModal({
  opened,
  onClose,
  onAdd,
  onUseAsTemplate,
  gameSystem,
}: AddCreatureModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCreatures, setSelectedCreatures] = useState<SelectedCreature[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (opened) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [opened]);

  // Search for creatures when query changes
  const searchCreatures = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/creatures/search?q=${encodeURIComponent(query)}&gameSystem=${gameSystem}`
      );
      const result = await response.json();

      if (result.data) {
        setSearchResults(result.data);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [gameSystem]);

  useEffect(() => {
    searchCreatures(debouncedQuery);
  }, [debouncedQuery, searchCreatures]);

  // Load initial results when modal opens
  useEffect(() => {
    if (opened && searchResults.length === 0 && !searchQuery) {
      // Load some default creatures
      searchCreatures("a");
    }
  }, [opened]);

  // Reset state when modal closes
  useEffect(() => {
    if (!opened) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedCreatures([]);
    }
  }, [opened]);

  const handleAddToSelection = (creature: SearchResult) => {
    const existing = selectedCreatures.find((c) => c.id === creature.id);
    if (existing) {
      // Increment quantity
      setSelectedCreatures(
        selectedCreatures.map((c) =>
          c.id === creature.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      // Add new creature with quantity 1
      setSelectedCreatures([...selectedCreatures, { ...creature, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (creatureId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedCreatures(selectedCreatures.filter((c) => c.id !== creatureId));
    } else {
      setSelectedCreatures(
        selectedCreatures.map((c) =>
          c.id === creatureId ? { ...c, quantity } : c
        )
      );
    }
  };

  const handleRemoveFromSelection = (creatureId: string) => {
    setSelectedCreatures(selectedCreatures.filter((c) => c.id !== creatureId));
  };

  const handleAddToCombat = async () => {
    if (selectedCreatures.length === 0) return;

    setAdding(true);
    try {
      await onAdd(selectedCreatures);
      onClose();
    } catch (error) {
      console.error("Failed to add creatures:", error);
    } finally {
      setAdding(false);
    }
  };

  const totalCreatures = selectedCreatures.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add Creatures to Combat"
      size="lg"
    >
      <Stack gap="md">
        {/* Search Input */}
        <TextInput
          ref={searchInputRef}
          placeholder="Search creatures..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftSection={<Text size="sm">🔍</Text>}
        />

        {/* Search Results */}
        <ScrollArea h={300} offsetScrollbars>
          {loading ? (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          ) : searchResults.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              {searchQuery ? "No creatures found" : "Type to search for creatures"}
            </Text>
          ) : (
            <Stack gap="xs">
              {searchResults.map((creature) => {
                const selected = selectedCreatures.find((c) => c.id === creature.id);
                return (
                  <Paper
                    key={creature.id}
                    withBorder
                    p="sm"
                    style={{
                      backgroundColor: selected
                        ? "var(--mantine-color-blue-light)"
                        : undefined,
                    }}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                        {/* Creature icon */}
                        <Text size="xl">
                          {creature.sourceType === "pc" ? "👤" : "👹"}
                        </Text>

                        {/* Creature info */}
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Group gap="xs" wrap="nowrap">
                            <Text fw={500} truncate>
                              {creature.name}
                            </Text>
                            {creature.sourceType === "custom" && (
                              <Badge size="xs" variant="light" color="violet">
                                Custom
                              </Badge>
                            )}
                            {creature.sourceType === "pc" && (
                              <Badge size="xs" variant="light" color="green">
                                PC
                              </Badge>
                            )}
                          </Group>
                          <Group gap="xs">
                            {creature.size && (
                              <Text size="xs" c="dimmed">
                                {creature.size}
                              </Text>
                            )}
                            {creature.type && (
                              <Text size="xs" c="dimmed">
                                {creature.type}
                              </Text>
                            )}
                          </Group>
                        </Box>

                        {/* CR Badge */}
                        {creature.challengeRating !== null && (
                          <Badge variant="outline" size="sm">
                            CR {formatCR(creature.challengeRating)}
                          </Badge>
                        )}
                      </Group>

                      {/* Quantity selector or Add button */}
                      {selected ? (
                        <Group gap="xs" wrap="nowrap">
                          <NumberInput
                            value={selected.quantity}
                            onChange={(val) =>
                              handleUpdateQuantity(creature.id, Number(val) || 0)
                            }
                            min={0}
                            max={20}
                            size="xs"
                            w={60}
                          />
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleRemoveFromSelection(creature.id)}
                            size="sm"
                          >
                            ✕
                          </ActionIcon>
                        </Group>
                      ) : (
                        <Group gap="xs" wrap="nowrap">
                          {onUseAsTemplate && (
                            <Button
                              size="xs"
                              variant="subtle"
                              onClick={() => onUseAsTemplate(creature.id, creature.sourceType)}
                            >
                              Template
                            </Button>
                          )}
                          <Button
                            size="xs"
                            variant="light"
                            onClick={() => handleAddToSelection(creature)}
                          >
                            Add
                          </Button>
                        </Group>
                      )}
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </ScrollArea>

        {/* Selected creatures summary */}
        {selectedCreatures.length > 0 && (
          <>
            <Divider />
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Selected: {selectedCreatures.map((c) => `${c.name} x${c.quantity}`).join(", ")}
              </Text>
            </Box>
          </>
        )}

        {/* Action buttons */}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddToCombat}
            loading={adding}
            disabled={selectedCreatures.length === 0}
          >
            Add to Combat ({totalCreatures})
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
