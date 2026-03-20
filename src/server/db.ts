import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

let pool: mysql.Pool | null = null;
let migrationPromise: Promise<void> | null = null;

const parseBoolean = (value: string | undefined) =>
  typeof value === 'string' && ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());

async function ensureDatabaseReady(db: mysql.Pool) {
  // Skip SQL file migrations in Vercel serverless / production environments.
  // SQL files are not present in Vercel's read-only filesystem.
  // Run migrations manually via phpMyAdmin or a local migration script.
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return;
  }

  if (!migrationPromise) {
    migrationPromise = (async () => {
      const sqlFiles = ['database.sql', 'migration_v1.sql'];

      for (const fileName of sqlFiles) {
        const filePath = path.join(process.cwd(), fileName);

        try {
          const sql = await fs.readFile(filePath, 'utf8');
          if (sql.trim()) {
            await db.query(sql);
          }
        } catch (error: any) {
          if (error?.code === 'ENOENT') {
            continue;
          }
          throw error;
        }
      }
    })().catch((error) => {
      migrationPromise = null;
      throw error;
    });
  }

  await migrationPromise;
}

export function getDb() {
  if (!pool) {
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      throw new Error('DATABASE_NOT_CONFIGURED');
    }

    const host = process.env.DB_HOST;
    const port = Number(process.env.DB_PORT || 3306);
    const useSsl = parseBoolean(process.env.DB_SSL);

    if (
      process.env.NODE_ENV === 'production' &&
      ['localhost', '127.0.0.1', '::1'].includes(host)
    ) {
      throw new Error('DATABASE_LOCALHOST_UNREACHABLE');
    }

    pool = mysql.createPool({
      host,
      port,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true
    });
  }
  return pool;
}

// Helper to handle DB errors gracefully in API routes
export const withDb = async (req: any, res: any, fn: (db: mysql.Pool) => Promise<any>) => {
  try {
    const db = getDb();
    await ensureDatabaseReady(db);
    await fn(db);
  } catch (error: any) {
    if (error.message === 'DATABASE_NOT_CONFIGURED') {
      res.status(503).json({ 
        error: 'Database not configured', 
        message: 'Please configure DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in the environment variables.' 
      });
    } else if (error.message === 'DATABASE_LOCALHOST_UNREACHABLE') {
      res.status(503).json({
        error: 'Database host unreachable from production',
        message: 'DB_HOST is set to localhost/127.0.0.1, which Vercel cannot access. Use a public or hosted MySQL endpoint instead.',
      });
    } else {
      console.error('Database error details:', JSON.stringify({
        message: error.message,
        code: error.code,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || '3306',
        ssl: process.env.DB_SSL || 'false',
        user: process.env.DB_USER,
        db: process.env.DB_NAME
      }, null, 2));
      res.status(500).json({ error: 'Internal server error', details: error.message, code: error.code });
    }
  }
};
