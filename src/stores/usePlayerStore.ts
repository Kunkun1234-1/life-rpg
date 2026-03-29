import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AttributeKey } from '../types';
import { getAdventureLevel, getCurrentTitle } from '../lib/gameFormulas';

interface PlayerStore {
  // State
  playerName: string;
  totalExp: number;
  stardust: number;
  stamina: number;
  maxStamina: number;
  overflowStamina: number;
  streakDays: number;
  achievementPoints: number;
  attributeExp: Record<AttributeKey, number>;

  // Derived getters
  getAdventureLevel: () => number;
  getCurrentTitle: () => string;

  // Actions
  addExp: (amount: number, attrKey: AttributeKey) => void;
  spendStamina: (amount: number) => void;
  addStardust: (amount: number) => void;
  spendStardust: (amount: number) => void;
  resetDailyStamina: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  addAchievementPoints: (n: number) => void;
  setPlayerName: (name: string) => void;
}

const defaultAttributeExp: Record<AttributeKey, number> = {
  body: 0,
  mind: 0,
  craft: 0,
  social: 0,
  spirit: 0,
  wealth: 0,
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      playerName: '冒险者',
      totalExp: 0,
      stardust: 100,
      stamina: 100,
      maxStamina: 100,
      overflowStamina: 150,
      streakDays: 0,
      achievementPoints: 0,
      attributeExp: { ...defaultAttributeExp },

      getAdventureLevel: () => getAdventureLevel(get().totalExp),
      getCurrentTitle: () => getCurrentTitle(getAdventureLevel(get().totalExp)),

      addExp: (amount, attrKey) =>
        set((state) => ({
          totalExp: state.totalExp + amount,
          attributeExp: {
            ...state.attributeExp,
            [attrKey]: state.attributeExp[attrKey] + amount,
          },
        })),

      spendStamina: (amount) =>
        set((state) => ({
          stamina: state.stamina - amount,
        })),

      addStardust: (amount) =>
        set((state) => ({
          stardust: state.stardust + amount,
        })),

      spendStardust: (amount) =>
        set((state) => ({
          stardust: Math.max(0, state.stardust - amount),
        })),

      resetDailyStamina: () =>
        set((state) => ({
          stamina: Math.min(state.stamina + state.maxStamina, state.overflowStamina),
        })),

      incrementStreak: () =>
        set((state) => ({
          streakDays: state.streakDays + 1,
        })),

      resetStreak: () => set({ streakDays: 0 }),

      addAchievementPoints: (n) =>
        set((state) => ({
          achievementPoints: state.achievementPoints + n,
        })),

      setPlayerName: (name) => set({ playerName: name }),
    }),
    { name: 'life-rpg-player' }
  )
);
