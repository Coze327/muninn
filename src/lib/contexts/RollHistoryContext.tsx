"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { RollEntry, RollHistoryContextValue } from "@/types/dice";

const RollHistoryContext = createContext<RollHistoryContextValue | undefined>(undefined);

const MAX_ROLL_HISTORY = 50;

export function RollHistoryProvider({ children }: { children: ReactNode }) {
  const [rolls, setRolls] = useState<RollEntry[]>([]);

  const addRoll = (roll: Omit<RollEntry, 'id' | 'timestamp'>) => {
    const newRoll: RollEntry = {
      ...roll,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    setRolls((prevRolls) => {
      const updatedRolls = [newRoll, ...prevRolls];
      // Keep only the most recent MAX_ROLL_HISTORY rolls (FIFO)
      return updatedRolls.slice(0, MAX_ROLL_HISTORY);
    });
  };

  const clearHistory = () => {
    setRolls([]);
  };

  return (
    <RollHistoryContext.Provider value={{ rolls, addRoll, clearHistory }}>
      {children}
    </RollHistoryContext.Provider>
  );
}

export function useRollHistory() {
  const context = useContext(RollHistoryContext);
  if (context === undefined) {
    throw new Error("useRollHistory must be used within a RollHistoryProvider");
  }
  return context;
}
