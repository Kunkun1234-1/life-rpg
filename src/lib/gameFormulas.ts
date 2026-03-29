import { TITLES, STAMINA } from './constants';

// --- Adventure Level XP Curve ---
// Per level required: 100 * 1.15^(Lv-1)
export function adventureLevelExp(level: number): number {
  return Math.round(100 * Math.pow(1.15, level - 1));
}

export function totalAdventureExpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += adventureLevelExp(i);
  }
  return total;
}

export function getAdventureLevel(totalExp: number): number {
  let level = 1;
  let expNeeded = 0;
  while (true) {
    const nextLevelExp = adventureLevelExp(level);
    if (expNeeded + nextLevelExp > totalExp) break;
    expNeeded += nextLevelExp;
    level++;
  }
  return level;
}

export function getAdventureLevelProgress(totalExp: number): { level: number; currentLevelExp: number; nextLevelExp: number; progress: number } {
  const level = getAdventureLevel(totalExp);
  const expForCurrentLevel = totalAdventureExpForLevel(level);
  const currentLevelExp = totalExp - expForCurrentLevel;
  const nextLevelExp = adventureLevelExp(level);
  return {
    level,
    currentLevelExp,
    nextLevelExp,
    progress: currentLevelExp / nextLevelExp,
  };
}

// --- Attribute Level XP Curve ---
// Per level required: 50 * 1.12^(Lv-1)
export function attributeLevelExp(level: number): number {
  return Math.round(50 * Math.pow(1.12, level - 1));
}

export function totalAttributeExpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += attributeLevelExp(i);
  }
  return total;
}

export function getAttributeLevel(attrExp: number): number {
  let level = 1;
  let expNeeded = 0;
  while (true) {
    const nextLevelExp = attributeLevelExp(level);
    if (expNeeded + nextLevelExp > attrExp) break;
    expNeeded += nextLevelExp;
    level++;
  }
  return level;
}

export function getAttributeLevelProgress(attrExp: number): { level: number; currentLevelExp: number; nextLevelExp: number; progress: number } {
  const level = getAttributeLevel(attrExp);
  const expForCurrentLevel = totalAttributeExpForLevel(level);
  const currentLevelExp = attrExp - expForCurrentLevel;
  const nextLevelExp = attributeLevelExp(level);
  return {
    level,
    currentLevelExp,
    nextLevelExp,
    progress: currentLevelExp / nextLevelExp,
  };
}

// --- Title System ---
export function getCurrentTitle(adventureLevel: number): string {
  let title = TITLES[0].name;
  for (const t of TITLES) {
    if (adventureLevel >= t.level) title = t.name;
    else break;
  }
  return title;
}

// --- Stamina Calculations ---
export function calculateStaminaCost(baseCost: number, currentStamina: number): {
  actualCost: number;
  isOverdraft: boolean;
  rewardMultiplier: number;
} {
  const isOverdraft = currentStamina < baseCost;
  return {
    actualCost: baseCost,
    isOverdraft,
    rewardMultiplier: isOverdraft ? STAMINA.OVERDRAFT_PENALTY : 1.0,
  };
}

export function resetDailyStamina(currentStamina: number): number {
  return Math.min(currentStamina + STAMINA.DAILY_CAP, STAMINA.OVERFLOW_CAP);
}

// --- Task Reward Calculations ---
export function calculateTaskReward(
  baseExp: number,
  baseStardust: number,
  options: {
    isFirstCompletion: boolean;
    isOverachieve: boolean;
    isOverdraft: boolean;
    equipmentBonus: number; // e.g. 0.05 for 5%
    expBoostActive: boolean; // item effect
    stardustBoostActive: boolean;
    expBoostValue?: number;
    stardustBoostValue?: number;
  }
): { exp: number; stardust: number } {
  let expMultiplier = 1.0;
  let stardustMultiplier = 1.0;

  // First completion: x2.0
  if (options.isFirstCompletion) {
    expMultiplier *= 2.0;
    stardustMultiplier *= 2.0;
  }

  // Over-achievement: x1.5
  if (options.isOverachieve) {
    expMultiplier *= 1.5;
    stardustMultiplier *= 1.5;
  }

  // Overdraft penalty: x0.7
  if (options.isOverdraft) {
    expMultiplier *= STAMINA.OVERDRAFT_PENALTY;
    stardustMultiplier *= STAMINA.OVERDRAFT_PENALTY;
  }

  // Equipment bonus (additive)
  expMultiplier += options.equipmentBonus;

  // Item boost effects
  if (options.expBoostActive) {
    expMultiplier *= options.expBoostValue ?? 1.3;
  }
  if (options.stardustBoostActive) {
    stardustMultiplier *= options.stardustBoostValue ?? 1.3;
  }

  return {
    exp: Math.round(baseExp * expMultiplier),
    stardust: Math.round(baseStardust * stardustMultiplier),
  };
}

// --- Subtask Reward Distribution ---
export function calculateSubtaskReward(
  motherTaskExp: number,
  motherTaskStardust: number,
  motherTaskStamina: number,
  subtaskCount: number,
): { expPerSubtask: number; stardustPerSubtask: number; staminaPerSubtask: number; completionBonus: { exp: number; stardust: number } } {
  return {
    expPerSubtask: Math.round(motherTaskExp / subtaskCount),
    stardustPerSubtask: Math.round(motherTaskStardust / subtaskCount),
    staminaPerSubtask: Math.round(motherTaskStamina / subtaskCount),
    completionBonus: {
      exp: Math.round(motherTaskExp * 0.2),
      stardust: Math.round(motherTaskStardust * 0.2),
    },
  };
}

// --- UUID Generator ---
export function generateId(): string {
  return crypto.randomUUID();
}
