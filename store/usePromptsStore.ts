/**
 * Zustand store for HeyGen prompts state management
 * 
 * Provides centralized state management, caching, and optimistic updates
 * for prompts across all components. Replaces the usePrompts hook while
 * maintaining the exact same interface for zero-breaking changes.
 * 
 * According to Byterover memory layer, this follows the established
 * error handling patterns and API integration from PRs 1-4.
 */

import React from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type {
  Prompt,
  PromptsListResponse,
  PromptCreateResponse,
  PromptUpdateResponse,
} from '@/app/types/prompt';

/**
 * Data structure for creating a new prompt
 */
export interface CreatePromptData {
  name: string;
  openingLine?: string;
  customPrompt?: string;
}

/**
 * Data structure for updating an existing prompt
 */
export interface UpdatePromptData {
  name?: string;
  openingLine?: string;
  customPrompt?: string;
}

/**
 * Store state interface
 */
interface PromptsStoreState {
  // Core state
  prompts: Prompt[];
  selectedPromptId: string;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;

  // Cache configuration
  cacheMaxAge: number; // 5 minutes in milliseconds
}

/**
 * Store actions interface
 */
interface PromptsStoreActions {
  // API operations
  fetchPrompts: () => Promise<void>;
  createPrompt: (data: CreatePromptData) => Promise<Prompt | null>;
  updatePrompt: (id: string, data: UpdatePromptData) => Promise<Prompt | null>;
  
  // UI helpers (same as usePrompts hook)
  refreshPrompts: () => Promise<void>;
  getPromptById: (id: string) => Prompt | undefined;
  clearError: () => void;
  
  // Store-specific actions
  setSelectedPrompt: (id: string) => void;
  
  // Internal helpers
  _handleApiError: (error: unknown, defaultMessage: string) => void;
  _isCacheValid: () => boolean;
  _invalidateCache: () => void;
}

type PromptsStore = PromptsStoreState & PromptsStoreActions;

/**
 * Zustand store for prompts management
 * 
 * Features:
 * - 5-minute caching to reduce API calls
 * - Optimistic updates with rollback on failure
 * - Cross-component state synchronization
 * - Exact interface compatibility with usePrompts hook
 */
