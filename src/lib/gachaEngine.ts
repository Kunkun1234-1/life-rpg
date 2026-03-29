import { GachaPool, GachaPity, GachaPrize, GachaRarity } from '../types';
import { GACHA_CONFIG } from './constants';

export function calculatePullRarity(pity: GachaPity): GachaRarity {
  // 4-star guarantee every 10
  if (pity.pullsSinceLast4Star >= GACHA_CONFIG.FOUR_STAR_GUARANTEE - 1) return Math.random() < 0.006 ? 5 : 4;
  // 5-star: base 0.6%, soft pity from 75, hard at 90
  let fiveStarRate = GACHA_CONFIG.RATES.FIVE_STAR;
  if (pity.pullsSinceLast5Star >= GACHA_CONFIG.SOFT_PITY_START) {
    fiveStarRate += (pity.pullsSinceLast5Star - GACHA_CONFIG.SOFT_PITY_START + 1) * 0.06;
  }
  if (pity.pullsSinceLast5Star >= GACHA_CONFIG.HARD_PITY - 1) return 5;
  const roll = Math.random();
  if (roll < fiveStarRate) return 5;
  if (roll < fiveStarRate + GACHA_CONFIG.RATES.FOUR_STAR) return 4;
  return 3;
}

export function selectPrize(pool: GachaPool, rarity: GachaRarity, pity: GachaPity): { prize: GachaPrize; lost5050: boolean } {
  if (rarity === 5) {
    if (pity.lost5050) return { prize: pool.fiveStarUp, lost5050: false }; // grand guarantee
    if (Math.random() < 0.5) return { prize: pool.fiveStarUp, lost5050: false }; // won 50/50
    const std = pool.fiveStarStandard[Math.floor(Math.random() * pool.fiveStarStandard.length)];
    return { prize: std || pool.fiveStarUp, lost5050: true };
  }
  if (rarity === 4) {
    const item = pool.fourStarItems[Math.floor(Math.random() * pool.fourStarItems.length)];
    return { prize: item || { name: '四星奖励', rarity: 4 }, lost5050: false };
  }
  const item = pool.threeStarItems[Math.floor(Math.random() * pool.threeStarItems.length)];
  return { prize: item || { name: '三星奖励', rarity: 3 }, lost5050: false };
}
