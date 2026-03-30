// ============================================================
// Life RPG - Core Type Definitions
// ============================================================

// --- Attribute System ---
export type AttributeKey = 'body' | 'mind' | 'craft' | 'social' | 'spirit' | 'wealth';

export interface AttributeInfo {
  key: AttributeKey;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

export interface AttributeState {
  key: AttributeKey;
  exp: number;
  level: number;
}

// --- Task System ---
export type TaskRarity = 1 | 2 | 3 | 4 | 5; // ★ to ★★★★★
export type TaskCycle = 'daily' | 'weekly' | 'onetime';
export type TaskStatus = 'pending' | 'completed' | 'archived' | 'failed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  element: AttributeKey;
  rarity: TaskRarity;
  cycle: TaskCycle;
  baseExp: number;
  baseStardust: number;
  staminaCost: number;
  status: TaskStatus;
  parentTaskId?: string; // for subtasks
  mainlineId?: string; // linked mainline quest
  subtasks?: Task[];
  isFirstCompletion: boolean;
  deadline?: string; // ISO date
  createdAt: string;
  completedAt?: string;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  userId: string;
  completedAt: string;
  isOverachieve: boolean;
  isFirstTime: boolean;
  expEarned: number;
  stardustEarned: number;
  staminaSpent: number;
}

// --- Player State ---
export interface PlayerState {
  id: string;
  email: string;
  playerName: string;
  totalExp: number;
  adventureLevel: number;
  stardust: number;
  stamina: number;
  maxStamina: number;
  overflowStamina: number;
  streakDays: number;
  currentTitle: string;
  customTitle?: string;
  achievementPoints: number;
  createdAt: string;
}

// --- Title System ---
export interface Title {
  level: number;
  name: string;
  description: string;
}

// --- Achievement System ---
export type AchievementCategory = 'beginner' | 'persistence' | 'attribute' | 'quest' | 'gacha' | 'principle' | 'shop' | 'legendary';
export type AchievementRewardTier = 'normal' | 'rare' | 'legendary';
export type AchievementVisibility = 'visible' | 'hidden';

export interface AchievementCategoryInfo {
  key: AchievementCategory;
  label: string;
  icon: string;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  category: AchievementCategory;
  points: number;
  stardustReward: number;
  rewardTier: AchievementRewardTier;
  visibility: AchievementVisibility;
  condition: string;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
}

// --- Equipment System ---
export type EquipmentType = 'tool' | 'habit' | 'environment';

export interface Equipment {
  id: string;
  userId: string;
  name: string;
  type: EquipmentType;
  attributeKey: AttributeKey;
  bonusPct: number; // 3 or 5
  isEquipped: boolean;
  streakDays: number; // for upgrade tracking
  createdAt: string;
}

// --- Shop System ---
export type ShopCategory = 'instant_reward' | 'item_shop' | 'stored_reward' | 'gacha';
export type ItemEffectType = 'stamina_boost' | 'exp_boost' | 'stardust_boost' | 'rest_day' | 'attr_resonance' | 'fate_compass' | 'time_sand' | 'custom';

export interface ShopItem {
  id: string;
  userId?: string;
  name: string;
  description: string;
  category: ShopCategory;
  price: number;
  isSystem: boolean;
  maxPerMonth?: number;
  effectType: ItemEffectType;
  effectValue?: number;
  isRotating?: boolean;
}

export interface InventoryItem {
  id: string;
  userId: string;
  itemId: string;
  item: ShopItem;
  quantity: number;
  obtainedAt: string;
}

// --- Boss System ---
export type BossType = 'weekly' | 'monthly' | 'quarterly';
export type BossStatus = 'active' | 'defeated' | 'undefeated' | 'expired';

export interface Boss {
  id: string;
  userId: string;
  name: string;
  type: BossType;
  condition: string;
  attributeKeys: AttributeKey[];
  status: BossStatus;
  rewardExp: number;
  rewardStardust: number;
  period: string; // e.g. "2026-W13" or "2026-03"
  createdAt: string;
  defeatedAt?: string;
}

