'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Home, BarChart3, Calendar } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { useNotifications } from '@/hooks/useNotifications';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useFilteredHabits } from '@/hooks/useFilteredHabits';
import { useUndoStack } from '@/hooks/useUndoStack';
import { Header } from '@/components/Header';
import { HabitList } from '@/components/HabitList';
import { AddHabitModal } from '@/components/AddHabitModal';
import { MotivationalQuote } from '@/components/MotivationalQuote';
import { Statistics } from '@/components/Statistics';
import { CalendarHeatmap } from '@/components/CalendarHeatmap';
import { SearchFilter } from '@/components/SearchFilter';
import { UndoToast } from '@/components/UndoToast';
import { HabitCategory, Habit } from '@/types/habit';

type Tab = 'home' | 'stats' | 'calendar';

export default function HomePage() {
  const { habits, isLoaded, addHabit, toggleHabit, deleteHabit, updateHabit } = useHabits();
  const { permission, requestPermission } = useNotifications();
  const { playComplete } = useSoundEffects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');

  // Undo stack
  const { push: pushUndo, pop: popUndo, lastAction } = useUndoStack();
  const [showUndoToast, setShowUndoToast] = useState(false);

  // Apply filters
  const filteredHabits = useFilteredHabits(habits, searchQuery, selectedCategory);

  // Handle delete with undo
  const handleDelete = useCallback((id: string) => {
    const habitToDelete = habits.find(h => h.id === id);
    if (!habitToDelete) return;

    deleteHabit(id);
    pushUndo(`Deleted "${habitToDelete.name}"`, () => {
      addHabit(habitToDelete);
    });
    setShowUndoToast(true);
  }, [habits, deleteHabit, pushUndo, addHabit]);

  // Handle undo
  const handleUndo = useCallback(() => {
    const action = popUndo();
    if (action) {
      action.undo();
      setShowUndoToast(false);
    }
  }, [popUndo]);

  // Handle edit
  const handleEdit = useCallback((id: string, updates: Partial<Habit>) => {
    updateHabit(id, updates);
  }, [updateHabit]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* Animated gradient orbs */}
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white/50 text-sm">Loading your habits...</p>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'home' as Tab, icon: Home, label: 'Today' },
    { id: 'stats' as Tab, icon: BarChart3, label: 'Stats' },
    { id: 'calendar' as Tab, icon: Calendar, label: 'Calendar' },
  ];

  return (
    <main className="min-h-screen pb-28 relative bg-[#0f0f23]">
      {/* Animated gradient orbs */}
      <div className="gradient-orb orb-1" />
      <div className="gradient-orb orb-2" />
      <div className="gradient-orb orb-3" />

      <div className="max-w-lg mx-auto px-4 pt-8 relative z-10">
        <Header
          notificationPermission={permission}
          onRequestNotification={requestPermission}
        />

        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <MotivationalQuote />

              {habits.length > 0 && (
                <SearchFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              )}

              <HabitList
                habits={filteredHabits}
                onToggle={toggleHabit}
                onDelete={handleDelete}
                onEdit={handleEdit}
                playSound={playComplete}
              />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Statistics habits={habits} />

              {habits.length === 0 && (
                <div className="glass rounded-2xl p-8 text-center">
                  <p className="text-white/50">Add some habits to see your statistics</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <CalendarHeatmap habits={habits} />

              {habits.length === 0 && (
                <div className="glass rounded-2xl p-8 text-center">
                  <p className="text-white/50">Add some habits to see your activity</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-20">
        <div className="max-w-lg mx-auto">
          <div className="glass rounded-2xl p-2 flex items-center justify-around">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-500/30 to-emerald-500/30 text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </motion.button>
            ))}

            {/* Add button */}
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-gradient-to-r from-violet-500 to-emerald-500 rounded-xl shadow-lg shadow-violet-500/30 flex items-center justify-center text-white ml-2"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>

      <AddHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addHabit}
      />

      <UndoToast
        message={lastAction?.message || ''}
        isVisible={showUndoToast && !!lastAction}
        onUndo={handleUndo}
        onDismiss={() => setShowUndoToast(false)}
      />
    </main>
  );
}
