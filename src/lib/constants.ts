import type { AttributeInfo, Title, RarityConfig, Achievement, Breakthrough, ShopItem, AchievementCategoryInfo, GachaPool } from '../types';

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

// --- Achievement Categories (8 categories, Star Rail inspired) ---
export const ACHIEVEMENT_CATEGORIES: AchievementCategoryInfo[] = [
  { key: 'beginner', label: '初心启程', icon: '🌟' },
  { key: 'persistence', label: '持之以恒', icon: '🔥' },
  { key: 'attribute', label: '六维觉醒', icon: '💎' },
  { key: 'quest', label: '征途万里', icon: '⚔️' },
  { key: 'gacha', label: '命运之轮', icon: '🎰' },
  { key: 'principle', label: '智者之书', icon: '📖' },
  { key: 'shop', label: '星尘商人', icon: '✨' },
  { key: 'legendary', label: '传说缔造', icon: '👑' },
];

// --- Expanded Achievements (~40+, three reward tiers) ---
// normal: +1pt, +20 stardust | rare: +3pt, +80 stardust | legendary: +5pt, +200 stardust
export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'id' | 'unlockedAt'>[] = [
  // === 初心启程 (Beginner) ===
  { key: 'first_quest', name: '初次冒险', description: '完成第一个任务', category: 'beginner', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'complete_first_task' },
  { key: 'first_level_up', name: '初露锋芒', description: '冒险等级达到 Lv.2', category: 'beginner', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'adventure_level_2' },
  { key: 'first_principle', name: '原则觉醒', description: '创建第一条自定义原则', category: 'beginner', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'first_principle' },
  { key: 'first_shop', name: '首次消费', description: '在商城兑换第一件物品', category: 'beginner', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'first_purchase' },
  { key: 'first_equipment', name: '装备就绪', description: '装备第一件装备', category: 'beginner', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'first_equipment' },
  { key: 'first_mainline', name: '指引之路', description: '创建第一条主线任务', category: 'beginner', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'first_mainline' },

  // === 持之以恒 (Persistence) ===
  { key: 'streak_3', name: '三日不辍', description: '连续3天完成所有日常任务', category: 'persistence', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'streak_3_days' },
  { key: 'streak_7', name: '周而复始', description: '连续7天完成所有日常任务', category: 'persistence', points: 3, stardustReward: 80, rewardTier: 'rare', visibility: 'visible', condition: 'streak_7_days' },
  { key: 'streak_14', name: '半月无歇', description: '连续14天完成所有日常任务', category: 'persistence', points: 3, stardustReward: 80, rewardTier: 'rare', visibility: 'visible', condition: 'streak_14_days' },
  { key: 'streak_30', name: '铁杵成针', description: '连续30天完成所有日常任务', category: 'persistence', points: 5, stardustReward: 200, rewardTier: 'legendary', visibility: 'visible', condition: 'streak_30_days' },
  { key: 'streak_100', name: '百日精进', description: '连续100天完成所有日常任务', category: 'persistence', points: 5, stardustReward: 200, rewardTier: 'legendary', visibility: 'hidden', condition: 'streak_100_days' },

  // === 六维觉醒 (Attribute) ===
  { key: 'any_attr_5', name: '初窥门径', description: '任意属性达到 Lv.5', category: 'attribute', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'any_attr_level_5' },
  { key: 'any_attr_10', name: '属性觉醒', description: '任意属性达到 Lv.10', category: 'attribute', points: 3, stardustReward: 80, rewardTier: 'rare', visibility: 'visible', condition: 'any_attr_level_10' },
  { key: 'any_attr_15', name: '登峰造极', description: '任意属性达到 Lv.15', category: 'attribute', points: 5, stardustReward: 200, rewardTier: 'legendary', visibility: 'visible', condition: 'any_attr_level_15' },
  { key: 'all_attrs_3', name: '六维萌芽', description: '所有属性均达到 Lv.3', category: 'attribute', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'all_attrs_level_3' },
  { key: 'all_attrs_5', name: '全面发展', description: '所有属性均达到 Lv.5', category: 'attribute', points: 3, stardustReward: 80, rewardTier: 'rare', visibility: 'visible', condition: 'all_attrs_level_5' },
  { key: 'all_attrs_10', name: '六维圆满', description: '所有属性均达到 Lv.10', category: 'attribute', points: 5, stardustReward: 200, rewardTier: 'legendary', visibility: 'hidden', condition: 'all_attrs_level_10' },

  // === 征途万里 (Quest) ===
  { key: 'tasks_10', name: '初出茅庐', description: '累计完成10个任务', category: 'quest', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'total_tasks_10' },
  { key: 'tasks_50', name: '久经沙场', description: '累计完成50个任务', category: 'quest', points: 3, stardustReward: 80, rewardTier: 'rare', visibility: 'visible', condition: 'total_tasks_50' },
  { key: 'tasks_200', name: '身经百战', description: '累计完成200个任务', category: 'quest', points: 5, stardustReward: 200, rewardTier: 'legendary', visibility: 'visible', condition: 'total_tasks_200' },
  { key: 'epic_slayer', name: '史诗破敌', description: '首次完成史诗级任务', category: 'quest', points: 3, stardustReward: 80, rewardTier: 'rare', visibility: 'visible', condition: 'complete_first_epic' },
  { key: 'legend_slayer', name: '传说缔造者', description: '首次完成传说级任务', category: 'quest', points: 5, stardustReward: 200, rewardTier: 'legendary', visibility: 'visible', condition: 'complete_first_legend' },
  { key: 'mainline_complete', name: '主线终章', description: '完成一条主线任务', category: 'quest', points: 3, stardustReward: 80, rewardTier: 'rare', visibility: 'visible', condition: 'complete_first_mainline' },

  // === 命运之轮 (Gacha) ===
  { key: 'first_pull', name: '命运初试', description: '进行第一次祈愿', category: 'gacha', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'first_gacha_pull' },
  { key: 'first_4star', name: '紫光闪耀', description: '首次获得四星奖励', category: 'gacha', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'first_4star' },
  { key: 'first_5star', name: '金光璀璨', description: '首次获得五星奖励', category: 'gacha', points: 3, stardustReward: 80, rewardTier: 'rare', visibility: 'visible', condition: 'first_5star' },
  { key: 'pulls_100', name: '百抽达人', description: '累计祈愿100次', category: 'gacha', points: 3, stardustReward: 80, rewardTier: 'rare', visibility: 'visible', condition: 'total_pulls_100' },
  { key: 'guaranteed_hit', name: '命运眷顾', description: '触发大保底获得UP五星', category: 'gacha', points: 5, stardustReward: 200, rewardTier: 'legendary', visibility: 'hidden', condition: 'grand_guarantee_hit' },

  // === 智者之书 (Principle) ===
  { key: 'first_decision_log', name: '决策之始', description: '写下第一条决策日志', category: 'principle', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'first_decision_log' },
  { key: 'principles_5', name: '原则初成', description: '累计创建5条自定义原则', category: 'principle', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'principles_count_5' },
  { key: 'logs_10', name: '反思达人', description: '写满10条决策日志', category: 'principle', points: 3, stardustReward: 80, rewardTier: 'rare', visibility: 'visible', condition: 'logs_count_10' },
  { key: 'convert_log', name: '从实践到原则', description: '将决策日志转化为原则', category: 'principle', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'first_log_convert' },

  // === 星尘商人 (Shop) ===
  { key: 'stardust_1000', name: '小有积蓄', description: '累计获得1000星尘', category: 'shop', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'total_stardust_earned_1000' },
  { key: 'stardust_5000', name: '星尘富翁', description: '累计获得5000星尘', category: 'shop', points: 3, stardustReward: 80, rewardTier: 'rare', visibility: 'visible', condition: 'total_stardust_earned_5000' },
  { key: 'big_spender', name: '大手笔', description: '单次购买花费500+星尘', category: 'shop', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'single_purchase_500' },
  { key: 'monthly_exp_3000', name: '月度传说', description: '单月累计获得3000+经验值', category: 'shop', points: 3, stardustReward: 80, rewardTier: 'rare', visibility: 'visible', condition: 'monthly_exp_3000' },

  // === 传说缔造 (Legendary) ===
  { key: 'level_10', name: '觉醒之人', description: '冒险等级达到 Lv.10', category: 'legendary', points: 3, stardustReward: 80, rewardTier: 'rare', visibility: 'visible', condition: 'adventure_level_10' },
  { key: 'level_20', name: '通达贤者', description: '冒险等级达到 Lv.20', category: 'legendary', points: 5, stardustReward: 200, rewardTier: 'legendary', visibility: 'visible', condition: 'adventure_level_20' },
  { key: 'level_30', name: '超凡入圣', description: '冒险等级达到 Lv.30', category: 'legendary', points: 5, stardustReward: 200, rewardTier: 'legendary', visibility: 'hidden', condition: 'adventure_level_30' },
  { key: 'boss_weekly', name: '首领终结者', description: '首次击败周本Boss', category: 'legendary', points: 1, stardustReward: 20, rewardTier: 'normal', visibility: 'visible', condition: 'first_boss_defeat' },
  { key: 'boss_monthly', name: '月度霸主', description: '击败月度Boss', category: 'legendary', points: 3, stardustReward: 80, rewardTier: 'rare', visibility: 'visible', condition: 'first_monthly_boss' },
  { key: 'breakthrough_first', name: '破境飞升', description: '完成第一次突破任务', category: 'legendary', points: 5, stardustReward: 200, rewardTier: 'legendary', visibility: 'hidden', condition: 'first_breakthrough' },
];

