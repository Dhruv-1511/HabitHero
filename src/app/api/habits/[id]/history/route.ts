import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import {
  isHabitOwnedByUser,
  getCompletionsByDateRange,
  getCompletionsByHabitId,
} from '@/lib/db/queries';

// Force Node.js runtime
export const runtime = 'nodejs';

/**
 * GET /api/habits/[id]/history?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=100&offset=0
 * Fetch completion history for a habit with optional date range and pagination
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Validate pagination params
    if (limit < 1 || limit > 1000) {
      return NextResponse.json(
        { success: false, error: 'Limit must be between 1 and 1000' },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { success: false, error: 'Offset must be non-negative' },
        { status: 400 }
      );
    }

    // Fetch completions
    let completions;
    if (startDate && endDate) {
      completions = getCompletionsByDateRange(id, startDate, endDate);
    } else {
      completions = getCompletionsByHabitId(id);
    }

    // Apply pagination
    const total = completions.length;
    const paginatedCompletions = completions.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      completions: paginatedCompletions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Get history error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
