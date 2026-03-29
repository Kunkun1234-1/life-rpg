import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Achievement } from '../types';
import { DEFAULT_ACHIEVEMENTS } from '../lib/constants';
import { getAttributeLevel } from '../lib/gameFormulas';
import { usePlayerStore } from './usePlayerStore';
import { useTaskStore } from './useTaskStore';

interface AchievementStore {
  achievements: Achievement[];
  checkAndUnlock: () => void;
}

const initialAchievements: Achievement[] = DEFAULT_ACHIEVEMENTS.map((a) => ({
  ...a,
  id: crypto.randomUUID(),
}));

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      achievements: initialAchievements,

      checkAndUnlock: () => {
        const player = usePlayerStore.getState();
        const tasks = useTaskStore.getState().tasks;
        const { achievements } = get();

        const completedTasks = tasks.filter((t) => t.status === 'completed');
        const attrExp = player.attributeExp;

        const conditionMet: Record<string, boolean> = {
          complete_first_task: completedTasks.length >= 1,
          streak_7_days: player.streakDays >= 7,
          any_attr_level_10: Object.values(attrExp).some(
            (exp) => getAttributeLevel(exp) >= 10
          ),
          complete_first_epic: completedTasks.some((t) => t.rarity >= 4),
          monthly_exp_3000: (() => {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const completions = useTaskStore.getState().completions;
            const monthlyExp = completions
              .filter((c) => c.completedAt >= monthStart)
              .reduce((sum, c) => sum + c.expEarned, 0);
            return monthlyExp >= 3000;
          })(),
          all_attrs_level_5: Object.values(attrExp).every(
            (exp) => getAttributeLevel(exp) >= 5
          ),
        };

        let pointsToAdd = 0;
        const updated = achievements.map((a) => {
          if (a.unlockedAt) return a;
          if (conditionMet[a.condition]) {
            pointsToAdd += a.points;
            return { ...a, unlockedAt: new Date().toISOString() };
          }
          return a;
        });

        if (pointsToAdd > 0) {
          player.addAchievementPoints(pointsToAdd);
        }

        set({ achievements: updated });
      },
    }),
    { name: 'life-rpg-achievements' }
  )
);
