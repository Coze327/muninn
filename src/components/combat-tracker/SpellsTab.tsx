'use client';

import { useState, useEffect } from 'react';
import {
  Paper,
  Text,
  Stack,
  Group,
  Button,
  Collapse,
  Badge,
  ActionIcon,
  Tabs,
  Box,
  Tooltip,
  Select,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  PiCaretDown,
  PiCaretRight,
  PiCircle,
  PiCircleFill,
} from 'react-icons/pi';
import { useDiceRoller } from '@/hooks/useDiceRoller';
import { DamageTypeIcon } from './DamageTypeIcon';
import type { DnD5eInnateSpellcasting, DnD5eInnateSpell } from '@/types/dnd5e';

type SpellcastingData = {
  ability: string;
  dc: number;
  attack_bonus: number;
  slots: Record<string, number>; // { "1": 4, "2": 3, etc. }
  at_will?: string[]; // Spells that can be cast at will
  [key: string]: unknown; // "0", "1", "2", etc. are spell name arrays
};

type SpellSlotUsage = Record<string, { max: number; used: number }>;

type Spell = {
  name: string;
  level: number;
  school: { index: string };
  casting_time: string;
  range: string;
  components: string[];
  duration: string;
  concentration: boolean;
  desc: string[];
  higher_level?: string[];
  attack_type?: string;
  damage?: {
    damage_type: { index: string };
    damage_at_slot_level?: Record<string, string>;
    damage_at_character_level?: Record<string, string>;
  };
  dc?: {
    dc_type: { index: string };
    success_type: string;
  };
};

type SpellsTabProps = {
  spellcastingData: SpellcastingData | null;
  innateSpellcasting?: DnD5eInnateSpellcasting | null;
  currentSpellSlots: string | null; // JSON string from CombatCreature.spellSlots
  creatureId: string;
  creatureName: string;
  onSpellSlotsUpdate: (spellSlots: SpellSlotUsage) => void;
  onAttackContextMenu?: (e: React.MouseEvent, notation: string) => void;
  onDamageContextMenu?: (
    e: React.MouseEvent,
    notation: string,
    rollName: string
  ) => void;
};

// Helper to determine character level from spell slots
const getCasterLevel = (slots: Record<string, number>): number => {
  const highestSlot = Math.max(...Object.keys(slots).map(Number));
  // Spell slots become available at these levels:
  // 1st: level 1, 2nd: level 3, 3rd: level 5, 4th: level 7, 5th: level 9
  // 6th: level 11, 7th: level 13, 8th: level 15, 9th: level 17
  const slotToLevel: Record<number, number> = {
    1: 1,
    2: 3,
    3: 5,
    4: 7,
    5: 9,
    6: 11,
    7: 13,
    8: 15,
    9: 17,
  };
  return slotToLevel[highestSlot] || 1;
};

// Helper to get cantrip damage for character level
const getCantripDamage = (
  damage_at_character_level: Record<string, string>,
  casterLevel: number
): string => {
  // Cantrips scale at levels 1, 5, 11, 17
  if (casterLevel >= 17)
    return (
      damage_at_character_level['17'] ||
      damage_at_character_level['11'] ||
      damage_at_character_level['5'] ||
      damage_at_character_level['1']
    );
  if (casterLevel >= 11)
    return (
      damage_at_character_level['11'] ||
      damage_at_character_level['5'] ||
      damage_at_character_level['1']
    );
  if (casterLevel >= 5)
    return damage_at_character_level['5'] || damage_at_character_level['1'];
  return damage_at_character_level['1'];
};

// Helper to group innate spells by usage
const groupInnateSpells = (spells: DnD5eInnateSpell[]) => {
  const groups = new Map<string, DnD5eInnateSpell[]>();

  for (const spell of spells) {
    let key: string;
    if (spell.usage.type === 'at will') {
      key = 'At will';
    } else if (spell.usage.type === 'per day' && spell.usage.times) {
      key = `${spell.usage.times}/day each`;
    } else {
      key = spell.usage.type;
    }

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(spell);
  }

  // Sort: at will first, then descending by times per day
  return Array.from(groups.entries()).sort(([keyA], [keyB]) => {
    if (keyA === 'At will') return -1;
    if (keyB === 'At will') return 1;
    const timesA = parseInt(keyA) || 0;
    const timesB = parseInt(keyB) || 0;
    return timesB - timesA;
  });
};

