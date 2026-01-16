'use client';

import { memo, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { HABIT_CATEGORIES, HabitCategory } from '@/types/habit';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: HabitCategory | 'all';
  onCategoryChange: (category: HabitCategory | 'all') => void;
}

export const SearchFilter = memo(function SearchFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: SearchFilterProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounced search - 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, onSearchChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  }, []);

  const categories = [
    { id: 'all' as const, label: 'All', emoji: '🌟' },
    ...Object.entries(HABIT_CATEGORIES).map(([key, value]) => ({
      id: key as HabitCategory,
      label: value.label,
      emoji: value.emoji,
    })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-2xl p-4 mb-6 space-y-4"
    >
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <input
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          placeholder="Search habits..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
        />
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === category.id
                ? category.id === 'all'
                  ? 'bg-gradient-to-r from-violet-500/30 to-emerald-500/30 text-white border border-white/20 shadow-lg'
                  : `category-${category.id} text-white shadow-lg`
                : 'bg-white/5 text-white/50 hover:bg-white/10 border border-transparent'
            }`}
          >
            <span>{category.emoji}</span>
            <span>{category.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
});
