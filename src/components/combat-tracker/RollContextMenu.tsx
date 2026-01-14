'use client';

import { Menu } from '@mantine/core';

type RollMode = 'normal' | 'advantage' | 'disadvantage' | 'crit';
type RollType = 'attack' | 'damage';

type ContextMenuState = {
  x: number;
  y: number;
  notation: string;
  rollName: string;
  actionName: string;
  rollType: RollType;
} | null;

type RollContextMenuProps = {
  contextMenu: ContextMenuState;
  onClose: () => void;
  onRoll: (
    notation: string,
    rollName: string,
    rollType: RollType,
    actionName: string,
    mode: RollMode
  ) => void;
};

export function RollContextMenu({
  contextMenu,
  onClose,
  onRoll,
}: RollContextMenuProps) {
  const handleRoll = (mode: RollMode) => {
    if (contextMenu) {
      onRoll(
        contextMenu.notation,
        contextMenu.rollName,
        contextMenu.rollType,
        contextMenu.actionName,
        mode
      );
      onClose();
    }
  };

  return (
    <Menu
      opened={contextMenu !== null}
      onClose={onClose}
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
        {contextMenu?.rollType === 'attack' ? (
          <>
            <Menu.Item onClick={() => handleRoll('normal')}>
              Roll Normal
            </Menu.Item>
            <Menu.Item onClick={() => handleRoll('advantage')}>
              Roll with Advantage
            </Menu.Item>
            <Menu.Item onClick={() => handleRoll('disadvantage')}>
              Roll with Disadvantage
            </Menu.Item>
          </>
        ) : (
          <>
            <Menu.Item onClick={() => handleRoll('normal')}>
              Roll Normal Damage
            </Menu.Item>
            <Menu.Item onClick={() => handleRoll('crit')}>
              Roll Critical Damage
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

export type { ContextMenuState, RollMode, RollType };
