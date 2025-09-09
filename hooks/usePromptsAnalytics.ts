/**
 * Prompts Analytics Hook
 * 
 * Provides analytics tracking specifically for the HeyGen Prompts Management feature.
 * Tracks user interactions, performance metrics, and error occurrences.
 * 
 * According to Byterover memory layer, this integrates with the existing
 * prompts ecosystem to provide usage insights and error tracking.
 */

import React, { useCallback, useRef } from 'react';
import { analytics, AnalyticsEvents, type AnalyticsEventName } from '@/lib/analytics';
import type { Prompt } from '@/app/types/prompt';

export interface PromptsAnalyticsHook {
  // Prompt CRUD Operations
  trackPromptCreated: (prompt: { name: string; hasOpeningLine: boolean; hasCustomPrompt: boolean }) => void;
  trackPromptUpdated: (promptId: string, changes: string[]) => void;
  trackPromptDeleted: (promptId: string) => void;
  
  // UI Interactions
  trackPromptsListViewed: (promptCount: number) => void;
  trackPromptFormOpened: (mode: 'create' | 'edit', promptId?: string) => void;
  trackPromptFormSubmitted: (mode: 'create' | 'edit', success: boolean, error?: string) => void;
  trackPromptFormCancelled: (mode: 'create' | 'edit') => void;
  trackPromptsManagerOpened: () => void;
  trackPromptsManagerClosed: (sessionDuration: number) => void;
  
  // Error Tracking
  trackError: (error: Error | string, context?: string, severity?: 'low' | 'medium' | 'high' | 'critical') => void;
  trackApiError: (endpoint: string, status: number, error: string, duration?: number) => void;
  trackNetworkError: (error: string, attemptCount?: number) => void;
  
  // Performance Metrics
  trackApiPerformance: (endpoint: string, duration: number, success: boolean) => void;
  trackFormPerformance: (formType: string, loadTime: number) => void;
  
  // User Journey
  trackFeatureUsage: (feature: string, context?: Record<string, any>) => void;
  
  // Utility
  getSessionStartTime: () => number;
  resetSessionTimer: () => void;
}

/**
 * Hook for prompts-specific analytics tracking
 */
