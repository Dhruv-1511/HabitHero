# HabbitHero Backend Infrastructure

Complete backend implementation with SQLite database, JWT authentication, and RESTful API.

## Installation

Install required dependencies:

```bash
npm install better-sqlite3 bcryptjs jose
npm install -D @types/better-sqlite3 @types/bcryptjs
```

## Architecture Overview

### Database Layer (`src/lib/db/`)
- **schema.sql**: Database schema with users, habits, and completions tables
- **index.ts**: SQLite connection singleton with schema initialization
- **queries.ts**: Type-safe prepared statements for all CRUD operations

### Authentication Layer (`src/lib/auth/`)
- **password.ts**: bcrypt password hashing and validation
- **jwt.ts**: JWT token signing and verification using jose library
- **session.ts**: HTTP-only cookie session management

### API Routes (`src/app/api/`)
All routes use Node.js runtime (required for better-sqlite3)

#### Auth Endpoints
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Get current user session

#### Habit Endpoints
- `GET /api/habits` - List all user habits with completions
- `POST /api/habits` - Create new habit
- `GET /api/habits/[id]` - Get single habit
- `PUT /api/habits/[id]` - Update habit
- `DELETE /api/habits/[id]` - Delete habit (cascades to completions)

#### Completion Endpoints
- `POST /api/habits/[id]/completions` - Mark habit complete for date
- `DELETE /api/habits/[id]/completions?date=YYYY-MM-DD` - Remove completion
- `GET /api/habits/[id]/history` - Get completion history with pagination

#### Migration Endpoint
- `POST /api/migrate` - Migrate localStorage habits to database

### Frontend Integration

#### Auth Context (`src/contexts/AuthContext.tsx`)
React context providing:
- `user`: Current user object or null
- `isLoading`: Loading state during initialization
- `isAuthenticated`: Boolean auth status
- `login(email, password)`: Login function
- `register(email, password)`: Registration function
- `logout()`: Logout function
- `refreshUser()`: Refresh user data

#### API Client (`src/lib/api/client.ts`)
Centralized API client with methods:
- `authApi.login`, `authApi.register`, `authApi.logout`, `authApi.me`
- `habitsApi.list`, `habitsApi.create`, `habitsApi.update`, `habitsApi.delete`
- `completionsApi.toggle`, `completionsApi.create`, `completionsApi.delete`
- `completionsApi.history`
- `migrationApi.migrateHabits`

#### Auth Pages
- `/login` - Login form with error handling
- `/register` - Registration form with password confirmation

## Security Features

### Password Security
- bcrypt hashing with 12 rounds
- Minimum 8 characters, must contain letters and numbers
- Constant-time comparison for password verification

### Session Security
- HTTP-only cookies (prevents XSS)
- Secure flag in production (HTTPS only)
- SameSite=lax (CSRF protection)
- 7-day expiration

### API Security
- All protected routes require authentication
- Authorization checks (users can only access their own data)
- Input validation on all endpoints
- Proper HTTP status codes (401, 403, 404, 400, 500)
- Generic error messages to prevent user enumeration
- Foreign key constraints with CASCADE deletes

### SQL Injection Prevention
- All queries use prepared statements
- No string concatenation in SQL queries
- Parameterized queries via better-sqlite3

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Habits Table
```sql
CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  category TEXT NOT NULL,
  weekly_goal INTEGER DEFAULT 7,
  reminder_time TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Completions Table
```sql
CREATE TABLE completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  date TEXT NOT NULL,
  note TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  UNIQUE(habit_id, date)
);
```

### Indexes
- `idx_habits_user_id` - Optimize user habit queries
- `idx_completions_habit_id` - Optimize completion lookups
- `idx_completions_date` - Optimize date-based queries
- `idx_completions_habit_date` - Optimize habit+date queries

## Environment Variables

Create `.env.local`:
```env
JWT_SECRET=your-secret-key-change-in-production
DATABASE_PATH=./data/habithero.db
NODE_ENV=development
```

**IMPORTANT**: Generate a secure JWT secret in production:
```bash
openssl rand -base64 32
```

## Usage Examples

### Using Auth in Components

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Using API Client

```tsx
import { habitsApi, completionsApi } from '@/lib/api/client';

