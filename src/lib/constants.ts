import type { AttributeInfo, Title, RarityConfig, Achievement, Breakthrough, ShopItem } from '../types';

// --- Attribute Definitions ---
export const ATTRIBUTES: AttributeInfo[] = [
  { key: 'body', name: '体魄', emoji: '🔥', color: '#FF6B6B', description: '运动、饮食、睡眠、体检、身体素质' },
  { key: 'mind', name: '心智', emoji: '❄️', color: '#64B5F6', description: '阅读、学习课程、考证、深度思考、写作' },
  { key: 'craft', name: '技艺', emoji: '⚡', color: '#FFD54F', description: '工作项目、副业产出、技术实操、作品创作' },
  { key: 'social', name: '社交', emoji: '🌿', color: '#81C784', description: '家人相处、朋友聚会、社交拓展、团队协作' },
  { key: 'spirit', name: '心灵', emoji: '💫', color: '#CE93D8', description: '冥想、反思、情绪管理、兴趣爱好、自我对话' },
  { key: 'wealth', name: '财务', emoji: '🔶', color: '#FFB74D', description: '收入增长、储蓄、投资、记账、财务规划' },
];

export const ATTRIBUTE_MAP = Object.fromEntries(ATTRIBUTES.map(a => [a.key, a])) as Record<string, AttributeInfo>;

// --- Title System ---
export const TITLES: Title[] = [
  { level: 1, name: '初入尘世', description: '刚刚开始的旅行者' },
  { level: 5, name: '历练行者', description: '已建立基本习惯循环' },
  { level: 10, name: '觉醒之人', description: '开始感受到系统性成长' },
  { level: 15, name: '破境修士', description: '突破舒适区，进入新阶段' },
  { level: 20, name: '通达贤者', description: '多维度均衡发展' },
  { level: 30, name: '超凡入圣', description: '长期坚持的证明' },
  { level: 40, name: '命运主宰', description: '完全掌控自己的节奏' },
  { level: 50, name: '万界之主', description: '终极称号，传说级成就' },
];

// --- Task Rarity Config ---
export const RARITY_CONFIGS: RarityConfig[] = [
  {
    rarity: 1, label: '日常', stars: '★', cycle: 'daily',
    staminaRange: [10, 15], expRange: [20, 30], stardustRange: [5, 10],
    color: '#9E9E9E', description: '30分钟内可完成的习惯性任务',
  },
  {
    rarity: 2, label: '周常', stars: '★★', cycle: 'weekly',
    staminaRange: [25, 30], expRange: [50, 80], stardustRange: [20, 30],
    color: '#64B5F6', description: '1-3小时投入的定期事项',
  },
  {
    rarity: 3, label: '挑战', stars: '★★★', cycle: 'onetime',
    staminaRange: [40, 50], expRange: [100, 200], stardustRange: [50, 80],
    color: '#CE93D8', description: '走出舒适区的突破性任务',
  },
  {
    rarity: 4, label: '史诗', stars: '★★★★', cycle: 'onetime',
    staminaRange: [60, 70], expRange: [200, 400], stardustRange: [100, 150],
    color: '#FFD54F', description: '跨越数周的阶段性大目标',
  },
  {
    rarity: 5, label: '传说', stars: '★★★★★', cycle: 'onetime',
    staminaRange: [80, 90], expRange: [400, 800], stardustRange: [200, 400],
    color: '#FF7043', description: '改变人生轨迹的里程碑',
  },
];

export const RARITY_MAP = Object.fromEntries(RARITY_CONFIGS.map(r => [r.rarity, r])) as Record<number, RarityConfig>;

// --- Stamina Constants ---
export const STAMINA = {
  DAILY_CAP: 100,
  OVERFLOW_CAP: 150,
  OVERDRAFT_PENALTY: 0.7,
  CONDENSED_BOOST: 30,
};

// --- Streak Bonuses ---
export const STREAK_BONUSES = [
  { days: 3, stardust: 30 },
  { days: 7, stardust: 80 },
  { days: 14, stardust: 200 },
];

// --- Achievement Unlock Thresholds ---
export const ACHIEVEMENT_UNLOCKS = [
  { points: 10, feature: '自定义称号' },
  { points: 25, feature: '属性雷达图面板' },
  { points: 50, feature: '奖励商店扩展槽位' },
  { points: 100, feature: '高级数据统计视图' },
];

