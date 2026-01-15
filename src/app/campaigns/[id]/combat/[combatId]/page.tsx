"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AppShell,
  Burger,
  Group,
  Text,
  ActionIcon,
  TextInput,
  Drawer,
  NavLink,
  Loader,
  Center,
  Alert,
  useMantineColorScheme,
  Box,
  Stack,
  Badge,
  Modal,
  Button,
  Paper,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  InitiativeTracker,
  StatBlockPanel,
  EditableFieldsPanel,
  ActionsPanel,
  AddCreatureModal,
} from "@/components/combat-tracker";
import { RollHistoryProvider, useRollHistory } from "@/lib/contexts/RollHistoryContext";

type CombatCreature = {
  id: string;
  name: string;
  identifier: string | null;
  initiative: number;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  armorClass: number;
  tokenColor: string | null;
  statusEffects: string;
  isConcentrating: boolean;
  concentrationNote: string | null;
  spellSlots: string | null;
  turnNumber: number;
  sortOrder: number;
  sourceType: string;
  sourceId: string | null;
  statsSnapshot: string;
};

type Combat = {
  id: string;
  name: string | null;
  status: string;
  round: number;
  turnIndex: number;
  campaignId: string;
  campaign: {
    id: string;
    name: string;
    gameSystem: string;
  };
  creatures: CombatCreature[];
};

