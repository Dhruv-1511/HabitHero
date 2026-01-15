'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, MessageCircle, Target } from 'lucide-react';
import { Habit, HABIT_COLORS, HABIT_CATEGORIES, HabitColor, HabitCategory } from '@/types/habit';
import { getTodayString, calculateStreak, getWeekDates } from '@/lib/dates';
import { IconComponent } from './IconComponent';
import { StreakBadge } from './StreakBadge';
import { Confetti } from './Confetti';
import { useState } from 'react';

interface HabitCardProps {
  habit: Habit;
  onToggle: (note?: string) => void;
  onDelete: () => void;
  playSound?: () => void;
}

export function HabitCard({ habit, onToggle, onDelete, playSound }: HabitCardProps) {
  const today = getTodayString();
  const isCompleted = habit.completedDates.includes(today);
  const streak = calculateStreak(habit.completedDates);
  const colors = HABIT_COLORS[habit.color as HabitColor] || HABIT_COLORS.emerald;
  const category = HABIT_CATEGORIES[habit.category as HabitCategory];
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');

  // Calculate weekly progress
  const weekDates = getWeekDates();
  const weeklyCompleted = weekDates.filter((d) => habit.completedDates.includes(d)).length;
  const weeklyProgress = (weeklyCompleted / habit.weeklyGoal) * 100;

  const handleToggle = () => {
    if (!isCompleted) {
      setShowConfetti(true);
      playSound?.();
      setTimeout(() => setShowConfetti(false), 1000);
    }
    onToggle(note || undefined);
    setNote('');
    setShowNoteInput(false);
  };

  const handleNoteSubmit = () => {
    handleToggle();
  };

  const todayNote = habit.notes.find((n) => n.date === today);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }}
      whileHover={{ y: -2 }}
      className={`relative glass rounded-2xl p-4 overflow-hidden group ${
        isCompleted ? 'ring-1 ring-white/20' : ''
      }`}
    >
      {showConfetti && <Confetti />}

      {/* Glow effect when completed */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${
          isCompleted ? 'from-emerald-500/20 to-teal-500/20' : 'from-transparent to-transparent'
        } transition-all duration-500`}
        initial={false}
        animate={{ opacity: isCompleted ? 1 : 0 }}
      />

      <div className="relative">
        {/* Header with category */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] px-2 py-0.5 rounded-full category-${habit.category} text-white/90 font-medium`}>
            {category?.emoji} {category?.label}
          </span>
          <div className="flex items-center gap-1">
            <motion.button
              onClick={() => setShowNoteInput(!showNoteInput)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-1.5 rounded-lg transition-colors ${
                todayNote ? 'text-violet-400 bg-violet-500/20' : 'text-white/30 hover:text-white/60 hover:bg-white/10'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              onClick={onDelete}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={handleToggle}
            whileTap={{ scale: 0.9 }}
            className={`relative w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
              isCompleted
                ? `${colors.bg} shadow-lg ${colors.glow}`
                : 'bg-white/10 hover:bg-white/15'
            }`}
          >
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 15,
                  }}
                >
                  <Check className="w-7 h-7 text-white" strokeWidth={3} />
                </motion.div>
              ) : (
                <motion.div
                  key="icon"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 15,
                  }}
                  className={colors.text}
                >
                  <IconComponent name={habit.icon} className="w-7 h-7" />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className={`absolute inset-0 rounded-xl ${colors.ring} ring-2`}
              initial={false}
              animate={{
                scale: isCompleted ? [1, 1.3, 1] : 1,
                opacity: isCompleted ? [1, 0] : 0,
              }}
              transition={{ duration: 0.5 }}
            />
          </motion.button>

          <div className="flex-1 min-w-0">
            <motion.h3
              className={`font-semibold text-white truncate ${
                isCompleted ? 'line-through opacity-50' : ''
              }`}
            >
              {habit.name}
            </motion.h3>

            {/* Weekly progress bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {weeklyCompleted}/{habit.weeklyGoal} this week
                </span>
                {streak > 0 && <StreakBadge streak={streak} />}
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${colors.bg}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Note input */}
        <AnimatePresence>
          {showNoteInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-white/10">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note for today..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleNoteSubmit()}
                />
                {todayNote && !note && (
                  <p className="text-xs text-white/40 mt-2 italic">
                    Previous note: "{todayNote.note}"
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