// Create a habit
const { habit } = await habitsApi.create({
  name: 'Morning Meditation',
  icon: '🧘',
  color: '#8B5CF6',
  category: 'Health',
  weeklyGoal: 7,
});

// Toggle completion
await completionsApi.toggle(habit.id, '2026-01-15', 'Felt great!');

// Get history
const { completions } = await completionsApi.history(habit.id, {
  startDate: '2026-01-01',
  endDate: '2026-01-31',
});
```

### Protecting Pages

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected content</div>;
}
```

## Migration from localStorage

For existing users with localStorage data:

```tsx
import { migrationApi } from '@/lib/api/client';

async function migrateData() {
  // Get habits from localStorage
  const localHabits = JSON.parse(localStorage.getItem('habits') || '[]');

  // Migrate to database
  const result = await migrationApi.migrateHabits(localHabits);

  console.log(`Migrated ${result.migratedCount} habits`);

  // Clear localStorage after successful migration
  if (result.migratedCount > 0) {
    localStorage.removeItem('habits');
  }
}
```

## Performance Optimizations

### Database
- Indexes on frequently queried columns
- Foreign key constraints for referential integrity
- Prepared statements cached by better-sqlite3

### API
- Efficient queries with proper joins
- Pagination support for large datasets
- Single query to fetch habits with completions

### Caching Opportunities
Consider implementing:
- Redis cache for user sessions
- In-memory cache for habit lists
- CDN caching for static assets

## Error Handling

All API routes return consistent error format:
```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP status codes:
- `200` - Success
- `400` - Bad request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not allowed)
- `404` - Not found
- `500` - Server error

## Testing

### Manual API Testing

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Create habit (requires cookie)
curl -X POST http://localhost:3000/api/habits \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Exercise","icon":"💪","color":"#10B981","category":"Health"}'

# Get habits
curl http://localhost:3000/api/habits -b cookies.txt
```

## Deployment Considerations

### Production Checklist
- [ ] Generate secure JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Set up database backups
- [ ] Configure CORS if needed
- [ ] Set up rate limiting
- [ ] Monitor database file size
- [ ] Consider moving to PostgreSQL for scale

### Database Location
- Development: `./data/habithero.db`
- Production: Use persistent storage (not ephemeral filesystem)
- Consider PostgreSQL for multi-instance deployments

## Troubleshooting

### "Module not found: Can't resolve 'better-sqlite3'"
- Ensure dependencies are installed: `npm install better-sqlite3`
- Check that API routes have `export const runtime = 'nodejs'`

### "Unauthorized" errors
- Check that cookies are being sent with requests
- Verify JWT_SECRET is set in .env.local
- Check that session hasn't expired (7 days)

### Database locked errors
- SQLite doesn't support concurrent writes well
- Consider connection pooling or switch to PostgreSQL for high traffic

### Foreign key constraint errors
- Ensure `pragma('foreign_keys = ON')` is set
- Verify parent records exist before creating child records

## Next Steps

1. **Add Rate Limiting**: Prevent brute force attacks on auth endpoints
2. **Email Verification**: Send confirmation emails for new accounts
3. **Password Reset**: Implement forgot password flow
4. **OAuth**: Add Google/GitHub login
5. **API Documentation**: Generate OpenAPI/Swagger docs
6. **Automated Tests**: Add unit and integration tests
7. **Database Migrations**: Implement migration system for schema changes
8. **Monitoring**: Add logging and error tracking (Sentry, etc.)

## File Structure

```
src/
├── lib/
│   ├── db/
│   │   ├── schema.sql
│   │   ├── index.ts
│   │   └── queries.ts
│   ├── auth/
│   │   ├── password.ts
│   │   ├── jwt.ts
│   │   └── session.ts
│   └── api/
│       └── client.ts
├── contexts/
│   └── AuthContext.tsx
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── habits/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── completions/route.ts
│   │   │       └── history/route.ts
│   │   └── migrate/
│   │       └── route.ts
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── layout.tsx
└── .env.local
```

## License

This backend infrastructure is part of the HabbitHero project.
