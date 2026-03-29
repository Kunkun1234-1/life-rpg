import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AttributeKey, AttributeState } from '../types';
import { getAttributeLevelProgress, getAdventureLevelProgress, generateId } from '../lib/gameFormulas';
import { getCurrentTitle } from '../lib/gameFormulas';

interface PlayerStoreState {
  id: string;
  playerName: string;
  totalExp: number;
  stardust: number;
  stamina: number;
  maxStamina: number;
  streakDays: number;
  currentTitle: string;
  attributes: AttributeState[];
  // Computed helpers
  getAttributeState: (key: AttributeKey) => AttributeState;
  getAttributeProgress: (key: AttributeKey) => { level: number; currentLevelExp: number; nextLevelExp: number; progress: number };
  getAdventureProgress: () => { level: number; currentLevelExp: number; nextLevelExp: number; progress: number };
  addExp: (amount: number, attributeKey?: AttributeKey) => void;
  addStardust: (amount: number) => void;
  spendStardust: (amount: number) => boolean;
  spendStamina: (amount: number) => void;
}

const DEFAULT_ATTRIBUTES: AttributeState[] = [
  { key: 'body', exp: 0, level: 1 },
  { key: 'mind', exp: 0, level: 1 },
  { key: 'craft', exp: 0, level: 1 },
  { key: 'social', exp: 0, level: 1 },
  { key: 'spirit', exp: 0, level: 1 },
  { key: 'wealth', exp: 0, level: 1 },
];

export const usePlayerStore = create<PlayerStoreState>()(
  persist(
    (set, get) => ({
      id: generateId(),
      playerName: '旅行者',
      totalExp: 0,
      stardust: 100,
      stamina: 100,
      maxStamina: 100,
      streakDays: 0,
      currentTitle: '初入尘世',
      attributes: DEFAULT_ATTRIBUTES,

      getAttributeState: (key) => {
        return get().attributes.find(a => a.key === key) ?? { key, exp: 0, level: 1 };
      },

      getAttributeProgress: (key) => {
        const attr = get().getAttributeState(key);
        return getAttributeLevelProgress(attr.exp);
      },

      getAdventureProgress: () => {
        return getAdventureLevelProgress(get().totalExp);
      },

      addExp: (amount, attributeKey) => {
        set(state => {
          const newTotalExp = state.totalExp + amount;
          const newTitle = getCurrentTitle(getAdventureLevelProgress(newTotalExp).level);

          let newAttributes = state.attributes;
          if (attributeKey) {
            newAttributes = state.attributes.map(a => {
              if (a.key === attributeKey) {
                const newExp = a.exp + amount;
                const { level } = getAttributeLevelProgress(newExp);
                return { ...a, exp: newExp, level };
              }
              return a;
            });
          }

          return {
            totalExp: newTotalExp,
            currentTitle: newTitle,
            attributes: newAttributes,
          };
        });
      },

      addStardust: (amount) => {
        set(state => ({ stardust: state.stardust + amount }));
      },

      spendStardust: (amount) => {
        const { stardust } = get();
        if (stardust < amount) return false;
        set(state => ({ stardust: state.stardust - amount }));
        return true;
      },

      spendStamina: (amount) => {
        set(state => ({ stamina: Math.max(0, state.stamina - amount) }));
      },
    }),
    { name: 'player-store' }
  )
);
