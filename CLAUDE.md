# Life RPG - Development Guide

## Project Overview
Life RPG is a gamified life management web app inspired by Genshin Impact's RPG mechanics. Users manage tasks, earn XP, level up attributes, and unlock achievements.

## Tech Stack
- **Frontend**: React 19 + TypeScript, Vite
- **Routing**: React Router DOM v7
- **State**: Zustand (with persist middleware for localStorage)
- **Styling**: Tailwind CSS v4 (dark theme, Genshin-inspired)
- **Animation**: Framer Motion
- **Charts**: Recharts (radar chart, trend charts)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Deploy**: Vercel/Netlify

## Project Structure
```
src/
  components/       # Reusable UI components
    ui/             # Base UI (Button, Card, Modal, ProgressBar, etc.)
    layout/         # Layout components (Sidebar, TopBar, ContentArea)
  pages/            # Page-level components
    Dashboard/      # Main dashboard
    Character/      # Character panel + radar chart
    Tasks/          # Task center (CRUD, completion)
    Shop/           # Shop + inventory
    Calendar/       # Calendar system
    Principles/     # Principles, decision logs, goals, reviews
  stores/           # Zustand stores
    usePlayerStore.ts    # Player state (level, exp, stamina, stardust)
    useTaskStore.ts      # Task CRUD and completion logic
    useAchievementStore.ts
    useShopStore.ts
    useEquipmentStore.ts
    useBossStore.ts
    usePrincipleStore.ts
    useCalendarStore.ts
  lib/              # Utilities and helpers
    gameFormulas.ts # XP curves, level calculations
    supabase.ts     # Supabase client
    constants.ts    # Game constants (titles, achievement definitions, etc.)
  types/            # TypeScript type definitions
    index.ts        # All shared types
  hooks/            # Custom React hooks
```

## Key Design Constants
- **Adventure Level XP**: `100 * 1.15^(Lv-1)` per level
- **Attribute Level XP**: `50 * 1.12^(Lv-1)` per level
- **Stamina**: 100 daily cap, 150 overflow cap, 70% reward when overdraft
- **Task Rarities**: Daily(★), Weekly(★★), Challenge(★★★), Epic(★★★★), Legend(★★★★★)
- **First completion bonus**: x2.0
- **Over-achievement bonus**: x1.5
- **Subtask completion bonus**: +20% on all subtasks done

## Visual Style (Genshin-Inspired Dark Theme)
- Background: deep blue #0a0a1a → deep purple #1a0a2e gradient
- Accent: gold #FFD54F, blue #64B5F6
- Element colors: Body🔥 #FF6B6B, Mind❄️ #64B5F6, Craft⚡ #FFD54F, Social🌿 #81C784, Spirit💫 #CE93D8, Wealth🔶 #FFB74D
- Cards: frosted glass (rgba(255,255,255,0.03-0.06) + backdrop-filter: blur(10px))
- Quality colors: Daily=gray, Weekly=blue, Challenge=purple, Epic=gold, Legend=orange-red gradient
- Fonts: Noto Serif SC (headings), Noto Sans SC (body)

## Development Commands
```bash
export PATH="/home/wangkun/.local/share/fnm/node-versions/v24.3.0/installation/bin:$PATH"
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint check
```

## Rules
- All components use TypeScript with proper type annotations
- Use Zustand stores for all state management (with `persist` middleware for local storage)
- Tailwind CSS for all styling - no CSS modules or styled-components
- Framer Motion for all animations
- Mobile-responsive but desktop-first layout
- Chinese UI text (the app is in Chinese)
- Keep components focused and small (<200 lines)
- Use the existing color constants and design tokens consistently
