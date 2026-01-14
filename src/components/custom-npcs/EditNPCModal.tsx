'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Stack,
  Group,
  Alert,
  Text,
} from '@mantine/core';
import type { DnD5eCreature } from '@/types/dnd5e';

type EditNPCModalProps = {
  opened: boolean;
  onClose: () => void;
  onUpdated: (npc: CustomCreature) => void;
  onDeleted: (id: string) => void;
  onUseAsTemplate?: (stats: DnD5eCreature) => void;
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

export function EditNPCModal({ opened, onClose, onUpdated, onDeleted, onUseAsTemplate, customNPC }: EditNPCModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Parse stats
  let stats: Partial<DnD5eCreature> = {};
  if (customNPC) {
    try {
      stats = JSON.parse(customNPC.stats);
    } catch (e) {
      console.error('Failed to parse NPC stats:', e);
    }
  }

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
      onClose();
    } catch (err) {
      setError('Failed to delete custom NPC');
    } finally {
      setLoading(false);
    }
  };

  if (!customNPC) return null;

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Custom NPC" size="xl">
      <Stack gap="md">
        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        <Alert variant="light" color="blue">
          <Stack gap="xs">
            <Text fw={600}>{stats.name}</Text>
            <Text size="sm">
              {stats.size} {stats.type}, CR {stats.challenge_rating}
            </Text>
            <Text size="xs" c="dimmed">
              Full editing interface coming soon. For now, you can delete this NPC or use it as a template.
            </Text>
          </Stack>
        </Alert>

        <Group justify="space-between">
          {!deleteConfirm ? (
            <>
              <Group gap="xs">
                <Button variant="default" onClick={onClose}>
                  Close
                </Button>
                {onUseAsTemplate && (
                  <Button
                    variant="light"
                    onClick={() => {
                      onUseAsTemplate(stats as DnD5eCreature);
                      onClose();
                    }}
                  >
                    Use as Template
                  </Button>
                )}
              </Group>
              <Button color="red" variant="light" onClick={() => setDeleteConfirm(true)}>
                Delete NPC
              </Button>
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
    </Modal>
  );
}
