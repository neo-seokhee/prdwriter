import { getUserByAccessCode, createUser } from '../db/queries';

/**
 * Generate an access code in the format ABC-1234
 * 3 uppercase letters + hyphen + 4 digits
 */
export const generateAccessCode = (): string => {
  // Generate 3 random uppercase letters
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');

  // Generate 4 random digits
  const numbers = Math.floor(1000 + Math.random() * 9000).toString();

  return `${letters}-${numbers}`;
};

/**
 * Validate access code format
 * @param code - Access code to validate
 * @returns true if valid format, false otherwise
 */
export const validateAccessCodeFormat = (code: string): boolean => {
  // Regex: 3 uppercase letters, hyphen, 4 digits
  return /^[A-Z]{3}-\d{4}$/.test(code);
};

/**
 * Check if access code exists in database
 * @param code - Access code to check
 * @returns true if exists, false otherwise
 */
export const checkAccessCodeExists = async (code: string): Promise<boolean> => {
  const user = await getUserByAccessCode(code);
  return !!user;
};

/**
 * Generate a unique access code
 * Retries up to maxAttempts times if collision occurs
 * @param maxAttempts - Maximum number of attempts (default: 10)
 * @returns Unique access code
 * @throws Error if unable to generate unique code
 */
export const generateUniqueAccessCode = async (maxAttempts: number = 10): Promise<string> => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const code = generateAccessCode();

    if (!(await checkAccessCodeExists(code))) {
      return code;
    }

    attempts++;
  }

  throw new Error('Unable to generate unique access code after maximum attempts');
};

/**
 * Create a new user with a unique access code
 * @returns Object with user_id and access_code
 */
export const createUserWithAccessCode = async (): Promise<{ user_id: number; access_code: string }> => {
  const access_code = await generateUniqueAccessCode();
  const user_id = await createUser({ access_code });

  return { user_id, access_code };
};
