import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import {
  getHabitById,
  updateHabit,
  deleteHabit,
  isHabitOwnedByUser,
  getCompletionsByHabitId,
} from '@/lib/db/queries';

// Force Node.js runtime
export const runtime = 'nodejs';

/**
 * GET /api/habits/[id]
 * Fetch a single habit with completions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Check ownership
    if (!isHabitOwnedByUser(id, session.userId)) {
      return NextResponse.json(
        { success: false, error: 'Habit not found' },
        { status: 404 }
      );
    }

    // Fetch habit and completions
    const habit = getHabitById(id);
    if (!habit) {
      return NextResponse.json(
        { success: false, error: 'Habit not found' },
        { status: 404 }
      );
    }

    const completions = getCompletionsByHabitId(id);

    return NextResponse.json({
      success: true,
      habit: {
        ...habit,
        completions,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Get habit error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch habit' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/habits/[id]
 * Update a habit's properties
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Check ownership
    if (!isHabitOwnedByUser(id, session.userId)) {
      return NextResponse.json(
        { success: false, error: 'Habit not found' },
        { status: 404 }
      );
    }

    // Parse update data
    const body = await request.json();
    const { name, icon, color, category, weekly_goal, reminder_time } = body;

    // Validate weekly goal if provided
    if (weekly_goal !== undefined && (weekly_goal < 1 || weekly_goal > 7)) {
      return NextResponse.json(
        { success: false, error: 'Weekly goal must be between 1 and 7' },
        { status: 400 }
      );
    }

    // Update habit
    const updatedHabit = updateHabit(id, {
      name,
      icon,
      color,
      category,
      weekly_goal,
      reminder_time,
    });

    if (!updatedHabit) {
      return NextResponse.json(
        { success: false, error: 'Failed to update habit' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      habit: {
        ...updatedHabit,
        completions: getCompletionsByHabitId(id),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Update habit error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update habit' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/habits/[id]
 * Delete a habit (cascades to completions)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Check ownership
    if (!isHabitOwnedByUser(id, session.userId)) {
      return NextResponse.json(
        { success: false, error: 'Habit not found' },
        { status: 404 }
      );
    }

    // Delete habit
    const deleted = deleteHabit(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete habit' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Delete habit error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete habit' },
      { status: 500 }
    );
  }
}
