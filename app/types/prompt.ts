/**
 * TypeScript type definitions for HeyGen Prompts Management
 * 
 * Frontend uses "Prompt" terminology, backend/API uses "knowledge_base"
 * as per HeyGen API naming conventions.
 */

// Frontend/UI Types (use "Prompt" naming)
export interface Prompt {
  id: string;
  name: string;
  description?: string;
  openingLine?: string;
  customPrompt?: string;
}

// API Request Types for Create Operations (matches actual HeyGen API)
export interface CreatePromptRequest {
  name: string;
  opening?: string;
  prompt?: string;
}

// API Request Types for Update Operations (matches actual HeyGen API)
export interface UpdatePromptRequest {
  name?: string;
  opening?: string;
  prompt?: string;
}

// HeyGen API Response Types (actual format from API)
export interface KnowledgeBaseAPIResponse {
  id: string;
  name: string;
  description?: string;
  opening?: string;
  prompt?: string;
  links?: string[];
  meta_data?: any;
  created_ts?: string;
  updated_ts?: string;
}

export interface HeyGenListAPIResponse {
  code: number;
  data: {
    list: KnowledgeBaseAPIResponse[];
  };
  msg?: string;
  message?: string;
}

// HeyGen Create API returns empty object on success
export interface HeyGenCreateAPIResponse {}

export interface HeyGenUpdateAPIResponse {
  data: {
    knowledge_base_id: string;
    name: string;
    description?: string;
    opening_line?: string;
    custom_prompt?: string;
  };
}

// API Error Response Types
export interface APIErrorResponse {
  error: string;
}

// Standard API Response Wrapper
export interface PromptsListResponse {
  prompts: Prompt[];
}

export interface PromptCreateResponse {
  prompt: Prompt;
}

export interface PromptUpdateResponse {
  prompt: Prompt;
}