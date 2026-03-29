import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerState, AttributeState, AttributeKey } from '../types';
import { generateId } from '../lib/gameFormulas';

interface PlayerStore {
  player: PlayerState;
  attributes: AttributeState[];
  spendStardust: (amount: number) => boolean;
  addStardust: (amount: number) => void;
}

const DEFAULT_PLAYER: PlayerState = {
  id: generateId(),
  email: '',
  playerName: '旅行者',
  totalExp: 0,
  adventureLevel: 1,
  stardust: 500,
  stamina: 100,
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

      spendStardust: (amount) => {
        const { player } = get();
        if (player.stardust < amount) return false;
        set((state) => ({
          player: { ...state.player, stardust: state.player.stardust - amount },
        }));
        return true;
      },

      addStardust: (amount) =>
        set((state) => ({
          player: { ...state.player, stardust: state.player.stardust + amount },
        })),
    }),
    { name: 'life-rpg-player' }
  )
);
