# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server (requires build first)
```

## Architecture

**HabbitHero** is a Next.js 16 habit tracking app using React 19, TypeScript, Tailwind CSS 4, Framer Motion, and Recharts.

### Data Flow

All data persists in browser localStorage (key: `habit-tracker-habits`). The `useHabits` hook (`src/hooks/useHabits.ts`) is the central state manager that handles loading, saving, and all CRUD operations on habits. Data syncs automatically to localStorage on every state change.

### Project Structure

```
src/
├── app/
│   └── page.tsx              # Main SPA entry (client component)
├── components/               # UI components
│   ├── HabitList.tsx         # Renders list of HabitCard components
│   ├── HabitCard.tsx         # Individual habit with completion toggle, notes, streak
│   ├── AddHabitModal.tsx     # Template selection or custom habit form
│   ├── Statistics.tsx        # Dashboard with 6 stat cards (memoized calculations)
│   ├── CalendarHeatmap.tsx   # GitHub-style 365-day activity visualization
│   └── ...                   # Header, MotivationalQuote, ProgressChart, etc.
├── hooks/
│   ├── useHabits.ts          # Primary state: habits[], addHabit, toggleHabit, deleteHabit, updateHabit
│   ├── useNotifications.ts   # Browser Notifications API wrapper
│   └── useSoundEffects.ts    # Web Audio API for completion sounds
├── lib/
│   ├── storage.ts            # localStorage read/write, ID generation
│   └── dates.ts              # Date formatting, streak calculation, week/month helpers
└── types/
    └── habit.ts              # Habit interface, HabitCategory, HabitColor, templates
```

### Key Patterns

- **Dates**: Stored as `YYYY-MM-DD` strings throughout
- **IDs**: Generated via `Date.now().toString(36) + Math.random().toString(36)`
- **State updates**: Immutable (spread, filter, map)
- **Animations**: Framer Motion with spring physics; staggered list animations use `delay: index * amount`
- **Components**: All interactive components have `'use client'` directive

### Type System

Core types in `src/types/habit.ts`:
- `Habit`: id, name, icon, color, category, createdAt, completedDates[], reminderTime?, weeklyGoal, notes[]
- `HabitCategory`: health | work | personal | learning | fitness | mindfulness
- `HabitColor`: emerald | violet | rose | amber | sky | orange | cyan | pink
- `HABIT_ICONS`: 16 Lucide icon names
- `HABIT_TEMPLATES`: 10 pre-configured habit templates

### Styling

Dark theme with glassmorphism design. Key CSS classes in `globals.css`:
- `.glass`, `.glass-light`, `.glass-dark`: Card styles with backdrop blur
- `.text-gradient`: Gradient text for branding
- `.category-{name}`: Category background colors
- `.glow-{color}`: Shadow glow effects

Path alias: `@/*` maps to `./src/*`
