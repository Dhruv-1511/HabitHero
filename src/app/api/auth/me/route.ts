import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserById } from '@/lib/db/queries';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Get current session
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null });
    }

    // Verify user still exists in database
    const user = getUserById(session.userId);

    if (!user) {
      // User was deleted, clear invalid session
      return NextResponse.json({ user: null });
    }

    // Return user data (no password hash!)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null });
  }
}
