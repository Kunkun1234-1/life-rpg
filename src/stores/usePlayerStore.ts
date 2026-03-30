import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AttributeKey } from '../types';
import { getAdventureLevel, getCurrentTitle } from '../lib/gameFormulas';

interface PlayerStore {
  // State
  playerName: string;
  avatarUrl: string | null;
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
  addStamina: (amount: number) => void;
  addStardust: (amount: number) => void;
  spendStardust: (amount: number) => boolean;
  resetDailyStamina: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  addAchievementPoints: (n: number) => void;
  setPlayerName: (name: string) => void;
  setAvatar: (url: string | null) => void;
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
      avatarUrl: null,
      totalExp: 0,
      stardust: 10000, // TODO: change back to 100 after testing
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
          stamina: Math.max(0, state.stamina - amount),
        })),

      addStamina: (amount) =>
        set((state) => ({
          stamina: Math.min(state.stamina + amount, state.overflowStamina),
        })),

      addStardust: (amount) =>
        set((state) => ({
          stardust: state.stardust + amount,
        })),

      spendStardust: (amount) => {
        const state = get();
        if (state.stardust < amount) return false;
        set({ stardust: state.stardust - amount });
        return true;
      },

      resetDailyStamina: () =>
        set((state) => ({
          stamina: state.maxStamina,
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
      setAvatar: (url) => set({ avatarUrl: url }),
    }),
    { name: 'life-rpg-player' }
  )
);
