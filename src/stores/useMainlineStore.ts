import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MainlineQuest } from '../types';

interface MainlineStore {
  mainlineQuests: MainlineQuest[];
  addMainlineQuest: (quest: Omit<MainlineQuest, 'id' | 'createdAt'>) => void;
  updateMainlineQuest: (id: string, updates: Partial<MainlineQuest>) => void;
  completeMainlineQuest: (id: string) => void;
  deleteMainlineQuest: (id: string) => void;
}

export const useMainlineStore = create<MainlineStore>()(
  persist(
    (set) => ({
      mainlineQuests: [],

      addMainlineQuest: (quest) =>
        set((s) => ({
          mainlineQuests: [
            ...s.mainlineQuests,
            {
              ...quest,
              id: `mainline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateMainlineQuest: (id, updates) =>
        set((s) => ({
          mainlineQuests: s.mainlineQuests.map((q) =>
            q.id === id ? { ...q, ...updates } : q
          ),
        })),

      completeMainlineQuest: (id) =>
        set((s) => ({
          mainlineQuests: s.mainlineQuests.map((q) =>
            q.id === id
              ? { ...q, status: 'completed', completedAt: new Date().toISOString() }
              : q
          ),
        })),

      deleteMainlineQuest: (id) =>
        set((s) => ({
          mainlineQuests: s.mainlineQuests.filter((q) => q.id !== id),
        })),
    }),
    { name: 'life-rpg-mainline' }
  )
);
