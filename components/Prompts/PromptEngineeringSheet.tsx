/**
 * PromptEngineeringSheet - Professional prompt editing interface
 * 
 * Features:
 * - Full-height side sheet for maximum working space
 * - Resizable panels for edit/preview split
 * - Enhanced textarea with auto-expand and better UX
 * - Increased character limits (5000+ chars)
 * - Live preview functionality
 * - Smart formatting and validation
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Eye, 
  Save, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import type { Prompt } from '@/app/types/prompt';

// Enhanced validation with industry-standard limits
// These limits match the backend validation in app/lib/prompt-utils.ts
const LIMITS = {
  name: 100,           // Adequate for typical prompt names (matches backend)
  openingLine: 1500,   // Allows comprehensive avatar introductions (matches backend) 
  customPrompt: 15000, // Enables professional use cases like therapy prompts (matches backend)
} as const;

export interface PromptEngineeringSheetProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: PromptFormData) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: Prompt;
  isSubmitting?: boolean;
}

export interface PromptFormData {
  name: string;
  openingLine: string;
  customPrompt: string;
}

export function PromptEngineeringSheet({
  trigger,
  isOpen,
  onOpenChange,
  onSubmit,
  mode,
  initialData,
  isSubmitting = false,
}: PromptEngineeringSheetProps) {
  const [formData, setFormData] = useState<PromptFormData>({
    name: '',
    openingLine: '',
    customPrompt: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewData, setPreviewData] = useState<PromptFormData>(formData);
  const [activeTab, setActiveTab] = useState('edit');

  // Initialize form data when sheet opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      const newFormData = mode === 'edit' && initialData ? {
        name: initialData.name,
        openingLine: initialData.openingLine || '',
        customPrompt: initialData.customPrompt || '',
      } : {
        name: '',
        openingLine: '',
        customPrompt: '',
      };
      
      setFormData(newFormData);
      setPreviewData(newFormData);
      setErrors({});
      setSubmitError('');
      setHasUnsavedChanges(false);
    }
  }, [isOpen, mode, initialData]);

  // Update preview data when form changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPreviewData(formData);
    }, 300); // Debounced live preview

    return () => clearTimeout(timeoutId);
  }, [formData]);

  const handleInputChange = useCallback((field: keyof PromptFormData, value: string) => {
    // Enforce character limits
    const limit = LIMITS[field];
    const truncatedValue = value.length > limit ? value.substring(0, limit) : value;
    
    setFormData(prev => ({
      ...prev,
      [field]: truncatedValue,
    }));
    
    // Clear field error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
    
    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
    
    // Visual feedback for character limit
    if (value.length > limit) {
      const inputElement = document.getElementById(field);
      if (inputElement) {
        inputElement.classList.add('animate-pulse');
        setTimeout(() => {
          inputElement.classList.remove('animate-pulse');
        }, 500);
      }
    }
  }, [errors, submitError]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Prompt name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Prompt name must be at least 3 characters';
    }
    
    if (formData.customPrompt && formData.customPrompt.length < 10) {
      newErrors.customPrompt = 'Custom instructions must be at least 10 characters if provided';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      setHasUnsavedChanges(false);
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
      onOpenChange?.(false);
    }
  };


  const resetForm = () => {
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
    setHasUnsavedChanges(false);
    setErrors({});
  };

  const getCharacterStatus = (field: keyof PromptFormData) => {
    const length = (formData[field] || '').length;
    const limit = LIMITS[field];
    const percentage = (length / limit) * 100;
    
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  const title = mode === 'create' ? 'Create New Prompt' : 'Edit Prompt';
  const submitText = mode === 'create' ? 'Create Prompt' : 'Update Prompt';

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <FileText className="w-4 h-4 mr-2" />
      {mode === 'create' ? 'New Prompt' : 'Edit'}
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-full sm:w-[90vw] md:w-[80vw] lg:w-[75vw] xl:w-[70vw] max-w-none p-0 flex flex-col"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#7559FF]" />
            {title}
            {hasUnsavedChanges && (
              <Badge variant="outline" className="ml-2 text-xs">
                Unsaved
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Professional prompt engineering workspace with live preview and enhanced editing capabilities.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-2 border-b border-zinc-700 bg-zinc-800/30">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="edit" className="flex-1 m-0 min-h-0">
              <form onSubmit={handleSubmit} className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Prompt Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2 text-white">
                        Prompt Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg bg-zinc-800 text-white placeholder-zinc-400 focus:ring-2 focus:ring-[#7559FF] focus:border-transparent transition-all ${
                          errors.name ? 'border-red-500 bg-red-900/20' : 'border-zinc-600'
                        }`}
                        placeholder="Enter a descriptive name for your prompt..."
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.name}
                        </p>
                      )}
                      <p className={`mt-1 text-xs ${
                        getCharacterStatus('name') === 'danger' ? 'text-red-400 font-bold' :
                        getCharacterStatus('name') === 'warning' ? 'text-yellow-400 font-medium' : 
                        'text-zinc-400'
                      }`}>
                        {formData.name.length}/{LIMITS.name} characters
                        {getCharacterStatus('name') === 'warning' && ' • Approaching limit'}
                        {getCharacterStatus('name') === 'danger' && ' • Limit reached'}
                      </p>
                    </div>

                    {/* Opening Line */}
                    <div>
                      <label htmlFor="openingLine" className="block text-sm font-medium mb-2 text-white">
                        Opening Line
                      </label>
                      <textarea
                        id="openingLine"
                        value={formData.openingLine}
                        onChange={(e) => handleInputChange('openingLine', e.target.value)}
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-lg bg-zinc-800 text-white placeholder-zinc-400 focus:ring-2 focus:ring-[#7559FF] focus:border-transparent resize-y transition-all ${
                          errors.openingLine ? 'border-red-500 bg-red-900/20' : 'border-zinc-600'
                        }`}
                        placeholder="How would you like the avatar to start conversations?"
                        disabled={isSubmitting}
                      />
                      {errors.openingLine && (
                        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.openingLine}
                        </p>
                      )}
                      <p className={`mt-1 text-xs ${
                        getCharacterStatus('openingLine') === 'danger' ? 'text-red-400 font-bold' :
                        getCharacterStatus('openingLine') === 'warning' ? 'text-yellow-400 font-medium' : 
                        'text-zinc-400'
                      }`}>
                        {formData.openingLine.length}/{LIMITS.openingLine} characters
                      </p>
                    </div>

                    {/* Custom Instructions - Enhanced */}
                    <div className="flex-1 min-h-0 flex flex-col">
                      <label htmlFor="customPrompt" className="block text-sm font-medium mb-2 text-white">
                        Custom Instructions
                      </label>
                      

                      <textarea
                        id="customPrompt"
                        value={formData.customPrompt}
                        onChange={(e) => handleInputChange('customPrompt', e.target.value)}
                        className={`flex-1 min-h-[300px] w-full px-4 py-3 border rounded-lg bg-zinc-800 text-white placeholder-zinc-400 focus:ring-2 focus:ring-[#7559FF] focus:border-transparent resize-none transition-all font-mono text-sm leading-relaxed ${
                          errors.customPrompt ? 'border-red-500 bg-red-900/20' : 'border-zinc-600'
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
                        disabled={isSubmitting}
                      />
                      {errors.customPrompt && (
                        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.customPrompt}
                        </p>
                      )}
                      <p className={`mt-1 text-xs ${
                        getCharacterStatus('customPrompt') === 'danger' ? 'text-red-400 font-bold' :
                        getCharacterStatus('customPrompt') === 'warning' ? 'text-yellow-400 font-medium' : 
                        'text-zinc-400'
                      }`}>
                        {formData.customPrompt.length}/{LIMITS.customPrompt} characters
                        {getCharacterStatus('customPrompt') === 'warning' && ' • Approaching limit'}
                        {getCharacterStatus('customPrompt') === 'danger' && ' • Limit reached'}
                      </p>
                    </div>
                  </div>

                  {/* Submit Error */}
                  {submitError && (
                    <div className="px-6 pb-4">
                      <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                        <p className="text-sm text-red-200 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {submitError}
                        </p>
                      </div>
                    </div>
                  )}
                </form>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 m-0 min-h-0">
            <div className="h-full p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2 text-white">{previewData.name || 'Untitled Prompt'}</h2>
                  <Badge variant="secondary" className="text-zinc-300 border-zinc-600">Preview Mode</Badge>
                </div>

                {previewData.openingLine && (
                  <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                    <h3 className="font-medium text-blue-200 mb-2">Opening Line</h3>
                    <p className="text-blue-100 italic">"{previewData.openingLine}"</p>
                  </div>
                )}

                {previewData.customPrompt && (
                  <div className="p-4 bg-zinc-800/60 border border-zinc-700 rounded-lg">
                    <h3 className="font-medium mb-3 text-white">Custom Instructions</h3>
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-zinc-200">
                        {previewData.customPrompt}
                      </pre>
                    </div>
                  </div>
                )}

                {!previewData.name && !previewData.openingLine && !previewData.customPrompt && (
                  <div className="text-center py-12 text-zinc-400">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start editing your prompt to see a preview here</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="px-6 py-4 border-t border-zinc-700 bg-zinc-900">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-zinc-400">
              {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(errors).length > 0}
                className="bg-[#7559FF] hover:bg-[#6147DD]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {submitText}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}