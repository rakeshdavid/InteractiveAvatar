/**
 * PromptsManager component - Main interface for managing HeyGen prompts
 * 
 * Provides a unified modal interface with tab navigation for all prompt operations:
 * - View all prompts (PromptsList integration)
 * - Create new prompts (PromptForm in create mode)
 * - Edit existing prompts (PromptForm in edit mode)
 * 
 * Integrates with usePrompts hook and existing UI components from PRs 1-8.
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { Search, Plus, Edit, Copy } from 'lucide-react';
import { usePromptToasts } from '@/components/ui';
import { usePrompts } from '@/store/usePromptsStore';
import { PromptsList } from './PromptsList';
import { PromptEngineeringSheet } from './PromptEngineeringSheet';
import type { Prompt } from '@/app/types/prompt';
import type { PromptFormData } from './PromptEngineeringSheet';

export interface PromptsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'list' | 'create';
}

type TabType = 'list' | 'create' | 'edit';

export function PromptsManager({
  isOpen,
  onClose,
  defaultTab = 'list',
}: PromptsManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  
  // State for PromptEngineeringSheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create');

  const {
    prompts,
    createPrompt,
    updatePrompt,
    refreshPrompts,
  } = usePrompts();

  // Keyboard shortcut for command palette
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const { promptCreated, promptUpdated, promptError } = usePromptToasts();

  // Handle tab changes with edge case handling
  const handleTabChange = useCallback((tab: TabType) => {
    // Edge case: Prevent tab change during submission
    if (isSubmitting) {
      promptError('Please wait for the current operation to complete.');
      return;
    }

    // Edge case: Warn if leaving edit tab with unsaved changes
    if (activeTab === 'edit' && tab !== 'edit' && editingPrompt) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
      );
      if (!confirmLeave) {
        return;
      }
    }

    // Edge case: Validate tab transition
    if (tab === 'edit' && !editingPrompt) {
      promptError('No prompt selected for editing. Please select a prompt from the list.');
      setActiveTab('list');
      return;
    }

    setActiveTab(tab);
    if (tab !== 'edit') {
      setEditingPrompt(null);
    }
  }, [isSubmitting, activeTab, editingPrompt, promptError]);

  // Handle edit prompt selection with edge case handling
  const handleEditPrompt = useCallback((prompt: Prompt) => {
    // Edge case: Prevent edit during submission
    if (isSubmitting) {
      promptError('Please wait for the current operation to complete.');
      return;
    }

    // Edge case: Validate prompt data
    if (!prompt || !prompt.id) {
      promptError('Invalid prompt selected. Please try again.');
      return;
    }

    // Edge case: Warn if already editing another prompt
    if (editingPrompt && editingPrompt.id !== prompt.id) {
      const confirmSwitch = window.confirm(
        'You are already editing another prompt. Switch to this one? Unsaved changes will be lost.'
      );
      if (!confirmSwitch) {
        return;
      }
    }

    setEditingPrompt(prompt);
    setSheetMode('edit');
    setSheetOpen(true);
  }, [isSubmitting, editingPrompt, promptError]);

  // Handle create prompt form submission
  const handleCreateSubmit = useCallback(async (data: PromptFormData) => {
    // Edge case: Validate data before submitting
    if (!data.name || data.name.trim() === '') {
      promptError('Prompt name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newPrompt = await createPrompt({
        name: data.name.trim(),
        openingLine: data.openingLine?.trim() || undefined,
        customPrompt: data.customPrompt?.trim() || undefined,
      });

      if (newPrompt) {
        promptCreated(newPrompt.name);
        // Edge case: Refresh might fail, but create succeeded
        try {
          await refreshPrompts();
        } catch (refreshError) {
          console.warn('Failed to refresh prompts after create:', refreshError);
          // Don't show error to user as the create actually succeeded
        }
        setActiveTab('list');
      } else {
        // Edge case: Create returned null/undefined but didn't throw
        promptError('Prompt creation completed but returned no data. The prompt may have been created successfully.');
        setActiveTab('list');
      }
    } catch (error) {
      console.error('Create prompt error:', error);
      
      // Edge case: Handle specific create error types
      if (error instanceof Error) {
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          promptError('A prompt with this name already exists. Please choose a different name.');
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          promptError('You have reached your prompt limit. Please upgrade your plan or delete unused prompts.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          promptError('Network error. Please check your connection and try again.');
        } else if (error.message.includes('permission') || error.message.includes('401') || error.message.includes('403')) {
          promptError('You don\'t have permission to create prompts. Please check your API key.');
        } else {
          promptError(error.message);
        }
      } else {
        promptError('Failed to create prompt. Please try again.');
      }
      
      throw error; // Re-throw to let form handle it
    } finally {
      setIsSubmitting(false);
    }
  }, [createPrompt, promptCreated, promptError, refreshPrompts]);

  // Handle update prompt form submission
  const handleUpdateSubmit = useCallback(async (data: PromptFormData) => {
    // Edge case: Editing prompt was cleared somehow
    if (!editingPrompt) {
      promptError('Edit session expired. Please try selecting the prompt again.');
      setActiveTab('list');
      return;
    }

    // Edge case: Invalid prompt ID
    if (!editingPrompt.id || editingPrompt.id.trim() === '') {
      promptError('Invalid prompt selected. Please try again.');
      setActiveTab('list');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedPrompt = await updatePrompt(editingPrompt.id, {
        name: data.name,
        openingLine: data.openingLine || undefined,
        customPrompt: data.customPrompt || undefined,
      });

      if (updatedPrompt) {
        promptUpdated(updatedPrompt.name);
        // Edge case: Refresh might fail, but update succeeded
        try {
          await refreshPrompts();
        } catch (refreshError) {
          console.warn('Failed to refresh prompts after update:', refreshError);
          // Don't show error to user as the update actually succeeded
        }
        setActiveTab('list');
        setEditingPrompt(null);
      } else {
        // Edge case: Update returned null/undefined but didn't throw
        promptError('Update completed but returned no data. The prompt may have been updated successfully.');
        setActiveTab('list');
        setEditingPrompt(null);
      }
    } catch (error) {
      console.error('Update prompt error:', error);
      
      // Edge case: Handle different error types with appropriate messages
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('404')) {
          promptError('This prompt no longer exists. It may have been deleted.');
          setActiveTab('list');
          setEditingPrompt(null);
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          promptError('Network error. Please check your connection and try again.');
        } else if (error.message.includes('permission') || error.message.includes('401') || error.message.includes('403')) {
          promptError('You don\'t have permission to update this prompt. Please check your API key.');
        } else {
          promptError(error.message);
        }
      } else {
        promptError('Failed to update prompt. Please try again.');
      }
      
      throw error; // Re-throw to let form handle it
    } finally {
      setIsSubmitting(false);
    }
  }, [editingPrompt, updatePrompt, promptUpdated, promptError, refreshPrompts]);

  // Handle modal close with edge case handling
  const handleClose = useCallback((event?: any) => {
    // Prevent event bubbling that might cause issues
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    
    // Edge case: Prevent closing during submission
    if (isSubmitting) {
      promptError('Please wait for the current operation to complete.');
      return;
    }

    // Edge case: Warn if user is editing and might lose data
    if (activeTab === 'edit' && editingPrompt) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close? Your changes will be lost.'
      );
      if (!confirmClose) {
        return;
      }
    }

    // Reset state and close
    try {
      setActiveTab(defaultTab);
      setEditingPrompt(null);
      setCommandOpen(false); // Also close command palette if open
      onClose();
    } catch (error) {
      console.error('Error closing modal:', error);
      // Force close even if there's an error
      onClose();
    }
  }, [isSubmitting, activeTab, editingPrompt, defaultTab, onClose, promptError]);

  // Handle new prompt button click
  const handleNewPromptClick = useCallback(() => {
    setSheetMode('create');
    setEditingPrompt(null);
    setSheetOpen(true);
  }, []);

  // Handle sheet submission
  const handleSheetSubmit = useCallback(async (data: PromptFormData) => {
    setIsSubmitting(true);
    try {
      if (sheetMode === 'create') {
        await handleCreateSubmit(data);
      } else if (sheetMode === 'edit') {
        await handleUpdateSubmit(data);
      }
      setSheetOpen(false);
      setEditingPrompt(null);
    } catch (error) {
      // Error handling is done in the individual handlers
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [sheetMode, handleCreateSubmit, handleUpdateSubmit]);

  // Handle sheet close
  const handleSheetClose = useCallback((open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      setEditingPrompt(null);
    }
  }, []);


  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent 
          className="max-w-6xl max-h-[95vh] overflow-y-auto"
          aria-labelledby="prompts-manager-title"
          aria-describedby="prompts-manager-description"
        >
          <DialogHeader>
            <DialogTitle id="prompts-manager-title" className="text-2xl font-semibold text-foreground">
              Manage Prompts
            </DialogTitle>
            <DialogDescription id="prompts-manager-description" className="flex items-center justify-between">
              <span>Create, edit, and organize your avatar prompts and conversation starters.</span>
              <div className="flex items-center text-xs text-muted-foreground">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
                <span className="ml-1">for quick search</span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as TabType)} className="flex-1">
            <TabsList className={`grid w-full ${activeTab === 'edit' && editingPrompt ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <span>All Prompts</span>
              </TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
              {activeTab === 'edit' && editingPrompt && (
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <span>Edit</span>
                  <Badge variant="outline" className="text-xs">
                    {editingPrompt.name}
                  </Badge>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="list" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Manage your avatar prompts and conversation starters
                  {isSubmitting && (
                    <span className="ml-2 inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  )}
                </div>
                <Button 
                  onClick={handleNewPromptClick} 
                  className="bg-[#7559FF] hover:bg-[#6147DD] disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  New Prompt
                </Button>
              </div>
              <div className="min-h-[500px] overflow-y-auto">
                <PromptsList
                  onEdit={handleEditPrompt}
                  onCreateNew={handleNewPromptClick}
                  showActions={true}
                  hideNewPromptButton={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="create" className="mt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Click "New Prompt" to open the enhanced prompt engineering workspace
                </p>
                <button
                  onClick={() => {
                    setSheetMode('create');
                    setEditingPrompt(null);
                    setSheetOpen(true);
                  }}
                  className="px-6 py-3 bg-[#7559FF] hover:bg-[#6147DD] text-white rounded-lg font-medium transition-colors"
                >
                  Open Prompt Engineering Studio
                </button>
              </div>
            </TabsContent>

            <TabsContent value="edit" className="mt-6">
              {editingPrompt ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Opening enhanced prompt engineering workspace for: <strong>{editingPrompt.name}</strong>
                  </p>
                  <button
                    onClick={() => {
                      setSheetMode('edit');
                      setSheetOpen(true);
                    }}
                    className="px-6 py-3 bg-[#7559FF] hover:bg-[#6147DD] text-white rounded-lg font-medium transition-colors"
                  >
                    Open Prompt Engineering Studio
                  </button>
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput 
          placeholder="Search prompts or actions..." 
          aria-label="Search prompts and actions"
        />
        <CommandList role="listbox" aria-label="Search results">
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => {
              setCommandOpen(false);
              handleNewPromptClick();
            }}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Create new prompt</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => {
              setCommandOpen(false);
              setActiveTab('list');
            }}>
              <Search className="mr-2 h-4 w-4" />
              <span>View all prompts</span>
              <CommandShortcut>⌘L</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          {prompts.length > 0 && (
            <CommandGroup heading="Prompts">
              {prompts.slice(0, 8).map((prompt) => (
                <CommandItem
                  key={prompt.id}
                  onSelect={() => {
                    setCommandOpen(false);
                    handleEditPrompt(prompt);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{prompt.name}</span>
                    {prompt.openingLine && (
                      <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {prompt.openingLine}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
              {prompts.length > 8 && (
                <CommandItem disabled>
                  <span className="text-muted-foreground">...and {prompts.length - 8} more</span>
                </CommandItem>
              )}
            </CommandGroup>
          )}

          <CommandGroup heading="Categories">
            <CommandItem onSelect={() => {
              setCommandOpen(false);
              // TODO: Filter by sales category when we implement filtering
              setActiveTab('list');
            }}>
              <Badge className="mr-2 bg-green-500" />
              <span>Sales prompts</span>
            </CommandItem>
            <CommandItem onSelect={() => {
              setCommandOpen(false);
              // TODO: Filter by support category
              setActiveTab('list');
            }}>
              <Badge className="mr-2 bg-purple-500" />
              <span>Support prompts</span>
            </CommandItem>
            <CommandItem onSelect={() => {
              setCommandOpen(false);
              // TODO: Filter by demo category
              setActiveTab('list');
            }}>
              <Badge className="mr-2 bg-blue-500" />
              <span>Demo prompts</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Enhanced Prompt Engineering Sheet */}
      <PromptEngineeringSheet
        isOpen={sheetOpen}
        onOpenChange={handleSheetClose}
        onSubmit={handleSheetSubmit}
        mode={sheetMode}
        initialData={editingPrompt || undefined}
        isSubmitting={isSubmitting}
      />
    </>
  );
}