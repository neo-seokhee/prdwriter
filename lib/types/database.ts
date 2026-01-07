// Database Model Types

export interface User {
  id: number;
  access_code: string;
  created_at: string;
  last_accessed: string;
}

export interface Product {
  id: number;
  user_id: number;
  product_name: string | null;
  one_liner: string;
  core_features: string;
  platforms: string; // JSON string
  tech_stack: string | null;
  is_action_camp: number; // 0 or 1 (SQLite boolean)
  created_at: string;
  updated_at: string;
}

export interface ProductWithPlatforms extends Omit<Product, 'platforms'> {
  platforms: string[];
  product_name: string | null;
  is_action_camp: number;
}

export interface UserResearch {
  id: number;
  product_id: number;
  research_content: string;
  sequence_number: number;
  created_at: string;
}

export interface PRDVersion {
  id: number;
  product_id: number;
  version_number: number;
  content: string;
  validation_annotations: string | null; // JSON string
  research_snapshot: string | null; // JSON string
  generation_prompt: string | null;
  created_at: string;
}

export interface ValidationMarker {
  id: number;
  prd_version_id: number;
  feature_name: string;
  marker_type: 'user_need_verification' | 'additional_research_needed' | 'unclear_problem_solution';
  description: string | null;
  section_context: string | null;
  created_at: string;
}

// Input Types (for creation)
export interface CreateUserInput {
  access_code: string;
}

export interface CreateProductInput {
  user_id: number;
  product_name?: string;
  one_liner: string;
  core_features: string;
  platforms: string[];
  tech_stack?: string;
  is_action_camp?: boolean;
}

export interface CreateResearchInput {
  product_id: number;
  research_content: string;
  sequence_number: number;
}

export interface CreatePRDVersionInput {
  product_id: number;
  version_number: number;
  content: string;
  validation_annotations?: Array<{
    feature_name: string;
    marker_type: 'user_need_verification' | 'additional_research_needed' | 'unclear_problem_solution';
    description: string;
    section_context: string;
  }>;
  research_snapshot?: number[];
  generation_prompt?: string;
}

export interface CreateValidationMarkerInput {
  prd_version_id: number;
  feature_name: string;
  marker_type: 'user_need_verification' | 'additional_research_needed' | 'unclear_problem_solution';
  description?: string;
  section_context?: string;
}