// --- Default Achievements ---
export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'id' | 'unlockedAt'>[] = [
  { key: 'first_quest', name: '初次冒险', description: '完成第一个任务', category: 'milestone', points: 5, condition: 'complete_first_task' },
  { key: 'streak_7', name: '持之以恒', description: '连续7天完成所有日常任务', category: 'streak', points: 10, condition: 'streak_7_days' },
  { key: 'attr_awakening', name: '属性觉醒', description: '任意属性达到 Lv.10', category: 'attribute', points: 15, condition: 'any_attr_level_10' },
  { key: 'epic_slayer', name: '史诗破敌', description: '首次完成史诗级任务', category: 'task', points: 20, condition: 'complete_first_epic' },
  { key: 'monthly_legend', name: '月度传说', description: '单月累计获得 3000+ 经验值', category: 'milestone', points: 25, condition: 'monthly_exp_3000' },
  { key: 'balanced', name: '全面发展', description: '所有属性均达到 Lv.5 以上', category: 'attribute', points: 30, condition: 'all_attrs_level_5' },
];

// --- Breakthrough Tasks ---
export const BREAKTHROUGHS: Breakthrough[] = [
  { level: 10, condition: '至少3个属性达到 Lv.3', description: '验证你已建立多维度的基本习惯', completed: false },
  { level: 20, condition: '完成一个史诗级任务 + 至少4个属性达到 Lv.5', description: '证明你能处理大型目标', completed: false },
  { level: 30, condition: '所有属性均达到 Lv.7 + 累计完成3个史诗级任务', description: '全面发展的证明', completed: false },
  { level: 40, condition: '完成一个传说级任务 + 所有属性均达到 Lv.10', description: '人生维度的重大突破', completed: false },
];

// --- System Shop Items (Permanent) ---
export const PERMANENT_SHOP_ITEMS: Omit<ShopItem, 'id'>[] = [
  { name: '浓缩体力', description: '使用后当日体力上限 +30', category: 'item_shop', price: 80, isSystem: true, maxPerMonth: 3, effectType: 'stamina_boost', effectValue: 30 },
  { name: '经验加倍卷轴', description: '使用后当日所有任务经验值 ×1.3', category: 'item_shop', price: 120, isSystem: true, maxPerMonth: 2, effectType: 'exp_boost', effectValue: 1.3 },
  { name: '星尘加倍卷轴', description: '使用后当日所有任务星尘 ×1.3', category: 'item_shop', price: 120, isSystem: true, maxPerMonth: 2, effectType: 'stardust_boost', effectValue: 1.3 },
  { name: '休息日令牌', description: '使用后当日所有日常任务视为已完成（获得50%经验）', category: 'item_shop', price: 300, isSystem: true, maxPerMonth: 1, effectType: 'rest_day', effectValue: 0.5 },
];

// --- System Shop Items (Rotating) ---
export const ROTATING_SHOP_ITEMS: Omit<ShopItem, 'id'>[] = [
  { name: '属性共鸣石', description: '使用后指定一个属性，本周该属性经验 +20%', category: 'item_shop', price: 150, isSystem: true, maxPerMonth: 1, effectType: 'attr_resonance', effectValue: 0.2, isRotating: true },
  { name: '命运罗盘', description: '使用后随机指定一个属性，当日该属性经验 ×1.5', category: 'item_shop', price: 60, isSystem: true, maxPerMonth: 2, effectType: 'fate_compass', effectValue: 1.5, isRotating: true },
  { name: '时光之沙', description: '使用后将一个已过期的挑战/史诗任务重新激活', category: 'item_shop', price: 200, isSystem: true, maxPerMonth: 1, effectType: 'time_sand', isRotating: true },
];

// --- Five Core Principles ---
export const SYSTEM_PRINCIPLES = [
  { title: '拥抱现实，面对现实', summary: '诚实地评估自己的任务完成情况和属性发展状态，不自欺。' },
  { title: '痛苦 + 反思 = 进步', summary: '系统不惩罚你，但会在回顾报告中呈现数据。关键在于「反思」。' },
  { title: '目标 → 问题 → 方案 → 执行', summary: '先设定阶段性目标，识别阻碍，诊断原因，设计解决方案，然后执行。' },
  { title: '做到头脑极度开放', summary: '不要因为某个属性等级低就回避它，不要只做擅长的事来刷经验。' },
  { title: '进化是最大的成就', summary: '经验值只涨不跌，代表累积进化。关注进步本身，而不是追求完美。' },
];
