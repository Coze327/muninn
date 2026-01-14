'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Card,
  Badge,
  Stack,
  Loader,
  Center,
  Alert,
  Box,
  Table,
  Tabs,
  Breadcrumbs,
  Anchor,
  TextInput,
  Pagination,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CreateCombatModal } from '@/components/combat/CreateCombatModal';
import { EditCombatModal } from '@/components/combat/EditCombatModal';
import { ActivateCombatModal } from '@/components/combat/ActivateCombatModal';
import { CreatePCModal } from '@/components/player-characters/CreatePCModal';
import { EditPCModal } from '@/components/player-characters/EditPCModal';
import { PCCard } from '@/components/player-characters/PCCard';
import { CreateNPCModal } from '@/components/custom-npcs/CreateNPCModal';
import { EditNPCModal } from '@/components/custom-npcs/EditNPCModal';
import { NPCCard } from '@/components/custom-npcs/NPCCard';
import { AppShellLayout } from '@/components/layout/AppShellLayout';
import type { DnD5eCreature } from '@/types/dnd5e';
import {
  formatChallengeRating,
  getArmorClass,
  parseHitPoints,
} from '@/types/dnd5e';

type Combat = {
  id: string;
  name: string | null;
  status: string;
  round: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    creatures: number;
  };
};