// --- Principle System ---
export interface Principle {
  id: string;
  userId: string;
  scenario: string; // "When..." condition
  action: string; // "Then..." action
  attributeKeys: AttributeKey[];
  sourceLogId?: string;
  confidence?: number;        // 1-5
  sourceType?: string;        // '直觉推导' | '逻辑论证' | '经验总结' | '他人建议'
  verificationCount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DecisionLog {
  id: string;
  userId: string;
  date: string;
  scenario: string;
  intuition?: string;
  logicAnalysis?: string;
  decision: string;
  basis: string;
  basisType?: string; // 'intuition' | 'principle' | 'logic' | 'experience'
  result: string;
  reflection: string;
  extractedPrinciple?: string;
  newPrincipleId?: string;
  createdAt: string;
}

export interface FiveStepFlow {
  id: string;
  userId: string;
  title: string;
  goal: string;
  problems: string[];
  diagnosis: { intuition: string; logic: string; rootCause: string };
  solutions: { description: string; chosen: boolean }[];
  execution: { status: 'planning' | 'executing' | 'reviewing' | 'completed'; notes: string };
  extractedPrincipleId?: string;
  attributeKeys: AttributeKey[];
  createdAt: string;
  updatedAt: string;
}

// --- Goal System ---
export type GoalType = 'vision' | 'phase';
export type GoalStatus = 'active' | 'completed' | 'abandoned';

export interface Goal {
  id: string;
  userId: string;
  type: GoalType;
  title: string;
  description?: string;
  attributeKeys: AttributeKey[];
  status: GoalStatus;
  deadline?: string;
  createdAt: string;
}

// --- Calendar System ---
export type CalendarEventType = 'course' | 'schedule' | 'note';

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  eventType: CalendarEventType;
  dayOfWeek?: number; // 0-6 for recurring
  timeStart?: string;
  timeEnd?: string;
  location?: string;
  date?: string; // specific date for one-time events
  isRecurring: boolean;
  description?: string;
}

export interface SemesterConfig {
  userId: string;
  semesterName: string;
  startDate: string;
  totalWeeks: number;
}

// --- Breakthrough System ---
export interface Breakthrough {
  level: number;
  condition: string;
  description: string;
  completed: boolean;
}

// --- Review System ---
export type ReviewPeriod = 'weekly' | 'monthly' | 'quarterly';

export interface ReviewReport {
  id: string;
  userId: string;
  period: ReviewPeriod;
  periodLabel: string; // e.g. "2026-W13" or "2026-03"
  completionRate: number;
  attributeExpGains: Record<AttributeKey, number>;
  stardustEarned: number;
  stardustSpent: number;
  achievementsUnlocked: string[];
  streakDays: number;
  createdAt: string;
}

// --- Mainline Quest System ---
export type MainlineStatus = 'active' | 'completed' | 'abandoned';

export interface MainlineQuest {
  id: string;
  userId: string;
  title: string;
  description: string;
  attributeKeys: AttributeKey[];
  status: MainlineStatus;
  completionCondition?: string;
  createdAt: string;
  completedAt?: string;
}

// --- Gacha/Wish System ---
export type GachaRarity = 3 | 4 | 5;

export interface GachaPrize {
  name: string;
  rarity: GachaRarity;
  isUp?: boolean; // for 5-star UP item
  emoji?: string;
  description?: string;
}

export interface GachaPool {
  id: string;
  userId: string;
  poolName: string;
  fiveStarUp: GachaPrize;
  fiveStarStandard: GachaPrize[];
  fourStarItems: GachaPrize[];
  threeStarItems: GachaPrize[];
  isActive: boolean;
  createdAt: string;
}

export interface GachaHistory {
  id: string;
  userId: string;
  poolId: string;
  prize: GachaPrize;
  pullNumber: number;
  isGuaranteed: boolean;
  createdAt: string;
}

export interface GachaPity {
  userId: string;
  poolId: string;
  pullsSinceLast4Star: number;
  pullsSinceLast5Star: number;
  totalPulls: number;
  lost5050: boolean; // 大保底 marker
}

// --- Task Rarity Config ---
export interface RarityConfig {
  rarity: TaskRarity;
  label: string;
  stars: string;
  cycle: TaskCycle;
  staminaRange: [number, number];
  expRange: [number, number];
  stardustRange: [number, number];
  color: string;
  description: string;
}
