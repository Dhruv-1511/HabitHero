'use client';

import { memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Habit } from '@/types/habit';

interface CalendarHeatmapProps {
  habits: Habit[];
}

export const CalendarHeatmap = memo(function CalendarHeatmap({ habits }: CalendarHeatmapProps) {
  // Create a stable key based on actual completion data, not habits array reference
  const completionKey = useMemo(
    () => habits.map((h) => `${h.id}:${h.completedDates.length}`).join('|'),
    [habits]
  );

  const heatmapData = useMemo(() => {
    const data: Record<string, number> = {};
    const today = new Date();
    const habitsLength = habits.length;

    // Pre-build a Set of all completed dates for O(1) lookups
    const completedDateSets = habits.map((h) => new Set(h.completedDates));

    // Get data for the last 365 days
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      // Count completions using Set lookups (O(1) per habit instead of O(n))
      let completedCount = 0;
      for (const dateSet of completedDateSets) {
        if (dateSet.has(dateString)) completedCount++;
      }

      data[dateString] = habitsLength > 0 ? completedCount / habitsLength : 0;
    }

    return data;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completionKey]);

  const weeks = useMemo(() => {
    const result: { date: string; level: number }[][] = [];
    const dates = Object.entries(heatmapData);

    let currentWeek: { date: string; level: number }[] = [];

    // Fill in empty days at the start to align with the correct day of week
    const firstDate = new Date(dates[0][0]);
    const startDay = firstDate.getDay();
    for (let i = 0; i < startDay; i++) {
      currentWeek.push({ date: '', level: -1 });
    }

    dates.forEach(([date, ratio]) => {
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }

      let level = 0;
      if (ratio > 0) level = 1;
      if (ratio >= 0.25) level = 2;
      if (ratio >= 0.5) level = 3;
      if (ratio >= 0.75) level = 4;
      if (ratio >= 1) level = 5;

      currentWeek.push({ date, level });
    });

    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }

    return result;
  }, [heatmapData]);

  const months = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result: { name: string; index: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const validDay = week.find((d) => d.date);
      if (validDay) {
        const month = new Date(validDay.date).getMonth();
        if (month !== lastMonth) {
          result.push({ name: monthNames[month], index: weekIndex });
          lastMonth = month;
        }
      }
    });

    return result;
  }, [weeks]);

  const getLevelColor = useCallback((level: number) => {
    switch (level) {
      case -1: return 'bg-transparent';
      case 0: return 'bg-white/5';
      case 1: return 'bg-emerald-900/50';
      case 2: return 'bg-emerald-700/60';
      case 3: return 'bg-emerald-500/70';
      case 4: return 'bg-emerald-400/80';
      case 5: return 'bg-emerald-400 shadow-lg shadow-emerald-500/30';
      default: return 'bg-white/5';
    }
  }, []);

  if (habits.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 mb-6"
    >
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <span className="text-lg">Yearly Activity</span>
        <span className="text-xs text-white/50 font-normal">Last 365 days</span>
      </h3>

      <div className="overflow-x-auto pb-2">
        <div className="relative">
          {/* Month labels */}
          <div className="flex mb-1 text-[10px] text-white/40">
            {months.map((month, i) => (
              <span
                key={i}
                className="absolute"
                style={{ left: `${month.index * 14}px` }}
              >
                {month.name}
              </span>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-[3px] mt-5">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day, dayIndex) => (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: weekIndex * 0.005,
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                    className={`w-[11px] h-[11px] rounded-[2px] ${getLevelColor(day.level)} transition-all hover:ring-1 hover:ring-white/30`}
                    title={day.date ? `${day.date}: ${Math.round((heatmapData[day.date] || 0) * 100)}% completed` : ''}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-white/40">
        <span>Less</span>
        {[0, 1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`w-[11px] h-[11px] rounded-[2px] ${getLevelColor(level)}`}
          />
        ))}
        <span>More</span>
      </div>
    </motion.div>
  );
});
