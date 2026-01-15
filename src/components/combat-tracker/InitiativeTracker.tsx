'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import {
  Box,
  Group,
  ActionIcon,
  Text,
  Badge,
  Stack,
  CloseButton,
  Menu,
} from '@mantine/core';
import { getCreatureImagePath } from '@/lib/utils/creature-image';

// Design system: Border radius constants
const RADIUS = {
  XL: 16, // Large containers, main cards
  LG: 12, // Medium containers, round indicator
  MD: 8, // Pills, badges, buttons
  SM: 6, // Small elements, bars
  XS: 4, // Tiny elements
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
  sourceType: string;
  statsSnapshot: string;
};

type InitiativeTrackerProps = {
  creatures: CombatCreature[];
  currentTurnIndex: number;
  selectedCreatureId: string | null;
  onSelectCreature: (id: string) => void;
  onDeleteCreature?: (id: string) => void;
  onDeleteCreatureImmediate?: (id: string) => void;
  onNextTurn?: () => void;
  onPreviousTurn?: () => void;
  round: number;
  newlyAddedIds?: Set<string>;
};

export function InitiativeTracker({
  creatures,
  currentTurnIndex,
  selectedCreatureId,
  onSelectCreature,
  onDeleteCreature,
  onDeleteCreatureImmediate,
  onNextTurn,
  onPreviousTurn,
  round,
  newlyAddedIds = new Set(),
}: InitiativeTrackerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [contextMenuCreatureId, setContextMenuCreatureId] = useState<
    string | null
  >(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [hoveredCreatureId, setHoveredCreatureId] = useState<string | null>(null);

  const handleImageError = (creatureId: string) => {
    setImageErrors((prev) => new Set(prev).add(creatureId));
  };

  const handlePreviousTurn = () => {
    if (onPreviousTurn) {
      onPreviousTurn();
    }
  };

  const handleNextTurn = () => {
    if (onNextTurn) {
      onNextTurn();
    }
  };

  // Parse status effects from JSON string
  const parseStatusEffects = (effectsJson: string): string[] => {
    try {
      return JSON.parse(effectsJson) || [];
    } catch {
      return [];
    }
  };

  // Calculate HP percentage for visual indicator
  const getHpPercentage = (current: number, max: number) => {
    if (max <= 0) return 100;
    return Math.max(0, Math.min(100, (current / max) * 100));
  };

  // Check if creature is bloodied (50% or less HP)
  const isBloodied = (current: number, max: number) => {
    return current > 0 && current <= max / 2;
  };

  // Check if creature is dead/unconscious
  const isDead = (current: number) => current <= 0;

  if (creatures.length === 0) {
    return (
      <Box ta='center' py='md'>
        <Text c='dimmed'>
          No creatures in combat yet. Use the search bar to add creatures.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {/* Previous Turn Button */}
      <ActionIcon
        variant='subtle'
        size='lg'
        className='scroll-button'
        onClick={handlePreviousTurn}
        title='Previous turn'
        disabled={!onPreviousTurn}
        style={{
          background: 'var(--mantine-color-default-hover)',
          borderRadius: RADIUS.MD,
          border: '1px solid var(--mantine-color-default-border)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
        }}>
        <Text size='lg' fw={600}>
          ‹
        </Text>
      </ActionIcon>

      {/* Scrollable creature cards */}
      <Box
        ref={scrollContainerRef}
        style={{
          maxWidth: 'calc(100vw - 200px)',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
        }}
        className='initiative-scrollbar'>
        <Box
          style={{
            display: 'flex',
            gap: '16px',
            padding: '12px 8px',
            width: 'max-content',
          }}>
          {creatures.map((creature, index) => {
            const isCurrentTurn = index === currentTurnIndex;
            const isSelected = creature.id === selectedCreatureId;
            const isNewlyAdded = newlyAddedIds.has(creature.id);
            const statusEffects = parseStatusEffects(creature.statusEffects);
            const hpPercentage = getHpPercentage(
              creature.currentHp,
              creature.maxHp
            );
            const bloodied = isBloodied(creature.currentHp, creature.maxHp);
            const dead = isDead(creature.currentHp);
            const isPC = creature.sourceType === 'pc';

            // Get token color for bottom border
            const tokenColor =
              creature.tokenColor || (isPC ? '#3b82f6' : '#4a5568');

            const isHovered = hoveredCreatureId === creature.id;
            const showAC = isCurrentTurn || isSelected || isHovered;

            return (
              <Box
                key={creature.id}
                className='initiative-card'
                onClick={() => onSelectCreature(creature.id)}
                onMouseEnter={() => setHoveredCreatureId(creature.id)}
                onMouseLeave={() => setHoveredCreatureId(null)}
                style={{
                  cursor: 'pointer',
                  width: 120,
                  height: 200,
                  position: 'relative',
                  borderRadius: RADIUS.XL,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isCurrentTurn
                    ? 'scale(1.05) translateY(-4px)'
                    : isSelected
                    ? 'scale(1.02)'
                    : 'scale(1)',
                  opacity: dead ? 0.65 : 1,
                  filter: isCurrentTurn ? 'none' : 'brightness(0.85)',
                  boxShadow: isNewlyAdded
                    ? '0 0 0 3px #fbbf24, 0 8px 24px rgba(251, 191, 36, 0.5)'
                    : isCurrentTurn
                    ? '0 8px 24px rgba(0, 0, 0, 0.3)'
                    : '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}>
                {/* Background with neutral gradient */}
                <Box
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)',
                  }}
                />

                {/* Creature image background */}
                {!imageErrors.has(creature.id) && (
                  <Box
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 0,
                    }}>
                    <Image
                      src={getCreatureImagePath(creature.name)}
                      alt={creature.name}
                      fill
                      style={{
                        objectFit: 'cover',
                        opacity: 0.8,
                        imageRendering: 'auto',
                        transform: 'translateZ(0)',
                      }}
                      onError={() => handleImageError(creature.id)}
                      quality={95}
                      unoptimized
                    />
                  </Box>
                )}

                {/* Subtle pattern overlay */}
                <Box
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.1,
                    backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
                  }}
                />

                {/* Dark gradient at bottom for better contrast */}
                <Box
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    background:
                      'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.7))',
                    pointerEvents: 'none',
                  }}
                />

                {/* Creature icon - only show if no image */}
                {imageErrors.has(creature.id) && (
                  <Box
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.15,
                      fontSize: '5rem',
                    }}>
                    {isPC ? '👤' : '⚔️'}
                  </Box>
                )}

                {/* HP bar overlay (grows from bottom) */}
                <Box
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${100 - hpPercentage}%`,
                    background: dead
                      ? 'linear-gradient(to top, rgba(127, 29, 29, 0.8), rgba(127, 29, 29, 0.4))'
                      : bloodied
                      ? 'linear-gradient(to top, rgba(234, 88, 12, 0.6), rgba(234, 88, 12, 0.2))'
                      : 'transparent',
                    pointerEvents: 'none',
                    transition: 'height 0.4s ease',
                  }}
                />

                {/* Current turn indicator ring */}
                {isCurrentTurn && (
                  <Box
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: RADIUS.XL,
                      border: '3px solid #10b981',
                      boxShadow:
                        '0 0 24px rgba(16, 185, 129, 0.6), inset 0 0 20px rgba(16, 185, 129, 0.15)',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Selected indicator */}
                {isSelected && !isCurrentTurn && (
                  <Box
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: RADIUS.XL,
                      border: '2px solid rgba(59, 130, 246, 0.9)',
                      boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.25)',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Token color border - always on top */}
                <Box
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 5,
                    background: tokenColor,
                    borderBottomLeftRadius: RADIUS.XL,
                    borderBottomRightRadius: RADIUS.XL,
                    zIndex: 20,
                    pointerEvents: 'none',
                  }}
                />

                {/* Delete button - visible on hover */}
                {onDeleteCreature && (
                  <Menu
                    opened={contextMenuCreatureId === creature.id}
                    onChange={(opened) => {
                      if (!opened) setContextMenuCreatureId(null);
                    }}
                    position='bottom'
                    withArrow>
                    <Menu.Target>
                      <CloseButton
                        className='delete-btn'
                        size='sm'
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCreature(creature.id);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setContextMenuCreatureId(creature.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          opacity: 0,
                          transition:
                            'opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease',
                          zIndex: 10,
                          background: 'rgba(0, 0, 0, 0.6)',
                          backdropFilter: 'blur(4px)',
                          color: 'white',
                          borderRadius: '50%',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                      />
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        color='red'
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDeleteCreatureImmediate) {
                            onDeleteCreatureImmediate(creature.id);
                          }
                          setContextMenuCreatureId(null);
                        }}>
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                )}

                {/* Card content */}
                <Box
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 10,
                  }}>
                  {/* Top section */}
                  <Stack gap={6} align='center'>
                    {/* AC pill - only show on current turn, selected, or hover */}
                    {showAC && (
                      <Box
                        style={{
                          background: 'rgba(0, 0, 0, 0.5)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: RADIUS.MD,
                          padding: '5px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}>
                        <Text
                          size='xs'
                          c='dimmed'
                          fw={600}
                          style={{
                            color: 'rgba(255,255,255,0.7)',
                            letterSpacing: '0.5px',
                          }}>
                          AC
                        </Text>
                        <Text size='sm' fw={700} style={{ color: 'white' }}>
                          {creature.armorClass}
                        </Text>
                        {creature.isConcentrating && (
                          <Box
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: '#a855f7',
                              boxShadow: '0 0 8px #a855f7',
                            }}
                          />
                        )}
                      </Box>
                    )}

                    {/* Status effects */}
                    {statusEffects.length > 0 && (
                      <Stack gap={4} align='center'>
                        {statusEffects.slice(0, 2).map((effect, i) => (
                          <Box
                            key={i}
                            style={{
                              background: 'rgba(251, 146, 60, 0.95)',
                              borderRadius: RADIUS.SM,
                              padding: '3px 10px',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                            }}>
                            <Text size='xs' fw={600} style={{ color: 'white' }}>
                              {effect}
                            </Text>
                          </Box>
                        ))}
                        {statusEffects.length > 2 && (
                          <Text
                            size='xs'
                            fw={500}
                            style={{ color: 'rgba(255,255,255,0.6)' }}>
                            +{statusEffects.length - 2}
                          </Text>
                        )}
                      </Stack>
                    )}
                  </Stack>

                  {/* Bottom section */}
                  <Stack gap={6} align='center'>
                    {/* Name */}
                    <Text
                      size='sm'
                      fw={600}
                      ta='center'
                      truncate
                      style={{
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        maxWidth: '100%',
                      }}>
                      {creature.identifier || creature.name}
                    </Text>

                    {/* HP bar */}
                    <Box style={{ width: '100%' }}>
                      <Box
                        style={{
                          background: 'rgba(0, 0, 0, 0.4)',
                          borderRadius: RADIUS.SM,
                          height: 26,
                          overflow: 'hidden',
                          position: 'relative',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}>
                        {/* HP fill */}
                        <Box
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${hpPercentage}%`,
                            background: dead
                              ? 'linear-gradient(90deg, #7f1d1d, #991b1b)'
                              : bloodied
                              ? 'linear-gradient(90deg, #ea580c, #f97316)'
                              : 'linear-gradient(90deg, #059669, #10b981)',
                            borderRadius: RADIUS.SM,
                            transition:
                              'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease',
                          }}
                        />
                        {/* HP text */}
                        <Box
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text
                            size='xs'
                            fw={700}
                            style={{
                              color: 'white',
                              textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                            }}>
                            {creature.currentHp} / {creature.maxHp}
                            {creature.tempHp > 0 && (
                              <Text component='span' c='cyan' inherit>
                                {' '}+{creature.tempHp}
                              </Text>
                            )}
                            {dead && ' 💀'}
                          </Text>
                        </Box>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Next Turn Button */}
      <ActionIcon
        variant='subtle'
        size='lg'
        className='scroll-button'
        onClick={handleNextTurn}
        title='Next turn'
        disabled={!onNextTurn}
        style={{
          background: 'var(--mantine-color-default-hover)',
          borderRadius: RADIUS.MD,
          border: '1px solid var(--mantine-color-default-border)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
        }}>
        <Text size='lg' fw={600}>
          ›
        </Text>
      </ActionIcon>
    </Box>
  );
}
