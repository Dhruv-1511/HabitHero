'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Habit } from '@/types/habit';
import { calculateStreak, getWeekDates, getTodayString } from '@/lib/dates';
import { Flame, Target, Trophy, TrendingUp, Calendar, Zap } from 'lucide-react';

interface StatisticsProps {
  habits: Habit[];
}

export const Statistics = memo(function Statistics({ habits }: StatisticsProps) {
  // Create a stable key based on actual completion data
  const completionKey = useMemo(
    () => habits.map((h) => `${h.id}:${h.completedDates.length}:${h.completedDates[h.completedDates.length - 1] || ''}`).join('|'),
    [habits]
  );

  const stats = useMemo(() => {
    const today = getTodayString();
    const weekDates = getWeekDates();
    const habitsLength = habits.length;

    // Pre-build Sets for O(1) lookups
    const completedDateSets = habits.map((h) => new Set(h.completedDates));

    // Total completions today
    const todayCompletions = completedDateSets.filter((set) => set.has(today)).length;

    // Weekly completion rate - use Set for faster lookups
    const weeklyCompleted = completedDateSets.reduce((sum, dateSet) => {
      return sum + weekDates.filter((d) => dateSet.has(d)).length;
    }, 0);
    const weeklyTotal = habitsLength * 7;
    const weeklyRate = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

    // Best streak across all habits
    const bestStreak = Math.max(0, ...habits.map((h) => calculateStreak(h.completedDates)));

    // Current active streaks
    const activeStreaks = habits.filter((h) => calculateStreak(h.completedDates) > 0).length;

    // Total all-time completions
    const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0);

    // Perfect days (all habits completed) - optimized with Sets
    const allDates = new Set(habits.flatMap((h) => h.completedDates));
    let perfectDays = 0;
    allDates.forEach((date) => {
      const completedOnDate = completedDateSets.filter((set) => set.has(date)).length;
      if (completedOnDate === habitsLength && habitsLength > 0) {
        perfectDays++;
      }
    });

    return {
      todayCompletions,
      todayTotal: habitsLength,
      weeklyRate,
      bestStreak,
      activeStreaks,
      totalCompletions,
      perfectDays,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completionKey]);

  if (habits.length === 0) return null;

  const statCards = [
    {
      icon: Target,
      label: 'Today',
      value: `${stats.todayCompletions}/${stats.todayTotal}`,
      color: 'from-violet-500 to-purple-600',
      glow: 'shadow-violet-500/30',
    },
    {
      icon: TrendingUp,
      label: 'Weekly Rate',
      value: `${stats.weeklyRate}%`,
      color: 'from-emerald-500 to-teal-600',
      glow: 'shadow-emerald-500/30',
    },
    {
      icon: Flame,
      label: 'Best Streak',
      value: `${stats.bestStreak} days`,
      color: 'from-orange-500 to-red-600',
      glow: 'shadow-orange-500/30',
    },
    {
      icon: Zap,
      label: 'Active Streaks',
      value: stats.activeStreaks.toString(),
      color: 'from-amber-500 to-yellow-600',
      glow: 'shadow-amber-500/30',
    },
    {
      icon: Calendar,
      label: 'Total Check-ins',
      value: stats.totalCompletions.toString(),
      color: 'from-sky-500 to-blue-600',
      glow: 'shadow-sky-500/30',
    },
    {
      icon: Trophy,
      label: 'Perfect Days',
      value: stats.perfectDays.toString(),
      color: 'from-pink-500 to-rose-600',
      glow: 'shadow-pink-500/30',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <h3 className="text-white font-semibold mb-4 text-lg">Statistics</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`glass rounded-xl p-4 relative overflow-hidden group`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`}
            />

            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} ${stat.glow} shadow-lg`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>

            <motion.p
              key={stat.value}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-white"
            >
              {stat.value}
            </motion.p>
            <p className="text-xs text-white/50">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});
