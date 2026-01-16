'use client';

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CheckCircle2, TrendingUp, Award } from 'lucide-react';
import { Habit, HABIT_COLORS, HabitColor } from '@/types/habit';
import { IconComponent } from './IconComponent';
import { calculateStreak } from '@/lib/dates';

interface HabitHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit;
}

export const HabitHistoryModal = memo(function HabitHistoryModal({
  isOpen,
  onClose,
  habit,
}: HabitHistoryModalProps) {
  const colors = useMemo(
    () => HABIT_COLORS[habit.color as HabitColor] || HABIT_COLORS.emerald,
    [habit.color]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCompletions = habit.completedDates.length;
    const currentStreak = calculateStreak(habit.completedDates);

    // Calculate best streak
    const sortedDates = [...habit.completedDates].sort();
    let bestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr);

      if (prevDate) {
        const dayDiff = Math.floor(
          (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          tempStreak++;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }

      prevDate = currentDate;
    }
    bestStreak = Math.max(bestStreak, tempStreak);

    return {
      totalCompletions,
      currentStreak,
      bestStreak,
    };
  }, [habit.completedDates]);

  // Get last 30 days for calendar view
  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const isCompleted = habit.completedDates.includes(dateStr);

      days.push({
        date: dateStr,
        dayOfMonth: date.getDate(),
        isCompleted,
      });
    }

    return days;
  }, [habit.completedDates]);

  // Get recent completions with notes
  const recentCompletions = useMemo(() => {
    const sorted = [...habit.completedDates]
      .sort()
      .reverse()
      .slice(0, 10)
      .map((dateStr) => {
        const note = habit.notes.find((n) => n.date === dateStr);
        const date = new Date(dateStr);
        return {
          dateStr,
          formatted: date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          note: note?.note,
        };
      });

    return sorted;
  }, [habit.completedDates, habit.notes]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            className="fixed bottom-0 left-0 right-0 glass-dark rounded-t-3xl p-6 z-50 max-h-[90vh] overflow-y-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:max-w-md sm:w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${colors.bg} ${colors.glow} shadow-lg`}>
                  <IconComponent name={habit.icon} className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{habit.name}</h2>
                  <p className="text-xs text-white/40">History & Statistics</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </motion.button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-xl p-3 text-center"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{stats.totalCompletions}</p>
                <p className="text-[10px] text-white/40">Total</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-xl p-3 text-center"
              >
                <TrendingUp className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
                <p className="text-[10px] text-white/40">Current</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-xl p-3 text-center"
              >
                <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{stats.bestStreak}</p>
                <p className="text-[10px] text-white/40">Best</p>
              </motion.div>
            </div>

            {/* Calendar view */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Last 30 Days
              </h3>
              <div className="grid grid-cols-10 gap-1.5">
                {calendarDays.map((day, index) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium transition-all ${
                      day.isCompleted
                        ? `${colors.bg} text-white shadow-lg ${colors.glow}`
                        : 'bg-white/5 text-white/30'
                    }`}
                    title={day.date}
                  >
                    {day.dayOfMonth}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent completions */}
            {recentCompletions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/70 mb-3">Recent Completions</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {recentCompletions.map((completion, index) => (
                    <motion.div
                      key={completion.dateStr}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="glass rounded-xl p-3"
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.text}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{completion.formatted}</p>
                          {completion.note && (
                            <p className="text-xs text-white/50 mt-1 italic">"{completion.note}"</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {recentCompletions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-white/40 text-sm">No completions yet. Start building your streak!</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
