'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { Habit } from '@/types/habit';
import { getWeekDates, getDayName, getTodayString } from '@/lib/dates';
import { TrendingUp } from 'lucide-react';

interface ProgressChartProps {
  habits: Habit[];
}

export function ProgressChart({ habits }: ProgressChartProps) {
  const weekDates = getWeekDates();
  const today = getTodayString();

  const data = weekDates.map((date) => {
    const completedCount = habits.filter((habit) =>
      habit.completedDates.includes(date)
    ).length;

    return {
      day: getDayName(date),
      completed: completedCount,
      total: habits.length,
      percentage: habits.length > 0 ? (completedCount / habits.length) * 100 : 0,
      isToday: date === today,
    };
  });

  const weeklyCompletion = data.reduce((sum, d) => sum + d.completed, 0);
  const weeklyTotal = data.reduce((sum, d) => sum + d.total, 0);
  const weeklyPercentage =
    weeklyTotal > 0 ? Math.round((weeklyCompletion / weeklyTotal) * 100) : 0;

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
}
