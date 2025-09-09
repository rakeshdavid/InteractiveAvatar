/**
 * Centralized error messages for Maslow AI
 * 
 * This file contains all user-facing error messages to ensure consistent
 * branding and make future rebranding easier. All messages use "Maslow AI"
 * or generic service terminology instead of backend provider names.
 */

export const ERROR_MESSAGES = {
  // Network and connectivity errors
  NETWORK_ERROR: "Network error connecting to Maslow AI service",
  CONNECTION_FAILED: "Connection failed. Please check your network and try again.",
  SERVICE_UNAVAILABLE: "Maslow AI service is temporarily unavailable. Please try again later.",
  REQUEST_TIMEOUT: "Request timed out. Please try again.",

  // Authentication and authorization errors  
  INVALID_API_KEY: "Invalid API key",
  API_CONFIG_ERROR: "API configuration error",
  AUTH_FAILED: "Authentication failed. Please verify your Maslow AI API key is valid and active.",
  ACCESS_DENIED: "Access denied. Your API key may not have permission to manage prompts.",
  API_KEY_MISSING: "Maslow AI API key is missing or invalid. Please check your configuration.",

  // Prompt-specific errors
  FETCH_PROMPTS_FAILED: "Failed to fetch prompts from Maslow AI",
  CREATE_PROMPT_FAILED: "Failed to create prompt",
  UPDATE_PROMPT_FAILED: "Failed to update prompt", 
  PROMPT_NOT_FOUND: "Prompt not found",
  INVALID_PROMPT_DATA: "Invalid prompt data provided",

  // Validation errors
  PROMPT_NAME_REQUIRED: "Prompt name is required",
  NO_VALID_FIELDS: "No valid fields provided for update",
  VALIDATION_ERROR: "Validation errors",

  // Generic server errors
  INTERNAL_SERVER_ERROR: "Internal server error",
  INVALID_JSON: "Invalid JSON in request body",
  ENDPOINT_NOT_FOUND: "Endpoint not found",

  // UI-specific messages
  SYNC_IN_PROGRESS: "Updating Maslow AI with latest changes...",
  AUTH_SERVER_ERROR: "Failed to authenticate with Maslow AI servers. This may affect all prompt operations until resolved.",
} as const;

/**
 * HTTP status code to error message mapping
 * Provides consistent error messages based on HTTP status codes
 */
export const STATUS_ERROR_MAP = {
  400: "Invalid request data. Please check your input and try again.",
  401: ERROR_MESSAGES.AUTH_FAILED,
  403: ERROR_MESSAGES.ACCESS_DENIED,
  404: ERROR_MESSAGES.PROMPT_NOT_FOUND,
  429: "Too many requests. Please wait a moment before trying again.",
  500: "Server error occurred. Please try again in a few minutes.",
  502: ERROR_MESSAGES.SERVICE_UNAVAILABLE,
  503: ERROR_MESSAGES.SERVICE_UNAVAILABLE,
  504: ERROR_MESSAGES.REQUEST_TIMEOUT,
} as const;

/**
 * Helper function to get user-friendly error message from HTTP status
 */
export function getErrorMessageForStatus(status: number): string {
  return STATUS_ERROR_MAP[status as keyof typeof STATUS_ERROR_MAP] || 
    `Server error (${status}). Please try again or contact support.`;
}

/**
 * Helper function to determine if an error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && 
    error.message.includes('fetch') &&
    (error.message.includes('network') || error.message.includes('connection'));
}

/**
 * Helper function to get appropriate network error message
 */
export function getNetworkErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();
  
  if (message.includes('network')) {
    return "Network error. Please check your internet connection and try again.";
  } else if (message.includes('cors')) {
    return "Connection blocked. Please refresh the page and try again.";
  } else {
    return ERROR_MESSAGES.CONNECTION_FAILED;
  }
}