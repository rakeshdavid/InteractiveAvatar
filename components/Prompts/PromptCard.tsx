/**
 * PromptCard component for displaying individual prompts
 * 
 * Uses the completed Card component system from PR 6 to display 
 * prompt information with edit and delete actions.
 */

import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardContentItem,
  CardActions,
  CardActionButton,
} from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Prompt } from '@/app/types/prompt';

export interface PromptCardProps {
  prompt: Prompt;
  onEdit?: (prompt: Prompt) => void;
  onDuplicate?: (prompt: Prompt) => void;
  showActions?: boolean;
}

export function PromptCard({ 
  prompt, 
  onEdit, 
  onDuplicate,
  showActions = true 
}: PromptCardProps) {
  const [showPreview, setShowPreview] = React.useState(false);
  
  const handleEdit = () => {
    onEdit?.(prompt);
  };

  const handleDuplicate = () => {
    onDuplicate?.(prompt);
  };

  // Determine prompt category for visual indicators
  const getPromptCategory = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('sales') || lowerName.includes('sell') || lowerName.includes('pitch')) return 'sales';
    if (lowerName.includes('support') || lowerName.includes('help') || lowerName.includes('service')) return 'support';
    if (lowerName.includes('demo') || lowerName.includes('presentation') || lowerName.includes('show')) return 'demo';
    return 'custom';
  };

  const category = getPromptCategory(prompt.name);

  const getCategoryStatus = (category: string) => {
    switch (category) {
      case 'sales':
        return { type: 'active' as const, label: 'Sales' };
      case 'support':
        return { type: 'selected' as const, label: 'Support' };
      case 'demo':
        return { type: 'inactive' as const, label: 'Demo' };
      default:
        return { type: 'inactive' as const, label: 'Custom' };
    }
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title={prompt.name}
        description={prompt.description}
      />

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span></span>
            {getCategoryBadge(category)}
          </div>
          {prompt.openingLine && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Opening Line</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {prompt.openingLine}
              </p>
            </div>
          )}
          
          {prompt.customPrompt && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Instructions</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {prompt.customPrompt}
              </p>
            </div>
          )}
          
          {!prompt.openingLine && !prompt.customPrompt && (
            <div className="flex items-center justify-center py-4">
              <Badge variant="secondary" className="text-xs">
                No additional configuration
              </Badge>
            </div>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardActions>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="ghost"
                size="sm"
                className="h-8 px-2"
              >
                {showPreview ? 'Hide' : 'Preview'}
              </Button>
              {onDuplicate && (
                <Button
                  onClick={handleDuplicate}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                >
                  Duplicate
                </Button>
              )}
            </div>
            {onEdit && (
              <Button
                onClick={handleEdit}
                variant="default"
                size="sm"
                className="h-8 bg-[#7559FF] hover:bg-[#6147DD]"
              >
                Edit
              </Button>
            )}
          </div>
        </CardActions>
      )}

      {/* Enhanced Quick Preview */}
      {showPreview && (prompt.openingLine || prompt.customPrompt) && (
        <div className="border-t p-4 bg-muted/50">
          <div className="space-y-3">
            {prompt.openingLine && (
              <div>
                <Badge variant="outline" className="text-xs mb-2">Opening Line</Badge>
                <p className="text-sm bg-background p-3 rounded-md border">
                  {prompt.openingLine}
                </p>
              </div>
            )}
            {prompt.customPrompt && (
              <div>
                <Badge variant="outline" className="text-xs mb-2">Custom Instructions</Badge>
                <p className="text-sm bg-background p-3 rounded-md border max-h-24 overflow-y-auto">
                  {prompt.customPrompt}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}