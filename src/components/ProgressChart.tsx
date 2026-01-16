'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { Habit } from '@/types/habit';
import { getWeekDates, getDayName, getTodayString } from '@/lib/dates';
import { TrendingUp } from 'lucide-react';

interface ProgressChartProps {
  habits: Habit[];
}

export const ProgressChart = memo(function ProgressChart({ habits }: ProgressChartProps) {
  // Create a stable key based on completion data
  const completionKey = useMemo(
    () => habits.map((h) => `${h.id}:${h.completedDates.length}`).join('|'),
    [habits]
  );

  const { data, weeklyPercentage } = useMemo(() => {
    const weekDates = getWeekDates();
    const today = getTodayString();
    const habitsLength = habits.length;

    // Pre-build Sets for O(1) lookups
    const completedDateSets = habits.map((h) => new Set(h.completedDates));

    const chartData = weekDates.map((date) => {
      const completedCount = completedDateSets.filter((set) => set.has(date)).length;

      return {
        day: getDayName(date),
        completed: completedCount,
        total: habitsLength,
        percentage: habitsLength > 0 ? (completedCount / habitsLength) * 100 : 0,
        isToday: date === today,
      };
    });

    const weeklyCompletion = chartData.reduce((sum, d) => sum + d.completed, 0);
    const weeklyTotal = chartData.reduce((sum, d) => sum + d.total, 0);
    const percentage = weeklyTotal > 0 ? Math.round((weeklyCompletion / weeklyTotal) * 100) : 0;

    return { data: chartData, weeklyPercentage: percentage };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completionKey]);

  if (habits.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-violet-100 rounded-lg">
            <TrendingUp className="w-4 h-4 text-violet-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Weekly Progress</h3>
        </div>
        <motion.span
          key={weeklyPercentage}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold text-violet-600"
        >
          {weeklyPercentage}%
        </motion.span>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isToday ? '#8B5CF6' : '#E5E7EB'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});
