/**
 * Utility functions for HeyGen Prompts Management
 * 
 * Handles transformation between API formats and UI formats,
 * validation, and common prompt operations.
 */

import type {
  Prompt,
  KnowledgeBaseAPIResponse,
  CreatePromptRequest,
  UpdatePromptRequest,
} from "@/app/types/prompt";

/**
 * Transform HeyGen API knowledge_base response to frontend Prompt format
 * Maps API naming (id, opening, prompt) to UI naming (id, openingLine, customPrompt)
 */
export function transformKnowledgeBaseToPrompt(kb: KnowledgeBaseAPIResponse): Prompt {
  return {
    id: kb.id,
    name: kb.name,
    description: kb.description,
    openingLine: kb.opening,
    customPrompt: kb.prompt,
  };
}

/**
 * Transform frontend Prompt format to HeyGen API create request format
 * Maps UI naming (openingLine, customPrompt) to API naming (opening, prompt)
 */
export function transformPromptToCreateRequest(prompt: {
  name: string;
  openingLine?: string;
  customPrompt?: string;
}): CreatePromptRequest {
  return {
    name: prompt.name,
    opening: prompt.openingLine,
    prompt: prompt.customPrompt,
  };
}

/**
 * Transform frontend Prompt format to HeyGen API update request format
 * Maps UI naming (openingLine, customPrompt) to API naming (opening, prompt)
 * Only includes fields that are being updated (partial update support)
 */
export function transformPromptToUpdateRequest(prompt: {
  name?: string;
  openingLine?: string;
  customPrompt?: string;
}): UpdatePromptRequest {
  const updateRequest: UpdatePromptRequest = {};
  
  if (prompt.name !== undefined) updateRequest.name = prompt.name;
  if (prompt.openingLine !== undefined) updateRequest.opening = prompt.openingLine;
  if (prompt.customPrompt !== undefined) updateRequest.prompt = prompt.customPrompt;
  
  return updateRequest;
}

/**
 * Validate prompt data before creating/updating
 * Returns array of validation error messages, empty array if valid
 */
export function validatePromptData(prompt: {
  name?: string;
  openingLine?: string;
  customPrompt?: string;
}): string[] {
  const errors: string[] = [];
  
  // Name is required for create operations
  if (prompt.name !== undefined && prompt.name.trim().length === 0) {
    errors.push("Prompt name cannot be empty");
  }
  
  // Check maximum lengths (based on typical API limits)
  if (prompt.name && prompt.name.length > 100) {
    errors.push("Prompt name must be 100 characters or less");
  }
  
  if (prompt.openingLine && prompt.openingLine.length > 500) {
    errors.push("Opening line must be 500 characters or less");
  }
  
  if (prompt.customPrompt && prompt.customPrompt.length > 2000) {
    errors.push("Custom instructions must be 2000 characters or less");
  }
  
  return errors;
}

/**
 * Check if a prompt update request has any fields to update
 * Useful to prevent empty update API calls
 */
export function hasUpdates(updates: UpdatePromptRequest): boolean {
  return Object.keys(updates).length > 0;
}

/**
 * Create standardized error responses for API routes
 */
export function createErrorResponse(message: string, status: number): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    },
  );
}

/**
 * Create standardized success responses for API routes
 */
export function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=60", // Cache for 1 minute
      },
    },
  );
}