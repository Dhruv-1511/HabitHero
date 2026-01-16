import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import {
  isHabitOwnedByUser,
  createCompletion,
  deleteCompletion,
  getCompletion,
} from '@/lib/db/queries';
import { randomUUID } from 'crypto';

// Force Node.js runtime
export const runtime = 'nodejs';

/**
 * POST /api/habits/[id]/completions
 * Mark a habit as complete for a specific date
 */
export async function POST(
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

    // Parse request body
    const body = await request.json();
    const { date, note } = body;

    // Validate date
    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Check if completion already exists
    const existing = getCompletion(id, date);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Habit already completed for this date' },
        { status: 400 }
      );
    }

    // Create completion
    const completionId = randomUUID();
    const completion = createCompletion(completionId, id, date, note || null);

    return NextResponse.json({
      success: true,
      completion,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Create completion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create completion' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/habits/[id]/completions?date=YYYY-MM-DD
 * Remove a completion for a specific date
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

    // Get date from query params
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date query parameter is required' },
        { status: 400 }
      );
    }

    // Delete completion
    const deleted = deleteCompletion(id, date);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Completion not found' },
        { status: 404 }
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

    console.error('Delete completion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete completion' },
      { status: 500 }
    );
  }
}
