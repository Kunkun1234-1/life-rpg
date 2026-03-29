import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AttributeKey, AttributeState } from '../types';
import { generateId } from '../lib/gameFormulas';
import { getCurrentTitle } from '../lib/gameFormulas';

interface PlayerStore {
  id: string;
  email: string;
  playerName: string;
  totalExp: number;
  adventureLevel: number;
  stardust: number;
  stamina: number;
  maxStamina: number;
  overflowStamina: number;
  streakDays: number;
  currentTitle: string;
  customTitle?: string;
  achievementPoints: number;
  createdAt: string;
  attributes: AttributeState[];
  // Actions
  addExp: (amount: number) => void;
  addStardust: (amount: number) => void;
  spendStardust: (amount: number) => boolean;
  updateLevel: () => void;
  setCustomTitle: (title: string) => void;
}

const ATTR_KEYS: AttributeKey[] = ['body', 'mind', 'craft', 'social', 'spirit', 'wealth'];

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      id: generateId(),
      email: '',
      playerName: '旅行者',
      totalExp: 0,
      adventureLevel: 1,
      stardust: 0,
      stamina: 100,
      maxStamina: 100,
      overflowStamina: 150,
      streakDays: 0,
      currentTitle: '初入尘世',
      achievementPoints: 0,
      createdAt: new Date().toISOString(),
      attributes: ATTR_KEYS.map((key) => ({ key, exp: 0, level: 1 })),

      addExp: (amount) => {
        set((s) => {
          const newTotal = s.totalExp + amount;
          return { totalExp: newTotal };
        });
        get().updateLevel();
      },

      addStardust: (amount) => {
        set((s) => ({ stardust: s.stardust + amount }));
      },

      spendStardust: (amount) => {
        const { stardust } = get();
        if (stardust < amount) return false;
        set((s) => ({ stardust: s.stardust - amount }));
        return true;
      },

      updateLevel: () => {
        const { totalExp } = get();
        let level = 1;
        let expNeeded = 0;
        while (true) {
          const nextLevelExp = Math.round(100 * Math.pow(1.15, level - 1));
          if (expNeeded + nextLevelExp > totalExp) break;
          expNeeded += nextLevelExp;
          level++;
        }
        const title = getCurrentTitle(level);
        set({ adventureLevel: level, currentTitle: title });
      },

      setCustomTitle: (title) => {
        set({ customTitle: title });
      },
    }),
    { name: 'life-rpg-player' }
  )
);
