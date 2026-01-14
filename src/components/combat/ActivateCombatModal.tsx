"use client";

import { useState } from "react";
import {
  Modal,
  Button,
  Stack,
  Text,
  Alert,
  Group,
} from "@mantine/core";

type Combat = {
  id: string;
  name: string | null;
  status: string;
  round: number;
  createdAt: string;
  updatedAt: string;
};

type ActivateCombatModalProps = {
  opened: boolean;
  onClose: () => void;
  onActivated: (activatedCombat: Combat, endedCombat?: Combat) => void;
  combatToActivate: Combat | null;
  activeCombat: Combat | null; // Currently active combat (if any)
};

export function ActivateCombatModal({
  opened,
  onClose,
  onActivated,
  combatToActivate,
  activeCombat,
}: ActivateCombatModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivate = async () => {
    if (!combatToActivate) return;

    setError(null);
    setLoading(true);

    try {
      // If there's an active combat, end it first
      let endedCombat: Combat | undefined;
      if (activeCombat) {
        const endResponse = await fetch(`/api/combats/${activeCombat.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "COMPLETED" }),
        });

        const endResult = await endResponse.json();
        if (endResult.error) {
          setError(endResult.error.message);
          setLoading(false);
          return;
        }
        endedCombat = endResult.data;
      }

      // Activate the new combat
      const activateResponse = await fetch(`/api/combats/${combatToActivate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });

      const activateResult = await activateResponse.json();
      if (activateResult.error) {
        setError(activateResult.error.message);
        setLoading(false);
        return;
      }

      onActivated(activateResult.data, endedCombat);
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!combatToActivate) return null;

  const combatName = combatToActivate.name || "Untitled Combat";
  const activeCombatName = activeCombat?.name || "Untitled Combat";

  return (
    <Modal opened={opened} onClose={onClose} title="Activate Combat">
      <Stack gap="md">
        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        {activeCombat ? (
          <>
            <Text>
              <strong>&quot;{activeCombatName}&quot;</strong> is currently active.
              Activating <strong>&quot;{combatName}&quot;</strong> will end the current combat.
            </Text>
            <Text c="dimmed" size="sm">
              Do you want to continue?
            </Text>
          </>
        ) : (
          <Text>
            Activate <strong>&quot;{combatName}&quot;</strong>?
          </Text>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleActivate} loading={loading}>
            Activate
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
