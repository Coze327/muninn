'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Box,
  Text,
  Stack,
  Divider,
  Grid,
  Paper,
  Title,
  Group,
  Accordion,
  Menu,
} from '@mantine/core';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import { useDiceRoller } from '@/hooks/useDiceRoller';
import { getCreatureImagePath } from '@/lib/utils/creature-image';

type CombatCreature = {
  id: string;
  name: string;
  identifier: string | null;
  initiative: number;
  currentHp: number;
  maxHp: number;
  armorClass: number;
  tokenColor: string | null;
  sourceType: string;
  statsSnapshot: string;
};

type StatBlockPanelProps = {
  creature: CombatCreature | null;
};

// Ability score modifier calculation
function getModifier(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

// Parse "CON +6, INT +8" → [{ability: 'CON', bonus: 6}, ...]
function parseSavingThrows(
  text: string
): Array<{ ability: string; bonus: number }> {
  const regex = /([A-Z]{3})\s*\+(\d+)/g;
  const results: Array<{ ability: string; bonus: number }> = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    results.push({ ability: match[1], bonus: parseInt(match[2]) });
  }
  return results;
}

// Parse "History +12, Perception +10" → [{skill: 'History', bonus: 12}, ...]
function parseSkills(text: string): Array<{ skill: string; bonus: number }> {
  const regex = /([A-Za-z\s]+)\s*\+(\d+)/g;
  const results: Array<{ skill: string; bonus: number }> = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    results.push({
      skill: match[1].trim(),
      bonus: parseInt(match[2]),
    });
  }
  return results;
}

