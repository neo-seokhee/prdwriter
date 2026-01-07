import { Pool } from 'pg';
import { createTables } from './schema';

let pool: Pool | null = null;
let isInitialized = false;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  return pool;
};

export const initializeDatabase = async (): Promise<void> => {
  if (!isInitialized) {
    await createTables();
    isInitialized = true;
  }
};

// Helper function to execute queries with tagged template
export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
  const pool = getPool();
  
  // Convert template string to parameterized query
  let query = strings[0];
  const params: any[] = [];
  
  for (let i = 0; i < values.length; i++) {
    params.push(values[i]);
    query += `$${i + 1}` + strings[i + 1];
  }
  
  const result = await pool.query(query, params);
  return { rows: result.rows, rowCount: result.rowCount };
};

export default sql;
