/**
 * Custom React hook for managing HeyGen prompts/knowledge bases
 *
 * Provides comprehensive CRUD operations for prompts with proper state management,
 * error handling, and integration with the HeyGen API infrastructure.
 *
 * According to Byterover memory layer, this follows existing project patterns
 * and integrates with the completed API endpoints from PRs 1-4.
 */

import { useCallback, useEffect, useState } from "react";

import type {
  Prompt,
  PromptsListResponse,
  PromptCreateResponse,
  PromptUpdateResponse,
} from "@/app/types/prompt";

/**
 * Data structure for creating a new prompt
 */
export interface CreatePromptData {
  name: string;
  openingLine?: string;
  customPrompt?: string;
}

/**
 * Data structure for updating an existing prompt (all fields optional)
 */
export interface UpdatePromptData {
  name?: string;
  openingLine?: string;
  customPrompt?: string;
}

/**
 * Return type for the usePrompts hook
 */
export interface UsePromptsReturn {
  // State
  prompts: Prompt[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchPrompts: () => Promise<void>;
  createPrompt: (data: CreatePromptData) => Promise<Prompt | null>;
  updatePrompt: (id: string, data: UpdatePromptData) => Promise<Prompt | null>;
  refreshPrompts: () => Promise<void>;
  getPromptById: (id: string) => Prompt | undefined;
  clearError: () => void;
}

/**
 * Custom hook for prompts management
 *
 * @returns Object containing prompts state and management methods
 *
 * @example
 * ```typescript
 * const { prompts, loading, createPrompt } = usePrompts();
 *
 * // Create a new prompt
 * const newPrompt = await createPrompt({
 *   name: "Assistant",
 *   openingLine: "Hello! How can I help you today?",
 *   customPrompt: "You are a helpful assistant..."
 * });
 * ```
 */
export const usePrompts = (): UsePromptsReturn => {
  // State management
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clear any existing error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle API errors with user-friendly messages
   * Based on Byterover memory layer error handling patterns
   */
  const handleApiError = useCallback(
    (error: unknown, defaultMessage: string) => {
      console.error("Prompts API Error:", error);

      if (error instanceof Response) {
        switch (error.status) {
          case 401:
            setError("Authentication failed. Please check your API key.");
            break;
          case 404:
            setError("Prompt not found.");
            break;
          case 503:
            setError(
              "Service temporarily unavailable. Please try again later.",
            );
            break;
          default:
            setError(`Server error (${error.status}). Please try again.`);
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(defaultMessage);
      }
    },
    [],
  );

  /**
   * Fetch all prompts from the API
   * Uses the completed List Prompts API from PR 1
   */
  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/prompts/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw response;
      }

      const data: PromptsListResponse = await response.json();
      setPrompts(data.prompts);
    } catch (err) {
      handleApiError(err, "Failed to load prompts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  /**
   * Create a new prompt with optimistic updates
   * Uses the completed Create Prompt API from PR 3
   */
  const createPrompt = useCallback(
    async (data: CreatePromptData): Promise<Prompt | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/prompts/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw response;
        }

        const result: PromptCreateResponse = await response.json();

        // Optimistic update: add the new prompt to the list
        setPrompts((prev) => [...prev, result.prompt]);

        return result.prompt;
      } catch (err) {
        handleApiError(err, "Failed to create prompt. Please try again.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleApiError],
  );

  /**
   * Update an existing prompt with optimistic updates and rollback on failure
   * Uses the completed Update Prompt API from PR 4
   */
  const updatePrompt = useCallback(
    async (id: string, data: UpdatePromptData): Promise<Prompt | null> => {
      setLoading(true);
      setError(null);

      // Store original prompt for potential rollback
      const originalPrompt = prompts.find((p) => p.id === id);
      if (!originalPrompt) {
        setError("Prompt not found");
        setLoading(false);
        return null;
      }

      // Optimistic update
      const optimisticPrompt: Prompt = {
        ...originalPrompt,
        ...data,
      };

      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? optimisticPrompt : p)),
      );

      try {
        const response = await fetch(`/api/prompts/update/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          // Rollback on failure
          setPrompts((prev) =>
            prev.map((p) => (p.id === id ? originalPrompt : p)),
          );
          throw response;
        }

        const result: PromptUpdateResponse = await response.json();

        // Update with actual server response
        setPrompts((prev) =>
          prev.map((p) => (p.id === id ? result.prompt : p)),
        );

        return result.prompt;
      } catch (err) {
        handleApiError(err, "Failed to update prompt. Please try again.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [prompts, handleApiError],
  );

  /**
   * Refresh the prompts list (alias for fetchPrompts)
   * Useful for manual refresh after external changes
   */
  const refreshPrompts = useCallback(async () => {
    await fetchPrompts();
  }, [fetchPrompts]);

  /**
   * Find a prompt by ID
   * Utility method for quick lookup
   */
  const getPromptById = useCallback(
    (id: string): Prompt | undefined => {
      return prompts.find((prompt) => prompt.id === id);
    },
    [prompts],
  );

  // Auto-fetch prompts on mount
  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return {
    // State
    prompts,
    loading,
    error,

    // Actions
    fetchPrompts,
    createPrompt,
    updatePrompt,
    refreshPrompts,
    getPromptById,
    clearError,
  };
};