// --- Gacha System Config ---
export const GACHA_CONFIG = {
  PULL_COST: 160,
  TEN_PULL_COST: 1600,
  RATES: { THREE_STAR: 0.943, FOUR_STAR: 0.051, FIVE_STAR: 0.006 },
  SOFT_PITY_START: 75,
  HARD_PITY: 90,
  FOUR_STAR_GUARANTEE: 10,
  GRAND_GUARANTEE: 180,
};

// --- Breakthrough Tasks ---
export const BREAKTHROUGHS: Breakthrough[] = [
  { level: 10, condition: '至少3个属性达到 Lv.3', description: '验证你已建立多维度的基本习惯', completed: false },
  { level: 20, condition: '完成一个史诗级任务 + 至少4个属性达到 Lv.5', description: '证明你能处理大型目标', completed: false },
  { level: 30, condition: '所有属性均达到 Lv.7 + 累计完成3个史诗级任务', description: '全面发展的证明', completed: false },
  { level: 40, condition: '完成一个传说级任务 + 所有属性均达到 Lv.10', description: '人生维度的重大突破', completed: false },
];

// --- System Shop Items (Permanent) ---
export const PERMANENT_SHOP_ITEMS: Omit<ShopItem, 'id'>[] = [
  { name: '浓缩体力', emoji: '⚡', description: '使用后当日体力上限 +30', category: 'item_shop', price: 80, isSystem: true, maxPerMonth: 3, effectType: 'stamina_boost', effectValue: 30 },
  { name: '经验加倍卷轴', emoji: '📜', description: '使用后当日所有任务经验值 ×1.3', category: 'item_shop', price: 120, isSystem: true, maxPerMonth: 2, effectType: 'exp_boost', effectValue: 1.3 },
  { name: '星尘加倍卷轴', emoji: '✨', description: '使用后当日所有任务星尘 ×1.3', category: 'item_shop', price: 120, isSystem: true, maxPerMonth: 2, effectType: 'stardust_boost', effectValue: 1.3 },
  { name: '休息日令牌', emoji: '🛌', description: '使用后当日所有日常任务视为已完成（获得50%经验）', category: 'item_shop', price: 300, isSystem: true, maxPerMonth: 1, effectType: 'rest_day', effectValue: 0.5 },
];