type PlayerCharacter = {
  id: string;
  name: string;
  gameSystem: string;
  stats: string;
  createdAt: string;
  updatedAt: string;
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

type Campaign = {
  id: string;
  name: string;
  gameSystem: string;
  createdAt: string;
  updatedAt: string;
  combats: Combat[];
};

const gameSystemLabels: Record<string, string> = {
  '5E': '5e',
  DAGGERHEART: 'Daggerheart',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [playerCharacters, setPlayerCharacters] = useState<PlayerCharacter[]>(
    []
  );
  const [customNPCs, setCustomNPCs] = useState<CustomCreature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [
    createModalOpened,
    { open: openCreateModal, close: closeCreateModal },
  ] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [
    activateModalOpened,
    { open: openActivateModal, close: closeActivateModal },
  ] = useDisclosure(false);
  const [
    createPCModalOpened,
    { open: openCreatePCModal, close: closeCreatePCModal },
  ] = useDisclosure(false);
  const [
    editPCModalOpened,
    { open: openEditPCModal, close: closeEditPCModal },
  ] = useDisclosure(false);
  const [
    createNPCModalOpened,
    { open: openCreateNPCModal, close: closeCreateNPCModal },
  ] = useDisclosure(false);
  const [
    editNPCModalOpened,
    { open: openEditNPCModal, close: closeEditNPCModal },
  ] = useDisclosure(false);

  // Selected combat for modals
  const [selectedCombat, setSelectedCombat] = useState<Combat | null>(null);
  const [combatToActivate, setCombatToActivate] = useState<Combat | null>(null);

  // Selected PC for modals
  const [selectedPC, setSelectedPC] = useState<PlayerCharacter | null>(null);

  // Selected NPC and template data for modals
  const [selectedNPC, setSelectedNPC] = useState<CustomCreature | null>(null);
  const [templateData, setTemplateData] = useState<DnD5eCreature | null>(null);

  // Search and pagination for PCs
  const [pcSearchQuery, setPcSearchQuery] = useState('');
  const [pcPage, setPcPage] = useState(1);
  const PC_PAGE_SIZE = 5;

  // Search and pagination for NPCs
  const [npcSearchQuery, setNpcSearchQuery] = useState('');
  const [npcPage, setNpcPage] = useState(1);
  const NPC_PAGE_SIZE = 5;

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      const result = await response.json();

      if (result.error) {
        setError(result.error.message);
        return;
      }

      setCampaign(result.data);
    } catch {
      setError('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerCharacters = async () => {
    if (!campaign) return;

    try {
      const response = await fetch(
        `/api/player-characters?campaignId=${campaignId}`
      );
      const result = await response.json();

      if (result.error) {
        console.error('Failed to load PCs:', result.error.message);
        return;
      }

      setPlayerCharacters(result.data);
    } catch {
      console.error('Failed to load player characters');
    }
  };

  const fetchCustomNPCs = async () => {
    if (!campaign) return;

    try {
      const response = await fetch(
        `/api/custom-creatures?gameSystem=${campaign.gameSystem}`
      );
      const result = await response.json();

      if (result.error) {
        console.error('Failed to load custom NPCs:', result.error.message);
        return;
      }

      setCustomNPCs(result.data);
    } catch {
      console.error('Failed to load custom NPCs');
    }
  };

  useEffect(() => {
    fetchCampaign();

    // Refetch when page becomes visible (handles back navigation)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCampaign();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [campaignId]);

  useEffect(() => {
    if (campaign) {
      fetchPlayerCharacters();
      fetchCustomNPCs();
    }
  }, [campaign]);

  // Group combats by status
  const activeCombats =
    campaign?.combats.filter((c) => c.status === 'ACTIVE') || [];
  const prepCombats =
    campaign?.combats.filter((c) => c.status === 'PREP') || [];
  const completedCombats =
    campaign?.combats.filter((c) => c.status === 'COMPLETED') || [];
  const activeCombat = activeCombats[0] || null;

  const handleCombatCreated = (newCombat: Combat) => {
    if (campaign) {
      setCampaign({
        ...campaign,
        combats: [newCombat, ...campaign.combats],
      });
    }
    closeCreateModal();
    // Navigate to the new combat
    router.push(`/campaigns/${campaignId}/combat/${newCombat.id}`);
  };

  const handleCombatUpdated = (updatedCombat: Combat) => {
    if (campaign) {
      setCampaign({
        ...campaign,
        combats: campaign.combats.map((c) =>
          c.id === updatedCombat.id ? { ...c, ...updatedCombat } : c
        ),
      });
    }
  };

  const handleCombatDeleted = (deletedId: string) => {
    if (campaign) {
      setCampaign({
        ...campaign,
        combats: campaign.combats.filter((c) => c.id !== deletedId),
      });
    }
  };

  const handleCombatActivated = (
    activatedCombat: Combat,
    endedCombat?: Combat
  ) => {
    if (campaign) {
      setCampaign({
        ...campaign,
        combats: campaign.combats.map((c) => {
          if (c.id === activatedCombat.id) return { ...c, ...activatedCombat };
          if (endedCombat && c.id === endedCombat.id)
            return { ...c, ...endedCombat };
          return c;
        }),
      });
    }
  };

  const handleEndCombat = async (combat: Combat) => {
    try {
      const response = await fetch(`/api/combats/${combat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      const result = await response.json();
      if (result.data) {
        handleCombatUpdated(result.data);
      }
    } catch {
      console.error('Failed to end encounter');
    }
  };

  const handleActivateClick = async (combat: Combat) => {
    // If no active combat, activate directly without modal
    if (!activeCombat) {
      try {
        const response = await fetch(`/api/combats/${combat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ACTIVE' }),
        });

        const result = await response.json();
        if (result.data) {
          handleCombatActivated(result.data);
        }
      } catch {
        console.error('Failed to activate combat');
      }
      return;
    }

    // Show modal if there's an active combat to warn user
    setCombatToActivate(combat);
    openActivateModal();
  };

  const handleEditClick = (combat: Combat, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCombat(combat);
    openEditModal();
  };

  const handleCombatClick = (combatId: string) => {
    router.push(`/campaigns/${campaignId}/combat/${combatId}`);
  };

  const handlePCCreated = (newPC: PlayerCharacter) => {
    setPlayerCharacters([...playerCharacters, newPC]);
    closeCreatePCModal();
  };

  const handlePCUpdated = (updatedPC: PlayerCharacter) => {
    setPlayerCharacters(
      playerCharacters.map((pc) => (pc.id === updatedPC.id ? updatedPC : pc))
    );
  };

  const handlePCDeleted = (deletedId: string) => {
    setPlayerCharacters(playerCharacters.filter((pc) => pc.id !== deletedId));
  };

  const handlePCClick = (pc: PlayerCharacter) => {
    setSelectedPC(pc);
    openEditPCModal();
  };

  const handleNPCCreated = (newNPC: CustomCreature) => {
    setCustomNPCs([...customNPCs, newNPC]);
    closeCreateNPCModal();
    setTemplateData(null);
  };

  const handleNPCUpdated = (updatedNPC: CustomCreature) => {
    setCustomNPCs(
      customNPCs.map((npc) => (npc.id === updatedNPC.id ? updatedNPC : npc))
    );
    closeEditNPCModal();
  };

  const handleNPCDeleted = (deletedId: string) => {
    setCustomNPCs(customNPCs.filter((npc) => npc.id !== deletedId));
    closeEditNPCModal();
  };

  const handleNPCClick = (npc: CustomCreature) => {
    setSelectedNPC(npc);
    openEditNPCModal();
  };

  const handleUseAsTemplate = async (
    sourceId: string,
    sourceType: 'creature' | 'custom' | 'pc'
  ) => {
    try {
      const response = await fetch(
        `/api/creatures/${sourceId}?sourceType=${sourceType}`
      );
      const result = await response.json();

      if (result.error) {
        console.error('Failed to load template:', result.error.message);
        return;
      }

      const stats = JSON.parse(result.data.stats);
      setTemplateData(stats);
      openCreateNPCModal();
    } catch {
      console.error('Failed to load template');
    }
  };

  // Filter and paginate Player Characters
  const filteredPCs = playerCharacters.filter((pc) => {
    const searchLower = pcSearchQuery.toLowerCase();
    let stats;
    try {
      stats = JSON.parse(pc.stats);
    } catch {
      stats = {};
    }
    return (
      pc.name.toLowerCase().includes(searchLower) ||
      (stats.race || '').toLowerCase().includes(searchLower) ||
      (stats.class || '').toLowerCase().includes(searchLower)
    );
  });
  const totalPCPages = Math.ceil(filteredPCs.length / PC_PAGE_SIZE);
  const paginatedPCs = filteredPCs.slice(
    (pcPage - 1) * PC_PAGE_SIZE,
    pcPage * PC_PAGE_SIZE
  );

  // Filter and paginate Custom NPCs
  const filteredNPCs = customNPCs.filter((npc) => {
    const searchLower = npcSearchQuery.toLowerCase();
    let stats: Partial<DnD5eCreature>;
    try {
      stats = JSON.parse(npc.stats);
    } catch {
      stats = {};
    }
    return (
      npc.name.toLowerCase().includes(searchLower) ||
      (stats.type || '').toLowerCase().includes(searchLower)
    );
  });
  const totalNPCPages = Math.ceil(filteredNPCs.length / NPC_PAGE_SIZE);
  const paginatedNPCs = filteredNPCs.slice(
    (npcPage - 1) * NPC_PAGE_SIZE,
    npcPage * NPC_PAGE_SIZE
  );

  // Navigation items for this campaign
  const navItems = [
    {
      label: 'All Campaigns',
      icon: '📋',
      href: '/campaigns',
    },
    {
      label: 'Profile',
      icon: '👤',
      href: '/profile',
    },
    {
      label: 'Settings',
      icon: '⚙️',
    },
    {
      label: 'Help',
      icon: '❓',
    },
  ];

  if (loading) {
    return (
      <AppShellLayout sidebarTitle='Loading...' navItems={navItems}>
        <Center h='calc(100vh - 60px)'>
          <Loader size='lg' />
        </Center>
      </AppShellLayout>
    );
  }

  if (error || !campaign) {
    return (
      <AppShellLayout sidebarTitle='Error' navItems={navItems}>
        <Container size='lg' py='xl'>
          <Alert color='red'>{error || 'Campaign not found'}</Alert>
        </Container>
      </AppShellLayout>
    );
  }

  const renderCombatRow = (combat: Combat) => {
    const isActive = combat.status === 'ACTIVE';
    const isPrep = combat.status === 'PREP';
    const isCompleted = combat.status === 'COMPLETED';

    return (
      <Card
        key={combat.id}
        withBorder
        padding='md'
        radius='md'
        style={{ cursor: 'pointer' }}
        onClick={() => handleCombatClick(combat.id)}>
        <Group justify='space-between' wrap='nowrap'>
          <Group gap='md' wrap='nowrap' style={{ flex: 1, minWidth: 0 }}>
            {/* Status indicator */}
            <Text size='lg'>
              {isActive && '●'}
              {isPrep && '○'}
              {isCompleted && '✓'}
            </Text>

            {/* Combat name */}
            <Text fw={500} truncate style={{ flex: 1 }}>
              {combat.name || `Combat ${formatDate(combat.createdAt)}`}
            </Text>

            {/* Round number for active */}
            {isActive && (
              <Badge variant='light' color='green'>
                Round {combat.round}
              </Badge>
            )}

            {/* Date for completed */}
            {isCompleted && (
              <Text size='sm' c='dimmed'>
                {formatDate(combat.updatedAt)}
              </Text>
            )}
          </Group>

          {/* Actions */}
          <Group gap='xs' wrap='nowrap' onClick={(e) => e.stopPropagation()}>
            {isActive && (
              <Button
                size='xs'
                variant='light'
                color='orange'
                onClick={() => handleEndCombat(combat)}>
                End Encounter
              </Button>
            )}
            {(isPrep || isCompleted) && (
              <Button
                size='xs'
                variant='light'
                onClick={() => handleActivateClick(combat)}>
                Activate
              </Button>
            )}
            <Button
              size='xs'
              variant='subtle'
              onClick={(e) => handleEditClick(combat, e)}>
              Edit
            </Button>
          </Group>
        </Group>
      </Card>
    );
  };

  const renderSection = (title: string, combats: Combat[]) => {
    if (combats.length === 0) return null;

    return (
      <Box mb='xl'>
        <Text size='sm' fw={600} c='dimmed' mb='sm' tt='uppercase'>
          {title}
        </Text>
        <Stack gap='sm'>{combats.map(renderCombatRow)}</Stack>
      </Box>
    );
  };

  return (
    <AppShellLayout
      sidebarTitle={campaign.name}
      sidebarSubtitle={
        gameSystemLabels[campaign.gameSystem] || campaign.gameSystem
      }
      navItems={navItems}
      headerCenter={<Button onClick={openCreateModal}>+ New Encounter</Button>}>
      <Container size='lg' py='xl'>
        {/* Breadcrumbs */}
        <Breadcrumbs mb='md'>
          <Anchor href='/campaigns' size='sm'>
            Campaigns
          </Anchor>
          <Text size='sm'>{campaign.name}</Text>
        </Breadcrumbs>

        {/* Header */}
        <Group justify='space-between' mb='xl'>
          <div>
            <Group gap='sm' align='center'>
              <Title order={1}>{campaign.name}</Title>
              <Badge color={campaign.gameSystem === '5E' ? 'red' : 'violet'}>
                {gameSystemLabels[campaign.gameSystem] || campaign.gameSystem}
              </Badge>
            </Group>
          </div>
        </Group>

        {/* Player Characters & Custom NPCs Section */}
        <Box mb='xl'>
          <Tabs defaultValue='pcs'>
            <Tabs.List>
              <Tabs.Tab value='pcs'>
                Player Characters{' '}
                {playerCharacters.length > 0 && `(${playerCharacters.length})`}
              </Tabs.Tab>
              <Tabs.Tab value='npcs'>
                Custom NPCs {customNPCs.length > 0 && `(${customNPCs.length})`}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value='pcs' pt='md'>
              <Group justify='space-between' mb='md'>
                <TextInput
                  placeholder='Search by name, race, or class...'
                  value={pcSearchQuery}
                  onChange={(e) => {
                    setPcSearchQuery(e.target.value);
                    setPcPage(1); // Reset to first page on search
                  }}
                  style={{ flex: 1, maxWidth: 400 }}
                />
                <Button onClick={openCreatePCModal} size='sm'>
                  + Add PC
                </Button>
              </Group>

              {playerCharacters.length === 0 ? (
                <Card withBorder p='lg' ta='center'>
                  <Stack align='center' gap='sm'>
                    <Text c='dimmed' size='sm'>
                      No player characters yet
                    </Text>
                    <Button
                      onClick={openCreatePCModal}
                      size='sm'
                      variant='light'>
                      + Add PC
                    </Button>
                  </Stack>
                </Card>
              ) : filteredPCs.length === 0 ? (
                <Card withBorder p='lg' ta='center'>
                  <Text c='dimmed' size='sm'>
                    No player characters match your search
                  </Text>
                </Card>
              ) : (
                <Stack gap='md'>
                  <Table highlightOnHover withTableBorder>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Race</Table.Th>
                        <Table.Th>Class</Table.Th>
                        <Table.Th>Level</Table.Th>
                        <Table.Th>HP</Table.Th>
                        <Table.Th>AC</Table.Th>
                        <Table.Th>STR</Table.Th>
                        <Table.Th>DEX</Table.Th>
                        <Table.Th>CON</Table.Th>
                        <Table.Th>Passive Perception</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {paginatedPCs.map((pc) => {
                        let stats;
                        try {
                          stats = JSON.parse(pc.stats);
                        } catch {
                          stats = {};
                        }
                        const str = stats.attributes?.strength || 10;
                        const dex = stats.attributes?.dexterity || 10;
                        const con = stats.attributes?.constitution || 10;
                        const wis = stats.attributes?.wisdom || 10;
                        const wisModifier = Math.floor((wis - 10) / 2);
                        const passivePerception = 10 + wisModifier;

                        return (
                          <Table.Tr
                            key={pc.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handlePCClick(pc)}>
                            <Table.Td fw={500}>{pc.name}</Table.Td>
                            <Table.Td>{stats.race || '—'}</Table.Td>
                            <Table.Td>{stats.class || '—'}</Table.Td>
                            <Table.Td>
                              <Badge variant='light' size='sm'>
                                {stats.level || 1}
                              </Badge>
                            </Table.Td>
                            <Table.Td>{stats.hitPoints || '—'}</Table.Td>
                            <Table.Td>{stats.armorClass || '—'}</Table.Td>
                            <Table.Td>{str}</Table.Td>
                            <Table.Td>{dex}</Table.Td>
                            <Table.Td>{con}</Table.Td>
                            <Table.Td>{passivePerception}</Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                  {totalPCPages > 1 && (
                    <Group justify='center'>
                      <Pagination
                        total={totalPCPages}
                        value={pcPage}
                        onChange={setPcPage}
                      />
                    </Group>
                  )}
                </Stack>
              )}
            </Tabs.Panel>

            <Tabs.Panel value='npcs' pt='md'>
              <Group justify='space-between' mb='md'>
                <TextInput
                  placeholder='Search by name or type...'
                  value={npcSearchQuery}
                  onChange={(e) => {
                    setNpcSearchQuery(e.target.value);
                    setNpcPage(1); // Reset to first page on search
                  }}
                  style={{ flex: 1, maxWidth: 400 }}
                />
                <Button onClick={openCreateNPCModal} size='sm'>
                  + Create NPC
                </Button>
              </Group>

              {customNPCs.length === 0 ? (
                <Card withBorder p='lg' ta='center'>
                  <Stack align='center' gap='sm'>
                    <Text c='dimmed' size='sm'>
                      No custom NPCs yet
                    </Text>
                    <Button
                      onClick={openCreateNPCModal}
                      size='sm'
                      variant='light'>
                      + Create NPC
                    </Button>
                  </Stack>
                </Card>
              ) : filteredNPCs.length === 0 ? (
                <Card withBorder p='lg' ta='center'>
                  <Text c='dimmed' size='sm'>
                    No custom NPCs match your search
                  </Text>
                </Card>
              ) : (
                <Stack gap='md'>
                  <Table highlightOnHover withTableBorder>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>CR</Table.Th>
                        <Table.Th>AC</Table.Th>
                        <Table.Th>HP</Table.Th>
                        <Table.Th>Speed</Table.Th>
                        <Table.Th>STR</Table.Th>
                        <Table.Th>DEX</Table.Th>
                        <Table.Th>CON</Table.Th>
                        <Table.Th>Passive Perception</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {paginatedNPCs.map((npc) => {
                        let stats: Partial<DnD5eCreature>;
                        try {
                          stats = JSON.parse(npc.stats);
                        } catch {
                          stats = {};
                        }
                        const size = stats.size || 'Medium';
                        const type = stats.type || 'Unknown';
                        const cr =
                          stats.challenge_rating !== undefined
                            ? formatChallengeRating(stats.challenge_rating)
                            : '0';
                        const ac = stats.armor_class
                          ? getArmorClass(stats.armor_class)
                          : 10;
                        const hp = stats.hit_points_roll
                          ? parseHitPoints(stats.hit_points_roll).average
                          : 0;
                        const speed = stats.speed?.walk || '30 ft.';
                        const str = stats.abilities?.STR || 10;
                        const dex = stats.abilities?.DEX || 10;
                        const con = stats.abilities?.CON || 10;
                        const passivePerception =
                          stats.senses?.passive_perception || 10;

                        return (
                          <Table.Tr
                            key={npc.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleNPCClick(npc)}>
                            <Table.Td fw={500}>{npc.name}</Table.Td>
                            <Table.Td>
                              {size} {type}
                            </Table.Td>
                            <Table.Td>
                              <Badge variant='light' size='sm' color='red'>
                                {cr}
                              </Badge>
                            </Table.Td>
                            <Table.Td>{ac}</Table.Td>
                            <Table.Td>{hp}</Table.Td>
                            <Table.Td>{speed}</Table.Td>
                            <Table.Td>{str}</Table.Td>
                            <Table.Td>{dex}</Table.Td>
                            <Table.Td>{con}</Table.Td>
                            <Table.Td>{passivePerception}</Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                  {totalNPCPages > 1 && (
                    <Group justify='center'>
                      <Pagination
                        total={totalNPCPages}
                        value={npcPage}
                        onChange={setNpcPage}
                      />
                    </Group>
                  )}
                </Stack>
              )}
            </Tabs.Panel>
          </Tabs>
        </Box>

        {/* Encounters Section */}
        <Group justify='space-between' mb='md'>
          <Title order={2} size='h3'>
            Encounters
          </Title>
        </Group>

        {/* Combat List */}
        {campaign.combats.length === 0 ? (
          <Card withBorder p='lg' ta='center'>
            <Stack align='center' gap='sm'>
              <Text c='dimmed' size='sm'>
                No encounters yet
              </Text>
              <Button onClick={openCreateModal} size='sm' variant='light'>
                + New Encounter
              </Button>
            </Stack>
          </Card>
        ) : (
          <>
            {renderSection('Active', activeCombats)}
            {renderSection('Prepared', prepCombats)}
            {renderSection('Completed', completedCombats)}
          </>
        )}

        {/* Modals */}
        <CreateCombatModal
          opened={createModalOpened}
          onClose={closeCreateModal}
          onCreated={handleCombatCreated}
          campaignId={campaignId}
        />

        <EditCombatModal
          opened={editModalOpened}
          onClose={closeEditModal}
          onUpdated={handleCombatUpdated}
          onDeleted={handleCombatDeleted}
          combat={selectedCombat}
        />

        <ActivateCombatModal
          opened={activateModalOpened}
          onClose={closeActivateModal}
          onActivated={handleCombatActivated}
          combatToActivate={combatToActivate}
          activeCombat={activeCombat}
        />

        <CreatePCModal
          opened={createPCModalOpened}
          onClose={closeCreatePCModal}
          onCreated={handlePCCreated}
          gameSystem={campaign.gameSystem}
          campaignId={campaignId}
        />

        <EditPCModal
          opened={editPCModalOpened}
          onClose={closeEditPCModal}
          onUpdated={handlePCUpdated}
          onDeleted={handlePCDeleted}
          playerCharacter={selectedPC}
        />

        <CreateNPCModal
          opened={createNPCModalOpened}
          onClose={() => {
            closeCreateNPCModal();
            setTemplateData(null);
          }}
          onCreated={handleNPCCreated}
          gameSystem={campaign.gameSystem}
          templateData={templateData}
        />

        <EditNPCModal
          opened={editNPCModalOpened}
          onClose={closeEditNPCModal}
          onUpdated={handleNPCUpdated}
          onDeleted={handleNPCDeleted}
          onUseAsTemplate={(stats) => {
            setTemplateData(stats);
            closeEditNPCModal();
            openCreateNPCModal();
          }}
          customNPC={selectedNPC}
        />
      </Container>
    </AppShellLayout>
  );
}
