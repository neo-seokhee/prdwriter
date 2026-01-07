import { sql } from '@vercel/postgres';

export const createTables = async (): Promise<void> => {
  // users 테이블
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      access_code TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_access_code ON users(access_code)
  `;

  // products 테이블
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_name TEXT,
      one_liner TEXT NOT NULL,
      core_features TEXT NOT NULL,
      platforms TEXT NOT NULL,
      tech_stack TEXT,
      is_action_camp INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_user_id ON products(user_id)
  `;

  // user_research 테이블
  await sql`
    CREATE TABLE IF NOT EXISTS user_research (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      research_content TEXT NOT NULL,
      sequence_number INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_product_id ON user_research(product_id)
  `;

  // prd_versions 테이블
  await sql`
    CREATE TABLE IF NOT EXISTS prd_versions (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      content TEXT NOT NULL,
      validation_annotations TEXT,
      research_snapshot TEXT,
      generation_prompt TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_product_version ON prd_versions(product_id, version_number)
  `;

  // validation_markers 테이블
  await sql`
    CREATE TABLE IF NOT EXISTS validation_markers (
      id SERIAL PRIMARY KEY,
      prd_version_id INTEGER NOT NULL REFERENCES prd_versions(id) ON DELETE CASCADE,
      feature_name TEXT NOT NULL,
      marker_type TEXT NOT NULL,
      description TEXT,
      section_context TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_prd_version ON validation_markers(prd_version_id)
  `;
};
