// API Request and Response Types

// ===== Access Code API =====
export interface GenerateAccessCodeResponse {
  access_code: string;
  user_id: number;
}

export interface ValidateAccessCodeRequest {
  access_code: string;
}

export interface ValidateAccessCodeResponse {
  valid: boolean;
  user_id?: number;
}

// ===== Product API =====
export interface CreateProductRequest {
  access_code: string;
  product_name?: string;
  one_liner: string;
  core_features: string;
  platforms: string[];
  tech_stack?: string;
  is_action_camp?: boolean;
}

export interface CreateProductResponse {
  product_id: number;
}

export interface UpdateProductRequest {
  one_liner?: string;
  core_features?: string;
  platforms?: string[];
  tech_stack?: string;
}

export interface GetProductResponse {
  id: number;
  user_id: number;
  product_name: string | null;
  one_liner: string;
  core_features: string;
  platforms: string[];
  tech_stack: string | null;
  is_action_camp: number;
  created_at: string;
  updated_at: string;
  research_count?: number;
  prd_count?: number;
}

export interface ListProductsResponse {
  products: GetProductResponse[];
}

// ===== Research API =====
export interface AddResearchRequest {
  research_content: string;
}

export interface AddResearchResponse {
  research_id: number;
  sequence_number: number;
}

export interface ListResearchResponse {
  research: Array<{
    id: number;
    product_id: number;
    research_content: string;
    sequence_number: number;
    created_at: string;
  }>;
}

// ===== PRD API =====
export interface GeneratePRDRequest {
  product_id: number;
}

export interface GeneratePRDResponse {
  prd_version_id: number;
  version_number: number;
  content: string;
  validation_markers: Array<{
    feature_name: string;
    marker_type: 'user_need_verification' | 'additional_research_needed' | 'unclear_problem_solution';
    description: string;
    section_context: string;
  }>;
}

export interface IteratePRDRequest {
  product_id: number;
  new_insights: string;
}

export interface IteratePRDResponse {
  prd_version_id: number;
  version_number: number;
  content: string;
  validation_markers: Array<{
    feature_name: string;
    marker_type: 'user_need_verification' | 'additional_research_needed' | 'unclear_problem_solution';
    description: string;
    section_context: string;
  }>;
  change_summary: string;
}

export interface GetPRDVersionResponse {
  id: number;
  product_id: number;
  version_number: number;
  content: string;
  validation_markers: Array<{
    id: number;
    feature_name: string;
    marker_type: 'user_need_verification' | 'additional_research_needed' | 'unclear_problem_solution';
    description: string | null;
    section_context: string | null;
    created_at: string;
  }>;
  created_at: string;
}

// ===== Error Response =====
export interface ErrorResponse {
  error: string;
  details?: string;
}
