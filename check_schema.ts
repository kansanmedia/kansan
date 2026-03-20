import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkSchema() {
  console.log('Checking database schema...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    console.log('Successfully connected!');
    
    console.log('\n--- Clients Table Schema ---');
    const [columns] = await connection.execute('SHOW COLUMNS FROM clients');
    console.log(columns);

    await connection.end();
  } catch (error) {
    console.error('Error checking schema:');
    console.error(error);
  }
}

checkSchema();
