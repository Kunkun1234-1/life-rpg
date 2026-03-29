import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AttributeKey } from '../types';
import { generateId } from '../lib/gameFormulas';

interface PlayerStore {
  id: string;
  playerName: string;
  totalExp: number;
  adventureLevel: number;
  stardust: number;
  stamina: number;
  maxStamina: number;
  streakDays: number;
  currentTitle: string;
  attributeExp: Record<AttributeKey, number>;
  addExp: (amount: number) => void;
  addStardust: (amount: number) => void;
  spendStardust: (amount: number) => boolean;
  spendStamina: (amount: number) => void;
  addAttributeExp: (key: AttributeKey, amount: number) => void;
  setPlayerName: (name: string) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      id: generateId(),
      playerName: '旅行者',
      totalExp: 0,
      adventureLevel: 1,
      stardust: 100,
      stamina: 80,
      maxStamina: 100,
      streakDays: 0,
      currentTitle: '初入尘世',
      attributeExp: {
        body: 0,
        mind: 0,
        craft: 0,
        social: 0,
        spirit: 0,
        wealth: 0,
      },
      addExp: (amount) => set((s) => ({ totalExp: s.totalExp + amount })),
      addStardust: (amount) => set((s) => ({ stardust: s.stardust + amount })),
      spendStardust: (amount) => {
        const s = get();
        if (s.stardust < amount) return false;
        set({ stardust: s.stardust - amount });
        return true;
      },
      spendStamina: (amount) => set((s) => ({ stamina: Math.max(0, s.stamina - amount) })),
      addAttributeExp: (key, amount) =>
        set((s) => ({
          attributeExp: { ...s.attributeExp, [key]: s.attributeExp[key] + amount },
        })),
      setPlayerName: (name) => set({ playerName: name }),
    }),
    { name: 'player-store' }
  )
);
