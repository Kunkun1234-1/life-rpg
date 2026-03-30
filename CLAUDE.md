# Life RPG — 人生冒险 · 数值系统

> 用游戏的视角管理任务、做出决策、平衡工作与生活。灵感来源：《原神》RPG 机制。

## Quick Start

```bash
# 安装依赖
export PATH="/home/wangkun/.local/share/fnm/node-versions/v24.3.0/installation/bin:$PATH"
npm install

# 启动开发服务器
npm run dev        # → http://localhost:5173

# 构建生产版本
npm run build

# 代码检查
npm run lint
```

## Tech Stack

| 层 | 技术 |
|---|---|
| Frontend | React 19 + TypeScript, Vite |
| Routing | React Router DOM v7 |
| State | Zustand (persist middleware → localStorage + Supabase sync) |
| Styling | Tailwind CSS v4 (Genshin-inspired dark theme) |
| Animation | Framer Motion + HTML5 Video |
| Charts | Recharts (radar chart) |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Auth | Email/Password, Google OAuth, GitHub OAuth |

## Project Structure

```
src/
├── components/
│   ├── ui/                  # Button, Card, GlassCard, Modal, ProgressBar, StarRating
│   ├── layout/              # AppLayout, Sidebar (7 nav items), TopBar
│   ├── auth/                # AuthGuard (route protection)
│   └── animations/          # LevelUp, TaskComplete, BossDefeat, Achievement,
│                            # GachaAnimation, MainlineComplete
├── pages/
│   ├── Auth/LoginPage.tsx   # Genshin-style splash → door → login form
│   ├── Dashboard/           # TodayTasks, AttributeRadar, BossStatus, QuickActions
│   ├── Character/           # RadarChart, AttributeDetail, EquipmentSlots, AchievementWall
│   ├── Tasks/               # 5-tab task center, TaskCard, CreateTaskModal
│   ├── Shop/                # 4-tab shop (instant/items/stored/gacha), GachaPanel, Inventory
│   ├── Calendar/            # Month view + day detail (45:55 layout), semester weeks
│   ├── Achievements/        # 8-category grid (Star Rail style), custom achievements
│   └── Principles/          # 6-tab: 五步法, 决策树, 我的原则, 决策日志, 目标, 回顾
├── stores/                  # 11 Zustand stores (all with persist middleware)
│   ├── useAuthStore.ts      # Supabase auth (email, Google, GitHub)
│   ├── usePlayerStore.ts    # EXP, stardust, stamina, attributes, streaks
│   ├── useTaskStore.ts      # Task CRUD, completion, subtasks, rewards
│   ├── useAchievementStore.ts # 40+ achievements, 8 categories, custom achievements
│   ├── useShopStore.ts      # Custom rewards, inventory, purchases
│   ├── useGachaStore.ts     # Gacha pools, pulls, pity tracking, inventory integration
│   ├── useEquipmentStore.ts # Tool/habit/environment equipment, bonuses
│   ├── useBossStore.ts      # Weekly/monthly/quarterly bosses
│   ├── useCalendarStore.ts  # Events, semester config
│   ├── useMainlineStore.ts  # Mainline quests (max 3 active)
│   └── usePrincipleStore.ts # Principles, decision logs, goals, 5-step flows
├── lib/
│   ├── supabase.ts          # Supabase client
│   ├── supabase-migration.sql # Database schema (paste into Supabase SQL Editor)
│   ├── syncEngine.ts        # Load from / save to Supabase (debounced)
│   ├── gameFormulas.ts      # XP curves, reward calculations, level progression
│   ├── gachaEngine.ts       # Gacha probability engine (soft/hard pity, 50/50)
│   ├── constants.ts         # All game constants, achievements, gacha pools
│   └── breakthroughCheck.ts # Level 10/20/30/40 breakthrough conditions
├── types/index.ts           # All TypeScript interfaces
└── index.css                # Tailwind theme + animation keyframes
```

## Core Game Systems

### 1. Experience & Leveling
- **Adventure Level**: `100 × 1.15^(Lv-1)` per level, drives titles (8 tiers, Lv.1→50)
- **6 Attributes**: 体魄🔥 心智❄️ 技艺⚡ 社交🌿 心灵💫 财务🔶
- **Attribute Level**: `50 × 1.12^(Lv-1)` per level
- Task EXP flows to both adventure level AND corresponding attribute

### 2. Task System (5 tabs)
- **进行中**: Active pending tasks, sorted by rarity
- **周常日常**: Daily/weekly recurring tasks management
- **史诗传说**: Epic(★★★★) / Legend(★★★★★) with subtask support
- **主线任务**: Direction anchors (max 3 active), linked tasks aggregate under them
- **历史记录**: Completed/archived tasks

Rarity tiers: ★Daily → ★★Weekly → ★★★Challenge → ★★★★Epic → ★★★★★Legend

Bonuses: First completion ×2.0, Over-achievement ×1.5, Overdraft penalty ×0.7, Subtask completion +20%

### 3. Stamina (体力)
- Daily cap: 100, Overflow cap: 150
- Resets daily, overdraft allowed at 70% reward penalty
- Condensed Stamina items boost +30

