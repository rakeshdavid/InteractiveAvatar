/**
 * PromptsList component for displaying and managing prompts
 * 
 * Main container component that uses the usePrompts hook from PR 5
 * and displays prompts in a vertical table layout for better organization.
 * Updated from card grid to table format for improved UX.
 */

import React, { useEffect, useState } from 'react';
import { usePromptToasts } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePrompts } from '@/store/usePromptsStore';
import type { Prompt } from '@/app/types/prompt';

export interface PromptsListProps {
  onEdit?: (prompt: Prompt) => void;
  onCreateNew?: () => void;
  onDuplicate?: (prompt: Prompt) => void;
  showActions?: boolean;
  className?: string;
  hideNewPromptButton?: boolean;
}


export function PromptsList({ 
  onEdit, 
  onCreateNew,
  onDuplicate,
  showActions = true,
  className = "",
  hideNewPromptButton = false
}: PromptsListProps) {
  const { 
    prompts, 
    loading, 
    error, 
    fetchPrompts, 
    clearError,
    createPrompt,
    updatePrompt,
  } = usePrompts();
  
  const { promptError, promptCreated, promptUpdated } = usePromptToasts();

  
  // Show recently used state
  const [showRecentlyUsed, setShowRecentlyUsed] = React.useState(true);

  // Fetch prompts on mount
  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      promptError(error);
      clearError();
    }
  }, [error, promptError, clearError]);

  const handleEdit = (prompt: Prompt) => {
    // Call the original callback - PromptsManager will handle the sheet
    onEdit?.(prompt);
  };

  const handleCreateNew = () => {
    // Call the original callback - PromptsManager will handle the sheet  
    onCreateNew?.();
  };


  // Helper function to determine prompt category and badge
  const getPromptCategory = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('sales') || lowerName.includes('sell') || lowerName.includes('pitch')) return 'sales';
    if (lowerName.includes('support') || lowerName.includes('help') || lowerName.includes('service')) return 'support';
    if (lowerName.includes('demo') || lowerName.includes('presentation') || lowerName.includes('show')) return 'demo';
    return 'custom';
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'sales':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Sales</Badge>;
      case 'support':
        return <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">Support</Badge>;
      case 'demo':
        return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">Demo</Badge>;
      default:
        return <Badge variant="secondary">Custom</Badge>;
    }
  };

  // Sort prompts alphabetically by name
  const sortedPrompts = React.useMemo(() => {
    return [...prompts].sort((a, b) => a.name.localeCompare(b.name));
  }, [prompts]);

  // Get popular/recent prompts for sales teams (simulate with first few prompts)
  const getPopularPrompts = React.useMemo(() => {
    return prompts.slice(0, 3).filter(prompt => {
      const name = prompt.name.toLowerCase();
      return name.includes('sales') || name.includes('demo') || name.includes('support');
    });
  }, [prompts]);

  // Loading state
  if (loading && prompts.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Prompts
          </h2>
          {onCreateNew && !hideNewPromptButton && (
            <Button
              onClick={handleCreateNew}
              disabled={loading}
              className="bg-[#7559FF] hover:bg-[#6347FF]"
              aria-label="Create new prompt"
            >
              New Prompt
            </Button>
          )}
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="animate-pulse">
                  <TableCell>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-6 bg-muted rounded-full w-16"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 bg-muted rounded w-16 ml-auto"></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Empty state - no prompts at all
  if (!loading && prompts.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Prompts
          </h2>
          {onCreateNew && !hideNewPromptButton && (
            <Button
              onClick={handleCreateNew}
              className="bg-[#7559FF] hover:bg-[#6347FF]"
              aria-label="Create new prompt"
            >
              New Prompt
            </Button>
          )}
        </div>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No prompts yet
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Get started by creating your first prompt to customize your avatar's responses.
          </p>
          <div className="bg-zinc-800/30 rounded-lg p-4 mb-6 max-w-lg mx-auto">
            <p className="text-sm text-foreground mb-2 font-medium">💡 Pro Tips for Sales Teams:</p>
            <ul className="text-xs text-muted-foreground space-y-1 text-left">
              <li>• Create different prompts for sales, support, and demo scenarios</li>
              <li>• Use opening lines to set the conversation tone</li>
              <li>• Test prompts with different avatar personalities</li>
              <li>• Use the duplicate feature to A/B test variations</li>
            </ul>
          </div>
          {onCreateNew && !hideNewPromptButton && (
            <Button
              onClick={handleCreateNew}
              className="bg-[#7559FF] hover:bg-[#6347FF]"
              size="lg"
            >
              Create Your First Prompt
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Prompts list
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-foreground">
          Prompts
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({sortedPrompts.length})
          </span>
        </h2>
        {onCreateNew && !hideNewPromptButton && (
          <Button
            onClick={handleCreateNew}
            disabled={loading}
            className="bg-[#7559FF] hover:bg-[#6147FF]"
            aria-label="Create new prompt"
          >
            {loading ? 'Loading...' : 'New Prompt'}
          </Button>
        )}
      </div>

      {/* Quick Start for Sales Teams */}
      {getPopularPrompts.length > 0 && showRecentlyUsed && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-700/30 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-blue-200 flex items-center gap-2">
              ⚡ Quick Start
            </h3>
            <Button
              onClick={() => setShowRecentlyUsed(false)}
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-300 h-auto p-1"
            >
              Hide
            </Button>
          </div>
          <p className="text-blue-300/70 text-sm mb-4">Popular prompts for sales teams</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {getPopularPrompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => onEdit?.(prompt)}
                className="text-left p-3 bg-blue-900/30 hover:bg-blue-800/40 rounded-lg border border-blue-700/30 transition-colors group"
              >
                <h4 className="text-blue-100 font-medium text-sm group-hover:text-white">
                  {prompt.name}
                </h4>
                <p className="text-blue-300/70 text-xs mt-1 line-clamp-2">
                  {prompt.openingLine || prompt.description || 'Quick start with this prompt'}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompts Table */}
      {sortedPrompts.length > 0 && (
        <div>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {sortedPrompts.length} prompt{sortedPrompts.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPrompts.map((prompt) => (
                  <TableRow key={prompt.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{prompt.name}</span>
                        {prompt.openingLine && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            Opening: "{prompt.openingLine}"
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        {prompt.description ? (
                          <span className="text-sm text-muted-foreground">
                            {prompt.description}
                          </span>
                        ) : prompt.customPrompt ? (
                          <span className="text-sm text-muted-foreground line-clamp-2">
                            {prompt.customPrompt}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            No description
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(getPromptCategory(prompt.name))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onDuplicate && showActions && (
                          <Button
                            onClick={() => onDuplicate(prompt)}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                          >
                            Duplicate
                          </Button>
                        )}
                        {showActions && (
                          <Button
                            onClick={() => handleEdit(prompt)}
                            size="sm"
                            className="h-8 bg-[#7559FF] hover:bg-[#6147DD]"
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Loading overlay for refresh */}
      {loading && prompts.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center text-sm text-muted-foreground">
            <div className="animate-spin w-4 h-4 border-2 border-[#7559FF] border-t-transparent rounded-full mr-2"></div>
            Refreshing prompts...
          </div>
        </div>
      )}

    </div>
  );
}