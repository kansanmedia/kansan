import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool: mysql.Pool | null = null;

export function getDb() {
  if (!pool) {
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      throw new Error('DATABASE_NOT_CONFIGURED');
    }
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
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
    await fn(db);
  } catch (error: any) {
    if (error.message === 'DATABASE_NOT_CONFIGURED') {
      res.status(503).json({ 
        error: 'Database not configured', 
        message: 'Please configure DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in the environment variables.' 
      });
    } else {
      console.error('Database error details:', JSON.stringify({
        message: error.message,
        code: error.code,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        db: process.env.DB_NAME
      }, null, 2));
      res.status(500).json({ error: 'Internal server error', details: error.message, code: error.code });
    }
  }
};
