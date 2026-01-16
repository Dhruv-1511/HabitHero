import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

// Singleton database instance
let db: Database.Database | null = null;

/**
 * Get or create the SQLite database connection
 * Initializes schema on first connection
 */
export function getDb(): Database.Database {
  if (db) {
    return db;
  }

  // Determine database path from environment or default
  const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'habithero.db');

  // Create database connection with better-sqlite3
  db = new Database(dbPath, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
  });

  // Enable foreign key constraints (critical for CASCADE deletes)
  db.pragma('foreign_keys = ON');

  // Initialize schema if tables don't exist
  initializeSchema(db);

  return db;
}

/**
 * Initialize database schema from SQL file
 */
function initializeSchema(database: Database.Database): void {
  try {
    const schemaPath = join(process.cwd(), 'src', 'lib', 'db', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Execute schema (CREATE TABLE IF NOT EXISTS is idempotent)
    database.exec(schema);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}

/**
 * Close the database connection (useful for cleanup in tests)
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Helper to run queries in a transaction
 */
export function transaction<T>(fn: (db: Database.Database) => T): T {
  const database = getDb();
  const txn = database.transaction(fn);
  return txn(database);
}
