'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Stack, Group, Alert, Text } from '@mantine/core';
import { validateCreature } from '@/lib/utils/npc-form-helpers';
import { useNPCForm } from './useNPCForm';
import { buildCreatureStats } from './build-creature-stats';
import { NPCFormTabs } from './NPCFormTabs';
import type { DnD5eCreature } from '@/types/dnd5e';

type EditNPCModalProps = {
  opened: boolean;
  onClose: () => void;
  onUpdated: (npc: CustomCreature) => void;
  onDeleted: (id: string) => void;
  customNPC: CustomCreature | null;
};

type CustomCreature = {
  id: string;
  name: string;
  gameSystem: string;
  stats: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export function EditNPCModal({
  opened,
  onClose,
  onUpdated,
  onDeleted,
  customNPC,
}: EditNPCModalProps) {
  // Parse stats from the existing NPC
  const [initialStats, setInitialStats] = useState<DnD5eCreature | null>(null);

  useEffect(() => {
    if (customNPC && opened) {
      try {
        const parsed = JSON.parse(customNPC.stats) as DnD5eCreature;
        setInitialStats(parsed);
      } catch (e) {
        console.error('Failed to parse NPC stats:', e);
        setInitialStats(null);
      }
    } else if (!opened) {
      setInitialStats(null);
    }
  }, [customNPC, opened]);

  // Use the NPC form hook with editing mode
  const formState = useNPCForm({ templateData: initialStats, isEditing: true });

  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleClose = () => {
    formState.resetForm();
    setError(null);
    setDeleteConfirm(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!customNPC) return;
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/custom-creatures/${customNPC.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error.message);
        return;
      }

      onDeleted(customNPC.id);
      handleClose();
    } catch (err) {
      setError('Failed to delete custom NPC');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNPC) return;

    setError(null);
    setLoading(true);

    try {
      // Build creature stats from form state
      const stats = buildCreatureStats({
        index: formState.index,
        name: formState.name,
        size: formState.size,
        type: formState.type,
        alignment: formState.alignment,
        cr: formState.cr,
        proficiencyBonus: formState.proficiencyBonus,
        xp: formState.xp,
        languages: formState.languages,
        str: formState.str,
        dex: formState.dex,
        con: formState.con,
        int: formState.int,
        wis: formState.wis,
        cha: formState.cha,
        savingThrows: formState.savingThrows,
        skills: formState.skills,
        acValue: formState.acValue,
        acType: formState.acType,
        armorItems: formState.armorItems,
        hitPointsRoll: formState.hitPointsRoll,
        speedWalk: formState.speedWalk,
        speedFly: formState.speedFly,
        speedSwim: formState.speedSwim,
        speedClimb: formState.speedClimb,
        speedBurrow: formState.speedBurrow,
        speedHover: formState.speedHover,
        passivePerception: formState.passivePerception,
        darkvision: formState.darkvision,
        blindsight: formState.blindsight,
        tremorsense: formState.tremorsense,
        truesight: formState.truesight,
        damageVulnerabilities: formState.damageVulnerabilities,
        damageResistances: formState.damageResistances,
        damageImmunities: formState.damageImmunities,
        conditionImmunities: formState.conditionImmunities,
        multiattackDesc: formState.multiattackDesc,
        actions: formState.actions,
        specialAbilities: formState.specialAbilities,
        legendaryActions: formState.legendaryActions,
        reactions: formState.reactions,
        spellcastingType: formState.spellcastingType,
        spellAbility: formState.spellAbility,
        spellDC: formState.spellDC,
        spellAttackBonus: formState.spellAttackBonus,
        spellSlotsLevel1: formState.spellSlotsLevel1,
        spellSlotsLevel2: formState.spellSlotsLevel2,
        spellSlotsLevel3: formState.spellSlotsLevel3,
        spellSlotsLevel4: formState.spellSlotsLevel4,
        spellSlotsLevel5: formState.spellSlotsLevel5,
        spellSlotsLevel6: formState.spellSlotsLevel6,
        spellSlotsLevel7: formState.spellSlotsLevel7,
        spellSlotsLevel8: formState.spellSlotsLevel8,
        spellSlotsLevel9: formState.spellSlotsLevel9,
        atWillSpells: formState.atWillSpells,
        cantrips: formState.cantrips,
        level1Spells: formState.level1Spells,
        level2Spells: formState.level2Spells,
        level3Spells: formState.level3Spells,
        level4Spells: formState.level4Spells,
        level5Spells: formState.level5Spells,
        level6Spells: formState.level6Spells,
        level7Spells: formState.level7Spells,
        level8Spells: formState.level8Spells,
        level9Spells: formState.level9Spells,
        innateAbility: formState.innateAbility,
        innateDC: formState.innateDC,
        innateSpells: formState.innateSpells,
        componentsRequired: formState.componentsRequired,
      });

      // Validate
      const errors = validateCreature(stats);
      if (errors.length > 0) {
        setError(`Validation errors:\n${errors.join('\n')}`);
        setLoading(false);
        return;
      }

      // Update creature
      const response = await fetch(`/api/custom-creatures/${customNPC.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formState.name,
          stats,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error.message);
        return;
      }

      onUpdated(result.data);
      handleClose();
    } catch (err) {
      setError('Failed to update custom NPC');
    } finally {
      setLoading(false);
    }
  };

  if (!customNPC) return null;

  // Show loading state while parsing initial stats
  if (!initialStats && opened) {
    return (
      <Modal opened={opened} onClose={handleClose} title="Edit Custom NPC" size="xl">
        <Stack gap="md">
          <Alert color="blue" variant="light">
            Loading NPC data...
          </Alert>
        </Stack>
      </Modal>
    );
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Edit Custom NPC" size="xl">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}

          <NPCFormTabs formState={formState} />

          <Group justify="space-between" mt="md">
            {!deleteConfirm ? (
              <>
                <Button
                  color="red"
                  variant="light"
                  onClick={() => setDeleteConfirm(true)}
                >
                  Delete NPC
                </Button>
                <Group>
                  <Button variant="default" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading}>
                    Save Changes
                  </Button>
                </Group>
              </>
            ) : (
              <>
                <Text size="sm" c="dimmed">
                  Are you sure you want to delete this NPC?
                </Text>
                <Group>
                  <Button variant="default" onClick={() => setDeleteConfirm(false)}>
                    Cancel
                  </Button>
                  <Button color="red" onClick={handleDelete} loading={loading}>
                    Confirm Delete
                  </Button>
                </Group>
              </>
            )}
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