export const usePromptsAnalytics = (): PromptsAnalyticsHook => {
  const sessionStartTime = useRef<number>(Date.now());
  const formStartTimes = useRef<Map<string, number>>(new Map());
  const apiStartTimes = useRef<Map<string, number>>(new Map());

  const resetSessionTimer = useCallback(() => {
    sessionStartTime.current = Date.now();
  }, []);

  const getSessionStartTime = useCallback(() => {
    return sessionStartTime.current;
  }, []);

  // CRUD Operations Analytics
  const trackPromptCreated = useCallback((prompt: { name: string; hasOpeningLine: boolean; hasCustomPrompt: boolean }) => {
    analytics.track(AnalyticsEvents.PROMPT_CREATED, {
      prompt_name_length: prompt.name.length,
      has_opening_line: prompt.hasOpeningLine,
      has_custom_prompt: prompt.hasCustomPrompt,
      feature_complexity: (prompt.hasOpeningLine ? 1 : 0) + (prompt.hasCustomPrompt ? 1 : 0),
    });
  }, []);

  const trackPromptUpdated = useCallback((promptId: string, changes: string[]) => {
    analytics.track(AnalyticsEvents.PROMPT_UPDATED, {
      prompt_id: promptId,
      fields_changed: changes,
      change_count: changes.length,
    });
  }, []);

  const trackPromptDeleted = useCallback((promptId: string) => {
    analytics.track(AnalyticsEvents.PROMPT_DELETED, {
      prompt_id: promptId,
    });
  }, []);

  // UI Interaction Analytics
  const trackPromptsListViewed = useCallback((promptCount: number) => {
    analytics.track(AnalyticsEvents.PROMPT_LIST_VIEWED, {
      prompt_count: promptCount,
      list_size_category: promptCount === 0 ? 'empty' : 
                         promptCount <= 5 ? 'small' : 
                         promptCount <= 20 ? 'medium' : 'large',
    });
  }, []);

  const trackPromptFormOpened = useCallback((mode: 'create' | 'edit', promptId?: string) => {
    const startTime = Date.now();
    formStartTimes.current.set(`${mode}_${promptId || 'new'}`, startTime);
    
    analytics.track(AnalyticsEvents.PROMPT_FORM_OPENED, {
      form_mode: mode,
      prompt_id: promptId,
    });
  }, []);

  const trackPromptFormSubmitted = useCallback((mode: 'create' | 'edit', success: boolean, error?: string) => {
    const formKey = `${mode}_${Date.now()}`;
    const startTime = formStartTimes.current.get(formKey);
    const duration = startTime ? Date.now() - startTime : undefined;
    
    analytics.track(AnalyticsEvents.PROMPT_FORM_SUBMITTED, {
      form_mode: mode,
      success,
      error_message: error,
      form_duration: duration,
      submission_outcome: success ? 'success' : 'error',
    });
  }, []);

  const trackPromptFormCancelled = useCallback((mode: 'create' | 'edit') => {
    analytics.track(AnalyticsEvents.PROMPT_FORM_CANCELLED, {
      form_mode: mode,
    });
  }, []);

  const trackPromptsManagerOpened = useCallback(() => {
    resetSessionTimer();
    analytics.track(AnalyticsEvents.PROMPT_MANAGER_OPENED);
  }, [resetSessionTimer]);

  const trackPromptsManagerClosed = useCallback((sessionDuration?: number) => {
    const duration = sessionDuration || (Date.now() - sessionStartTime.current);
    
    analytics.track(AnalyticsEvents.PROMPT_MANAGER_CLOSED, {
      session_duration: duration,
      session_category: duration < 30000 ? 'quick' : 
                       duration < 120000 ? 'normal' : 'extended',
    });
  }, []);

  // Error Analytics
  const trackError = useCallback((error: Error | string, context?: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'object' ? error.stack : undefined;
    
    analytics.track(AnalyticsEvents.ERROR_OCCURRED, {
      error_message: errorMessage,
      error_stack: errorStack,
      error_context: context,
      error_severity: severity,
      error_type: typeof error === 'string' ? 'string' : error.name || 'Error',
    });
  }, []);

  const trackApiError = useCallback((endpoint: string, status: number, error: string, duration?: number) => {
    analytics.track(AnalyticsEvents.API_REQUEST_FAILED, {
      endpoint,
      http_status: status,
      error_message: error,
      request_duration: duration,
      error_category: status >= 500 ? 'server_error' : 
                     status >= 400 ? 'client_error' : 'unknown',
    });
  }, []);

  const trackNetworkError = useCallback((error: string, attemptCount: number = 1) => {
    analytics.track(AnalyticsEvents.NETWORK_ERROR, {
      error_message: error,
      attempt_count: attemptCount,
      network_error_type: error.includes('timeout') ? 'timeout' : 
                         error.includes('offline') ? 'offline' : 
                         error.includes('fetch') ? 'fetch_failed' : 'unknown',
    });
  }, []);

  // Performance Analytics
  const trackApiPerformance = useCallback((endpoint: string, duration: number, success: boolean) => {
    analytics.track(AnalyticsEvents.API_RESPONSE_TIME, {
      endpoint,
      duration,
      success,
      performance_category: duration < 500 ? 'fast' : 
                           duration < 2000 ? 'normal' : 
                           duration < 5000 ? 'slow' : 'very_slow',
    });
  }, []);

  const trackFormPerformance = useCallback((formType: string, loadTime: number) => {
    analytics.track(AnalyticsEvents.PAGE_LOAD_TIME, {
      component_type: 'form',
      form_type: formType,
      load_time: loadTime,
      performance_category: loadTime < 100 ? 'fast' : 
                           loadTime < 500 ? 'normal' : 'slow',
    });
  }, []);

  // Feature Usage Analytics
  const trackFeatureUsage = useCallback((feature: string, context?: Record<string, any>) => {
    analytics.track(AnalyticsEvents.FEATURE_USED, {
      feature_name: feature,
      feature_context: context,
    });
  }, []);

  return {
    // CRUD Operations
    trackPromptCreated,
    trackPromptUpdated,
    trackPromptDeleted,
    
    // UI Interactions
    trackPromptsListViewed,
    trackPromptFormOpened,
    trackPromptFormSubmitted,
    trackPromptFormCancelled,
    trackPromptsManagerOpened,
    trackPromptsManagerClosed,
    
    // Error Tracking
    trackError,
    trackApiError,
    trackNetworkError,
    
    // Performance Metrics
    trackApiPerformance,
    trackFormPerformance,
    
    // User Journey
    trackFeatureUsage,
    
    // Utility
    getSessionStartTime,
    resetSessionTimer,
  };
};

/**
 * Higher-order component for automatic analytics tracking
 */
export function withPromptsAnalytics<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  const WithAnalyticsComponent: React.FC<P> = (props: P) => {
    const analytics = usePromptsAnalytics();
    
    // Track component mount
    React.useEffect(() => {
      analytics.trackFeatureUsage(`${componentName}_mounted`);
    }, [analytics]);
    
    return React.createElement(WrappedComponent, props);
  };

  WithAnalyticsComponent.displayName = `withPromptsAnalytics(${componentName})`;
  return WithAnalyticsComponent;
}