/**
 * PromptForm component for creating and editing prompts
 * 
 * Supports both create and edit modes with proper validation,
 * modal integration, and API connectivity.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui';
import type { Prompt } from '@/app/types/prompt';
import { validatePromptForm, getFieldError, hasValidationErrors, type PromptFormData, type ValidationError } from './validation';

export interface PromptFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PromptFormData) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: Prompt;
  isSubmitting?: boolean;
}

export function PromptForm({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  isSubmitting = false,
}: PromptFormProps) {
  const [formData, setFormData] = useState<PromptFormData>({
    name: '',
    openingLine: '',
    customPrompt: '',
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string>('');

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({
          name: initialData.name,
          openingLine: initialData.openingLine || '',
          customPrompt: initialData.customPrompt || '',
        });
      } else {
        setFormData({
          name: '',
          openingLine: '',
          customPrompt: '',
        });
      }
      setErrors([]);
      setSubmitError('');
    }
  }, [isOpen, mode, initialData]);

  const handleInputChange = (field: keyof PromptFormData, value: string) => {
    // Enforce character limits in real-time
    let truncatedValue = value;
    const limits = {
      name: 100,
      openingLine: 500,
      customPrompt: 2000,
    };
    
    if (value.length > limits[field]) {
      truncatedValue = value.substring(0, limits[field]);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: truncatedValue,
    }));
    
    // Clear field-specific error when user starts typing
    if (getFieldError(errors, field)) {
      setErrors(prev => prev.filter(error => error.field !== field));
    }
    
    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
    
    // Show warning if user tried to exceed limit
    if (value.length > limits[field]) {
      // Brief visual feedback that the limit was reached
      const inputElement = document.getElementById(field);
      if (inputElement) {
        inputElement.classList.add('animate-pulse');
        setTimeout(() => {
          inputElement.classList.remove('animate-pulse');
        }, 500);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validatePromptForm(formData);
    setErrors(validationErrors);
    
    if (hasValidationErrors(validationErrors)) {
      return;
    }

    try {
      await onSubmit(formData);
      // Form will be closed by parent component on success
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred. Please try again.'
      );
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const title = mode === 'create' ? 'Create New Prompt' : 'Edit Prompt';
  const submitText = mode === 'create' ? 'Create Prompt' : 'Update Prompt';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">
            {title}
          </h2>
          <p className="mt-2 text-sm text-zinc-300">
            {mode === 'create' 
              ? 'Create a new prompt with custom instructions for your avatar.'
              : 'Update the prompt details and instructions.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prompt Name Field */}
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-white mb-2"
            >
              Prompt Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#7559FF] focus:border-[#7559FF] bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400 min-h-[44px] touch-manipulation transition-all duration-200 ${
                getFieldError(errors, 'name') 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-900/20' 
                  : 'border-zinc-600 focus:border-[#7559FF] hover:border-zinc-500'
              }`}
              placeholder="Enter prompt name..."
              maxLength={100}
              disabled={isSubmitting}
            />
            {getFieldError(errors, 'name') && (
              <p className="mt-1 text-sm text-red-400 font-medium">
                {getFieldError(errors, 'name')}
              </p>
            )}
            <p className={`mt-1 text-xs ${
              formData.name.length > 90 ? 'text-yellow-400 font-medium' : 
              formData.name.length === 100 ? 'text-red-400 font-bold' : 
              'text-zinc-400'
            }`}>
              {formData.name.length}/100 characters
              {formData.name.length > 90 && formData.name.length < 100 && (
                <span className="ml-2 text-yellow-300">• Approaching limit</span>
              )}
              {formData.name.length === 100 && (
                <span className="ml-2 text-red-300">• Character limit reached</span>
              )}
            </p>
          </div>

          {/* Opening Line Field */}
          <div>
            <label 
              htmlFor="openingLine" 
              className="block text-sm font-medium text-white mb-2"
            >
              Opening Line
            </label>
            <textarea
              id="openingLine"
              value={formData.openingLine}
              onChange={(e) => handleInputChange('openingLine', e.target.value)}
              rows={6}
              className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#7559FF] focus:border-[#7559FF] bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400 resize-vertical touch-manipulation transition-all duration-200 ${
                getFieldError(errors, 'openingLine') 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-900/20' 
                  : 'border-zinc-600 focus:border-[#7559FF] hover:border-zinc-500'
              }`}
              placeholder="Enter opening line for conversations..."
              maxLength={500}
              disabled={isSubmitting}
            />
            {getFieldError(errors, 'openingLine') && (
              <p className="mt-1 text-sm text-red-400 font-medium">
                {getFieldError(errors, 'openingLine')}
              </p>
            )}
            <p className={`mt-1 text-xs ${
              (formData.openingLine || '').length > 450 ? 'text-yellow-400 font-medium' : 
              (formData.openingLine || '').length === 500 ? 'text-red-400 font-bold' : 
              'text-zinc-400'
            }`}>
              {(formData.openingLine || '').length}/500 characters
              {(formData.openingLine || '').length > 450 && (formData.openingLine || '').length < 500 && (
                <span className="ml-2 text-yellow-300">• Approaching limit</span>
              )}
              {(formData.openingLine || '').length === 500 && (
                <span className="ml-2 text-red-300">• Character limit reached</span>
              )}
            </p>
          </div>

          {/* Custom Instructions Field */}
          <div>
            <label 
              htmlFor="customPrompt" 
              className="block text-sm font-medium text-white mb-2"
            >
              Custom Instructions
            </label>
            <textarea
              id="customPrompt"
              value={formData.customPrompt}
              onChange={(e) => handleInputChange('customPrompt', e.target.value)}
              rows={12}
              className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#7559FF] focus:border-[#7559FF] bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400 resize-vertical touch-manipulation transition-all duration-200 ${
                getFieldError(errors, 'customPrompt') 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-900/20' 
                  : 'border-zinc-600 focus:border-[#7559FF] hover:border-zinc-500'
              }`}
              placeholder={`PERSONA:

