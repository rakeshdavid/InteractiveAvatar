/**
 * Client-side validation for Prompt Form component
 * 
 * Provides validation rules and error messages for prompt form fields.
 * Mirrors server-side validation from app/lib/prompt-utils.ts
 */

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
  } else if (data.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Prompt name must be 100 characters or less'
    });
  }

  // Opening line validation (optional)
  if (data.openingLine && data.openingLine.length > 500) {
    errors.push({
      field: 'openingLine',
      message: 'Opening line must be 500 characters or less'
    });
  }

  // Custom prompt validation (optional)
  if (data.customPrompt && data.customPrompt.length > 2000) {
    errors.push({
      field: 'customPrompt',
      message: 'Custom instructions must be 2000 characters or less'
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