export function SpellsTab({
  spellcastingData,
  innateSpellcasting,
  currentSpellSlots,
  creatureId,
  creatureName,
  onSpellSlotsUpdate,
  onAttackContextMenu,
  onDamageContextMenu,
}: SpellsTabProps) {
  const { roll } = useDiceRoller();
  const [spellSlots, setSpellSlots] = useState<SpellSlotUsage>({});
  const [activeLevel, setActiveLevel] = useState<string>('0');
  const [expandedSpells, setExpandedSpells] = useState<Set<string>>(new Set());
  const [spellDetails, setSpellDetails] = useState<Record<string, Spell>>({});
  const [loadingSpells, setLoadingSpells] = useState<Set<string>>(new Set());
  const [upcastLevels, setUpcastLevels] = useState<Record<string, string>>({});
  const [spellcastingType, setSpellcastingType] = useState<
    'prepared' | 'innate'
  >('prepared');

  // Determine if we have both types
  const hasPreparedSpells = !!spellcastingData;
  const hasInnateSpells = !!innateSpellcasting && innateSpellcasting.spells.length > 0;
  const hasBothTypes = hasPreparedSpells && hasInnateSpells;

  // Calculate caster level from spell slots
  const casterLevel = spellcastingData
    ? getCasterLevel(spellcastingData.slots)
    : 1;

  // Initialize spell slots from props
  useEffect(() => {
    if (!spellcastingData) return;

    let initialSlots: SpellSlotUsage = {};
    if (currentSpellSlots) {
      try {
        initialSlots = JSON.parse(currentSpellSlots);
      } catch {
        initialSlots = {};
      }
    }

    // Initialize any missing spell levels from spellcastingData.slots
    const slots = { ...initialSlots };
    Object.entries(spellcastingData.slots).forEach(([level, max]) => {
      if (!slots[level]) {
        slots[level] = { max, used: 0 };
      }
    });

    setSpellSlots(slots);
  }, [spellcastingData, currentSpellSlots]);

  // Fetch spell details for current level to show metadata (like concentration) even when closed
  useEffect(() => {
    if (!spellcastingData) return;

    const spells = (spellcastingData[activeLevel] as string[]) || [];
    const toFetch = spells.filter(
      (s) => !spellDetails[s] && !loadingSpells.has(s)
    );

    if (toFetch.length === 0) return;

    const newLoading = new Set(loadingSpells);
    toFetch.forEach((s) => newLoading.add(s));
    setLoadingSpells(newLoading);

    const fetchSpellDetails = async () => {
      const fetchPromises = toFetch.map(async (spellName) => {
        try {
          const spellIndex = spellName.toLowerCase().replace(/\s+/g, '-');
          const response = await fetch(`/api/spells/${spellIndex}`);
          if (response.ok) {
            const spell = await response.json();
            return { spellName, spell };
          }
        } catch (error) {
          console.error('Failed to fetch spell details:', error);
        }
        return null;
      });

      const results = await Promise.all(fetchPromises);
      const newDetails = { ...spellDetails };
      results.forEach((result) => {
        if (result) {
          newDetails[result.spellName] = result.spell;
        }
      });
      setSpellDetails(newDetails);

      const stillLoading = new Set(loadingSpells);
      toFetch.forEach((s) => stillLoading.delete(s));
      setLoadingSpells(stillLoading);
    };

    fetchSpellDetails();
  }, [activeLevel, spellcastingData]);

  // Fetch innate spell details when innate tab is active
  useEffect(() => {
    if (!innateSpellcasting || spellcastingType !== 'innate') return;

    const allInnateSpells = innateSpellcasting.spells.map((s) => s.name);
    const toFetch = allInnateSpells.filter(
      (s) => !spellDetails[s] && !loadingSpells.has(s)
    );

    if (toFetch.length === 0) return;

    const newLoading = new Set(loadingSpells);
    toFetch.forEach((s) => newLoading.add(s));
    setLoadingSpells(newLoading);

    const fetchSpellDetails = async () => {
      const fetchPromises = toFetch.map(async (spellName) => {
        try {
          const spellIndex = spellName.toLowerCase().replace(/\s+/g, '-');
          const response = await fetch(`/api/spells/${spellIndex}`);
          if (response.ok) {
            const spell = await response.json();
            return { spellName, spell };
          }
        } catch (error) {
          console.error('Failed to fetch spell details:', error);
        }
        return null;
      });

      const results = await Promise.all(fetchPromises);
      const newDetails = { ...spellDetails };
      results.forEach((result) => {
        if (result) {
          newDetails[result.spellName] = result.spell;
        }
      });
      setSpellDetails(newDetails);

      const stillLoading = new Set(loadingSpells);
      toFetch.forEach((s) => stillLoading.delete(s));
      setLoadingSpells(stillLoading);
    };

    fetchSpellDetails();
  }, [spellcastingType, innateSpellcasting]);

  const toggleSpellSlot = (level: string, slotIndex: number) => {
    const levelSlots = spellSlots[level];
    if (!levelSlots) return;

    const newUsed = slotIndex < levelSlots.used ? slotIndex : slotIndex + 1;
    const updatedSlots = {
      ...spellSlots,
      [level]: { ...levelSlots, used: newUsed },
    };

    setSpellSlots(updatedSlots);
    onSpellSlotsUpdate(updatedSlots);
  };

  const toggleSpellExpanded = async (spellName: string) => {
    const isExpanded = expandedSpells.has(spellName);
    const newExpanded = new Set(expandedSpells);

    if (isExpanded) {
      newExpanded.delete(spellName);
    } else {
      newExpanded.add(spellName);

      // Fetch spell details if we don't have them
      if (!spellDetails[spellName] && !loadingSpells.has(spellName)) {
        setLoadingSpells(new Set(loadingSpells).add(spellName));
        try {
          const spellIndex = spellName.toLowerCase().replace(/\s+/g, '-');
          const response = await fetch(`/api/spells/${spellIndex}`);
          if (response.ok) {
            const spell = await response.json();
            setSpellDetails({ ...spellDetails, [spellName]: spell });
          }
        } catch (error) {
          console.error('Failed to fetch spell details:', error);
        } finally {
          const newLoading = new Set(loadingSpells);
          newLoading.delete(spellName);
          setLoadingSpells(newLoading);
        }
      }
    }

    setExpandedSpells(newExpanded);
  };

  if (!spellcastingData && !innateSpellcasting) {
    return (
      <Text c='dimmed' ta='center' py='md'>
        No spellcasting ability
      </Text>
    );
  }

  // Get spell levels available (for prepared spells)
  const spellLevels = spellcastingData
    ? [
        ...(spellcastingData.at_will && spellcastingData.at_will.length > 0 ? ['at_will'] : []),
        '0',
        ...Object.keys(spellcastingData.slots).sort()
      ]
    : [];

  // Get spells for current level (for prepared spells)
  const spellsAtLevel = spellcastingData
    ? ((spellcastingData[activeLevel] as string[]) || [])
    : [];

  // Render prepared spells section
  const renderPreparedSpells = () => {
    if (!spellcastingData) return null;

    return (
      <Stack gap='xs'>
      {/* Spellcasting Stats */}
      <Group gap='xl' justify='center'>
        <Stack gap={4} align='center'>
          <Text size='xs' c='dimmed' fw={500} tt='uppercase'>
            Ability
          </Text>
          <Text size='lg' fw={600}>
            {spellcastingData.ability}
          </Text>
        </Stack>
        <Stack gap={4} align='center'>
          <Text size='xs' c='dimmed' fw={500} tt='uppercase'>
            Spell Attack
          </Text>
          <Button
            size='sm'
            variant='light'
            onClick={() => {
              const notation = `1d20+${spellcastingData.attack_bonus}`;
              roll(notation, {
                creatureName,
                rollType: 'attack',
                rollName: 'Spell Attack',
              });
            }}
            onContextMenu={(e) => {
              if (onAttackContextMenu) {
                e.preventDefault();
                const notation = `1d20+${spellcastingData.attack_bonus}`;
                onAttackContextMenu(e, notation);
              }
            }}>
            +{spellcastingData.attack_bonus}
          </Button>
        </Stack>
        <Stack gap={4} align='center'>
          <Text size='xs' c='dimmed' fw={500} tt='uppercase'>
            Spell Save DC
          </Text>
          <Text size='lg' fw={600}>
            {spellcastingData.dc}
          </Text>
        </Stack>
      </Group>

      {/* Spell Slots Display - Only for current level, or spacer for cantrips */}
      {activeLevel !== '0' && spellSlots[activeLevel] ? (
        <Group gap='xs' wrap='nowrap'>
          <Text size='sm' fw={500}>
            Level {activeLevel} Slots:
          </Text>
          <Group gap={4}>
            {Array.from({ length: spellSlots[activeLevel].max }).map((_, i) => {
              // Reverse index so slots are used from right to left
              const reverseIndex = spellSlots[activeLevel].max - 1 - i;
              const isUsed = reverseIndex < spellSlots[activeLevel].used;

              return (
                <Tooltip
                  key={i}
                  label={isUsed ? 'Click to restore' : 'Click to use'}
                  withArrow>
                  <ActionIcon
                    variant='subtle'
                    size='sm'
                    onClick={() => toggleSpellSlot(activeLevel, reverseIndex)}
                    color={isUsed ? 'gray' : 'blue'}>
                    {isUsed ? <PiCircle /> : <PiCircleFill />}
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Group>
        </Group>
      ) : (
        <Box h={22} />
      )}

      {/* Spell Level Tabs */}
      <Box pos='relative'>
        <Tabs value={activeLevel} onChange={(val) => setActiveLevel(val || '0')}>
          <Tabs.List>
            {spellLevels.map((level) => {
              const spells = (spellcastingData[level] as string[]) || [];
              if (spells.length === 0) return null;

              return (
                <Tabs.Tab key={level} value={level}>
                  <Group gap={6} wrap='nowrap'>
                    {level === 'at_will'
                      ? 'At Will'
                      : level === '0'
                      ? 'Cantrips'
                      : `Level ${level}`}
                    {level !== '0' && level !== 'at_will' && spellSlots[level] && (
                      <Badge size='xs' variant='light' color='blue'>
                        {spellSlots[level].max - spellSlots[level].used}
                      </Badge>
                    )}
                  </Group>
                </Tabs.Tab>
              );
            })}
          </Tabs.List>

          {/* Expand/Collapse All button - positioned at far right of tabs */}
          {(() => {
            const spells = (spellcastingData[activeLevel] as string[]) || [];
            if (spells.length === 0) return null;

            const expandedInLevel = spells.filter((s) =>
              expandedSpells.has(s)
            ).length;
            const allExpanded = expandedInLevel === spells.length;

            const handleExpandAll = async () => {
              const newExpanded = new Set(expandedSpells);
              spells.forEach((spellName) => newExpanded.add(spellName));
              setExpandedSpells(newExpanded);

              // Fetch details for all spells that don't have them yet
              const toFetch = spells.filter(
                (s) => !spellDetails[s] && !loadingSpells.has(s)
              );
              if (toFetch.length > 0) {
                const newLoading = new Set(loadingSpells);
                toFetch.forEach((s) => newLoading.add(s));
                setLoadingSpells(newLoading);

                const fetchPromises = toFetch.map(async (spellName) => {
                  try {
                    const spellIndex = spellName
                      .toLowerCase()
                      .replace(/\s+/g, '-');
                    const response = await fetch(`/api/spells/${spellIndex}`);
                    if (response.ok) {
                      const spell = await response.json();
                      return { spellName, spell };
                    }
                  } catch (error) {
                    console.error('Failed to fetch spell details:', error);
                  }
                  return null;
                });

                const results = await Promise.all(fetchPromises);
                const newDetails = { ...spellDetails };
                results.forEach((result) => {
                  if (result) {
                    newDetails[result.spellName] = result.spell;
                  }
                });
                setSpellDetails(newDetails);
                setLoadingSpells(new Set());
              }
            };

            const handleCollapseAll = () => {
              const newExpanded = new Set(expandedSpells);
              spells.forEach((spellName) => newExpanded.delete(spellName));
              setExpandedSpells(newExpanded);
            };

            return (
              <Button
                pos='absolute'
                top={4}
                right={0}
                size='xs'
                variant='subtle'
                style={{ zIndex: 1 }}
                onClick={allExpanded ? handleCollapseAll : handleExpandAll}>
                {allExpanded ? 'Collapse All' : 'Expand All'}
              </Button>
            );
          })()}

        {spellLevels.map((level) => {
          const spells = (spellcastingData[level] as string[]) || [];
          if (spells.length === 0) return null;

          return (
            <Tabs.Panel key={level} value={level} pt='md'>
              <Stack gap='xs' pb={168}>
                {spells.map((spellName) => {
                  const isExpanded = expandedSpells.has(spellName);
                  const details = spellDetails[spellName];
                  const isLoading = loadingSpells.has(spellName);

                  return (
                    <Paper key={spellName} withBorder p='sm'>
                      <Group
                        justify='space-between'
                        align='center'
                        wrap='nowrap'
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleSpellExpanded(spellName)}>
                        <Group gap='xs'>
                          {isExpanded ? <PiCaretDown /> : <PiCaretRight />}
                          <Text fw={500}>{spellName}</Text>
                          {details?.concentration && (
                            <Badge size='xs' variant='light' color='violet'>
                              Concentration
                            </Badge>
                          )}
                        </Group>
                      </Group>

                      <Collapse in={isExpanded}>
                        {isLoading ? (
                          <Text size='sm' c='dimmed' mt='xs'>
                            Loading spell details...
                          </Text>
                        ) : details ? (
                          <Stack gap='xs' mt='md'>
                            <Group gap='md' wrap='wrap'>
                              <Text size='xs' c='dimmed'>
                                <strong>Casting Time:</strong>{' '}
                                {details.casting_time}
                              </Text>
                              <Text size='xs' c='dimmed'>
                                <strong>Range:</strong> {details.range}
                              </Text>
                              <Text size='xs' c='dimmed'>
                                <strong>Duration:</strong> {details.duration}
                              </Text>
                              <Text size='xs' c='dimmed'>
                                <strong>Components:</strong>{' '}
                                {details.components.join(', ')}
                              </Text>
                              <Text size='xs' c='dimmed'>
                                <strong>School:</strong>{' '}
                                <span style={{ textTransform: 'capitalize' }}>
                                  {details.school.index}
                                </span>
                              </Text>
                            </Group>
                            <Text
                              size='sm'
                              mt='xs'
                              style={{ whiteSpace: 'pre-wrap' }}>
                              {details.desc.join('\n\n')}
                            </Text>
                            {details.higher_level &&
                              details.higher_level.length > 0 && (
                                <Text size='sm' mt='xs' fs='italic'>
                                  <strong>At Higher Levels:</strong>{' '}
                                  {details.higher_level.join(' ')}
                                </Text>
                              )}
                            {details && (details.damage || activeLevel !== '0') && (
                              <Group gap='xs' mt='md' align='flex-end'>
                                {/* Upcast selector */}
                                {details.damage?.damage_at_slot_level && (
                                  <Select
                                    label='Cast at Level'
                                    size='xs'
                                    w={120}
                                    value={
                                      upcastLevels[spellName] ||
                                      String(details.level)
                                    }
                                    onChange={(val) => {
                                      if (val) {
                                        setUpcastLevels({
                                          ...upcastLevels,
                                          [spellName]: val,
                                        });
                                      }
                                    }}
                                    data={Object.keys(
                                      details.damage.damage_at_slot_level
                                    )
                                      .filter((level) => {
                                        const maxSpellLevel = Math.max(
                                          ...Object.keys(spellcastingData?.slots || {}).map(Number)
                                        );
                                        return Number(level) <= maxSpellLevel;
                                      })
                                      .map((level) => ({
                                        value: level,
                                        label: `Level ${level}`,
                                      }))}
                                  />
                                )}

                                {/* Damage button */}
                                {details.damage && (
                                  <Stack gap={2} align='center'>
                                    <Text size='xs' c='dimmed' fw={500}>
                                      Damage
                                    </Text>
                                    <Tooltip
                                      label={details.damage.damage_type.index}
                                      withArrow>
                                      <Button
                                        size='xs'
                                        variant='light'
                                        color='red'
                                        py={6}
                                        h='auto'
                                        onClick={() => {
                                          let damageNotation = '';
                                          if (
                                            details.damage?.damage_at_slot_level
                                          ) {
                                            const castLevel =
                                              upcastLevels[spellName] ||
                                              String(details.level);
                                            damageNotation =
                                              details.damage.damage_at_slot_level[
                                                castLevel
                                              ] || '';
                                          } else if (
                                            details.damage
                                              ?.damage_at_character_level
                                          ) {
                                            damageNotation = getCantripDamage(
                                              details.damage
                                                .damage_at_character_level,
                                              casterLevel
                                            );
                                          }
                                          if (damageNotation) {
                                            roll(damageNotation, {
                                              creatureName,
                                              rollType: 'damage',
                                              rollName: `${spellName} - Damage`,
                                            });
                                          }
                                        }}
                                        onContextMenu={(e) => {
                                          if (onDamageContextMenu) {
                                            e.preventDefault();
                                            let damageNotation = '';
                                            if (
                                              details.damage?.damage_at_slot_level
                                            ) {
                                              const castLevel =
                                                upcastLevels[spellName] ||
                                                String(details.level);
                                              damageNotation =
                                                details.damage
                                                  .damage_at_slot_level[
                                                  castLevel
                                                ] || '';
                                            } else if (
                                              details.damage
                                                ?.damage_at_character_level
                                            ) {
                                              damageNotation = getCantripDamage(
                                                details.damage
                                                  .damage_at_character_level,
                                                casterLevel
                                              );
                                            }
                                            if (damageNotation) {
                                              onDamageContextMenu(
                                                e,
                                                damageNotation,
                                                `${spellName} - Damage`
                                              );
                                            }
                                          }
                                        }}>
                                        <Group gap={4} wrap='nowrap'>
                                          <DamageTypeIcon
                                            damageType={
                                              details.damage.damage_type.index
                                            }
                                          />
                                          <Text size='xs'>
                                            {details.damage.damage_at_slot_level
                                              ? details.damage
                                                  .damage_at_slot_level[
                                                  upcastLevels[spellName] ||
                                                    String(details.level)
                                                ]
                                              : details.damage
                                                  .damage_at_character_level
                                              ? getCantripDamage(
                                                  details.damage
                                                    .damage_at_character_level,
                                                  casterLevel
                                                )
                                              : ''}
                                          </Text>
                                        </Group>
                                      </Button>
                                    </Tooltip>
                                  </Stack>
                                )}

                                {/* Use Slot button - only for non-cantrips and non-at-will spells */}
                                {activeLevel !== '0' && activeLevel !== 'at_will' && (
                                  <Stack gap={2} align='center'>
                                    <Text size='xs' c='dimmed' fw={500}>
                                      Spell Slot
                                    </Text>
                                    <Button
                                      size='xs'
                                      variant='light'
                                      py={6}
                                      h='auto'
                                      onClick={() => {
                                        const levelToUse = details.damage
                                          ?.damage_at_slot_level
                                          ? upcastLevels[spellName] ||
                                            String(details.level)
                                          : activeLevel;

                                        const levelSlots = spellSlots[levelToUse];
                                        if (
                                          levelSlots &&
                                          levelSlots.used < levelSlots.max
                                        ) {
                                          toggleSpellSlot(
                                            levelToUse,
                                            levelSlots.used
                                          );

                                          const newUsed = levelSlots.used + 1;
                                          const remaining = levelSlots.max - newUsed;

                                          notifications.show({
                                            title: 'Spell Slot Used',
                                            message: `Level ${levelToUse} slot used. ${remaining}/${levelSlots.max} remaining.`,
                                            color: 'blue',
                                          });
                                        } else if (levelSlots) {
                                          notifications.show({
                                            title: 'No Slots Available',
                                            message: `No Level ${levelToUse} slots available.`,
                                            color: 'yellow',
                                          });
                                        }
                                      }}>
                                      Use
                                    </Button>
                                  </Stack>
                                )}
                              </Group>
                            )}
                          </Stack>
                        ) : (
                          <Text size='sm' c='dimmed' mt='xs'>
                            Click to load spell details...
                          </Text>
                        )}
                      </Collapse>
                    </Paper>
                  );
                })}
              </Stack>
            </Tabs.Panel>
          );
        })}
        </Tabs>
      </Box>
    </Stack>
    );
  };

  // Render innate spells section
  const renderInnateSpells = () => {
    if (!innateSpellcasting) return null;

    return (
      <Stack gap='xs'>
        {/* Innate Spellcasting Stats */}
        <Group gap='xl' justify='center'>
          <Stack gap={4} align='center'>
            <Text size='xs' c='dimmed' fw={500} tt='uppercase'>
              Ability
            </Text>
            <Text size='lg' fw={600}>
              {innateSpellcasting.ability}
            </Text>
          </Stack>
          <Stack gap={4} align='center'>
            <Text size='xs' c='dimmed' fw={500} tt='uppercase'>
              Spell Save DC
            </Text>
            <Text size='lg' fw={600}>
              {innateSpellcasting.dc}
            </Text>
          </Stack>
        </Group>

        {/* Innate Spell Groups */}
        <Stack gap='md' mt='md' pb={168}>
          {groupInnateSpells(innateSpellcasting.spells).map(([usage, spells], groupIndex) => (
            <Paper key={groupIndex} withBorder p='sm'>
              <Text fw={600} mb='xs'>
                {usage}
              </Text>
              <Stack gap='xs'>
                {spells.map((spell) => {
                  const spellName = spell.name;
                  const isExpanded = expandedSpells.has(spellName);
                  const details = spellDetails[spellName];
                  const isLoading = loadingSpells.has(spellName);

                  return (
                    <Paper key={spellName} withBorder p='sm'>
                      <Group
                        justify='space-between'
                        align='center'
                        wrap='nowrap'
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleSpellExpanded(spellName)}>
                        <Group gap='xs'>
                          {isExpanded ? <PiCaretDown /> : <PiCaretRight />}
                          <Text fw={500}>{spellName}</Text>
                          {details?.concentration && (
                            <Badge size='xs' variant='light' color='violet'>
                              Concentration
                            </Badge>
                          )}
                        </Group>
                      </Group>

                      <Collapse in={isExpanded}>
                        {isLoading ? (
                          <Text size='sm' c='dimmed' mt='xs'>
                            Loading spell details...
                          </Text>
                        ) : details ? (
                          <Stack gap='xs' mt='md'>
                            <Group gap='md' wrap='wrap'>
                              <Text size='xs' c='dimmed'>
                                <strong>Casting Time:</strong>{' '}
                                {details.casting_time}
                              </Text>
                              <Text size='xs' c='dimmed'>
                                <strong>Range:</strong> {details.range}
                              </Text>
                              <Text size='xs' c='dimmed'>
                                <strong>Duration:</strong> {details.duration}
                              </Text>
                              <Text size='xs' c='dimmed'>
                                <strong>Components:</strong>{' '}
                                {details.components.join(', ')}
                              </Text>
                              <Text size='xs' c='dimmed'>
                                <strong>School:</strong>{' '}
                                <span style={{ textTransform: 'capitalize' }}>
                                  {details.school.index}
                                </span>
                              </Text>
                            </Group>
                            <Text
                              size='sm'
                              mt='xs'
                              style={{ whiteSpace: 'pre-wrap' }}>
                              {details.desc.join('\n\n')}
                            </Text>
                            {details.higher_level &&
                              details.higher_level.length > 0 && (
                                <Text size='sm' mt='xs' fs='italic'>
                                  <strong>At Higher Levels:</strong>{' '}
                                  {details.higher_level.join(' ')}
                                </Text>
                              )}
                            {details.damage && (
                              <Group gap='xs' mt='md' align='flex-end'>
                                <Stack gap={2} align='center'>
                                  <Text size='xs' c='dimmed' fw={500}>
                                    Damage
                                  </Text>
                                  <Tooltip
                                    label={details.damage.damage_type.index}
                                    withArrow>
                                    <Button
                                      size='xs'
                                      variant='light'
                                      color='red'
                                      py={6}
                                      h='auto'
                                      onClick={() => {
                                        const damageNotation =
                                          details.damage
                                            ?.damage_at_character_level
                                            ? getCantripDamage(
                                                details.damage
                                                  .damage_at_character_level,
                                                casterLevel
                                              )
                                            : details.damage?.damage_at_slot_level?.['1'] || '';
                                        if (damageNotation) {
                                          roll(damageNotation, {
                                            creatureName,
                                            rollType: 'damage',
                                            rollName: `${spellName} - Damage`,
                                          });
                                        }
                                      }}
                                      onContextMenu={(e) => {
                                        if (onDamageContextMenu) {
                                          e.preventDefault();
                                          const damageNotation =
                                            details.damage
                                              ?.damage_at_character_level
                                              ? getCantripDamage(
                                                  details.damage
                                                    .damage_at_character_level,
                                                  casterLevel
                                                )
                                              : details.damage?.damage_at_slot_level?.['1'] || '';
                                          if (damageNotation) {
                                            onDamageContextMenu(
                                              e,
                                              damageNotation,
                                              `${spellName} - Damage`
                                            );
                                          }
                                        }
                                      }}>
                                      <Group gap={4} wrap='nowrap'>
                                        <DamageTypeIcon
                                          damageType={
                                            details.damage.damage_type.index
                                          }
                                        />
                                        <Text size='xs'>
                                          {details.damage
                                            .damage_at_character_level
                                            ? getCantripDamage(
                                                details.damage
                                                  .damage_at_character_level,
                                                casterLevel
                                              )
                                            : details.damage.damage_at_slot_level?.['1'] || ''}
                                        </Text>
                                      </Group>
                                    </Button>
                                  </Tooltip>
                                </Stack>
                              </Group>
                            )}
                          </Stack>
                        ) : (
                          <Text size='sm' c='dimmed' mt='xs'>
                            Click to load spell details...
                          </Text>
                        )}
                      </Collapse>
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>
    );
  };

  // Main return - show sub-tabs if both types exist
  if (hasBothTypes) {
    return (
      <Tabs value={spellcastingType} onChange={(val) => setSpellcastingType(val as 'prepared' | 'innate')}>
        <Tabs.List>
          <Tabs.Tab value='prepared'>Prepared Spells</Tabs.Tab>
          <Tabs.Tab value='innate'>Innate Spells</Tabs.Tab>
        </Tabs.List>
        <Box mt='md'>
          <Tabs.Panel value='prepared'>{renderPreparedSpells()}</Tabs.Panel>
          <Tabs.Panel value='innate'>{renderInnateSpells()}</Tabs.Panel>
        </Box>
      </Tabs>
    );
  }

  // Show whichever type exists
  return (
    <>
      {hasPreparedSpells && renderPreparedSpells()}
      {hasInnateSpells && renderInnateSpells()}
    </>
  );
}
