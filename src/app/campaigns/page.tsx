"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  SimpleGrid,
  Card,
  Badge,
  Stack,
  Loader,
  Center,
  Alert,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CreateCampaignModal } from "@/components/campaigns/CreateCampaignModal";
import { CampaignCard } from "@/components/campaigns/CampaignCard";

type Campaign = {
  id: string;
  name: string;
  gameSystem: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    combats: number;
  };
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns");
      const result = await response.json();

      if (result.error) {
        setError(result.error.message);
        return;
      }

      setCampaigns(result.data);
    } catch {
      setError("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCampaignCreated = (newCampaign: Campaign) => {
    setCampaigns((prev) => [newCampaign, ...prev]);
    closeModal();
  };

  const handleCampaignDeleted = (deletedId: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== deletedId));
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>Campaigns</Title>
          <Text c="dimmed" size="sm">
            Manage your TTRPG campaigns
          </Text>
        </div>
        <Button onClick={openModal}>New Campaign</Button>
      </Group>

      {error && (
        <Alert color="red" mb="lg">
          {error}
        </Alert>
      )}

      {campaigns.length === 0 ? (
        <Card withBorder p="xl" ta="center">
          <Stack align="center" gap="md">
            <Text size="lg" fw={500}>
              No campaigns yet
            </Text>
            <Text c="dimmed" size="sm">
              Create your first campaign to start tracking combat encounters
            </Text>
            <Button onClick={openModal}>Create Campaign</Button>
          </Stack>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onDeleted={handleCampaignDeleted}
            />
          ))}
        </SimpleGrid>
      )}

      <CreateCampaignModal
        opened={modalOpened}
        onClose={closeModal}
        onCreated={handleCampaignCreated}
      />
    </Container>
  );
}
