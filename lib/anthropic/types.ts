export interface ValidationMarkerOutput {
  feature_name: string;
  marker_type: 'user_need_verification' | 'additional_research_needed' | 'unclear_problem_solution';
  description: string;
  section_context: string;
}

export interface PRDGenerationOutput {
  prd_content: string;
  validation_markers: ValidationMarkerOutput[];
}

export interface PRDIterationOutput {
  prd_content: string;
  validation_markers: ValidationMarkerOutput[];
  change_summary: string;
}
