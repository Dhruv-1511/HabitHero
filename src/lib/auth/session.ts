import { cookies } from 'next/headers';
import { signToken, verifyToken, JWTPayload } from './jwt';

const SESSION_COOKIE_NAME = 'habithero_session';

// Cookie options for security
const COOKIE_OPTIONS = {
  httpOnly: true, // Prevents XSS attacks by making cookie inaccessible to JS
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax' as const, // CSRF protection
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  path: '/',
};

/**
 * Create a session for a user by setting an httpOnly cookie with JWT
 */
export async function createSession(userId: string, email: string): Promise<void> {
  const token = await signToken({ userId, email });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);
}

/**
 * Get the current session from the request cookie
 * Returns userId and email if valid session exists, null otherwise
 */
export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Destroy the current session by clearing the cookie
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if user is authenticated (helper for API routes)
 */
export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}
