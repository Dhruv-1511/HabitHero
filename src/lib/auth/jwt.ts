import { SignJWT, jwtVerify } from 'jose';

// Get JWT secret from environment or use default (change in production!)
const JWT_SECRET = process.env.JWT_SECRET || 'habithero-secret-key-change-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

// Token expiration: 7 days
const TOKEN_EXPIRATION = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Sign a JWT token with user data
 * Returns a token string that expires in 7 days
 */
export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(secret);
}

/**
 * Verify and decode a JWT token
 * Returns the payload if valid, null if invalid or expired
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch (error) {
    // Token is invalid, expired, or malformed
    console.error('JWT verification failed:', error);
    return null;
  }
}
