import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST() {
  try {
    // Clear the session cookie
    await destroySession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
