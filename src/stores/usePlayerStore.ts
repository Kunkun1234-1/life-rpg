import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerState, AttributeState, AttributeKey } from '../types';

interface PlayerStore {
  player: PlayerState;
  attributes: AttributeState[];
  setPlayer: (player: Partial<PlayerState>) => void;
  addStamina: (amount: number) => void;
  spendStamina: (amount: number) => void;
  addExp: (amount: number) => void;
  addStardust: (amount: number) => void;
  spendStardust: (amount: number) => boolean;
  addAttributeExp: (key: AttributeKey, amount: number) => void;
}

const DEFAULT_PLAYER: PlayerState = {
  id: 'local',
  email: '',
  playerName: '旅行者',
  totalExp: 0,
  adventureLevel: 1,
  stardust: 100,
  stamina: 80,
  maxStamina: 100,
  overflowStamina: 0,
  streakDays: 0,
  currentTitle: '初入尘世',
  achievementPoints: 0,
  createdAt: new Date().toISOString(),
};

const DEFAULT_ATTRIBUTES: AttributeState[] = [
  { key: 'body', exp: 0, level: 1 },
  { key: 'mind', exp: 0, level: 1 },
  { key: 'craft', exp: 0, level: 1 },
  { key: 'social', exp: 0, level: 1 },
  { key: 'spirit', exp: 0, level: 1 },
  { key: 'wealth', exp: 0, level: 1 },
];

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      player: DEFAULT_PLAYER,
      attributes: DEFAULT_ATTRIBUTES,

      setPlayer: (partial) =>
        set((state) => ({ player: { ...state.player, ...partial } })),

      addStamina: (amount) =>
        set((state) => ({
          player: {
            ...state.player,
            stamina: Math.min(state.player.stamina + amount, state.player.maxStamina),
          },
        })),

      spendStamina: (amount) =>
        set((state) => ({
          player: {
            ...state.player,
            stamina: Math.max(state.player.stamina - amount, 0),
          },
        })),

      addExp: (amount) => {
        const { player } = get();
        const newExp = player.totalExp + amount;
        // Simple level calculation: 100 * 1.15^(Lv-1) per level
        let level = 1;
        let expNeeded = 0;
        while (expNeeded + Math.round(100 * Math.pow(1.15, level - 1)) <= newExp) {
          expNeeded += Math.round(100 * Math.pow(1.15, level - 1));
          level++;
        }
        set((state) => ({
          player: { ...state.player, totalExp: newExp, adventureLevel: level },
        }));
      },

      addStardust: (amount) =>
        set((state) => ({
          player: { ...state.player, stardust: state.player.stardust + amount },
        })),

      spendStardust: (amount) => {
        const { player } = get();
        if (player.stardust < amount) return false;
        set((state) => ({
          player: { ...state.player, stardust: state.player.stardust - amount },
        }));
        return true;
      },

      addAttributeExp: (key, amount) =>
        set((state) => {
          const attrs = state.attributes.map((a) => {
            if (a.key !== key) return a;
            const newExp = a.exp + amount;
            let level = 1;
            let expNeeded = 0;
            while (expNeeded + Math.round(50 * Math.pow(1.12, level - 1)) <= newExp) {
              expNeeded += Math.round(50 * Math.pow(1.12, level - 1));
              level++;
            }
            return { ...a, exp: newExp, level };
          });
          return { attributes: attrs };
        }),
    }),
    { name: 'liferpg-player' }
  )
);
