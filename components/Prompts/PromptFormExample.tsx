/**
 * Example usage of PromptForm component
 * 
 * This file demonstrates how to integrate the PromptForm with API calls
 * and provides patterns for create/edit functionality.
 */

'use client';

import React, { useState } from 'react';
import { PromptForm } from './PromptForm';
import type { PromptFormData } from './validation';
import type { Prompt } from '@/app/types/prompt';

export function PromptFormExample() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>();

  // Example create handler
  const handleCreate = async (data: PromptFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/prompts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create prompt');
      }

      // Success - close modal and refresh data
      setIsCreateModalOpen(false);
      // You would typically refresh your prompts list here
      console.log('Prompt created successfully');
    } catch (error) {
      console.error('Create error:', error);
      throw error; // Re-throw to show error in form
    } finally {
      setIsSubmitting(false);
    }
  };

  // Example edit handler
  const handleEdit = async (data: PromptFormData) => {
    if (!editingPrompt) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/prompts/update/${editingPrompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update prompt');
      }

      // Success - close modal and refresh data
      setIsEditModalOpen(false);
      setEditingPrompt(undefined);
      // You would typically refresh your prompts list here
      console.log('Prompt updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      throw error; // Re-throw to show error in form
    } finally {
      setIsSubmitting(false);
    }
  };

  // Example function to open edit modal
  const openEditModal = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Example buttons to trigger modals */}
      <div className="space-x-2">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-[#7559FF] text-white rounded-md hover:bg-[#6147DD]"
        >
          Create New Prompt
        </button>
        <button
          onClick={() => openEditModal({
            id: 'example-id',
            name: 'Example Prompt',
            openingLine: 'Hello! How can I help you?',
            customPrompt: 'You are a helpful assistant.',
          })}
          className="px-4 py-2 bg-zinc-600 text-white rounded-md hover:bg-zinc-700"
        >
          Edit Example Prompt
        </button>
      </div>

      {/* Create Modal */}
      <PromptForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        mode="create"
        isSubmitting={isSubmitting}
      />

      {/* Edit Modal */}
      <PromptForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPrompt(undefined);
        }}
        onSubmit={handleEdit}
        mode="edit"
        initialData={editingPrompt}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}