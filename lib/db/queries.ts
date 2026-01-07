import type {
  User,
  Product,
  ProductWithPlatforms,
  UserResearch,
  PRDVersion,
  ValidationMarker,
  CreateUserInput,
  CreateProductInput,
  CreateResearchInput,
  CreatePRDVersionInput,
  CreateValidationMarkerInput,
} from '../types/database';
import { sql } from './index';

// ===== USER QUERIES =====

export const getUserByAccessCode = async (accessCode: string): Promise<User | undefined> => {
  const result = await sql`SELECT * FROM users WHERE access_code = ${accessCode}`;
  return result.rows[0] as User | undefined;
};

export const createUser = async (input: CreateUserInput): Promise<number> => {
  const result = await sql`
    INSERT INTO users (access_code)
    VALUES (${input.access_code})
    RETURNING id
  `;
  return result.rows[0].id;
};

export const updateUserLastAccessed = async (userId: number): Promise<void> => {
  await sql`
    UPDATE users
    SET last_accessed = CURRENT_TIMESTAMP
    WHERE id = ${userId}
  `;
};

// ===== PRODUCT QUERIES =====

export const getProductById = async (productId: number): Promise<ProductWithPlatforms | undefined> => {
  const result = await sql`SELECT * FROM products WHERE id = ${productId}`;
  const product = result.rows[0] as Product | undefined;

  if (!product) return undefined;

  return {
    ...product,
    platforms: JSON.parse(product.platforms),
  };
};

export const getProductsByUserId = async (userId: number): Promise<(ProductWithPlatforms & { research_count: number; prd_count: number })[]> => {
  const result = await sql`SELECT * FROM products WHERE user_id = ${userId} ORDER BY created_at DESC`;
  const products = result.rows as Product[];

  const productsWithCounts = await Promise.all(
    products.map(async (product) => {
      const researchResult = await sql`SELECT COUNT(*) as count FROM user_research WHERE product_id = ${product.id}`;
      const prdResult = await sql`SELECT COUNT(*) as count FROM prd_versions WHERE product_id = ${product.id}`;

      return {
        ...product,
        platforms: JSON.parse(product.platforms),
        research_count: parseInt(researchResult.rows[0].count),
        prd_count: parseInt(prdResult.rows[0].count),
      };
    })
  );

  return productsWithCounts;
};

export const createProduct = async (input: CreateProductInput): Promise<number> => {
  const result = await sql`
    INSERT INTO products (user_id, product_name, one_liner, core_features, platforms, tech_stack, is_action_camp)
    VALUES (
      ${input.user_id},
      ${input.product_name || null},
      ${input.one_liner},
      ${input.core_features},
      ${JSON.stringify(input.platforms)},
      ${input.tech_stack || null},
      ${input.is_action_camp ? 1 : 0}
    )
    RETURNING id
  `;

  return result.rows[0].id;
};

export const updateProduct = async (productId: number, input: Partial<CreateProductInput>): Promise<void> => {
  const updates: string[] = [];
  const values: any[] = [];

  if (input.one_liner !== undefined) {
    updates.push('one_liner = $' + (values.length + 1));
    values.push(input.one_liner);
  }
  if (input.core_features !== undefined) {
    updates.push('core_features = $' + (values.length + 1));
    values.push(input.core_features);
  }
  if (input.platforms !== undefined) {
    updates.push('platforms = $' + (values.length + 1));
    values.push(JSON.stringify(input.platforms));
  }
  if (input.tech_stack !== undefined) {
    updates.push('tech_stack = $' + (values.length + 1));
    values.push(input.tech_stack);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');

  // Note: This is a simplified approach. For complex dynamic queries, consider using a query builder.
  const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${values.length + 1}`;
  values.push(productId);

  // Use pool.query for dynamic queries
  const { pool } = await import('./index');
  await pool.query(query, values);
};

export const deleteProduct = async (productId: number): Promise<void> => {
  await sql`DELETE FROM products WHERE id = ${productId}`;
};

// ===== USER RESEARCH QUERIES =====

export const getResearchByProductId = async (productId: number): Promise<UserResearch[]> => {
  const result = await sql`SELECT * FROM user_research WHERE product_id = ${productId} ORDER BY sequence_number ASC`;
  return result.rows as UserResearch[];
};

export const createResearch = async (input: CreateResearchInput): Promise<number> => {
  const result = await sql`
    INSERT INTO user_research (product_id, research_content, sequence_number)
    VALUES (${input.product_id}, ${input.research_content}, ${input.sequence_number})
    RETURNING id
  `;

  return result.rows[0].id;
};

export const getNextResearchSequence = async (productId: number): Promise<number> => {
  const result = await sql`SELECT MAX(sequence_number) as max_seq FROM user_research WHERE product_id = ${productId}`;
  const maxSeq = result.rows[0]?.max_seq;
  return (maxSeq || 0) + 1;
};

// ===== PRD VERSION QUERIES =====

export const getPRDVersionById = async (versionId: number): Promise<PRDVersion | undefined> => {
  const result = await sql`SELECT * FROM prd_versions WHERE id = ${versionId}`;
  return result.rows[0] as PRDVersion | undefined;
};

export const getPRDVersionsByProductId = async (productId: number): Promise<PRDVersion[]> => {
  const result = await sql`SELECT * FROM prd_versions WHERE product_id = ${productId} ORDER BY version_number DESC`;
  return result.rows as PRDVersion[];
};

export const getLatestPRDVersion = async (productId: number): Promise<PRDVersion | undefined> => {
  const result = await sql`SELECT * FROM prd_versions WHERE product_id = ${productId} ORDER BY version_number DESC LIMIT 1`;
  return result.rows[0] as PRDVersion | undefined;
};

export const createPRDVersion = async (input: CreatePRDVersionInput): Promise<number> => {
  const result = await sql`
    INSERT INTO prd_versions (product_id, version_number, content, validation_annotations, research_snapshot, generation_prompt)
    VALUES (
      ${input.product_id},
      ${input.version_number},
      ${input.content},
      ${input.validation_annotations ? JSON.stringify(input.validation_annotations) : null},
      ${input.research_snapshot ? JSON.stringify(input.research_snapshot) : null},
      ${input.generation_prompt || null}
    )
    RETURNING id
  `;

  return result.rows[0].id;
};

export const getNextPRDVersion = async (productId: number): Promise<number> => {
  const result = await sql`SELECT MAX(version_number) as max_ver FROM prd_versions WHERE product_id = ${productId}`;
  const maxVer = result.rows[0]?.max_ver;
  return (maxVer || 0) + 1;
};

// ===== VALIDATION MARKER QUERIES =====

export const getValidationMarkersByPRDVersionId = async (prdVersionId: number): Promise<ValidationMarker[]> => {
  const result = await sql`SELECT * FROM validation_markers WHERE prd_version_id = ${prdVersionId} ORDER BY id ASC`;
  return result.rows as ValidationMarker[];
};

export const createValidationMarker = async (input: CreateValidationMarkerInput): Promise<number> => {
  const result = await sql`
    INSERT INTO validation_markers (prd_version_id, feature_name, marker_type, description, section_context)
    VALUES (
      ${input.prd_version_id},
      ${input.feature_name},
      ${input.marker_type},
      ${input.description || null},
      ${input.section_context || null}
    )
    RETURNING id
  `;

  return result.rows[0].id;
};

export const createValidationMarkers = async (markers: CreateValidationMarkerInput[]): Promise<void> => {
  for (const marker of markers) {
    await createValidationMarker(marker);
  }
};
