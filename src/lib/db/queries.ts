import { getDb } from './index';

// Type definitions for database entities
export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  weekly_goal: number;
  reminder_time: string | null;
  created_at: string;
}

export interface Completion {
  id: string;
  habit_id: string;
  date: string;
  note: string | null;
  created_at: string;
}

// ============================================================================
// USER QUERIES
// ============================================================================

/**
 * Get user by email address
 */
export function getUserByEmail(email: string): User | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
}

/**
 * Get user by ID
 */
export function getUserById(id: string): User | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

/**
 * Create a new user
 */
export function createUser(id: string, email: string, passwordHash: string): User {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)'
  );
  stmt.run(id, email, passwordHash);
  return getUserById(id)!;
}

// ============================================================================
// HABIT QUERIES
// ============================================================================

/**
 * Get all habits for a user (with completion data)
 */
export function getHabitsByUserId(userId: string): Habit[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as Habit[];
}

/**
 * Get a single habit by ID
 */
export function getHabitById(habitId: string): Habit | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM habits WHERE id = ?');
  return stmt.get(habitId) as Habit | undefined;
}

/**
 * Create a new habit
 */
export function createHabit(
  id: string,
  userId: string,
  name: string,
  icon: string,
  color: string,
  category: string,
  weeklyGoal: number = 7,
  reminderTime: string | null = null
): Habit {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO habits (id, user_id, name, icon, color, category, weekly_goal, reminder_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, userId, name, icon, color, category, weeklyGoal, reminderTime);
  return getHabitById(id)!;
}

/**
 * Update an existing habit
 */
export function updateHabit(
  habitId: string,
  updates: Partial<Omit<Habit, 'id' | 'user_id' | 'created_at'>>
): Habit | undefined {
  const db = getDb();

  // Build dynamic update query
  const fields = Object.keys(updates).filter(key => updates[key as keyof typeof updates] !== undefined);
  if (fields.length === 0) {
    return getHabitById(habitId);
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updates[field as keyof typeof updates]);

  const stmt = db.prepare(`UPDATE habits SET ${setClause} WHERE id = ?`);
  stmt.run(...values, habitId);

  return getHabitById(habitId);
}

/**
 * Delete a habit (cascades to completions via foreign key)
 */
export function deleteHabit(habitId: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM habits WHERE id = ?');
  const result = stmt.run(habitId);
  return result.changes > 0;
}

/**
 * Check if a habit belongs to a user
 */
export function isHabitOwnedByUser(habitId: string, userId: string): boolean {
  const db = getDb();
  const stmt = db.prepare('SELECT 1 FROM habits WHERE id = ? AND user_id = ?');
  return stmt.get(habitId, userId) !== undefined;
}

// ============================================================================
// COMPLETION QUERIES
// ============================================================================

/**
 * Get all completions for a habit
 */
export function getCompletionsByHabitId(habitId: string): Completion[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM completions WHERE habit_id = ? ORDER BY date DESC');
  return stmt.all(habitId) as Completion[];
}

/**
 * Get completions for a habit within a date range
 */
export function getCompletionsByDateRange(
  habitId: string,
  startDate: string,
  endDate: string
): Completion[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM completions
    WHERE habit_id = ? AND date >= ? AND date <= ?
    ORDER BY date DESC
  `);
  return stmt.all(habitId, startDate, endDate) as Completion[];
}

/**
 * Get a specific completion by habit and date
 */
export function getCompletion(habitId: string, date: string): Completion | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM completions WHERE habit_id = ? AND date = ?');
  return stmt.get(habitId, date) as Completion | undefined;
}

/**
 * Create a completion (mark habit as done for a date)
 */
export function createCompletion(
  id: string,
  habitId: string,
  date: string,
  note: string | null = null
): Completion {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO completions (id, habit_id, date, note)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, habitId, date, note);
  return getCompletion(habitId, date)!;
}

/**
 * Delete a completion
 */
export function deleteCompletion(habitId: string, date: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM completions WHERE habit_id = ? AND date = ?');
  const result = stmt.run(habitId, date);
  return result.changes > 0;
}

/**
 * Get all completions for all user habits (for statistics)
 */
export function getAllUserCompletions(userId: string): Completion[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT c.* FROM completions c
    JOIN habits h ON c.habit_id = h.id
    WHERE h.user_id = ?
    ORDER BY c.date DESC
  `);
  return stmt.all(userId) as Completion[];
}
