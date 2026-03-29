import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Boss, BossType } from '../types';
import { generateId } from '../lib/gameFormulas';

interface BossCreateData {
  name: string;
  type: BossType;
  condition: string;
  attributeKeys: Boss['attributeKeys'];
  rewardExp: number;
  rewardStardust: number;
  period: string;
}

interface BossStore {
  bosses: Boss[];
  createBoss: (data: BossCreateData) => Boss;
  defeatBoss: (id: string) => { exp: number; stardust: number } | null;
  checkWeeklyBoss: (weeklyTasksTotal: number, weeklyTasksCompleted: number) => void;
  getActiveBosses: () => Boss[];
  archiveExpiredBosses: () => void;
}

export const useBossStore = create<BossStore>()(
  persist(
    (set, get) => ({
      bosses: [],

      createBoss: (data) => {
        const boss: Boss = {
          id: generateId(),
          userId: 'local',
          name: data.name,
          type: data.type,
          condition: data.condition,
          attributeKeys: data.attributeKeys,
          status: 'active',
          rewardExp: data.rewardExp,
          rewardStardust: data.rewardStardust,
          period: data.period,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ bosses: [...state.bosses, boss] }));
        return boss;
      },

      defeatBoss: (id) => {
        const boss = get().bosses.find((b) => b.id === id);
        if (!boss || boss.status !== 'active') return null;
        set((state) => ({
          bosses: state.bosses.map((b) =>
            b.id === id
              ? { ...b, status: 'defeated', defeatedAt: new Date().toISOString() }
              : b
          ),
        }));
        return { exp: boss.rewardExp, stardust: boss.rewardStardust };
      },

      // Auto-generate weekly boss when all weekly tasks are complete
      checkWeeklyBoss: (weeklyTasksTotal, weeklyTasksCompleted) => {
        if (weeklyTasksTotal === 0 || weeklyTasksCompleted < weeklyTasksTotal) return;

        const now = new Date();
        const year = now.getFullYear();
        // ISO week number
        const startOfYear = new Date(year, 0, 1);
        const weekNum = Math.ceil(
          ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
        );
        const period = `${year}-W${String(weekNum).padStart(2, '0')}`;

        const existing = get().bosses.find(
          (b) => b.type === 'weekly' && b.period === period
        );
        if (existing) return;

        const boss: Boss = {
          id: generateId(),
          userId: 'local',
          name: `周常终结者·第${weekNum}周`,
          type: 'weekly',
          condition: `完成本周全部 ${weeklyTasksTotal} 个周常任务`,
          attributeKeys: [],
          status: 'active',
          rewardExp: 200,
          rewardStardust: 80,
          period,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ bosses: [...state.bosses, boss] }));
      },

      getActiveBosses: () => {
        return get().bosses.filter((b) => b.status === 'active');
      },

      archiveExpiredBosses: () => {
        const now = new Date();
        set((state) => ({
          bosses: state.bosses.map((b) => {
            if (b.status !== 'active') return b;
            // Weekly bosses expire after 7 days, monthly after 30, quarterly after 90
            const created = new Date(b.createdAt);
            const daysAlive = (now.getTime() - created.getTime()) / 86400000;
            const expiryDays = b.type === 'weekly' ? 7 : b.type === 'monthly' ? 30 : 90;
            if (daysAlive > expiryDays) {
              return { ...b, status: 'expired' as const };
            }
            return b;
          }),
        }));
      },
    }),
    { name: 'life-rpg-bosses' }
  )
);
