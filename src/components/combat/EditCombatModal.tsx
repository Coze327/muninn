"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Alert,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";

type Combat = {
  id: string;
  name: string | null;
  status: string;
  round: number;
  createdAt: string;
  updatedAt: string;
};

type EditCombatModalProps = {
  opened: boolean;
  onClose: () => void;
  onUpdated: (combat: Combat) => void;
  onDeleted: (combatId: string) => void;
  combat: Combat | null;
};

export function EditCombatModal({
  opened,
  onClose,
  onUpdated,
  onDeleted,
  combat,
}: EditCombatModalProps) {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
    },
  });

  // Update form when combat changes
  useEffect(() => {
    if (combat) {
      form.setValues({ name: combat.name || "" });
    }
  }, [combat]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!combat) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/combats/${combat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name || null,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      onUpdated(result.data);
      handleClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!combat) return;

    setDeleteLoading(true);

    try {
      const response = await fetch(`/api/combats/${combat.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDeleted(combat.id);
        handleClose();
      }
    } catch {
      setError("Failed to delete combat.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setError(null);
    setConfirmDelete(false);
    onClose();
  };

  if (!combat) return null;

  return (
    <Modal opened={opened} onClose={handleClose} title="Edit Combat">
      {confirmDelete ? (
        <Stack gap="md">
          <Alert color="red" variant="light">
            Are you sure you want to delete &quot;{combat.name || "Untitled Combat"}&quot;?
            This will remove all creatures and combat data. This cannot be undone.
          </Alert>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={deleteLoading}>
              Delete
            </Button>
          </Group>
        </Stack>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}

            <TextInput
              label="Combat Name"
              placeholder="e.g., Goblin Ambush (optional)"
              {...form.getInputProps("name")}
            />

            <Button
              variant="subtle"
              color="red"
              onClick={() => setConfirmDelete(true)}
              style={{ alignSelf: "flex-start" }}
            >
              Delete Combat
            </Button>

            <Group justify="flex-end">
              <Button variant="default" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Save
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
