import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Achievement, AchievementCategory } from '../types';
import { DEFAULT_ACHIEVEMENTS } from '../lib/constants';
import { getAdventureLevel, getAttributeLevel } from '../lib/gameFormulas';
import { usePlayerStore } from './usePlayerStore';
import { useTaskStore } from './useTaskStore';
import { usePrincipleStore } from './usePrincipleStore';
import { useShopStore } from './useShopStore';
import { useEquipmentStore } from './useEquipmentStore';
import { useBossStore } from './useBossStore';

function buildInitialAchievements(): Achievement[] {
  return DEFAULT_ACHIEVEMENTS.map((a) => ({
    ...a,
    id: `achievement-${a.key}`,
  }));
}

interface ConditionResult {
  met: boolean;
  progress?: number;
  max?: number;
}

interface AchievementStore {
  achievements: Achievement[];
  checkAndUnlock: () => void;
  getByCategory: (cat: AchievementCategory) => Achievement[];
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      achievements: buildInitialAchievements(),

      checkAndUnlock: () => {
        const player = usePlayerStore.getState();
        const taskStore = useTaskStore.getState();
        const principleStore = usePrincipleStore.getState();
        const shopStore = useShopStore.getState();

        const tasks = taskStore.tasks;
        const completions = taskStore.completions;
        const completedTasks = tasks.filter((t) => t.status === 'completed');
        const attrExp = player.attributeExp;
        const attrValues = Object.values(attrExp);
        const adventureLevel = getAdventureLevel(player.totalExp);

        // Equipment check
        let hasEquipped = false;
        try {
          hasEquipped = useEquipmentStore.getState().equipment.some((e) => e.isEquipped);
        } catch { /* store unavailable */ }

        // Boss checks
        let hasBossDefeat = false;
        let hasMonthlyBossDefeat = false;
        try {
          const bosses = useBossStore.getState().bosses;
          hasBossDefeat = bosses.some((b) => b.status === 'defeated');
          hasMonthlyBossDefeat = bosses.some(
            (b) => b.status === 'defeated' && b.type === 'monthly'
          );
        } catch { /* store unavailable */ }

        // Mainline quest checks (store may not exist yet)
        let hasMainline = false;
        let hasMainlineComplete = false;
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mainlineStore = (globalThis as any).__mainlineStore;
          if (mainlineStore) {
            const state = mainlineStore.getState();
            hasMainline = (state.mainlineQuests?.length ?? 0) >= 1;
            hasMainlineComplete = state.mainlineQuests?.some(
              (q: { status: string }) => q.status === 'completed'
            ) ?? false;
          }
        } catch { /* store unavailable */ }

