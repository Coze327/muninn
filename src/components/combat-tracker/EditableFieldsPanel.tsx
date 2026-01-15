'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Text,
  Grid,
  TextInput,
  NumberInput,
  Checkbox,
  Button,
  Group,
  Stack,
  Badge,
  ActionIcon,
  MultiSelect,
  Paper,
  Divider,
  ColorInput,
  Tooltip,
} from '@mantine/core';
import {
  BsCCircleFill, //Concentration icon
  BsShieldFill, //Immunity icon
  BsShieldShaded, //Resistance icon
  BsShieldSlashFill, //Vulnerability icon
  BsShieldFillExclamation, //Condition Immunity icon
  BsShieldFillPlus, //Temp HP icon
} from 'react-icons/bs';
import { useDiceRoller } from '@/hooks/useDiceRoller';
import { useRollHistory } from '@/lib/contexts/RollHistoryContext';

// Design system: Border radius constants
const RADIUS = {
  XL: 16,
  LG: 12,
  MD: 8,
  SM: 6,
  XS: 4,
} as const;

type CombatCreature = {
  id: string;
  name: string;
  identifier: string | null;
  initiative: number;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  armorClass: number;
  tokenColor: string | null;
  statusEffects: string;
  isConcentrating: boolean;
  concentrationNote: string | null;
  statsSnapshot: string;
};

type EditableFieldsPanelProps = {
  creature: CombatCreature | null;
  onUpdate: (creature: Partial<CombatCreature> & { id: string }) => void;
};

// D&D 5e standard conditions
const CONDITIONS = [
  'Blinded',
  'Charmed',
  'Deafened',
  'Frightened',
  'Grappled',
  'Incapacitated',
  'Invisible',
  'Paralyzed',
  'Petrified',
  'Poisoned',
  'Prone',
  'Restrained',
  'Stunned',
  'Unconscious',
  'Exhaustion',
];

