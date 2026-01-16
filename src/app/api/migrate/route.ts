import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { createHabit, createCompletion, getHabitsByUserId } from '@/lib/db/queries';
import { randomUUID } from 'crypto';

// Force Node.js runtime
export const runtime = 'nodejs';

interface LocalStorageHabit {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  weeklyGoal?: number;
  reminderTime?: string;
  completions?: Array<{
    date: string;
    note?: string;
  }>;
}

/**
 * POST /api/migrate
 * Migrate habits from localStorage to database for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Parse habits from request body
    const body = await request.json();
    const { habits } = body as { habits: LocalStorageHabit[] };

    if (!Array.isArray(habits)) {
      return NextResponse.json(
        { success: false, error: 'Invalid habits data' },
        { status: 400 }
      );
    }

    // Check if user already has habits (prevent duplicate migrations)
    const existingHabits = getHabitsByUserId(session.userId);
    if (existingHabits.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'User already has habits. Migration aborted to prevent duplicates.',
        },
        { status: 400 }
      );
    }

    const migratedHabits = [];
    const errors = [];

    // Migrate each habit
    for (const localHabit of habits) {
      try {
        // Validate required fields
        if (!localHabit.name || !localHabit.icon || !localHabit.color || !localHabit.category) {
          errors.push({ habitName: localHabit.name, error: 'Missing required fields' });
          continue;
        }

        // Create new habit with new ID
        const newHabitId = randomUUID();
        const habit = createHabit(
          newHabitId,
          session.userId,
          localHabit.name,
          localHabit.icon,
          localHabit.color,
          localHabit.category,
          localHabit.weeklyGoal || 7,
          localHabit.reminderTime || null
        );

        // Migrate completions
        const migratedCompletions = [];
        if (localHabit.completions && Array.isArray(localHabit.completions)) {
          for (const completion of localHabit.completions) {
            try {
              const completionId = randomUUID();
              const newCompletion = createCompletion(
                completionId,
                newHabitId,
                completion.date,
                completion.note || null
              );
              migratedCompletions.push(newCompletion);
            } catch (error) {
              console.error('Failed to migrate completion:', error);
              // Continue with other completions even if one fails
            }
          }
        }

        migratedHabits.push({
          ...habit,
          completions: migratedCompletions,
        });
      } catch (error) {
        console.error('Failed to migrate habit:', error);
        errors.push({
          habitName: localHabit.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      migratedCount: migratedHabits.length,
      habits: migratedHabits,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    );
  }
}
