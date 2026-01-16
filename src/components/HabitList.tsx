'use client';

import { memo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Habit } from '@/types/habit';
import { HabitCard } from './HabitCard';
import { Sparkles, Rocket } from 'lucide-react';

interface HabitListProps {
  habits: Habit[];
  onToggle: (id: string, note?: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Habit>) => void;
  playSound?: () => void;
}

export const HabitList = memo(function HabitList({ habits, onToggle, onDelete, onEdit, playSound }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="relative mb-6"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500/30 to-emerald-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="w-6 h-6 text-amber-400" />
          </motion.div>
        </motion.div>

        <h3 className="text-xl font-bold text-white mb-2">
          Ready to build habits?
        </h3>
        <p className="text-white/50 text-sm max-w-xs mb-4">
          Start your journey to a better you. Add your first habit and watch your progress grow!
        </p>
        <p className="text-xs text-violet-400">
          Tap the + button below to get started
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {habits.map((habit, index) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { delay: index * 0.05 },
            }}
          >
            <HabitCard
              habit={habit}
              onToggle={(note) => onToggle(habit.id, note)}
              onDelete={() => onDelete(habit.id)}
              onEdit={(updates) => onEdit(habit.id, updates)}
              playSound={playSound}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
});
