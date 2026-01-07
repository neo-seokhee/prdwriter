import { sql } from '@vercel/postgres';
import { createTables } from './schema';

let isInitialized = false;

export const initializeDatabase = async (): Promise<void> => {
  if (!isInitialized) {
    await createTables();
    isInitialized = true;
  }
};

// Export sql client for use in API routes
export { sql };

// Default export for backward compatibility
export default sql;
