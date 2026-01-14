/**
 * Dice Rolling Type Definitions
 */

export type RollType = 'ability' | 'save' | 'skill' | 'attack' | 'damage';

export type RollEntry = {
  id: string;
  timestamp: Date;
  creatureName: string;
  rollType: RollType;
  rollName: string;
  notation: string;
  result: number;
  output: string;
};

export type RollOptions = {
  creatureName: string;
  rollType: RollType;
  rollName: string;
};

export type RollHistoryContextValue = {
  rolls: RollEntry[];
  addRoll: (roll: Omit<RollEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
};
