'use client';

import { Stack, Button, Accordion, Text, Divider } from '@mantine/core';
import type { DnD5eLegendaryAction, DnD5eAction } from '@/types/dnd5e';
import { LegendaryActionInput } from '../form-inputs/LegendaryActionInput';
import { ReactionInput } from '../form-inputs/ReactionInput';

export interface AdvancedTabProps {
  legendaryActions: DnD5eLegendaryAction[];
  setLegendaryActions: (value: DnD5eLegendaryAction[]) => void;
  reactions: DnD5eAction[];
  setReactions: (value: DnD5eAction[]) => void;
}

export function AdvancedTab(props: AdvancedTabProps) {
  const { legendaryActions, setLegendaryActions, reactions, setReactions } = props;

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Add legendary actions and reactions for powerful creatures
      </Text>

      {/* Legendary Actions */}
      <div>
        <Text fw={500} mb="xs">
          Legendary Actions
        </Text>

        {legendaryActions.length > 0 && (
          <Accordion variant="contained" mb="md">
            {legendaryActions.map((action, index) => (
              <LegendaryActionInput
                key={index}
                action={action}
                index={index}
                onChange={(updatedAction) => {
                  const updated = [...legendaryActions];
                  updated[index] = updatedAction;
                  setLegendaryActions(updated);
                }}
                onRemove={() => {
                  const updated = legendaryActions.filter((_, i) => i !== index);
                  setLegendaryActions(updated);
                }}
              />
            ))}
          </Accordion>
        )}

        <Button
          variant="light"
          onClick={() => {
            setLegendaryActions([
              ...legendaryActions,
              {
                name: '',
                desc: '',
              },
            ]);
          }}>
          Add Legendary Action
        </Button>
      </div>

      <Divider />

      {/* Reactions */}
      <div>
        <Text fw={500} mb="xs">
          Reactions
        </Text>

        {reactions.length > 0 && (
          <Accordion variant="contained" mb="md">
            {reactions.map((reaction, index) => (
              <ReactionInput
                key={index}
                reaction={reaction}
                index={index}
                onChange={(updatedReaction) => {
                  const updated = [...reactions];
                  updated[index] = updatedReaction;
                  setReactions(updated);
                }}
                onRemove={() => {
                  const updated = reactions.filter((_, i) => i !== index);
                  setReactions(updated);
                }}
              />
            ))}
          </Accordion>
        )}

        <Button
          variant="light"
          onClick={() => {
            setReactions([
              ...reactions,
              {
                name: '',
                desc: '',
              },
            ]);
          }}>
          Add Reaction
        </Button>
      </div>
    </Stack>
  );
}