export function EditableFieldsPanel({
  creature,
  onUpdate,
}: EditableFieldsPanelProps) {
  const { roll } = useDiceRoller();
  const { addRoll } = useRollHistory();
  const [identifier, setIdentifier] = useState('');
  const [initiative, setInitiative] = useState<number | string>(0);
  const [armorClass, setArmorClass] = useState<number | string>(10);
  const [maxHp, setMaxHp] = useState<number | string>(1);
  const [currentHp, setCurrentHp] = useState<number | string>(1);
  const [tempHp, setTempHp] = useState<number | string>(0);
  const [tokenColor, setTokenColor] = useState('');
  const [statusEffects, setStatusEffects] = useState<string[]>([]);
  const [isConcentrating, setIsConcentrating] = useState(false);
  const [concentrationNote, setConcentrationNote] = useState('');
  const [hpAdjustValue, setHpAdjustValue] = useState<string>('');

  // Ref for auto-focusing HP adjustment input
  const hpInputRef = useRef<HTMLInputElement>(null);

  // Reset form when creature changes
  useEffect(() => {
    if (creature) {
      setIdentifier(creature.identifier || '');
      setInitiative(creature.initiative);
      setArmorClass(creature.armorClass);
      setMaxHp(creature.maxHp);
      setCurrentHp(creature.currentHp);
      setTempHp(creature.tempHp);
      setTokenColor(creature.tokenColor || '#4a5568');
      setIsConcentrating(creature.isConcentrating);
      setConcentrationNote(creature.concentrationNote || '');
      setHpAdjustValue('');
      try {
        setStatusEffects(JSON.parse(creature.statusEffects) || []);
      } catch {
        setStatusEffects([]);
      }

      // Auto-focus HP adjustment input when creature changes
      setTimeout(() => {
        hpInputRef.current?.focus();
      }, 100);
    }
  }, [creature]);

  if (!creature) {
    return (
      <Box ta='center' py='xl'>
        <Text c='dimmed'>Select a creature to edit</Text>
      </Box>
    );
  }

  const handleSave = async () => {
    const updates = {
      id: creature.id,
      identifier: identifier || null,
      initiative: Number(initiative),
      armorClass: Number(armorClass),
      maxHp: Number(maxHp),
      currentHp: Number(currentHp),
      tempHp: Number(tempHp),
      tokenColor: tokenColor || null,
      statusEffects: JSON.stringify(statusEffects),
      isConcentrating,
      concentrationNote: concentrationNote || null,
    };

    // Optimistic update
    onUpdate(updates);

    // API call to persist
    try {
      await fetch(`/api/combat-creatures/${creature.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Failed to save creature:', error);
    }
  };

  // Parse creature stats to check for special attributes
  const getCreatureAttributes = () => {
    try {
      const stats = JSON.parse(creature.statsSnapshot);
      return {
        hasImmunities:
          (stats.damage_immunities && stats.damage_immunities.length > 0) ||
          (stats.damageImmunities && stats.damageImmunities.length > 0),
        hasResistances:
          (stats.damage_resistances && stats.damage_resistances.length > 0) ||
          (stats.damageResistances && stats.damageResistances.length > 0),
        hasVulnerabilities:
          (stats.damage_vulnerabilities &&
            stats.damage_vulnerabilities.length > 0) ||
          (stats.damageVulnerabilities &&
            stats.damageVulnerabilities.length > 0),
        hasConditionalImmunities:
          (stats.condition_immunities &&
            stats.condition_immunities.length > 0) ||
          (stats.conditionImmunities && stats.conditionImmunities.length > 0),
      };
    } catch {
      return {
        hasImmunities: false,
        hasResistances: false,
        hasVulnerabilities: false,
        hasConditionalImmunities: false,
      };
    }
  };

  const attributes = getCreatureAttributes();

  // Apply damage (temp HP absorbs first, then current HP)
  const applyDamage = () => {
    const amount = Number(hpAdjustValue);
    if (isNaN(amount) || amount <= 0) return;

    let remaining = amount;
    let newTempHp = Number(tempHp);
    let newCurrentHp = Number(currentHp);
    const oldTempHp = Number(tempHp);

    // Temp HP absorbs damage first
    if (newTempHp > 0) {
      const absorbed = Math.min(newTempHp, remaining);
      newTempHp -= absorbed;
      remaining -= absorbed;
    }

    // Remaining damage goes to current HP
    newCurrentHp = Math.max(0, newCurrentHp - remaining);

    setTempHp(newTempHp);
    setCurrentHp(newCurrentHp);
    setHpAdjustValue('');

    // Auto-save HP changes
    onUpdate({ id: creature.id, currentHp: newCurrentHp, tempHp: newTempHp });
    fetch(`/api/combat-creatures/${creature.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentHp: newCurrentHp, tempHp: newTempHp }),
    }).catch(console.error);

    // Log damage to roll history
    const displayName = creature.identifier
      ? `${creature.name} (${creature.identifier})`
      : creature.name;
    const tempAbsorbed = oldTempHp - newTempHp;
    const hpDamage = Number(currentHp) - newCurrentHp;
    let output = `${newCurrentHp}/${maxHp} HP`;
    if (tempAbsorbed > 0) {
      output = `${tempAbsorbed} absorbed by temp HP, ${hpDamage} to HP → ${output}`;
    }
    if (newTempHp > 0) {
      output += ` (+${newTempHp} temp)`;
    }
    addRoll({
      creatureName: displayName,
      rollType: 'damage',
      rollName: 'Damage Taken',
      notation: `−${amount}`,
      result: -amount,
      output,
    });

    // Concentration check if creature is concentrating (based on total damage taken)
    if (isConcentrating) {
      try {
        const stats = JSON.parse(creature.statsSnapshot);
        const conScore = stats.abilities?.CON || 10;
        const conModifier = Math.floor((conScore - 10) / 2);
        const dc = Math.max(10, Math.floor(amount / 2));

        roll(`1d20+${conModifier}`, {
          creatureName: displayName,
          rollType: 'save',
          rollName: `Concentration (DC ${dc})`,
          dc,
        });
      } catch (error) {
        console.error('Failed to roll concentration check:', error);
      }
    }

    // Refocus input
    setTimeout(() => hpInputRef.current?.focus(), 50);
  };

  // Grant temporary HP (replaces current temp HP if higher)
  const grantTempHp = () => {
    const amount = Number(hpAdjustValue);
    if (isNaN(amount) || amount <= 0) return;

    // Temp HP doesn't stack - take the higher value
    const newTempHp = Math.max(Number(tempHp), amount);
    setTempHp(newTempHp);
    setHpAdjustValue('');

    // Auto-save temp HP change
    onUpdate({ id: creature.id, tempHp: newTempHp });
    fetch(`/api/combat-creatures/${creature.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempHp: newTempHp }),
    }).catch(console.error);

    // Refocus input
    setTimeout(() => hpInputRef.current?.focus(), 50);
  };

  // Apply healing
  const applyHealing = () => {
    const amount = Number(hpAdjustValue);
    if (isNaN(amount) || amount <= 0) return;

    const oldHp = Number(currentHp);
    const newHp = Math.min(Number(maxHp), oldHp + amount);
    const actualHealing = newHp - oldHp;
    setCurrentHp(newHp);
    setHpAdjustValue('');

    // Auto-save HP changes
    onUpdate({ id: creature.id, currentHp: newHp });
    fetch(`/api/combat-creatures/${creature.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentHp: newHp }),
    }).catch(console.error);

    // Log healing to roll history
    const displayName = creature.identifier
      ? `${creature.name} (${creature.identifier})`
      : creature.name;
    let output = `${newHp}/${maxHp} HP`;
    if (actualHealing < amount) {
      output = `${actualHealing} healed (${amount - actualHealing} overheal) → ${output}`;
    }
    if (Number(tempHp) > 0) {
      output += ` (+${tempHp} temp)`;
    }
    addRoll({
      creatureName: displayName,
      rollType: 'damage',
      rollName: 'Healing',
      notation: `+${amount}`,
      result: actualHealing,
      output,
    });

    // Refocus input
    setTimeout(() => hpInputRef.current?.focus(), 50);
  };

  // Handle keyboard shortcuts for HP adjustment
  // Enter = Damage, Shift+Enter = Heal, Ctrl+Enter = Grant Temp HP
  const handleHpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.ctrlKey) {
        grantTempHp();
      } else if (e.shiftKey) {
        applyHealing();
      } else {
        applyDamage();
      }
    }
  };

  // Handle Enter key to save editable fields
  const handleFieldKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '16px',
        height: '100%',
      }}>
      {/* Left: Editable Fields */}
      <Stack gap='md'>
        {/* Row 1: Identifier, Initiative, AC, Max HP, Current HP */}
        <Group gap='md' grow>
          <TextInput
            label='Identifier'
            placeholder='Name, Type, etc.'
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={handleFieldKeyDown}
            size='sm'
            styles={{
              input: { borderRadius: RADIUS.MD },
            }}
          />
          <NumberInput
            label='Initiative'
            value={initiative}
            onChange={setInitiative}
            onKeyDown={handleFieldKeyDown}
            size='sm'
            min={0}
            styles={{
              input: { borderRadius: RADIUS.MD },
            }}
          />
          <NumberInput
            label='AC'
            value={armorClass}
            onChange={setArmorClass}
            onKeyDown={handleFieldKeyDown}
            min={0}
            size='sm'
            styles={{
              input: { borderRadius: RADIUS.MD },
            }}
          />
          <NumberInput
            label='Max HP'
            value={maxHp}
            onChange={setMaxHp}
            onKeyDown={handleFieldKeyDown}
            min={1}
            size='sm'
            styles={{
              input: { borderRadius: RADIUS.MD },
            }}
          />
          <NumberInput
            label='Current HP'
            value={currentHp}
            onChange={setCurrentHp}
            onKeyDown={handleFieldKeyDown}
            min={0}
            size='sm'
            styles={{
              input: { borderRadius: RADIUS.MD },
            }}
          />
        </Group>

        {/* Row 2: Token Colour, Concentration, Status Effects (2x width), Save Button */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 2fr 1fr',
            gap: '16px',
            alignItems: 'flex-end',
          }}>
          <ColorInput
            label='Token Colour'
            value={tokenColor}
            onChange={setTokenColor}
            size='sm'
            format='hex'
            // eyeDropper={false} // Disable screen color picker
            eyeDropperIcon={null}
            swatches={[
              '#ef4444',
              '#f97316',
              '#f59e0b',
              '#eab308',
              '#84cc16',
              '#22c55e',
              '#10b981',
              '#14b8a6',
              '#06b6d4',
              '#0ea5e9',
              '#3b82f6',
              '#6366f1',
              '#8b5cf6',
              '#a855f7',
              '#d946ef',
              '#ec4899',
              '#f43f5e',
              '#64748b',
              '#6b7280',
              '#4a5568',
            ]}
            styles={{
              input: { borderRadius: RADIUS.MD },
            }}
          />
          <Box>
            <Text size='sm' fw={500} mb={4}>
              Concentration
            </Text>
            <Group gap='xs' wrap='nowrap' align='center'>
              <Checkbox
                checked={isConcentrating}
                onChange={(e) => setIsConcentrating(e.target.checked)}
                size='sm'
              />
              <TextInput
                placeholder='Optional spell...'
                value={concentrationNote}
                onChange={(e) => setConcentrationNote(e.target.value)}
                onKeyDown={handleFieldKeyDown}
                size='sm'
                disabled={!isConcentrating}
                styles={{
                  input: { borderRadius: RADIUS.MD },
                  root: { flex: 1 },
                }}
              />
            </Group>
          </Box>
          <MultiSelect
            label='Status Effects'
            placeholder='Add conditions...'
            data={CONDITIONS}
            value={statusEffects}
            onChange={setStatusEffects}
            searchable
            clearable
            size='sm'
            styles={{
              input: {
                borderRadius: RADIUS.MD,
                minHeight: '36px',
                maxHeight: '36px',
                overflow: 'auto',
              },
            }}
          />
          <Button
            onClick={handleSave}
            size='sm'
            variant='filled'
            styles={{
              root: {
                borderRadius: RADIUS.MD,
                height: '36px',
              },
            }}>
            Save
          </Button>
        </Box>
      </Stack>

      {/* Right: HP Quick Adjust */}
      <Box
        p='sm'
        style={{
          width: '240px',
          borderLeft: '1px solid var(--mantine-color-default-border)',
        }}>
        <Stack gap='md'>
          {/* Status Indicators */}
          <Group
            gap='xs'
            justify='center'
            wrap='nowrap'
            style={{ lineHeight: 0 }}>
            <Tooltip label='Concentration' withArrow>
              <Box
                style={{
                  transition: 'all 0.2s ease',
                  filter: isConcentrating
                    ? 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.6))'
                    : 'none',
                  transform: isConcentrating ? 'scale(1.1)' : 'scale(1)',
                }}>
                <BsCCircleFill
                  size={20}
                  color={isConcentrating ? '#a855f7' : '#888'}
                />
              </Box>
            </Tooltip>
            <Tooltip label='Damage Immunities' withArrow>
              <Box
                style={{
                  transition: 'all 0.2s ease',
                  filter: attributes.hasImmunities
                    ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))'
                    : 'none',
                  transform: attributes.hasImmunities
                    ? 'scale(1.1)'
                    : 'scale(1)',
                }}>
                <BsShieldFill
                  size={20}
                  color={attributes.hasImmunities ? '#3b82f6' : '#888'}
                />
              </Box>
            </Tooltip>
            <Tooltip label='Damage Resistances' withArrow>
              <Box
                style={{
                  transition: 'all 0.2s ease',
                  filter: attributes.hasResistances
                    ? 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))'
                    : 'none',
                  transform: attributes.hasResistances
                    ? 'scale(1.1)'
                    : 'scale(1)',
                }}>
                <BsShieldShaded
                  size={20}
                  color={attributes.hasResistances ? '#10b981' : '#888'}
                />
              </Box>
            </Tooltip>
            <Tooltip label='Damage Vulnerabilities' withArrow>
              <Box
                style={{
                  transition: 'all 0.2s ease',
                  filter: attributes.hasVulnerabilities
                    ? 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.6))'
                    : 'none',
                  transform: attributes.hasVulnerabilities
                    ? 'scale(1.1)'
                    : 'scale(1)',
                }}>
                <BsShieldSlashFill
                  size={20}
                  color={attributes.hasVulnerabilities ? '#ef4444' : '#888'}
                />
              </Box>
            </Tooltip>
            <Tooltip label='Condition Immunities' withArrow>
              <Box
                style={{
                  transition: 'all 0.2s ease',
                  filter: attributes.hasConditionalImmunities
                    ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))'
                    : 'none',
                  transform: attributes.hasConditionalImmunities
                    ? 'scale(1.1)'
                    : 'scale(1)',
                }}>
                <BsShieldFillExclamation
                  size={20}
                  color={
                    attributes.hasConditionalImmunities ? '#f59e0b' : '#888'
                  }
                />
              </Box>
            </Tooltip>
            <Tooltip
              label={
                Number(tempHp) > 0
                  ? `Temp HP: ${tempHp} (Ctrl+Enter to grant)`
                  : 'Temp HP (Ctrl+Enter to grant)'
              }
              withArrow>
              <Box
                style={{
                  transition: 'all 0.2s ease',
                  filter:
                    Number(tempHp) > 0
                      ? 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.6))'
                      : 'none',
                  transform: Number(tempHp) > 0 ? 'scale(1.1)' : 'scale(1)',
                }}>
                <BsShieldFillPlus
                  size={20}
                  color={Number(tempHp) > 0 ? '#06b6d4' : '#888'}
                />
              </Box>
            </Tooltip>
          </Group>

          {/* HP Adjustment Input */}
          <TextInput
            ref={hpInputRef}
            type='number'
            placeholder='Amount'
            value={hpAdjustValue}
            onChange={(e) => setHpAdjustValue(e.target.value)}
            onKeyDown={handleHpKeyDown}
            size='sm'
            styles={{
              input: {
                borderRadius: RADIUS.MD,
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 600,
                height: '36px',
              },
            }}
          />
          <Group gap='xs' grow>
            <Button
              variant='light'
              color='red'
              size='sm'
              onClick={applyDamage}
              disabled={!hpAdjustValue || Number(hpAdjustValue) <= 0}
              styles={{
                root: {
                  borderRadius: RADIUS.MD,
                  height: '32px',
                  fontSize: '13px',
                },
              }}>
              Damage
            </Button>
            <Button
              variant='light'
              color='green'
              size='sm'
              onClick={applyHealing}
              disabled={!hpAdjustValue || Number(hpAdjustValue) <= 0}
              styles={{
                root: {
                  borderRadius: RADIUS.MD,
                  height: '32px',
                  fontSize: '13px',
                },
              }}>
              Heal
            </Button>
          </Group>
        </Stack>
      </Box>
    </Box>
  );
}
