'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, MessageCircle, Target, Pencil, Calendar } from 'lucide-react';
import { Habit, HABIT_COLORS, HABIT_CATEGORIES, HabitColor, HabitCategory } from '@/types/habit';
import { getTodayString, calculateStreak, getWeekDates } from '@/lib/dates';
import { IconComponent } from './IconComponent';
import { StreakBadge } from './StreakBadge';
import { Confetti } from './Confetti';
import { EditHabitModal } from './EditHabitModal';
import { ConfirmDialog } from './ConfirmDialog';
import { HabitHistoryModal } from './HabitHistoryModal';

interface HabitCardProps {
  habit: Habit;
  onToggle: (note?: string) => void;
  onDelete: () => void;
  onEdit: (updates: Partial<Habit>) => void;
  playSound?: () => void;
}

export const HabitCard = memo(function HabitCard({ habit, onToggle, onDelete, onEdit, playSound }: HabitCardProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Memoize expensive calculations
  const today = useMemo(() => getTodayString(), []);
  const isCompleted = useMemo(
    () => habit.completedDates.includes(today),
    [habit.completedDates, today]
  );
  const streak = useMemo(
    () => calculateStreak(habit.completedDates),
    [habit.completedDates]
  );
  const colors = useMemo(
    () => HABIT_COLORS[habit.color as HabitColor] || HABIT_COLORS.emerald,
    [habit.color]
  );
  const category = useMemo(
    () => HABIT_CATEGORIES[habit.category as HabitCategory],
    [habit.category]
  );

  // Memoize weekly progress calculation
  const { weeklyCompleted, weeklyProgress } = useMemo(() => {
    const weekDates = getWeekDates();
    const completed = weekDates.filter((d) => habit.completedDates.includes(d)).length;
    return {
      weeklyCompleted: completed,
      weeklyProgress: (completed / habit.weeklyGoal) * 100,
    };
  }, [habit.completedDates, habit.weeklyGoal]);

  const todayNote = useMemo(
    () => habit.notes.find((n) => n.date === today),
    [habit.notes, today]
  );

  // Memoize handlers
  const handleToggle = useCallback(() => {
    if (!isCompleted) {
      setShowConfetti(true);
      playSound?.();
      setTimeout(() => setShowConfetti(false), 1000);
    }
    onToggle(note || undefined);
    setNote('');
    setShowNoteInput(false);
  }, [isCompleted, note, onToggle, playSound]);

  const handleNoteSubmit = useCallback(() => {
    handleToggle();
  }, [handleToggle]);

  const toggleNoteInput = useCallback(() => {
    setShowNoteInput((prev) => !prev);
  }, []);

  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNote(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleNoteSubmit();
    },
    [handleNoteSubmit]
  );

  const handleEdit = useCallback((updates: Partial<Habit>) => {
    onEdit(updates);
    setShowEditModal(false);
  }, [onEdit]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    onDelete();
  }, [onDelete]);

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
              onClick={() => setShowHistoryModal(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 text-white/30 hover:text-sky-400 hover:bg-sky-500/20 rounded-lg transition-colors"
              title="View history"
            >
              <Calendar className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              onClick={() => setShowEditModal(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 text-white/30 hover:text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
              title="Edit habit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              onClick={toggleNoteInput}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-1.5 rounded-lg transition-colors ${
                todayNote ? 'text-violet-400 bg-violet-500/20' : 'text-white/30 hover:text-white/60 hover:bg-white/10'
              }`}
              title="Add note"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              onClick={handleDeleteClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
              title="Delete habit"
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
                  onChange={handleNoteChange}
                  placeholder="Add a note for today..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  onKeyDown={handleKeyDown}
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

      {/* Modals */}
      <EditHabitModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        habit={habit}
        onSave={handleEdit}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habit.name}"? This action cannot be undone and all progress will be lost.`}
        confirmText="Delete"
        variant="danger"
      />

      <HabitHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        habit={habit}
      />
    </motion.div>
  );
});
