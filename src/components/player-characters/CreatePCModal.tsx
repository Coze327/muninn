'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Group,
  NumberInput,
  Grid,
  Select,
} from '@mantine/core';

type PlayerCharacter = {
  id: string;
  name: string;
  gameSystem: string;
  stats: string;
  createdAt: string;
  updatedAt: string;
};

type Campaign = {
  id: string;
  name: string;
  gameSystem: string;
};

type CreatePCModalProps = {
  opened: boolean;
  onClose: () => void;
  onCreated: (pc: PlayerCharacter) => void;
  gameSystem: string;
  campaignId?: string;
};

export function CreatePCModal({
  opened,
  onClose,
  onCreated,
  gameSystem,
  campaignId: initialCampaignId,
}: CreatePCModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    initialCampaignId || null
  );
  const [characterClass, setCharacterClass] = useState('');
  const [race, setRace] = useState('');
  const [level, setLevel] = useState<number | string>(1);
  const [ac, setAc] = useState<number | string>(10);
  const [maxHp, setMaxHp] = useState<number | string>(10);
  const [passivePerception, setPassivePerception] = useState<number | string>(10);
  const [passiveInvestigation, setPassiveInvestigation] = useState<number | string>(10);
  const [passiveInsight, setPassiveInsight] = useState<number | string>(10);

  // Attributes
  const [strength, setStrength] = useState<number | string>(10);
  const [dexterity, setDexterity] = useState<number | string>(10);
  const [constitution, setConstitution] = useState<number | string>(10);
  const [intelligence, setIntelligence] = useState<number | string>(10);
  const [wisdom, setWisdom] = useState<number | string>(10);
  const [charisma, setCharisma] = useState<number | string>(10);

  // Fetch available campaigns when modal opens
  useEffect(() => {
    if (opened) {
      fetchCampaigns();
    }
  }, [opened, gameSystem]);

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const response = await fetch('/api/campaigns');
      const result = await response.json();

      if (result.error) {
        console.error('Failed to load campaigns:', result.error.message);
        return;
      }

      // Filter campaigns by game system
      const filteredCampaigns = result.data.filter(
        (c: Campaign) => c.gameSystem === gameSystem
      );
      setCampaigns(filteredCampaigns);
    } catch {
      console.error('Failed to load campaigns');
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Build stats object matching the JSON structure
      const stats = {
        type: 'pc',
        class: characterClass,
        race,
        level: Number(level),
        ac: Number(ac),
        total_hp: Number(maxHp),
        passive_perception: Number(passivePerception),
        passive_investigation: Number(passiveInvestigation),
        passive_insight: Number(passiveInsight),
        attributes: {
          strength: Number(strength),
          dexterity: Number(dexterity),
          constitution: Number(constitution),
          intelligence: Number(intelligence),
          wisdom: Number(wisdom),
          charisma: Number(charisma),
        },
      };

      const response = await fetch('/api/player-characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          gameSystem,
          stats,
          campaignId: selectedCampaignId,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error.message);
        return;
      }

      onCreated(result.data);
      handleClose();
    } catch {
      setError('Failed to create player character');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setCharacterClass('');
    setRace('');
    setLevel(1);
    setAc(10);
    setMaxHp(10);
    setPassivePerception(10);
    setPassiveInvestigation(10);
    setPassiveInsight(10);
    setStrength(10);
    setDexterity(10);
    setConstitution(10);
    setIntelligence(10);
    setWisdom(10);
    setCharisma(10);
    setSelectedCampaignId(initialCampaignId || null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create Player Character"
      size="lg">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <div style={{ color: 'red', fontSize: '0.875rem' }}>{error}</div>
          )}

          <TextInput
            label="Name"
            placeholder="Character name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />

          <Select
            label="Campaign"
            placeholder="Select a campaign (optional)"
            value={selectedCampaignId}
            onChange={setSelectedCampaignId}
            data={campaigns.map((c) => ({ value: c.id, label: c.name }))}
            clearable
            disabled={loadingCampaigns}
          />

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Class"
                placeholder="Fighter, Wizard, etc."
                value={characterClass}
                onChange={(e) => setCharacterClass(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Race"
                placeholder="Human, Elf, etc."
                value={race}
                onChange={(e) => setRace(e.currentTarget.value)}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Level"
                value={level}
                onChange={setLevel}
                min={1}
                max={20}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="AC"
                value={ac}
                onChange={setAc}
                min={1}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Max HP"
                value={maxHp}
                onChange={setMaxHp}
                min={1}
              />
            </Grid.Col>
          </Grid>

          {/* Ability Scores */}
          <div>
            <div style={{ fontWeight: 500, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Ability Scores
            </div>
            <Grid>
              <Grid.Col span={4}>
                <NumberInput
                  label="STR"
                  value={strength}
                  onChange={setStrength}
                  min={1}
                  max={30}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="DEX"
                  value={dexterity}
                  onChange={setDexterity}
                  min={1}
                  max={30}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="CON"
                  value={constitution}
                  onChange={setConstitution}
                  min={1}
                  max={30}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="INT"
                  value={intelligence}
                  onChange={setIntelligence}
                  min={1}
                  max={30}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="WIS"
                  value={wisdom}
                  onChange={setWisdom}
                  min={1}
                  max={30}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="CHA"
                  value={charisma}
                  onChange={setCharisma}
                  min={1}
                  max={30}
                />
              </Grid.Col>
            </Grid>
          </div>

          {/* Passive Skills */}
          <div>
            <div style={{ fontWeight: 500, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Passive Skills
            </div>
            <Grid>
              <Grid.Col span={4}>
                <NumberInput
                  label="Perception"
                  value={passivePerception}
                  onChange={setPassivePerception}
                  min={1}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="Investigation"
                  value={passiveInvestigation}
                  onChange={setPassiveInvestigation}
                  min={1}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="Insight"
                  value={passiveInsight}
                  onChange={setPassiveInsight}
                  min={1}
                />
              </Grid.Col>
            </Grid>
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
