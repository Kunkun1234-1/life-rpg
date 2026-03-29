import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MainlineQuest, MainlineStatus, AttributeKey } from '../types';

interface CreateMainlineData {
  title: string;
  description: string;
  attributeKeys: AttributeKey[];
  completionCondition?: string;
}

interface MainlineStore {
  mainlineQuests: MainlineQuest[];

  createMainline: (data: CreateMainlineData) => void;
  completeMainline: (id: string) => void;
  abandonMainline: (id: string) => void;
  updateMainline: (id: string, updates: Partial<MainlineQuest>) => void;
  getActiveMainlines: () => MainlineQuest[];
}

export const useMainlineStore = create<MainlineStore>()(
  persist(
    (set, get) => ({
      mainlineQuests: [],

      createMainline: (data) => {
        const active = get().mainlineQuests.filter(q => q.status === 'active');
        if (active.length >= 3) return;

        const now = new Date().toISOString();
        const newQuest: MainlineQuest = {
          id: crypto.randomUUID(),
          userId: 'local',
          title: data.title,
          description: data.description,
          attributeKeys: data.attributeKeys,
          completionCondition: data.completionCondition,
          status: 'active' as MainlineStatus,
          createdAt: now,
        };
        set((state) => ({ mainlineQuests: [...state.mainlineQuests, newQuest] }));
      },

      completeMainline: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          mainlineQuests: state.mainlineQuests.map((q) =>
            q.id === id ? { ...q, status: 'completed' as MainlineStatus, completedAt: now } : q
          ),
        }));
      },

      abandonMainline: (id) => {
        set((state) => ({
          mainlineQuests: state.mainlineQuests.map((q) =>
            q.id === id ? { ...q, status: 'abandoned' as MainlineStatus } : q
          ),
        }));
      },

      updateMainline: (id, updates) => {
        set((state) => ({
          mainlineQuests: state.mainlineQuests.map((q) =>
            q.id === id ? { ...q, ...updates } : q
          ),
        }));
      },

      getActiveMainlines: () => {
        return get().mainlineQuests.filter((q) => q.status === 'active');
      },
    }),
    { name: 'life-rpg-mainline' }
  )
);