export const usePromptsStore = create<PromptsStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    prompts: [],
    selectedPromptId: '',
    loading: false,
    error: null,
    lastFetch: null,
    cacheMaxAge: 5 * 60 * 1000, // 5 minutes

    /**
     * Enhanced API error handling with context-aware messages
     * Based on Byterover memory layer error handling patterns
     */
    _handleApiError: (error: unknown, defaultMessage: string) => {
      console.error('Prompts Store API Error:', error);

      // Handle Response objects (fetch API errors)
      if (error instanceof Response) {
        switch (error.status) {
          case 400:
            set({ error: 'Invalid request data. Please check your input and try again.' });
            break;
          case 401:
            set({ error: 'Authentication failed. Please verify your HeyGen API key is valid and active.' });
            break;
          case 403:
            set({ error: 'Access denied. Your API key may not have permission to manage prompts.' });
            break;
          case 404:
            set({ error: 'Prompt not found. It may have been deleted or moved.' });
            break;
          case 429:
            set({ error: 'Too many requests. Please wait a moment before trying again.' });
            break;
          case 500:
            set({ error: 'Server error occurred. Please try again in a few minutes.' });
            break;
          case 502:
          case 503:
            set({ error: 'HeyGen service is temporarily unavailable. Please try again later.' });
            break;
          case 504:
            set({ error: 'Request timed out. Please check your connection and try again.' });
            break;
          default:
            set({ error: `Server error (${error.status}). Please try again or contact support.` });
        }
      } 
      // Handle network errors
      else if (error instanceof TypeError && error.message.includes('fetch')) {
        if (error.message.includes('network')) {
          set({ error: 'Network error. Please check your internet connection and try again.' });
        } else if (error.message.includes('CORS')) {
          set({ error: 'Connection blocked. Please refresh the page and try again.' });
        } else {
          set({ error: 'Connection failed. Please check your network and try again.' });
        }
      }
      // Handle timeout errors
      else if (error instanceof Error && error.name === 'AbortError') {
        set({ error: 'Request timed out. Please try again.' });
      }
      // Handle JSON parsing errors
      else if (error instanceof SyntaxError) {
        set({ error: 'Invalid response from server. Please try again.' });
      }
      // Handle API key missing
      else if (error instanceof Error && error.message.includes('API key')) {
        set({ error: 'HeyGen API key is missing or invalid. Please check your configuration.' });
      }
      // Handle quota/rate limiting
      else if (error instanceof Error && (error.message.includes('quota') || error.message.includes('limit'))) {
        set({ error: 'API usage limit reached. Please try again later or upgrade your plan.' });
      }
      // Handle generic errors
      else if (error instanceof Error) {
        // Check for common error patterns and provide helpful messages
        const message = error.message.toLowerCase();
        if (message.includes('timeout')) {
          set({ error: 'Request timed out. Please try again.' });
        } else if (message.includes('offline')) {
          set({ error: 'You appear to be offline. Please check your connection.' });
        } else if (message.includes('cors')) {
          set({ error: 'Security restriction encountered. Please refresh the page.' });
        } else {
          // Use the original error message but make it more user-friendly
          const userFriendlyMessage = error.message
            .replace(/^Error:\s*/, '') // Remove "Error: " prefix
            .replace(/\.$/, '') // Remove trailing period
            .toLowerCase();
          
          set({ error: `${userFriendlyMessage.charAt(0).toUpperCase()}${userFriendlyMessage.slice(1)}. Please try again.` });
        }
      } 
      // Fallback for unknown errors
      else {
        set({ error: defaultMessage || 'An unexpected error occurred. Please try again.' });
      }
    },

    /**
     * Check if cached data is still valid
     */
    _isCacheValid: () => {
      const { lastFetch, cacheMaxAge } = get();
      if (!lastFetch) return false;
      return Date.now() - lastFetch < cacheMaxAge;
    },

    /**
     * Invalidate cache by resetting lastFetch
     */
    _invalidateCache: () => {
      set({ lastFetch: null });
    },

    /**
     * Clear any existing error state
     */
    clearError: () => {
      set({ error: null });
    },

    /**
     * Set selected prompt ID (store-specific feature)
     */
    setSelectedPrompt: (id: string) => {
      set({ selectedPromptId: id });
    },

    /**
     * Fetch all prompts from the API with caching
     * Uses the completed List Prompts API from PR 1
     */
    fetchPrompts: async () => {
      // Check cache first
      const { _isCacheValid, prompts } = get();
      if (_isCacheValid() && prompts.length > 0) {
        console.log('Using cached prompts data');
        return;
      }

      set({ loading: true, error: null });

      try {
        const response = await fetch('/api/prompts/list', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw response;
        }

        const data: PromptsListResponse = await response.json();
        
        set({ 
          prompts: data.prompts,
          lastFetch: Date.now(),
          loading: false 
        });
      } catch (err) {
        const { _handleApiError } = get();
        _handleApiError(err, 'Failed to load prompts. Please try again.');
        set({ loading: false });
      }
    },

    /**
     * Create a new prompt with optimistic updates
     * Uses the completed Create Prompt API from PR 3
     */
    createPrompt: async (data: CreatePromptData): Promise<Prompt | null> => {
      set({ loading: true, error: null });

      try {
        const response = await fetch('/api/prompts/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw response;
        }

        const result: PromptCreateResponse = await response.json();

        // Optimistic update: add the new prompt to the list
        set((state) => ({
          prompts: [...state.prompts, result.prompt],
          loading: false,
        }));

        // Invalidate cache to ensure fresh data on next fetch
        get()._invalidateCache();

        return result.prompt;
      } catch (err) {
        const { _handleApiError } = get();
        _handleApiError(err, 'Failed to create prompt. Please try again.');
        set({ loading: false });
        return null;
      }
    },

    /**
     * Update an existing prompt with optimistic updates and rollback on failure
     * Uses the completed Update Prompt API from PR 4
     */
    updatePrompt: async (id: string, data: UpdatePromptData): Promise<Prompt | null> => {
      const { prompts } = get();
      
      // Store original prompt for potential rollback
      const originalPrompt = prompts.find((p) => p.id === id);
      if (!originalPrompt) {
        set({ error: 'Prompt not found', loading: false });
        return null;
      }

      set({ loading: true, error: null });

      // Optimistic update
      const optimisticPrompt: Prompt = {
        ...originalPrompt,
        ...data,
      };

      set((state) => ({
        prompts: state.prompts.map((p) => (p.id === id ? optimisticPrompt : p)),
      }));

      try {
        const response = await fetch(`/api/prompts/update/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          // Rollback on failure
          set((state) => ({
            prompts: state.prompts.map((p) => (p.id === id ? originalPrompt : p)),
          }));
          throw response;
        }

        const result: PromptUpdateResponse = await response.json();

        // Update with actual server response
        set((state) => ({
          prompts: state.prompts.map((p) => (p.id === id ? result.prompt : p)),
          loading: false,
        }));

        // Invalidate cache to ensure fresh data on next fetch
        get()._invalidateCache();

        return result.prompt;
      } catch (err) {
        const { _handleApiError } = get();
        _handleApiError(err, 'Failed to update prompt. Please try again.');
        set({ loading: false });
        return null;
      }
    },

    /**
     * Refresh the prompts list (alias for fetchPrompts with cache invalidation)
     * Useful for manual refresh after external changes
     */
    refreshPrompts: async () => {
      get()._invalidateCache();
      await get().fetchPrompts();
    },

    /**
     * Find a prompt by ID
     * Utility method for quick lookup (same as usePrompts hook)
     */
    getPromptById: (id: string): Prompt | undefined => {
      const { prompts } = get();
      return prompts.find((prompt) => prompt.id === id);
    },
  }))
);

/**
 * Hook interface that matches the original usePrompts hook exactly
 * 
 * This provides backward compatibility and zero-breaking changes
 * during migration from the original hook to the Zustand store.
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
export interface UsePromptsReturn {
  // State (exact same interface as original hook)
  prompts: Prompt[];
  loading: boolean;
  error: string | null;

  // Actions (exact same interface as original hook)
  fetchPrompts: () => Promise<void>;
  createPrompt: (data: CreatePromptData) => Promise<Prompt | null>;
  updatePrompt: (id: string, data: UpdatePromptData) => Promise<Prompt | null>;
  refreshPrompts: () => Promise<void>;
  getPromptById: (id: string) => Prompt | undefined;
  clearError: () => void;
}

/**
 * Hook wrapper around the Zustand store
 * 
 * Provides the exact same interface as the original usePrompts hook
 * to ensure zero-breaking changes during migration.
 */
export const usePrompts = (): UsePromptsReturn => {
  const prompts = usePromptsStore((state) => state.prompts);
  const loading = usePromptsStore((state) => state.loading);
  const error = usePromptsStore((state) => state.error);
  const fetchPrompts = usePromptsStore((state) => state.fetchPrompts);
  const createPrompt = usePromptsStore((state) => state.createPrompt);
  const updatePrompt = usePromptsStore((state) => state.updatePrompt);
  const refreshPrompts = usePromptsStore((state) => state.refreshPrompts);
  const getPromptById = usePromptsStore((state) => state.getPromptById);
  const clearError = usePromptsStore((state) => state.clearError);

  // Auto-fetch prompts on first use (same behavior as original hook)
  React.useEffect(() => {
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

// Export the store selectors for advanced usage (optional)
export const usePromptsSelectors = {
  prompts: (state: PromptsStore) => state.prompts,
  loading: (state: PromptsStore) => state.loading,
  error: (state: PromptsStore) => state.error,
  selectedPromptId: (state: PromptsStore) => state.selectedPromptId,
} as const;