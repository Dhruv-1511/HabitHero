import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import {
  getHabitsByUserId,
  createHabit,
  getCompletionsByHabitId,
} from '@/lib/db/queries';
import { randomUUID } from 'crypto';

// Force Node.js runtime
export const runtime = 'nodejs';

/**
 * GET /api/habits
 * Fetch all habits for the authenticated user with completion data
 */
export async function GET() {
  try {
    // Require authentication
    const session = await requireAuth();

    // Fetch user's habits
    const habits = getHabitsByUserId(session.userId);

    // Attach completions to each habit
    const habitsWithCompletions = habits.map((habit) => ({
      ...habit,
      completions: getCompletionsByHabitId(habit.id),
    }));

    return NextResponse.json({
      success: true,
      habits: habitsWithCompletions,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Get habits error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch habits' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/habits
 * Create a new habit for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await requireAuth();

    // Parse request body
    const body = await request.json();
    const { name, icon, color, category, weeklyGoal, reminderTime } = body;

    // Validate required fields
    if (!name || !icon || !color || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate weekly goal
    const goal = weeklyGoal || 7;
    if (goal < 1 || goal > 7) {
      return NextResponse.json(
        { success: false, error: 'Weekly goal must be between 1 and 7' },
        { status: 400 }
      );
    }

    // Create habit
    const habitId = randomUUID();
    const habit = createHabit(
      habitId,
      session.userId,
      name,
      icon,
      color,
      category,
      goal,
      reminderTime || null
    );

    return NextResponse.json({
      success: true,
      habit: {
        ...habit,
        completions: [],
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Create habit error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create habit' },
      { status: 500 }
    );
  }
}
