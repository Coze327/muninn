'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Text,
  Badge,
  Group,
  Menu,
  ActionIcon,
  Stack,
} from '@mantine/core';

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

type CampaignCardProps = {
  campaign: Campaign;
  onDeleted: (id: string) => void;
};

const gameSystemLabels: Record<string, string> = {
  '5E': '5e',
  DAGGERHEART: 'Daggerheart',
};

const gameSystemColors: Record<string, string> = {
  '5E': 'red',
  DAGGERHEART: 'violet',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function CampaignCard({ campaign, onDeleted }: CampaignCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleClick = () => {
    router.push(`/campaigns/${campaign.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (
      !confirm(`Delete "${campaign.name}"? This will also delete all combats.`)
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDeleted(campaign.id);
      }
    } catch {
      console.error('Failed to delete campaign');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card
      withBorder
      shadow='sm'
      padding='lg'
      radius='md'
      style={{ cursor: 'pointer' }}
      onClick={handleClick}>
      <Stack gap='sm'>
        <Group justify='space-between' align='flex-start'>
          <Badge color={gameSystemColors[campaign.gameSystem] || 'gray'}>
            {gameSystemLabels[campaign.gameSystem] || campaign.gameSystem}
          </Badge>
          <Menu position='bottom-end' withinPortal>
            <Menu.Target>
              <ActionIcon
                variant='subtle'
                color='gray'
                onClick={(e) => e.stopPropagation()}>
                <Text size='lg'>...</Text>
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item color='red' onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Campaign'}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Text fw={600} size='lg' lineClamp={1}>
          {campaign.name}
        </Text>

        <Group gap='xs'>
          <Text size='sm' c='dimmed'>
            {campaign._count.combats} encounter
            {campaign._count.combats !== 1 ? 's' : ''}
          </Text>
          <Text size='sm' c='dimmed'>
            •
          </Text>
          <Text size='sm' c='dimmed'>
            Updated {formatDate(campaign.updatedAt)}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}