export function StatBlockPanel({ creature }: StatBlockPanelProps) {
  const { roll } = useDiceRoller();
  const [imageError, setImageError] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    notation: string;
    rollName: string;
    rollType: 'ability' | 'save' | 'skill';
  } | null>(null);

  // Reset image error when creature changes
  useEffect(() => {
    setImageError(false);
  }, [creature?.id]);

  // Helper to execute a roll with advantage/disadvantage
  const executeRoll = (
    notation: string,
    rollName: string,
    rollType: 'ability' | 'save' | 'skill',
    mode: 'normal' | 'advantage' | 'disadvantage'
  ) => {
    if (!creature) return;

    let finalNotation = notation;

    // Only modify d20 rolls
    if (notation.includes('d20') || notation.includes('1d20')) {
      if (mode === 'advantage') {
        finalNotation = notation.replace(/1?d20/g, '2d20kh1');
      } else if (mode === 'disadvantage') {
        finalNotation = notation.replace(/1?d20/g, '2d20kl1');
      }
    }

    const displayName = creature.identifier
      ? `${creature.name} (${creature.identifier})`
      : creature.name;

    roll(finalNotation, {
      creatureName: displayName,
      rollType,
      rollName,
    });
  };

  if (!creature) {
    return (
      <Box ta='center' py='xl'>
        <Text c='dimmed'>Select a creature to view its stat block</Text>
      </Box>
    );
  }

  // Parse the stats snapshot
  let stats: Record<string, unknown> = {};
  try {
    stats = JSON.parse(creature.statsSnapshot) || {};
  } catch {
    stats = {};
  }

  // Check if this is a PC or a monster/NPC
  const isPC = creature.sourceType === 'pc' || stats.type === 'pc';

  // Extract stat block fields (handling both PC and monster formats)
  const size = stats.size as string | undefined;
  const type = isPC
    ? `${stats.race || ''} ${stats.class || ''}`.trim() || 'Player Character'
    : (stats.type as string | undefined);
  const alignment = stats.alignment as string | undefined;
  const speed = stats.speed as Record<string, string> | string | undefined;

  // Extract abilities - handle different formats:
  // - PCs: stats.attributes.strength
  // - SRD creatures: stats.abilities.STR
  // - Custom creatures: stats.strength (flat)
  let abilities = {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
  };

  if (isPC && stats.attributes) {
    // PC format
    const attrs = stats.attributes as Record<string, unknown>;
    abilities = {
      str: (attrs.strength as number) || 10,
      dex: (attrs.dexterity as number) || 10,
      con: (attrs.constitution as number) || 10,
      int: (attrs.intelligence as number) || 10,
      wis: (attrs.wisdom as number) || 10,
      cha: (attrs.charisma as number) || 10,
    };
  } else if (stats.abilities) {
    // SRD format with abilities object
    const attrs = stats.abilities as Record<string, unknown>;
    abilities = {
      str: (attrs.STR as number) || 10,
      dex: (attrs.DEX as number) || 10,
      con: (attrs.CON as number) || 10,
      int: (attrs.INT as number) || 10,
      wis: (attrs.WIS as number) || 10,
      cha: (attrs.CHA as number) || 10,
    };
  } else {
    // Flat format (custom creatures or old format)
    abilities = {
      str: (stats.strength as number) || 10,
      dex: (stats.dexterity as number) || 10,
      con: (stats.constitution as number) || 10,
      int: (stats.intelligence as number) || 10,
      wis: (stats.wisdom as number) || 10,
      cha: (stats.charisma as number) || 10,
    };
  }

  const senses = stats.senses as string[] | string | undefined;
  const languages = stats.languages as string | undefined;
  const challengeRating = stats.challenge_rating as number | string | undefined;
  const level = isPC ? (stats.level as number | undefined) : undefined;
  const hitPointsRoll = stats.hit_points_roll as string | undefined;

  // Calculate average HP from roll notation
  let averageHp = creature.maxHp;
  if (hitPointsRoll) {
    try {
      const hpRoll = new DiceRoll(hitPointsRoll);
      averageHp = Math.floor(hpRoll.averageTotal);
    } catch {
      // If roll notation is invalid, fall back to maxHp
      averageHp = creature.maxHp;
    }
  }

  // Passive skills for PCs
  const passivePerception = isPC
    ? (stats.passive_perception as number | undefined)
    : undefined;
  const passiveInvestigation = isPC
    ? (stats.passive_investigation as number | undefined)
    : undefined;
  const passiveInsight = isPC
    ? (stats.passive_insight as number | undefined)
    : undefined;

  // Handle different formats for proficiencies
  const savingThrowsObj = stats.saving_throws as
    | Record<string, number>
    | undefined;
  const skillsObj = stats.skills as Record<string, number> | undefined;
  const proficiencies = stats.proficiencies as
    | Array<{ proficiency: { name: string }; value: number }>
    | undefined;

  const damageImmunities = stats.damage_immunities as string[] | undefined;
  const damageResistances = stats.damage_resistances as string[] | undefined;
  const damageVulnerabilities = stats.damage_vulnerabilities as
    | string[]
    | undefined;
  const conditionImmunities = stats.condition_immunities as
    | Array<{ name: string }>
    | string[]
    | undefined;
  const specialAbilities = stats.special_abilities as
    | Array<{ name: string; desc: string }>
    | undefined;

  // Format speed
  const formatSpeed = () => {
    if (!speed) return '30 ft.';
    if (typeof speed === 'string') return speed;
    return Object.entries(speed)
      .map(([type, value]) => (type === 'walk' ? value : `${type} ${value}`))
      .join(', ');
  };

  // Format senses
  const formatSenses = () => {
    if (!senses) return '—';
    if (typeof senses === 'string') return senses;
    if (Array.isArray(senses)) return senses.join(', ');
    // Handle object format: { darkvision: "60 ft.", passive_perception: 12 }
    if (typeof senses === 'object') {
      return Object.entries(senses)
        .map(([key, value]) => {
          const label = key.replace(/_/g, ' ');
          return `${label} ${value}`;
        })
        .join(', ');
    }
    return '—';
  };

  // Get saving throw proficiencies - handle both formats
  let savingThrows: string | undefined;
  if (savingThrowsObj) {
    // SRD format: { CON: 6, INT: 8 }
    savingThrows = Object.entries(savingThrowsObj)
      .map(([ability, value]) => `${ability} +${value}`)
      .join(', ');
  } else if (proficiencies) {
    // Old format with proficiencies array
    savingThrows = proficiencies
      .filter((p) => p.proficiency.name.startsWith('Saving Throw:'))
      .map((p) => {
        const ability = p.proficiency.name
          .replace('Saving Throw: ', '')
          .substring(0, 3);
        return `${ability} +${p.value}`;
      })
      .join(', ');
  }

  // Get skill proficiencies - handle both formats
  let skills: string | undefined;
  if (skillsObj) {
    // SRD format: { History: 12, Perception: 10 }
    skills = Object.entries(skillsObj)
      .map(([skill, value]) => `${skill} +${value}`)
      .join(', ');
  } else if (proficiencies) {
    // Old format with proficiencies array
    skills = proficiencies
      .filter((p) => p.proficiency.name.startsWith('Skill:'))
      .map((p) => {
        const skill = p.proficiency.name.replace('Skill: ', '');
        return `${skill} +${p.value}`;
      })
      .join(', ');
  }

  return (
    <Stack gap='sm'>
      {/* Creature Image */}
      {!imageError ? (
        <Box
          style={{
            position: 'relative',
            width: '100%',
            height: 350,
            borderRadius: 8,
            overflow: 'hidden',
          }}>
          <Image
            src={getCreatureImagePath(creature.name)}
            alt={creature.name}
            fill
            style={{ objectFit: 'cover' }}
            onError={() => setImageError(true)}
            unoptimized
          />
        </Box>
      ) : (
        <Box
          style={{
            width: '100%',
            height: 150,
            backgroundColor: creature.tokenColor || 'var(--mantine-color-gray-6)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text size='4rem'>{creature.sourceType === 'pc' ? '👤' : '👹'}</Text>
        </Box>
      )}

      {/* Name and Type */}
      <div>
        <Title order={3}>
          {creature.name}
          {creature.identifier && ` (${creature.identifier})`}
        </Title>
        <Text size='sm' fs='italic' c='dimmed'>
          {[size, type, alignment].filter(Boolean).join(' ') || 'Creature'}
        </Text>
      </div>

      <Divider />

      {/* Core Stats */}
      <Paper withBorder p='xs'>
        <Group justify='space-between' mb={4}>
          <Text size='sm'>
            <strong>AC</strong> {creature.armorClass}
          </Text>
          <Text size='sm'>
            <strong>HP</strong> {isPC ? creature.maxHp : averageHp}
            {hitPointsRoll ? ` (${hitPointsRoll})` : ''}
          </Text>
        </Group>
        <Text size='sm'>
          <strong>Speed</strong> {formatSpeed()}
        </Text>
        {level !== undefined && (
          <Text size='sm'>
            <strong>Level</strong> {level}
          </Text>
        )}
        {challengeRating !== undefined && !isPC && (
          <Text size='sm'>
            <strong>CR</strong> {challengeRating}
          </Text>
        )}
      </Paper>

      <Divider />

      {/* Ability Scores */}
      <Grid gutter='xs'>
        {Object.entries(abilities).map(([key, value]) => {
          const modifier = Math.floor((value - 10) / 2);
          const notation = `1d20${modifier >= 0 ? '+' : ''}${modifier}`;
          const rollName = `${key.toUpperCase()} Check`;

          return (
            <Grid.Col span={4} key={key}>
              <Paper
                withBorder
                p={4}
                ta='center'
                style={{
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onClick={() =>
                  executeRoll(notation, rollName, 'ability', 'normal')
                }
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    notation,
                    rollName,
                    rollType: 'ability',
                  });
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'var(--mantine-color-gray-1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}>
                <Text size='xs' fw={600} tt='uppercase'>
                  {key}
                </Text>
                <Text size='sm' fw={500}>
                  {value} ({getModifier(value)})
                </Text>
              </Paper>
            </Grid.Col>
          );
        })}
      </Grid>

      <Divider />

      {/* Proficiencies */}
      <Stack gap={4}>
        {savingThrows && (
          <Text size='sm'>
            <strong>Saving Throws</strong>{' '}
            {parseSavingThrows(savingThrows).map((save, i) => {
              const notation = `1d20+${save.bonus}`;
              const rollName = `${save.ability} Save`;

              return (
                <span key={i}>
                  {i > 0 && ', '}
                  <span
                    style={{
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textDecorationStyle: 'dotted',
                    }}
                    onClick={() =>
                      executeRoll(notation, rollName, 'save', 'normal')
                    }
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({
                        x: e.clientX,
                        y: e.clientY,
                        notation,
                        rollName,
                        rollType: 'save',
                      });
                    }}>
                    {save.ability} +{save.bonus}
                  </span>
                </span>
              );
            })}
          </Text>
        )}
        {skills && (
          <Text size='sm'>
            <strong>Skills</strong>{' '}
            {parseSkills(skills).map((skill, i) => {
              const notation = `1d20+${skill.bonus}`;
              const rollName = skill.skill;

              return (
                <span key={i}>
                  {i > 0 && ', '}
                  <span
                    style={{
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textDecorationStyle: 'dotted',
                    }}
                    onClick={() =>
                      executeRoll(notation, rollName, 'skill', 'normal')
                    }
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({
                        x: e.clientX,
                        y: e.clientY,
                        notation,
                        rollName,
                        rollType: 'skill',
                      });
                    }}>
                    {skill.skill} +{skill.bonus}
                  </span>
                </span>
              );
            })}
          </Text>
        )}
        {damageResistances && damageResistances.length > 0 && (
          <Text size='sm'>
            <strong>Resistances</strong> {damageResistances.join(', ')}
          </Text>
        )}
        {damageImmunities && damageImmunities.length > 0 && (
          <Text size='sm'>
            <strong>Immunities</strong> {damageImmunities.join(', ')}
          </Text>
        )}
        {damageVulnerabilities && damageVulnerabilities.length > 0 && (
          <Text size='sm'>
            <strong>Vulnerabilities</strong> {damageVulnerabilities.join(', ')}
          </Text>
        )}
        {conditionImmunities && conditionImmunities.length > 0 && (
          <Text size='sm'>
            <strong>Condition Immunities</strong>{' '}
            {Array.isArray(conditionImmunities)
              ? typeof conditionImmunities[0] === 'string'
                ? conditionImmunities.join(', ')
                : conditionImmunities.map((c: any) => c.name).join(', ')
              : ''}
          </Text>
        )}
        {isPC &&
        (passivePerception || passiveInvestigation || passiveInsight) ? (
          <>
            {passivePerception !== undefined && (
              <Text size='sm'>
                <strong>Passive Perception</strong> {passivePerception}
              </Text>
            )}
            {passiveInvestigation !== undefined && (
              <Text size='sm'>
                <strong>Passive Investigation</strong> {passiveInvestigation}
              </Text>
            )}
            {passiveInsight !== undefined && (
              <Text size='sm'>
                <strong>Passive Insight</strong> {passiveInsight}
              </Text>
            )}
          </>
        ) : (
          <>
            <Text size='sm'>
              <strong>Senses</strong> {formatSenses()}
            </Text>
            <Text size='sm'>
              <strong>Languages</strong> {languages || '—'}
            </Text>
          </>
        )}
      </Stack>

      {/* Special Abilities */}
      {specialAbilities && specialAbilities.length > 0 && (
        <>
          <Divider />
          <Accordion variant='contained' chevronPosition='left'>
            {specialAbilities.map((ability, i) => (
              <Accordion.Item key={i} value={`ability-${i}`}>
                <Accordion.Control>
                  <Text size='sm' fw={600}>
                    {ability.name}
                  </Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text size='sm'>{ability.desc}</Text>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </>
      )}

      {/* Context Menu for Advantage/Disadvantage */}
      <Menu
        opened={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        position='right-start'
        offset={0}
        styles={{
          dropdown: {
            position: 'fixed',
            left: contextMenu?.x || 0,
            top: contextMenu?.y || 0,
          },
        }}>
        <Menu.Target>
          <div
            style={{
              position: 'fixed',
              left: contextMenu?.x || 0,
              top: contextMenu?.y || 0,
              width: 0,
              height: 0,
            }}
          />
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            onClick={() => {
              if (contextMenu) {
                executeRoll(
                  contextMenu.notation,
                  contextMenu.rollName,
                  contextMenu.rollType,
                  'normal'
                );
                setContextMenu(null);
              }
            }}>
            Roll Normal
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              if (contextMenu) {
                executeRoll(
                  contextMenu.notation,
                  contextMenu.rollName,
                  contextMenu.rollType,
                  'advantage'
                );
                setContextMenu(null);
              }
            }}>
            Roll with Advantage
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              if (contextMenu) {
                executeRoll(
                  contextMenu.notation,
                  contextMenu.rollName,
                  contextMenu.rollType,
                  'disadvantage'
                );
                setContextMenu(null);
              }
            }}>
            Roll with Disadvantage
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Stack>
  );
}
