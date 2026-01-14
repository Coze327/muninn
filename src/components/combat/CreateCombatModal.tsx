"use client";

import { useState } from "react";
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Alert,
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

type CreateCombatModalProps = {
  opened: boolean;
  onClose: () => void;
  onCreated: (combat: Combat) => void;
  campaignId: string;
};

export function CreateCombatModal({
  opened,
  onClose,
  onCreated,
  campaignId,
}: CreateCombatModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/combats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          name: values.name || null,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      form.reset();
      onCreated(result.data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setError(null);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="New Combat Encounter">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}

          <TextInput
            label="Encounter Name"
            placeholder="e.g., Goblin Ambush (optional)"
            {...form.getInputProps("name")}
          />

          <Button type="submit" fullWidth loading={loading}>
            Create Combat
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
