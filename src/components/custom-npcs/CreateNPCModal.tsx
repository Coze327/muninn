'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Stack, Alert, Divider, Group, Autocomplete, Loader } from '@mantine/core';
import { validateCreature } from '@/lib/utils/npc-form-helpers';
import { useNPCForm } from './useNPCForm';
import { buildCreatureStats } from './build-creature-stats';
import { NPCFormTabs } from './NPCFormTabs';
import type { DnD5eCreature } from '@/types/dnd5e';

type CreateNPCModalProps = {
  opened: boolean;
  onClose: () => void;
  onCreated: (npc: CustomCreature) => void;
  gameSystem: string;
  templateData?: DnD5eCreature | null;
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

export function CreateNPCModal({ opened, onClose, onCreated, gameSystem, templateData }: CreateNPCModalProps) {
  const formState = useNPCForm({ templateData });

  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Template search state
  const [templateSearch, setTemplateSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Search for creatures to use as template
  useEffect(() => {
    const searchCreatures = async () => {
      if (!templateSearch.trim() || templateSearch.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await fetch(
          `/api/creatures/search?q=${encodeURIComponent(templateSearch)}&gameSystem=${gameSystem}&limit=10`
        );
        const result = await response.json();

        if (result.data) {
          setSearchResults(
            result.data.map((c: any) => ({
              value: `${c.id}|${c.sourceType}`,
              label: `${c.name} ${c.sourceType === 'custom' ? '(Custom)' : c.sourceType === 'pc' ? '(PC)' : ''}`,
              ...c,
            }))
          );
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(searchCreatures, 300);
    return () => clearTimeout(timeoutId);
  }, [templateSearch, gameSystem]);

  // Load selected template
  const handleTemplateSelect = async (value: string) => {
    const [id, sourceType] = value.split('|');

    try {
      const response = await fetch(`/api/creatures/${id}?sourceType=${sourceType}`);
      const result = await response.json();

      if (result.error) {
        setError('Failed to load template');
        return;
      }

      const stats = JSON.parse(result.data.stats);
      formState.populateFromTemplate(stats);
      setTemplateSearch('');
      setSearchResults([]);
    } catch (err) {
      setError('Failed to load template');
    }
  };

  const handleClose = () => {
    // Reset template search
    setTemplateSearch('');
    setSearchResults([]);

    // Reset all form fields
    formState.resetForm();
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Create creature
      const response = await fetch('/api/custom-creatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formState.name,
          gameSystem,
          stats,
          imageUrl: null,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error.message);
        return;
      }

      onCreated(result.data);
      handleClose();
    } catch (err) {
      setError('Failed to create custom NPC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Create Custom NPC" size="xl">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* Template Selector */}
          <Autocomplete
            label="Start from existing creature (optional)"
            placeholder="Search for a creature to use as template..."
            value={templateSearch}
            onChange={setTemplateSearch}
            onOptionSubmit={handleTemplateSelect}
            data={searchResults}
            rightSection={searchLoading ? <Loader size="xs" /> : null}
            limit={10}
          />

          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}

          <Divider />

          <NPCFormTabs formState={formState} />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create NPC
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
