"use client";

import { useState } from "react";
import {
  Modal,
  TextInput,
  NativeSelect,
  Button,
  Stack,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";

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

type CreateCampaignModalProps = {
  opened: boolean;
  onClose: () => void;
  onCreated: (campaign: Campaign) => void;
};

const gameSystemOptions = [
  { value: "DND5E", label: "D&D 5th Edition" },
  { value: "DAGGERHEART", label: "Daggerheart" },
];

export function CreateCampaignModal({
  opened,
  onClose,
  onCreated,
}: CreateCampaignModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
      gameSystem: "DND5E",
    },
    validate: {
      name: (value) =>
        value.trim().length === 0 ? "Name is required" : null,
      gameSystem: (value) =>
        !value ? "Game system is required" : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      // Add default _count since the API response doesn't include it
      const campaignWithCount = {
        ...result.data,
        _count: { combats: 0 },
      };

      form.reset();
      onCreated(campaignWithCount);
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
    <Modal opened={opened} onClose={handleClose} title="Create Campaign">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}

          <TextInput
            label="Campaign Name"
            placeholder="e.g., Curse of Strahd"
            required
            {...form.getInputProps("name")}
          />

          <NativeSelect
            label="Game System"
            required
            data={gameSystemOptions}
            {...form.getInputProps("gameSystem")}
          />

          <Button type="submit" fullWidth loading={loading}>
            Create Campaign
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
