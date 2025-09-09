/**
 * Client-side validation for Prompt Form component
 * 
 * Provides validation rules and error messages for prompt form fields.
 * Mirrors server-side validation from app/lib/prompt-utils.ts
 */

/**
 * Content length limits - must match backend validation in app/lib/prompt-utils.ts
 * These limits were determined through direct HeyGen API testing and industry standards
 */
const CONTENT_LIMITS = {
  name: 100,           // Adequate for typical prompt names
  openingLine: 1500,   // Allows comprehensive avatar introductions (up from 500)
  customPrompt: 15000, // Enables professional use cases like therapy prompts (up from 2000)
} as const;

export interface ValidationError {
  field: string;
  message: string;
}

export interface PromptFormData {
  name: string;
  openingLine?: string;
  customPrompt?: string;
}

/**
 * Validate prompt form data and return array of validation errors
 */
export function validatePromptForm(data: PromptFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Name validation (required)
  if (!data.name || data.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Prompt name is required'
    });
  } else if (data.name.length > CONTENT_LIMITS.name) {
    errors.push({
      field: 'name',
      message: `Prompt name must be ${CONTENT_LIMITS.name} characters or less`
    });
  }

  // Opening line validation (optional)
  if (data.openingLine && data.openingLine.length > CONTENT_LIMITS.openingLine) {
    errors.push({
      field: 'openingLine',
      message: `Opening line must be ${CONTENT_LIMITS.openingLine.toLocaleString()} characters or less`
    });
  }

  // Custom prompt validation (optional)
  if (data.customPrompt && data.customPrompt.length > CONTENT_LIMITS.customPrompt) {
    errors.push({
      field: 'customPrompt',
      message: `Custom instructions must be ${CONTENT_LIMITS.customPrompt.toLocaleString()} characters or less`
    });
  }

  return errors;
}

/**
 * Get validation error for a specific field
 */
export function getFieldError(errors: ValidationError[], fieldName: string): string | undefined {
  const error = errors.find(err => err.field === fieldName);
  return error?.message;
}

/**
 * Check if form has any validation errors
 */
export function hasValidationErrors(errors: ValidationError[]): boolean {
  return errors.length > 0;
}