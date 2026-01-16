'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import {
  HABIT_COLORS,
  HABIT_ICONS,
  HABIT_CATEGORIES,
  HabitColor,
  HabitIcon,
  HabitCategory,
  Habit,
} from '@/types/habit';
import { IconComponent } from './IconComponent';

interface EditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit;
  onSave: (updates: Partial<Habit>) => void;
}

export const EditHabitModal = memo(function EditHabitModal({
  isOpen,
  onClose,
  habit,
  onSave
}: EditHabitModalProps) {
  const [name, setName] = useState(habit.name);
  const [icon, setIcon] = useState<HabitIcon>(habit.icon as HabitIcon);
  const [color, setColor] = useState<HabitColor>(habit.color as HabitColor);
  const [category, setCategory] = useState<HabitCategory>(habit.category);
  const [weeklyGoal, setWeeklyGoal] = useState(habit.weeklyGoal);
  const [reminderTime, setReminderTime] = useState(habit.reminderTime || '');

  // Reset form when habit changes
  useEffect(() => {
    setName(habit.name);
    setIcon(habit.icon as HabitIcon);
    setColor(habit.color as HabitColor);
    setCategory(habit.category);
    setWeeklyGoal(habit.weeklyGoal);
    setReminderTime(habit.reminderTime || '');
  }, [habit]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      icon,
      color,
      category,
      weeklyGoal,
      reminderTime: reminderTime || undefined,
    });

    onClose();
  }, [name, icon, color, category, weeklyGoal, reminderTime, onSave, onClose]);

  const handleClose = useCallback(() => {
    // Reset to original values on cancel
    setName(habit.name);
    setIcon(habit.icon as HabitIcon);
    setColor(habit.color as HabitColor);
    setCategory(habit.category);
    setWeeklyGoal(habit.weeklyGoal);
    setReminderTime(habit.reminderTime || '');
    onClose();
  }, [habit, onClose]);

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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Habit</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Morning meditation"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(HABIT_CATEGORIES) as HabitCategory[]).map((cat) => (
                    <motion.button
                      key={cat}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCategory(cat)}
                      className={`p-2 rounded-lg text-xs font-medium transition-all ${
                        category === cat
                          ? `category-${cat} text-white shadow-lg`
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {HABIT_CATEGORIES[cat].emoji} {HABIT_CATEGORIES[cat].label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-8 gap-1.5">
                  {HABIT_ICONS.map((iconName) => (
                    <motion.button
                      key={iconName}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIcon(iconName)}
                      className={`p-2 rounded-lg transition-all ${
                        icon === iconName
                          ? `${HABIT_COLORS[color].bg} text-white shadow-lg ${HABIT_COLORS[color].glow}`
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      <IconComponent name={iconName} className="w-4 h-4" />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(HABIT_COLORS) as HabitColor[]).map((colorName) => (
                    <motion.button
                      key={colorName}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setColor(colorName)}
                      className={`w-8 h-8 rounded-full ${HABIT_COLORS[colorName].bg} transition-all ${
                        color === colorName
                          ? `ring-2 ring-offset-2 ring-offset-[#1a1a3e] ring-white/50 shadow-lg ${HABIT_COLORS[colorName].glow}`
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Weekly Goal: {weeklyGoal} days
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>1 day</span>
                  <span>7 days</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Daily Reminder (optional)
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!name.trim()}
                className="w-full py-4 bg-gradient-to-r from-violet-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
