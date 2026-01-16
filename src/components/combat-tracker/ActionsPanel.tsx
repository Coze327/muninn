'use client';

import { useState } from 'react';
import { Box, Text, Tabs, Stack, Paper } from '@mantine/core';
import { useDiceRoller } from '@/hooks/useDiceRoller';
import { ActionItem, type Action } from './ActionItem';
import { RollContextMenu, type ContextMenuState, type RollMode } from './RollContextMenu';
import { SpellsTab } from './SpellsTab';
import type { DnD5eInnateSpellcasting } from '@/types/dnd5e';

type CombatCreature = {
  id: string;
  name: string;
  identifier: string | null;
  statsSnapshot: string;
  spellSlots: string | null;
};

type ActionsPanelProps = {
  creature: CombatCreature | null;
  onCreatureUpdate?: (updates: Partial<CombatCreature>) => void;
};

type LegendaryAction = {
  name: string;
  desc: string;
};

export function ActionsPanel({ creature, onCreatureUpdate }: ActionsPanelProps) {
  const [activeTab, setActiveTab] = useState<string | null>('actions');
  const { roll } = useDiceRoller();
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const executeRoll = (
    notation: string,
    rollName: string,
    rollType: 'attack' | 'damage',
    actionName: string,
    mode: RollMode
  ) => {
    if (!creature) return;

    let finalNotation = notation;
    let finalRollName = rollName;

    // Only modify d20 rolls (attack rolls) for advantage/disadvantage
    if (rollType === 'attack') {
      if (mode === 'advantage') {
        finalNotation = notation.replace(/1?d20/g, '2d20kh1');
      } else if (mode === 'disadvantage') {
        finalNotation = notation.replace(/1?d20/g, '2d20kl1');
      }
    }

    // Double dice for critical damage (not modifiers)
    if (rollType === 'damage' && mode === 'crit') {
      finalNotation = notation.replace(
        /(\d+)d(\d+)/g,
        (match, count, sides) => {
          const doubled = parseInt(count) * 2;
          return `${doubled}d${sides}`;
        }
      );
      finalRollName = `${rollName} (Critical)`;
    }

    roll(finalNotation, {
      creatureId: creature.id,
      creatureName: displayName,
      rollType,
      rollName: `${actionName} - ${finalRollName}`,
    });
  };

  if (!creature) {
    return (
      <Box ta='center' py='xl'>
        <Text c='dimmed'>Select a creature to view its actions</Text>
      </Box>
    );
  }

  // Parse stats snapshot
  let stats: Record<string, unknown> = {};
  try {
    stats = JSON.parse(creature.statsSnapshot) || {};
  } catch {
    stats = {};
  }

  const displayName = creature.identifier
    ? `${creature.name} (${creature.identifier})`
    : creature.name;

  const actions = (stats.actions as Action[]) || [];
  const legendaryActions = (stats.legendary_actions as LegendaryAction[]) || [];
  const specialAbilities = (stats.special_abilities as Action[]) || [];
  const multiattack = stats.multiattack as { desc: string } | undefined;
  const spellcastingData = stats.spellcasting as any;

  // Get innate spellcasting from stats (structured data)
  const innateSpellcasting = stats.innate_spellcasting as DnD5eInnateSpellcasting | undefined;

  // Check if creature has spellcasting
  const hasSpellcasting = !!spellcastingData || !!innateSpellcasting;

  const handleSpellSlotsUpdate = async (spellSlots: Record<string, { max: number; used: number }>) => {
    if (!onCreatureUpdate) return;

    try {
      const response = await fetch(`/api/combat-creatures/${creature.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spellSlots: JSON.stringify(spellSlots) }),
      });

      if (response.ok) {
        onCreatureUpdate({ spellSlots: JSON.stringify(spellSlots) });
      }
    } catch (error) {
      console.error('Failed to update spell slots:', error);
    }
  };

  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <Tabs.List>
        <Tabs.Tab value='actions' disabled={actions.length === 0}>
          Actions {actions.length > 0 && `(${actions.length})`}
        </Tabs.Tab>
        <Tabs.Tab value='spells' disabled={!hasSpellcasting}>
          Spells
        </Tabs.Tab>
        <Tabs.Tab value='features' disabled={specialAbilities.length === 0}>
          Features{' '}
          {specialAbilities.length > 0 && `(${specialAbilities.length})`}
        </Tabs.Tab>
        <Tabs.Tab value='legendary' disabled={legendaryActions.length === 0}>
          Legendary{' '}
          {legendaryActions.length > 0 && `(${legendaryActions.length})`}
        </Tabs.Tab>
      </Tabs.List>

      <Box mt='md'>
        <Tabs.Panel value='actions'>
          {actions.length === 0 && !multiattack ? (
            <Text c='dimmed' ta='center' py='md'>
              No actions available
            </Text>
          ) : (
            <Stack gap='sm'>
              {/* Multiattack section */}
              {multiattack && (
                <Paper
                  withBorder
                  p='sm'
                  mb='sm'
                  style={{ borderLeft: '3px solid var(--mantine-color-blue-6)' }}>
                  <Text fw={600} mb='xs'>
                    Multiattack
                  </Text>
                  <Text size='sm' c='dimmed' style={{ whiteSpace: 'pre-wrap' }}>
                    {multiattack.desc}
                  </Text>
                </Paper>
              )}
              {actions.map((action, i) => (
                <ActionItem
                  key={i}
                  action={action}
                  onAttackRoll={(notation) => {
                    executeRoll(notation, 'Attack Roll', 'attack', action.name, 'normal');
                  }}
                  onDamageRoll={(notation, damageTypes) => {
                    executeRoll(notation, `Damage (${damageTypes})`, 'damage', action.name, 'normal');
                  }}
                  onAttackContextMenu={(e, notation, actionName) => {
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      notation,
                      rollName: 'Attack Roll',
                      actionName,
                      rollType: 'attack',
                    });
                  }}
                  onDamageContextMenu={(e, notation, rollName, actionName) => {
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      notation,
                      rollName,
                      actionName,
                      rollType: 'damage',
                    });
                  }}
                />
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value='spells'>
          <SpellsTab
            spellcastingData={spellcastingData}
            innateSpellcasting={innateSpellcasting}
            currentSpellSlots={creature.spellSlots}
            creatureId={creature.id}
            creatureName={displayName}
            onSpellSlotsUpdate={handleSpellSlotsUpdate}
            onAttackContextMenu={(e, notation) => {
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                notation,
                rollName: 'Spell Attack',
                actionName: 'Spell Attack',
                rollType: 'attack',
              });
            }}
            onDamageContextMenu={(e, notation, rollName) => {
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                notation,
                rollName,
                actionName: rollName,
                rollType: 'damage',
              });
            }}
          />
        </Tabs.Panel>

        <Tabs.Panel value='features'>
          {specialAbilities.length === 0 ? (
            <Text c='dimmed' ta='center' py='md'>
              No special features
            </Text>
          ) : (
            <Stack gap='sm'>
              {specialAbilities
                .filter((a) => !a.name.toLowerCase().includes('spellcasting'))
                .map((ability, i) => (
                  <Paper key={i} withBorder p='sm'>
                    <Text fw={600} mb='xs'>
                      {ability.name}
                    </Text>
                    <Text
                      size='sm'
                      c='dimmed'
                      style={{ whiteSpace: 'pre-wrap' }}>
                      {ability.desc}
                    </Text>
                  </Paper>
                ))}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value='legendary'>
          {legendaryActions.length === 0 ? (
            <Text c='dimmed' ta='center' py='md'>
              No legendary actions
            </Text>
          ) : (
            <Stack gap='sm'>
              {legendaryActions.map((action, i) => (
                <Paper key={i} withBorder p='sm'>
                  <Text fw={600} mb='xs'>
                    {action.name}
                  </Text>
                  <Text size='sm' c='dimmed' style={{ whiteSpace: 'pre-wrap' }}>
                    {action.desc}
                  </Text>
                </Paper>
              ))}
            </Stack>
          )}
        </Tabs.Panel>
      </Box>

      <RollContextMenu
        contextMenu={contextMenu}
        onClose={() => setContextMenu(null)}
        onRoll={executeRoll}
      />
    </Tabs>
  );
}