        // Gacha checks (store may not exist yet)
        let hasGachaPull = false;
        let has4Star = false;
        let has5Star = false;
        let totalPulls = 0;
        let grandGuaranteeHit = false;
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const gachaStore = (globalThis as any).__gachaStore;
          if (gachaStore) {
            const state = gachaStore.getState();
            const history = state.history ?? [];
            hasGachaPull = history.length >= 1;
            has4Star = history.some((h: { prize: { rarity: number } }) => h.prize.rarity >= 4);
            has5Star = history.some((h: { prize: { rarity: number } }) => h.prize.rarity >= 5);
            totalPulls = history.length;
            grandGuaranteeHit = history.some(
              (h: { isGuaranteed: boolean; prize: { rarity: number } }) =>
                h.isGuaranteed && h.prize.rarity === 5
            );
          }
        } catch { /* store unavailable */ }

        // Monthly exp
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthlyExp = completions
          .filter((c) => c.completedAt >= monthStart)
          .reduce((sum, c) => sum + c.expEarned, 0);

        // Total stardust earned from completions
        const totalStardustEarned = completions.reduce((sum, c) => sum + c.stardustEarned, 0);

        // Shop checks
        const hasPurchase = Object.keys(shopStore.monthlyPurchases).length > 0;
        const hasBigSpender = shopStore.inventory.some((i) => i.item.price >= 500);

        const check = (condition: string): ConditionResult => {
          switch (condition) {
            case 'complete_first_task':
              return { met: completedTasks.length >= 1, progress: Math.min(completedTasks.length, 1), max: 1 };
            case 'adventure_level_2':
              return { met: adventureLevel >= 2, progress: Math.min(adventureLevel, 2), max: 2 };
            case 'adventure_level_10':
              return { met: adventureLevel >= 10, progress: Math.min(adventureLevel, 10), max: 10 };
            case 'adventure_level_20':
              return { met: adventureLevel >= 20, progress: Math.min(adventureLevel, 20), max: 20 };
            case 'adventure_level_30':
              return { met: adventureLevel >= 30, progress: Math.min(adventureLevel, 30), max: 30 };
            case 'first_principle':
              return {
                met: principleStore.principles.length >= 1,
                progress: Math.min(principleStore.principles.length, 1),
                max: 1,
              };
            case 'first_purchase':
              return { met: hasPurchase };
            case 'first_equipment':
              return { met: hasEquipped };
            case 'first_mainline':
              return { met: hasMainline };
            case 'streak_3_days':
              return { met: player.streakDays >= 3, progress: Math.min(player.streakDays, 3), max: 3 };
            case 'streak_7_days':
              return { met: player.streakDays >= 7, progress: Math.min(player.streakDays, 7), max: 7 };
            case 'streak_14_days':
              return { met: player.streakDays >= 14, progress: Math.min(player.streakDays, 14), max: 14 };
            case 'streak_30_days':
              return { met: player.streakDays >= 30, progress: Math.min(player.streakDays, 30), max: 30 };
            case 'streak_100_days':
              return { met: player.streakDays >= 100, progress: Math.min(player.streakDays, 100), max: 100 };
            case 'any_attr_level_5':
              return { met: attrValues.some((exp) => getAttributeLevel(exp) >= 5) };
            case 'any_attr_level_10':
              return { met: attrValues.some((exp) => getAttributeLevel(exp) >= 10) };
            case 'any_attr_level_15':
              return { met: attrValues.some((exp) => getAttributeLevel(exp) >= 15) };
            case 'all_attrs_level_3':
              return { met: attrValues.every((exp) => getAttributeLevel(exp) >= 3) };
            case 'all_attrs_level_5':
              return { met: attrValues.every((exp) => getAttributeLevel(exp) >= 5) };
            case 'all_attrs_level_10':
              return { met: attrValues.every((exp) => getAttributeLevel(exp) >= 10) };
            case 'total_tasks_10':
              return { met: completedTasks.length >= 10, progress: Math.min(completedTasks.length, 10), max: 10 };
            case 'total_tasks_50':
              return { met: completedTasks.length >= 50, progress: Math.min(completedTasks.length, 50), max: 50 };
            case 'total_tasks_200':
              return { met: completedTasks.length >= 200, progress: Math.min(completedTasks.length, 200), max: 200 };
            case 'complete_first_epic':
              return { met: completedTasks.some((t) => t.rarity >= 4) };
            case 'complete_first_legend':
              return { met: completedTasks.some((t) => t.rarity >= 5) };
            case 'complete_first_mainline':
              return { met: hasMainlineComplete };
            case 'first_gacha_pull':
              return { met: hasGachaPull };
            case 'first_4star':
              return { met: has4Star };
            case 'first_5star':
              return { met: has5Star };
            case 'total_pulls_100':
              return { met: totalPulls >= 100, progress: Math.min(totalPulls, 100), max: 100 };
            case 'grand_guarantee_hit':
              return { met: grandGuaranteeHit };
            case 'first_decision_log':
              return {
                met: principleStore.decisionLogs.length >= 1,
                progress: Math.min(principleStore.decisionLogs.length, 1),
                max: 1,
              };
            case 'principles_count_5':
              return {
                met: principleStore.principles.length >= 5,
                progress: Math.min(principleStore.principles.length, 5),
                max: 5,
              };
            case 'logs_count_10':
              return {
                met: principleStore.decisionLogs.length >= 10,
                progress: Math.min(principleStore.decisionLogs.length, 10),
                max: 10,
              };
            case 'first_log_convert':
              return { met: principleStore.decisionLogs.some((l) => !!l.newPrincipleId) };
            case 'total_stardust_earned_1000':
              return {
                met: totalStardustEarned >= 1000,
                progress: Math.min(totalStardustEarned, 1000),
                max: 1000,
              };
            case 'total_stardust_earned_5000':
              return {
                met: totalStardustEarned >= 5000,
                progress: Math.min(totalStardustEarned, 5000),
                max: 5000,
              };
            case 'single_purchase_500':
              return { met: hasBigSpender };
            case 'monthly_exp_3000':
              return { met: monthlyExp >= 3000, progress: Math.min(monthlyExp, 3000), max: 3000 };
            case 'first_boss_defeat':
              return { met: hasBossDefeat };
            case 'first_monthly_boss':
              return { met: hasMonthlyBossDefeat };
            case 'first_breakthrough':
              return { met: adventureLevel >= 10 };
            default:
              return { met: false };
          }
        };

        const { achievements } = get();
        let pointsToAdd = 0;
        let stardustToAdd = 0;
        const nowIso = new Date().toISOString();

        const updated = achievements.map((a) => {
          if (a.unlockedAt) return a;
          const result = check(a.condition);
          if (result.met) {
            pointsToAdd += a.points;
            stardustToAdd += a.stardustReward;
            return {
              ...a,
              unlockedAt: nowIso,
              progress: result.max,
              maxProgress: result.max ?? a.maxProgress,
            };
          }
          // Update progress for visible locked achievements with progress tracking
          if (a.visibility === 'visible' && result.progress !== undefined && result.max !== undefined) {
            return { ...a, progress: result.progress, maxProgress: result.max };
          }
          return a;
        });

        if (pointsToAdd > 0) {
          usePlayerStore.getState().addAchievementPoints(pointsToAdd);
        }
        if (stardustToAdd > 0) {
          usePlayerStore.getState().addStardust(stardustToAdd);
        }

        set({ achievements: updated });
      },

      getByCategory: (cat) => get().achievements.filter((a) => a.category === cat),
    }),
    {
      name: 'life-rpg-achievements',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const full = buildInitialAchievements();
        if (state.achievements.length < full.length) {
          // Preserve unlockedAt for matching keys during migration
          const unlockedMap: Record<string, string> = {};
          for (const a of state.achievements) {
            if (a.unlockedAt) unlockedMap[a.key] = a.unlockedAt;
          }
          useAchievementStore.setState({
            achievements: full.map((a) => ({
              ...a,
              unlockedAt: unlockedMap[a.key],
            })),
          });
        }
      },
    }
  )
);
