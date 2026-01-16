'use client';

import { useMemo } from 'react';
import { Habit, HabitCategory } from '@/types/habit';

export function useFilteredHabits(
  habits: Habit[],
  searchQuery: string,
  selectedCategory: HabitCategory | 'all'
) {
  return useMemo(() => {
    let filtered = habits;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((habit) =>
        habit.name.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((habit) => habit.category === selectedCategory);
    }

    return filtered;
  }, [habits, searchQuery, selectedCategory]);
}