export default function CombatTrackerPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const combatId = params.combatId as string;

  const [combat, setCombat] = useState<Combat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected creature for editing
  const [selectedCreatureId, setSelectedCreatureId] = useState<string | null>(null);

  // Track newly added creatures for highlight effect
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());

  // UI state
  const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure(false);
  const [historyOpened, { toggle: toggleHistory }] = useDisclosure(false);
  const [addCreatureOpened, { open: openAddCreature, close: closeAddCreature }] = useDisclosure(false);
  const [creatureToDelete, setCreatureToDelete] = useState<string | null>(null);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const fetchCombat = async () => {
    try {
      const response = await fetch(`/api/combats/${combatId}`);
      const result = await response.json();

      if (result.error) {
        setError(result.error.message);
        return;
      }

      setCombat(result.data);

      // Select first creature by default if none selected
      if (!selectedCreatureId && result.data.creatures.length > 0) {
        // Select the creature whose turn it is
        const sortedCreatures = [...result.data.creatures].sort(
          (a, b) => b.initiative - a.initiative || a.sortOrder - b.sortOrder
        );
        if (sortedCreatures[result.data.turnIndex]) {
          setSelectedCreatureId(sortedCreatures[result.data.turnIndex].id);
        } else if (sortedCreatures[0]) {
          setSelectedCreatureId(sortedCreatures[0].id);
        }
      }
    } catch {
      setError("Failed to load combat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombat();

    // Refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCombat();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [combatId]);

  // Helper to extract dexterity from stats snapshot
  const getDexterity = (creature: CombatCreature): number => {
    try {
      const stats = JSON.parse(creature.statsSnapshot);

      // Try different formats
      if (stats.attributes?.dexterity) {
        return stats.attributes.dexterity;
      }
      if (stats.abilities?.DEX) {
        return stats.abilities.DEX;
      }
      if (stats.dexterity) {
        return stats.dexterity;
      }
    } catch {
      // Ignore parsing errors
    }
    return 10; // Default dexterity
  };

  // Get sorted creatures by initiative (highest first), ties broken by dexterity
  const sortedCreatures = combat
    ? [...combat.creatures].sort((a, b) => {
        // Primary sort: initiative (descending)
        if (b.initiative !== a.initiative) {
          return b.initiative - a.initiative;
        }
        // Tie-breaker: dexterity (descending)
        return getDexterity(b) - getDexterity(a);
      })
    : [];

  // Get selected creature
  const selectedCreature = sortedCreatures.find((c) => c.id === selectedCreatureId) || null;

  // Get current turn creature
  const currentTurnCreature = sortedCreatures[combat?.turnIndex || 0] || null;

  // Handle adding creatures to combat
  const handleAddCreatures = async (
    creatures: Array<{
      id: string;
      name: string;
      sourceType: "creature" | "custom" | "pc";
      quantity: number;
      stats: string;
    }>
  ) => {
    const response = await fetch(`/api/combats/${combatId}/creatures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creatures: creatures.map((c) => ({
          sourceId: c.id,
          sourceType: c.sourceType,
          quantity: c.quantity,
          stats: c.stats,
          name: c.name,
        })),
      }),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Update combat state with new creatures
    if (result.data?.combat) {
      setCombat(result.data.combat);

      // Select the first newly added creature
      if (result.data.added?.length > 0) {
        setSelectedCreatureId(result.data.added[0].id);

        // Highlight newly added creatures
        const addedIds = new Set<string>(result.data.added.map((c: { id: string }) => c.id));
        setNewlyAddedIds(addedIds);

        // Clear highlight after 10 seconds
        setTimeout(() => {
          setNewlyAddedIds(new Set());
        }, 10000);
      }
    }
  };

  // Handle requesting to delete a creature (shows confirmation)
  const handleRequestDelete = (creatureId: string) => {
    setCreatureToDelete(creatureId);
  };

  // Handle immediate deletion (no confirmation)
  const handleDeleteImmediate = async (creatureId: string) => {
    if (!combat) return;

    // Optimistic update
    setCombat({
      ...combat,
      creatures: combat.creatures.filter((c) => c.id !== creatureId),
    });

    // Clear selection if deleted creature was selected
    if (selectedCreatureId === creatureId) {
      setSelectedCreatureId(null);
    }

    try {
      await fetch(`/api/combat-creatures/${creatureId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete creature:", error);
      // Refetch on error to restore state
      fetchCombat();
    }
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!combat || !creatureToDelete) return;

    const creatureId = creatureToDelete;
    setCreatureToDelete(null);

    // Optimistic update
    setCombat({
      ...combat,
      creatures: combat.creatures.filter((c) => c.id !== creatureId),
    });

    // Clear selection if deleted creature was selected
    if (selectedCreatureId === creatureId) {
      setSelectedCreatureId(null);
    }

    try {
      await fetch(`/api/combat-creatures/${creatureId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete creature:", error);
      // Refetch on error to restore state
      fetchCombat();
    }
  };

  // Get creature name for delete confirmation
  const creatureToDeleteName = creatureToDelete
    ? combat?.creatures.find((c) => c.id === creatureToDelete)?.name || "this creature"
    : "";

  // Handle creature updates (e.g., spell slots)
  const handleCreatureUpdate = (creatureId: string, updates: Partial<CombatCreature>) => {
    if (!combat) return;

    // Optimistic update
    setCombat({
      ...combat,
      creatures: combat.creatures.map((c) =>
        c.id === creatureId ? { ...c, ...updates } : c
      ),
    });
  };

  // Handle turn advancement
  const handleNextTurn = async () => {
    if (!combat) return;

    const newTurnIndex = (combat.turnIndex + 1) % sortedCreatures.length;
    const newRound = newTurnIndex === 0 ? combat.round + 1 : combat.round;

    // Optimistic update
    setCombat({
      ...combat,
      turnIndex: newTurnIndex,
      round: newRound,
    });

    // Auto-select the creature whose turn it is
    if (sortedCreatures[newTurnIndex]) {
      setSelectedCreatureId(sortedCreatures[newTurnIndex].id);
    }

    try {
      await fetch(`/api/combats/${combatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turnIndex: newTurnIndex,
          round: newRound,
        }),
      });
    } catch (error) {
      console.error("Failed to advance turn:", error);
      fetchCombat();
    }
  };

  const handlePreviousTurn = async () => {
    if (!combat) return;

    const newTurnIndex = combat.turnIndex === 0
      ? sortedCreatures.length - 1
      : combat.turnIndex - 1;
    const newRound = combat.turnIndex === 0 && combat.round > 1
      ? combat.round - 1
      : combat.round;

    // Optimistic update
    setCombat({
      ...combat,
      turnIndex: newTurnIndex,
      round: newRound,
    });

    // Auto-select the creature whose turn it is
    if (sortedCreatures[newTurnIndex]) {
      setSelectedCreatureId(sortedCreatures[newTurnIndex].id);
    }

    try {
      await fetch(`/api/combats/${combatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turnIndex: newTurnIndex,
          round: newRound,
        }),
      });
    } catch (error) {
      console.error("Failed to go back turn:", error);
      fetchCombat();
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error || !combat) {
    return (
      <Center h="100vh">
        <Alert color="red" maw={400}>
          {error || "Combat not found"}
        </Alert>
      </Center>
    );
  }

  // Roll History Content Component
  function RollHistoryContent() {
    const { rolls, clearHistory } = useRollHistory();

    // Get color based on roll type
    const getRollTypeColor = (rollType: string, rollName: string) => {
      // Special case: differentiate damage vs healing
      if (rollType === 'damage') {
        return rollName === 'Healing' ? 'green' : 'red';
      }
      switch (rollType) {
        case 'attack': return 'orange';
        case 'save': return 'violet';
        case 'ability': return 'blue';
        case 'skill': return 'cyan';
        default: return 'gray';
      }
    };

    // Get label for roll type
    const getRollTypeLabel = (rollType: string, rollName: string) => {
      if (rollType === 'damage') {
        return rollName === 'Healing' ? 'Heal' : 'Dmg';
      }
      switch (rollType) {
        case 'attack': return 'Atk';
        case 'save': return 'Save';
        case 'ability': return 'Check';
        case 'skill': return 'Skill';
        default: return rollType;
      }
    };

    return (
      <>
        {rolls.length > 0 && (
          <Button fullWidth variant="light" onClick={clearHistory} mb="md">
            Clear History
          </Button>
        )}
        {rolls.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No rolls yet
          </Text>
        ) : (
          <Stack gap="xs">
            {rolls.map((roll) => {
              const color = getRollTypeColor(roll.rollType, roll.rollName);
              return (
                <Paper key={roll.id} withBorder p="xs">
                  <Group justify="space-between" mb={4}>
                    <Group gap="xs">
                      <Badge size="xs" color={color} variant="light">
                        {getRollTypeLabel(roll.rollType, roll.rollName)}
                      </Badge>
                      <Text size="sm" fw={600}>
                        {roll.creatureName}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {new Date(roll.timestamp).toLocaleTimeString()}
                    </Text>
                  </Group>
                  <Text size="sm">{roll.rollName}</Text>
                  <Text size="xl" fw={700} c={color}>
                    {roll.result}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {roll.output}
                  </Text>
                </Paper>
              );
            })}
          </Stack>
        )}
      </>
    );
  }

  return (
    <RollHistoryProvider>
      <AppShell
        header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { desktop: !navOpened, mobile: !navOpened },
      }}
      padding={0}
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={navOpened} onClick={toggleNav} size="sm" />
            <Text fw={700} size="lg">
              Muninn
            </Text>
          </Group>

          <Group style={{ flex: 1 }} justify="center">
            <Button
              variant="light"
              leftSection={<Text size="sm">➕</Text>}
              onClick={openAddCreature}
            >
              Add Creatures
            </Button>
          </Group>

          <Group gap="md">
            <Badge
              size="lg"
              variant="light"
              color="blue"
              style={{ textTransform: 'none' }}
            >
              Round {combat.round}
            </Badge>
            <ActionIcon
              variant="subtle"
              onClick={() => toggleColorScheme()}
              size="lg"
              title="Toggle color scheme"
            >
              {colorScheme === "dark" ? "☀️" : "🌙"}
            </ActionIcon>
            <ActionIcon
              variant={historyOpened ? "filled" : "subtle"}
              onClick={toggleHistory}
              size="lg"
              title="Roll history"
            >
              📜
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              onClick={() => router.push("/profile")}
              size="lg"
              title="Profile"
            >
              👤
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navigation Sidebar */}
      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Text size="sm" fw={600} c="dimmed" tt="uppercase">
            {combat.campaign.name}
          </Text>
          <Text size="lg" fw={500}>
            {combat.name || "Combat"}
          </Text>
          <Badge color={combat.status === "ACTIVE" ? "green" : "gray"}>
            {combat.status} • Round {combat.round}
          </Badge>
        </Stack>

        <Stack gap={0} mt="xl">
          <NavLink
            label="Back to Campaign"
            leftSection={<Text>←</Text>}
            onClick={() => {
              closeNav();
              router.push(`/campaigns/${campaignId}`);
            }}
          />
          <NavLink
            label="All Campaigns"
            leftSection={<Text>📋</Text>}
            onClick={() => {
              closeNav();
              router.push("/campaigns");
            }}
          />
          <NavLink
            label="Profile"
            leftSection={<Text>👤</Text>}
            onClick={() => {
              closeNav();
              router.push("/profile");
            }}
          />
          <NavLink
            label="Settings"
            leftSection={<Text>⚙️</Text>}
            onClick={() => closeNav()}
          />
          <NavLink
            label="Help"
            leftSection={<Text>❓</Text>}
            onClick={() => closeNav()}
          />
        </Stack>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        <Box
          style={{
            display: "grid",
            gridTemplateRows: "auto 1fr",
            height: "calc(100vh - 60px)",
            overflow: "hidden",
          }}
        >
          {/* Initiative Tracker Row */}
          <Box
            p="md"
            style={{
              borderBottom: "1px solid var(--mantine-color-default-border)",
            }}
          >
            <InitiativeTracker
              creatures={sortedCreatures}
              currentTurnIndex={combat.turnIndex}
              selectedCreatureId={selectedCreatureId}
              onSelectCreature={setSelectedCreatureId}
              onDeleteCreature={handleRequestDelete}
              onDeleteCreatureImmediate={handleDeleteImmediate}
              onNextTurn={handleNextTurn}
              onPreviousTurn={handlePreviousTurn}
              round={combat.round}
              newlyAddedIds={newlyAddedIds}
            />
          </Box>

          {/* Bottom Panels - Centered with max width for readability */}
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              overflowY: "auto",
            }}
          >
            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "400px 1fr",
                overflow: "hidden",
                width: "100%",
                maxWidth: "1600px",
              }}
            >
              {/* Left: Stat Block */}
              <Box
                p="md"
                style={{
                  borderRight: "1px solid var(--mantine-color-default-border)",
                  overflowY: "auto",
                }}
              >
                <StatBlockPanel creature={selectedCreature} />
              </Box>

              {/* Right: Editable Fields + Actions */}
              <Box
                style={{
                  display: "grid",
                  gridTemplateRows: "auto 1fr",
                  overflow: "hidden",
                }}
              >
                {/* Top: Editable Fields + HP Editor */}
                <Box
                  p="md"
                  style={{
                    borderBottom: "1px solid var(--mantine-color-default-border)",
                  }}
                >
                  <EditableFieldsPanel
                    creature={selectedCreature}
                    onUpdate={(updated) => {
                      if (combat) {
                        setCombat({
                          ...combat,
                          creatures: combat.creatures.map((c) =>
                            c.id === updated.id ? { ...c, ...updated } : c
                          ),
                        });
                      }
                    }}
                  />
                </Box>

                {/* Bottom: Actions Panel */}
                <Box p="md" style={{ overflowY: "auto" }}>
                  <ActionsPanel
                    creature={selectedCreature}
                    onCreatureUpdate={(updates) => {
                      if (selectedCreature) {
                        handleCreatureUpdate(selectedCreature.id, updates);
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Roll History Drawer */}
        <Drawer
          opened={historyOpened}
          onClose={toggleHistory}
          position="right"
          title="Roll History"
          padding="md"
          size="sm"
        >
          <RollHistoryContent />
        </Drawer>

        {/* Add Creature Modal */}
        <AddCreatureModal
          opened={addCreatureOpened}
          onClose={closeAddCreature}
          onAdd={handleAddCreatures}
          gameSystem={combat.campaign.gameSystem}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          opened={!!creatureToDelete}
          onClose={() => setCreatureToDelete(null)}
          title="Remove Creature"
          centered
          size="sm"
        >
          <Stack gap="md">
            <Text>
              Are you sure you want to remove <strong>{creatureToDeleteName}</strong> from combat?
            </Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setCreatureToDelete(null)}>
                Cancel
              </Button>
              <Button color="red" onClick={handleConfirmDelete}>
                Remove
              </Button>
            </Group>
          </Stack>
        </Modal>
      </AppShell.Main>
    </AppShell>
    </RollHistoryProvider>
  );
}
