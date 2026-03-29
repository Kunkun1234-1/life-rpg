import { BREAKTHROUGHS } from './constants';
import type { Breakthrough } from '../types';
import type { AttributeKey } from '../types';

// Minimal interfaces so this function doesn't couple to full store types
interface PlayerStoreSlice {
  adventureLevel: number;
  attributes?: Array<{ key: AttributeKey; level: number }>;
}

interface TaskStoreSlice {
  tasks?: Array<{ rarity: number; status: string }>;
}

interface BreakthroughResult {
  canBreakthrough: boolean;
  currentBreakthrough: Breakthrough | null;
  reason: string;
}

export function checkBreakthrough(
  playerStore: PlayerStoreSlice,
  taskStore: TaskStoreSlice
): BreakthroughResult {
  const { adventureLevel, attributes = [] } = playerStore;
  const tasks = taskStore.tasks ?? [];

  // Find the breakthrough relevant to the current level
  const relevantBreakthrough = BREAKTHROUGHS.find(
    (b) => b.level === adventureLevel && !b.completed
  );

  if (!relevantBreakthrough) {
    return {
      canBreakthrough: false,
      currentBreakthrough: null,
      reason: '当前等级无突破条件',
    };
  }

  const allAttrLevels = attributes.map((a) => a.level);
  const epicTasksCompleted = tasks.filter(
    (t) => t.rarity === 4 && t.status === 'completed'
  ).length;
  const legendTasksCompleted = tasks.filter(
    (t) => t.rarity === 5 && t.status === 'completed'
  ).length;

  let canBreakthrough = false;
  let reason = '';

  switch (adventureLevel) {
    case 10: {
      // 至少3个属性达到 Lv.3
      const attrsAbove3 = allAttrLevels.filter((l) => l >= 3).length;
      canBreakthrough = attrsAbove3 >= 3;
      reason = canBreakthrough
        ? '突破条件已满足'
        : `需要至少3个属性达到 Lv.3，当前满足 ${attrsAbove3} 个`;
      break;
    }
    case 20: {
      // 完成一个史诗级任务 + 至少4个属性达到 Lv.5
      const attrsAbove5 = allAttrLevels.filter((l) => l >= 5).length;
      canBreakthrough = epicTasksCompleted >= 1 && attrsAbove5 >= 4;
      if (!canBreakthrough) {
        const parts: string[] = [];
        if (epicTasksCompleted < 1) parts.push('需完成至少1个史诗级任务');
        if (attrsAbove5 < 4) parts.push(`需要至少4个属性达到 Lv.5（当前 ${attrsAbove5} 个）`);
        reason = parts.join('；');
      } else {
        reason = '突破条件已满足';
      }
      break;
    }
    case 30: {
      // 所有属性均达到 Lv.7 + 累计完成3个史诗级任务
      const allAbove7 = allAttrLevels.length >= 6 && allAttrLevels.every((l) => l >= 7);
      canBreakthrough = allAbove7 && epicTasksCompleted >= 3;
      if (!canBreakthrough) {
        const parts: string[] = [];
        if (!allAbove7) parts.push('需要所有属性均达到 Lv.7');
        if (epicTasksCompleted < 3) parts.push(`需累计完成3个史诗级任务（当前 ${epicTasksCompleted} 个）`);
        reason = parts.join('；');
      } else {
        reason = '突破条件已满足';
      }
      break;
    }
    case 40: {
      // 完成一个传说级任务 + 所有属性均达到 Lv.10
      const allAbove10 = allAttrLevels.length >= 6 && allAttrLevels.every((l) => l >= 10);
      canBreakthrough = legendTasksCompleted >= 1 && allAbove10;
      if (!canBreakthrough) {
        const parts: string[] = [];
        if (legendTasksCompleted < 1) parts.push('需完成至少1个传说级任务');
        if (!allAbove10) parts.push('需要所有属性均达到 Lv.10');
        reason = parts.join('；');
      } else {
        reason = '突破条件已满足';
      }
      break;
    }
    default:
      reason = '当前等级无突破条件';
  }

  return {
    canBreakthrough,
    currentBreakthrough: relevantBreakthrough,
    reason,
  };
}