Every time that you respond to user input, you must adopt the following persona:

____

[ Please provide a Persona for the Interactive Avatar. What is its name? What is its personality or background? ]
____

KNOWLEDGE BASE:

Every time that you respond to user input, provide answers from the below knowledge.
Always prioritize this knowledge when replying to users:

_____

[Provide any Knowledge that you would like your Interactive Avatar to have at its disposal. This can be a set of facts, or answers to frequently-asked questions, for example.]

_____

INSTRUCTIONS:

You must obey the following instructions when replying to users:

_____

[Provide any instructions for how the Interactive Avatar should act in its conversations with users. Should it limit all conversation to only certain subjects, for example, the knowledge you have]
_____`}
              maxLength={2000}
              disabled={isSubmitting}
            />
            {getFieldError(errors, 'customPrompt') && (
              <p className="mt-1 text-sm text-red-400 font-medium">
                {getFieldError(errors, 'customPrompt')}
              </p>
            )}
            <p className={`mt-1 text-xs ${
              (formData.customPrompt || '').length > 1800 ? 'text-yellow-400 font-medium' : 
              (formData.customPrompt || '').length === 2000 ? 'text-red-400 font-bold' : 
              'text-zinc-400'
            }`}>
              {(formData.customPrompt || '').length}/2000 characters
              {(formData.customPrompt || '').length > 1800 && (formData.customPrompt || '').length < 2000 && (
                <span className="ml-2 text-yellow-300">• Approaching limit</span>
              )}
              {(formData.customPrompt || '').length === 2000 && (
                <span className="ml-2 text-red-300">• Character limit reached</span>
              )}
            </p>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
              <p className="text-sm text-red-200 font-medium">
                {submitError}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-600">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-sm font-medium text-zinc-200 bg-zinc-700 border border-zinc-600 rounded-lg hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-medium text-white bg-[#7559FF] border border-transparent rounded-lg hover:bg-[#6147DD] focus:outline-none focus:ring-2 focus:ring-[#7559FF] focus:ring-offset-2 focus:ring-offset-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </div>
              ) : (
                submitText
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}