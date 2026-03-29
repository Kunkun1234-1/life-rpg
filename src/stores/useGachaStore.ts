import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GachaPool, GachaHistory, GachaPity, GachaPrize } from '../types';
import { GACHA_CONFIG } from '../lib/constants';
import { calculatePullRarity, selectPrize } from '../lib/gachaEngine';
import { usePlayerStore } from './usePlayerStore';

interface GachaState {
  pools: GachaPool[];
  history: GachaHistory[];
  pity: Record<string, GachaPity>;

  createPool: (pool: Omit<GachaPool, 'id' | 'userId' | 'createdAt'>) => void;
  deletePool: (poolId: string) => void;
  pullSingle: (poolId: string) => GachaPrize | null;
  pullTen: (poolId: string) => GachaPrize[];
  getPityInfo: (poolId: string) => GachaPity;
  getPoolHistory: (poolId: string) => GachaHistory[];
}

const DEFAULT_PITY = (poolId: string): GachaPity => ({
  userId: 'local',
  poolId,
  pullsSinceLast4Star: 0,
  pullsSinceLast5Star: 0,
  totalPulls: 0,
  lost5050: false,
});

export const useGachaStore = create<GachaState>()(
  persist(
    (set, get) => ({
      pools: [],
      history: [],
      pity: {},

      createPool: (poolData) => {
        const pool: GachaPool = {
          ...poolData,
          id: `pool_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          userId: 'local',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          pools: [...state.pools, pool],
          pity: {
            ...state.pity,
            [pool.id]: DEFAULT_PITY(pool.id),
          },
        }));
      },

      deletePool: (poolId) => {
        set((state) => ({
          pools: state.pools.filter((p) => p.id !== poolId),
          history: state.history.filter((h) => h.poolId !== poolId),
        }));
      },

      pullSingle: (poolId) => {
        const { pools, pity, history } = get();
        const pool = pools.find((p) => p.id === poolId);
        if (!pool) return null;

        const playerStore = usePlayerStore.getState();
        const success = playerStore.spendStardust(GACHA_CONFIG.PULL_COST);
        if (!success) return null;

        const currentPity = pity[poolId] || DEFAULT_PITY(poolId);
        const rarity = calculatePullRarity(currentPity);
        const { prize, lost5050 } = selectPrize(pool, rarity, currentPity);

        const newPity: GachaPity = {
          ...currentPity,
          pullsSinceLast4Star: rarity >= 4 ? 0 : currentPity.pullsSinceLast4Star + 1,
          pullsSinceLast5Star: rarity === 5 ? 0 : currentPity.pullsSinceLast5Star + 1,
          totalPulls: currentPity.totalPulls + 1,
          lost5050: rarity === 5 ? lost5050 : currentPity.lost5050,
        };

        const historyEntry: GachaHistory = {
          id: `gh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          userId: 'local',
          poolId,
          prize,
          pullNumber: newPity.totalPulls,
          isGuaranteed: rarity === 5 && currentPity.lost5050,
          createdAt: new Date().toISOString(),
        };

        set({
          pity: { ...pity, [poolId]: newPity },
          history: [historyEntry, ...history],
        });

        return prize;
      },

      pullTen: (poolId) => {
        const { pools, pity, history } = get();
        const pool = pools.find((p) => p.id === poolId);
        if (!pool) return [];

        const playerStore = usePlayerStore.getState();
        const success = playerStore.spendStardust(GACHA_CONFIG.TEN_PULL_COST);
        if (!success) return [];

        let currentPity = pity[poolId] || DEFAULT_PITY(poolId);
        const results: GachaPrize[] = [];
        const newHistoryEntries: GachaHistory[] = [];

        for (let i = 0; i < 10; i++) {
          const rarity = calculatePullRarity(currentPity);
          const { prize, lost5050 } = selectPrize(pool, rarity, currentPity);
          results.push(prize);

          currentPity = {
            ...currentPity,
            pullsSinceLast4Star: rarity >= 4 ? 0 : currentPity.pullsSinceLast4Star + 1,
            pullsSinceLast5Star: rarity === 5 ? 0 : currentPity.pullsSinceLast5Star + 1,
            totalPulls: currentPity.totalPulls + 1,
            lost5050: rarity === 5 ? lost5050 : currentPity.lost5050,
          };

          newHistoryEntries.push({
            id: `gh_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
            userId: 'local',
            poolId,
            prize,
            pullNumber: currentPity.totalPulls,
            isGuaranteed: rarity === 5 && (pity[poolId] || DEFAULT_PITY(poolId)).lost5050,
            createdAt: new Date().toISOString(),
          });
        }

        set({
          pity: { ...pity, [poolId]: currentPity },
          history: [...newHistoryEntries.reverse(), ...history],
        });

        return results;
      },

      getPityInfo: (poolId) => {
        const { pity } = get();
        return pity[poolId] || DEFAULT_PITY(poolId);
      },

      getPoolHistory: (poolId) => {
        return get().history.filter((h) => h.poolId === poolId);
      },
    }),
    { name: 'life-rpg-gacha' }
  )
);
