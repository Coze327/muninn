'use client';

import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import { notifications } from '@mantine/notifications';
import { useRollHistory } from '@/lib/contexts/RollHistoryContext';
import { DiceRollNotification } from '@/components/dice/DiceRollNotification';
import type { RollOptions, RollType } from '@/types/dice';

function getRollColor(rollType: RollType): string {
  switch (rollType) {
    case 'ability':
      return 'blue';
    case 'save':
      return 'violet';
    case 'skill':
      return 'cyan';
    case 'attack':
      return 'indigo';
    case 'damage':
      return 'orange';
    default:
      return 'blue';
  }
}

// Check if a d20 roll resulted in a natural 20 or natural 1
// Only checks dice that were actually used (not dropped by advantage/disadvantage)
function checkD20Critical(diceRoll: DiceRoll): 'nat20' | 'nat1' | null {
  try {
    // Access the rolls array to find d20 results
    const rollsData = diceRoll.rolls;
    if (!rollsData || rollsData.length === 0) return null;

    // Check if this roll contains a d20
    for (const rollGroup of rollsData) {
      // Check if this is a standard die roll with individual results
      if (rollGroup && typeof rollGroup === 'object' && 'rolls' in rollGroup) {
        const rolls = (rollGroup as any).rolls;
        if (Array.isArray(rolls)) {
          for (const roll of rolls) {
            // Skip dropped dice (from advantage/disadvantage)
            if (roll && typeof roll === 'object') {
              // Check if the die was dropped (modifiers include 'd' or 'drop')
              const modifiers = roll.modifiers;
              const useInTotal = roll.useInTotal;

              // Skip this roll if it was dropped or not used in total
              if (
                useInTotal === false ||
                (modifiers && modifiers.includes && modifiers.includes('d'))
              ) {
                continue;
              }

              // Check if this is a d20 roll (initial value is the die face value)
              if ('initialValue' in roll) {
                const value = roll.initialValue;
                // Check for natural 20 or 1
                if (value === 20) return 'nat20';
                if (value === 1) return 'nat1';
              }
            }
          }
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function useDiceRoller() {
  const { addRoll } = useRollHistory();

  const roll = (notation: string, options: RollOptions) => {
    try {
      const diceRoll = new DiceRoll(notation);

      // Check for critical hits/fails on d20 rolls (not damage rolls)
      const critResult = options.rollType !== 'damage' ? checkD20Critical(diceRoll) : null;

      // Determine notification color
      let notificationColor = getRollColor(options.rollType);
      let critText = '';
      if (critResult === 'nat20') {
        notificationColor = 'green';
        critText = ' (Critical!)';
      } else if (critResult === 'nat1') {
        notificationColor = 'red';
        critText = ' (Critical Fail!)';
      }

      // Show notification with standard Mantine format
      notifications.show({
        title: `${options.creatureName}: ${diceRoll.total}${critText}`,
        message: `${options.rollName}\n→ ${diceRoll.output}`,
        color: notificationColor,
        autoClose: critResult ? 8000 : 5000,
        withCloseButton: true,
      });

      // Add to history
      addRoll({
        creatureName: options.creatureName,
        rollType: options.rollType,
        rollName: options.rollName,
        notation,
        result: diceRoll.total,
        output: diceRoll.output,
      });
    } catch (error) {
      // Handle invalid notation gracefully
      notifications.show({
        title: 'Invalid Roll',
        message: `Could not parse dice notation: ${notation}`,
        color: 'red',
        autoClose: 3000,
      });
      console.error('Dice roll error:', error);
    }
  };

  return { roll };
}