// --- System Shop Items (Rotating) ---
export const ROTATING_SHOP_ITEMS: Omit<ShopItem, 'id'>[] = [
  { name: '属性共鸣石', emoji: '💎', description: '使用后指定一个属性，本周该属性经验 +20%', category: 'item_shop', price: 150, isSystem: true, maxPerMonth: 1, effectType: 'attr_resonance', effectValue: 0.2, isRotating: true },
  { name: '命运罗盘', emoji: '🧭', description: '使用后随机指定一个属性，当日该属性经验 ×1.5', category: 'item_shop', price: 60, isSystem: true, maxPerMonth: 2, effectType: 'fate_compass', effectValue: 1.5, isRotating: true },
  { name: '时光之沙', emoji: '⏳', description: '使用后将一个已过期的挑战/史诗任务重新激活', category: 'item_shop', price: 200, isSystem: true, maxPerMonth: 1, effectType: 'time_sand', isRotating: true },
];

// --- Default Gacha Pools ---
export const DEFAULT_GACHA_POOLS: Omit<GachaPool, 'id' | 'userId' | 'createdAt'>[] = [
  {
    poolName: '命运的馈赠',
    fiveStarUp: { name: '完整休假日', emoji: '🏖️', description: '获得一整天完全自由的休息日', rarity: 5, isUp: true },
    fiveStarStandard: [
      { name: '大额购物券', emoji: '🛍️', description: '购买一件500+元想要的东西', rarity: 5 },
      { name: '旅行基金', emoji: '✈️', description: '为下次旅行存入一笔基金', rarity: 5 },
    ],
    fourStarItems: [
      { name: '精致晚餐', emoji: '🍽️', description: '享受一顿好吃的大餐', rarity: 4 },
      { name: '电影之夜', emoji: '🎬', description: '看一部想看的电影', rarity: 4 },
      { name: '购物小奖', emoji: '🎁', description: '买一个100-200元的小物件', rarity: 4 },
      { name: '游戏时光', emoji: '🎮', description: '2小时不受打扰的游戏时间', rarity: 4 },
      { name: '甜品时刻', emoji: '🍰', description: '去喜欢的甜品店吃一次', rarity: 4 },
    ],
    threeStarItems: [
      { name: '奶茶券', emoji: '🧋', description: '一杯喜欢的奶茶', rarity: 3 },
      { name: '零食包', emoji: '🍿', description: '买一份喜欢的零食', rarity: 3 },
      { name: '小精致晚餐券', emoji: '🍜', description: '20元精致小餐一顿', rarity: 3 },
      { name: '小精致外卖券', emoji: '🥡', description: '25元外卖犒劳自己', rarity: 3 },
      { name: '半小时自由', emoji: '⏰', description: '30分钟做任何想做的事', rarity: 3 },
      { name: '音乐时光', emoji: '🎵', description: '安静听30分钟喜欢的音乐', rarity: 3 },
      { name: '散步券', emoji: '🚶', description: '出去散步放松一下', rarity: 3 },
      { name: '午睡券', emoji: '😴', description: '允许自己睡一个舒服的午觉', rarity: 3 },
      { name: '冰淇淋券', emoji: '🍦', description: '买一个喜欢的冰淇淋', rarity: 3 },
      { name: '刷剧半小时', emoji: '📺', description: '看半小时喜欢的剧', rarity: 3 },
    ],
    isActive: true,
  },
  {
    poolName: '探索者的秘宝',
    fiveStarUp: { name: '技能课程', emoji: '📚', description: '购买一门想学的在线课程', rarity: 5, isUp: true },
    fiveStarStandard: [
      { name: '运动装备', emoji: '🏃', description: '购买一件运动装备升级', rarity: 5 },
      { name: '创作工具', emoji: '🎨', description: '购买一件创作/生产力工具', rarity: 5 },
    ],
    fourStarItems: [
      { name: '新书奖励', emoji: '📖', description: '买一本想读的新书', rarity: 4 },
      { name: '健身体验', emoji: '💪', description: '体验一次新的运动项目', rarity: 4 },
      { name: '咖啡厅学习', emoji: '☕', description: '去咖啡厅享受一个下午的学习', rarity: 4 },
      { name: '社交聚会', emoji: '🤝', description: '约朋友出去聚一次', rarity: 4 },
      { name: '护肤品', emoji: '✨', description: '买一件小护肤品犒劳自己', rarity: 4 },
      { name: '大众精致晚餐券', emoji: '🍽️', description: '一顿大众点评精致好评餐厅晚餐', rarity: 4 },
      { name: '中精致外卖券', emoji: '📦', description: '一份中档精致外卖犒劳自己', rarity: 4 },
    ],
    threeStarItems: [
      { name: '冥想30分钟', emoji: '🧘', description: '安静冥想放松30分钟', rarity: 3 },
      { name: '热饮券', emoji: '☕', description: '一杯温暖的热饮', rarity: 3 },
      { name: '小精致晚餐券', emoji: '🍜', description: '20元精致小餐一顿', rarity: 3 },
      { name: '小精致外卖券', emoji: '🥡', description: '25元外卖犒劳自己', rarity: 3 },
      { name: '水果加餐', emoji: '🍎', description: '给自己买份好水果', rarity: 3 },
      { name: '拍照时刻', emoji: '📸', description: '出去拍一些喜欢的照片', rarity: 3 },
      { name: '伸展放松', emoji: '🤸', description: '做10分钟拉伸运动', rarity: 3 },
      { name: '播客一集', emoji: '🎧', description: '听一集感兴趣的播客', rarity: 3 },
      { name: '公园坐坐', emoji: '🌳', description: '去公园坐一会儿放空自己', rarity: 3 },
      { name: '手写日记', emoji: '📝', description: '花15分钟手写今天的感悟', rarity: 3 },
    ],
    isActive: true,
  },
];

// --- Five Core Principles ---
export const SYSTEM_PRINCIPLES = [
  { title: '拥抱现实，面对现实', summary: '诚实地评估自己的任务完成情况和属性发展状态，不自欺。' },
  { title: '痛苦 + 反思 = 进步', summary: '系统不惩罚你，但会在回顾报告中呈现数据。关键在于「反思」。' },
  { title: '目标 → 问题 → 方案 → 执行', summary: '先设定阶段性目标，识别阻碍，诊断原因，设计解决方案，然后执行。' },
  { title: '做到头脑极度开放', summary: '不要因为某个属性等级低就回避它，不要只做擅长的事来刷经验。' },
  { title: '进化是最大的成就', summary: '经验值只涨不跌，代表累积进化。关注进步本身，而不是追求完美。' },
];