### 4. Stardust (星尘) & Shop
- Earned from tasks, achievements, streaks
- **即时奖励**: User-defined instant rewards (buy & consume immediately)
- **道具商店**: System items (stamina boost, EXP scroll, rest day token)
- **存储奖励**: User-defined rewards saved to backpack for later
- **祈愿 (Gacha)**: Genshin-style wish system with real animation videos

### 5. Gacha/Wish System (祈愿)
- Probability: 3★ 94.3%, 4★ 5.1%, 5★ 0.6%
- Soft pity from pull 75, hard pity at 90
- 4★ guarantee every 10 pulls
- 50/50 mechanism + grand guarantee (大保底) at 180
- 2 default pools: "命运的馈赠" (life rewards) + "探索者的秘宝" (self-improvement)
- Prizes auto-added to inventory/backpack
- Real Genshin wish animation videos (MIT licensed from WishSimulator.app)

### 6. Achievement System (8 categories, 40+ achievements)
Categories: 初心启程🌟 持之以恒🔥 六维觉醒💎 征途万里⚔️ 命运之轮🎰 智者之书📖 星尘商人✨ 传说缔造👑

Three reward tiers: Normal (+1pt, +20 stardust), Rare (+3pt, +80), Legendary (+5pt, +200)

Three states: Unlocked (gold), Visible-locked (with progress), Hidden ("???")

Users can also create custom achievements with manual unlock.

### 7. Boss System
- **Weekly Boss**: Auto-generated, defeat by completing all weekly tasks
- **Monthly/Quarterly Boss**: User-defined challenges with custom conditions

### 8. Equipment System
- Types: Tool (物理工具), Habit (行为习惯), Environment (环境设置)
- Bonus: +3% → +5% after 30-day streak
- Max 3-6 equipped slots (unlocked via achievement points)

### 9. Principles System (达利欧五步法)
- **五步法**: Interactive stepper (目标→问题→诊断→方案→执行)
- **决策树**: Visual tree auto-generated from principles, grouped by attribute
- **我的原则**: "当...则..." rules with confidence stars, source type, verification count
- **决策日志**: Structured flow (情境→直觉→逻辑→决策→结果→反思→提炼原则)
- **目标设定**: Vision goals + phase goals
- **回顾报告**: Weekly data from real store data

### 10. Calendar System
- Month view (45:55 layout) with colored event dots
- Course (蓝), Schedule (橙), Note (红)
- Semester week tracking
- Stamina reference based on day's schedule

### 11. Mainline Quests (主线任务)
- Direction anchors representing core life goals
- Max 3 active simultaneously
- Tasks can be linked to a mainline
- Completion triggers special narrative animation

### 12. Breakthrough System
- At Lv.10/20/30/40, must meet conditions to advance
- Conditions involve attribute levels + completed epic/legend tasks

## Supabase Setup

### 1. Database Migration
Paste `src/lib/supabase-migration.sql` into Supabase SQL Editor and run it. Creates 11 tables with RLS policies.

### 2. Authentication Providers
In Supabase Dashboard → Authentication → Providers:
- **Email**: Disable "Confirm email" for dev/testing
- **Google**: Add OAuth Client ID/Secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **GitHub**: Add OAuth App from [GitHub Developer Settings](https://github.com/settings/developers)
- Redirect URI: `https://ppkgevflzwiybktyfmdy.supabase.co/auth/v1/callback`

### 3. Data Sync Strategy
- Login → load all data from Supabase → populate Zustand stores
- Store changes → debounced (1s) write to Supabase
- localStorage retained as offline cache / fallback

## Visual Style (Genshin-Inspired Dark Theme)

| Element | Value |
|---------|-------|
| Background | `#0a0a1a` → `#1a0a2e` gradient |
| Gold accent | `#FFD54F` |
| Blue accent | `#64B5F6` |
| Cards | Glass morphism: `rgba(255,255,255,0.04)` + `backdrop-filter: blur(10px)` |
| Fonts | Noto Serif SC (headings), Noto Sans SC (body) |
| Element colors | Body🔥`#FF6B6B` Mind❄️`#64B5F6` Craft⚡`#FFD54F` Social🌿`#81C784` Spirit💫`#CE93D8` Wealth🔶`#FFB74D` |
| Rarity colors | ★Gray ★★Blue ★★★Purple ★★★★Gold ★★★★★Orange-red |

## Key Animation Assets

| File | Source | License |
|------|--------|---------|
| `public/videos/gacha/3star-single.mp4` | WishSimulator.app | MIT |
| `public/videos/gacha/4star-*.mp4` | WishSimulator.app | MIT |
| `public/videos/gacha/5star-*.mp4` | WishSimulator.app | MIT |
| `public/images/splash-background.webp` | WishSimulator.app | MIT |
| `public/videos/login/bg.webm` | WishSimulator.app | MIT |

## Development Rules

- All components use TypeScript with proper type annotations
- Zustand stores for all state (with `persist` middleware for localStorage)
- Tailwind CSS for all styling — no CSS modules or styled-components
- Framer Motion for all animations
- Mobile-responsive but desktop-first layout
- **Chinese UI text** (the app is in Chinese)
- Keep components focused and small (<200 lines preferred)
- Use existing color constants and design tokens consistently
- All gacha probability logic in `gachaEngine.ts` (pure functions, no side effects)
- Cross-store access via `useXStore.getState()` (not React hooks)
