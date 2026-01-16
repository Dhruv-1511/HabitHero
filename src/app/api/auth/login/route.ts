import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db/queries';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';

// Force Node.js runtime (better-sqlite3 doesn't work in Edge)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = getUserByEmail(email.toLowerCase());
    if (!user) {
      // Use generic error message to prevent user enumeration
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    await createSession(user.id, user.email);

    // Return success with user data (no password hash!)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
