'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Habit, HabitCategory } from '@/types/habit';
import { getStoredHabits, setStoredHabits, generateId } from '@/lib/storage';
import { getTodayString } from '@/lib/dates';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = getStoredHabits();
    // Migrate old habits to new format
    const migrated = stored.map((h) => ({
      ...h,
      category: h.category || 'personal' as HabitCategory,
      weeklyGoal: h.weeklyGoal || 7,
      notes: h.notes || [],
    }));
    setHabits(migrated);
    setIsLoaded(true);
  }, []);

  // Debounced localStorage write - prevents excessive I/O
  useEffect(() => {
    if (!isLoaded) return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce writes by 300ms
    saveTimeoutRef.current = setTimeout(() => {
      setStoredHabits(habits);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [habits, isLoaded]);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'notes'>) => {
    const newHabit: Habit = {
      ...habit,
      id: generateId(),
      createdAt: getTodayString(),
      completedDates: [],
      notes: [],
    };
    setHabits((prev) => [...prev, newHabit]);
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const toggleHabit = useCallback((id: string, note?: string) => {
    const today = getTodayString();
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;

        const isCompleted = habit.completedDates.includes(today);

        if (isCompleted) {
          return {
            ...habit,
            completedDates: habit.completedDates.filter((d) => d !== today),
            notes: habit.notes.filter((n) => n.date !== today),
          };
        }

        const newNotes = note
          ? [...habit.notes.filter((n) => n.date !== today), { date: today, note }]
          : habit.notes;

        return {
          ...habit,
          completedDates: [...habit.completedDates, today],
          notes: newNotes,
        };
      })
    );
  }, []);

  const addNote = useCallback((habitId: string, note: string) => {
    const today = getTodayString();
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        return {
          ...habit,
          notes: [...habit.notes.filter((n) => n.date !== today), { date: today, note }],
        };
      })
    );
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit))
    );
  }, []);

  return {
    habits,
    isLoaded,
    addHabit,
    deleteHabit,
    toggleHabit,
    updateHabit,
    addNote,
  };
}
