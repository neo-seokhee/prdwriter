import { createPool, sql as vercelSql } from '@vercel/postgres';
import { createTables } from './schema';

let isInitialized = false;

// Create a pool connection with explicit configuration
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export const sql = pool.sql;

export const initializeDatabase = async (): Promise<void> => {
  if (!isInitialized) {
    await createTables();
    isInitialized = true;
  }
};

// Default export for backward compatibility
export default sql;
