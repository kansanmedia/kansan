import { getDb } from './src/server/db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    const db = getDb();
    const sql = fs.readFileSync(path.join(process.cwd(), 'migration_v1.sql'), 'utf8');
    
    console.log('Running migration...');
    // We need to split the queries because mysql2 might have issues with multiple statements in a single call even if enabled
    // especially with the commented lines
    const queries = sql.split(';').filter(q => q.trim().length > 0);
    
    for (const query of queries) {
      console.log('Executing:', query.substring(0, 50) + '...');
      await db.query(query);
    }
    
    console.log('Migration successful');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
