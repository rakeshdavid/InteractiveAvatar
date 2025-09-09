/**
 * Specialized Error Boundary for Prompts Components
 * 
 * Provides context-aware error handling specifically for the
 * HeyGen Prompts Management feature with specialized fallback UI
 * and recovery options.
 * 
 * According to Byterover memory layer, this integrates with the
 * existing prompts ecosystem (Toast, Modal, Store) for consistent UX.
 */

import React from 'react';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { useToast } from '../ui/Toast';

interface PromptsErrorBoundaryProps {
  children: React.ReactNode;
  feature?: 'list' | 'form' | 'manager' | 'general';
  onError?: (error: Error, errorInfo: any) => void;
}

/**
 * Specialized error boundary for prompts-related components
 * 
 * Features:
 * - Context-aware error messages
 * - Integration with toast notifications
 * - Prompts-specific recovery suggestions
 * - Graceful degradation to hardcoded prompts
 */
export function PromptsErrorBoundary({ 
  children, 
  feature = 'general',
  onError 
}: PromptsErrorBoundaryProps) {
  const customFallback = (error: Error, errorInfo: any, retry: () => void) => {
    return (
      <PromptsErrorFallback 
        error={error}
        errorInfo={errorInfo}
        feature={feature}
        onRetry={retry}
      />
    );
  };

  const handleError = (error: Error, errorInfo: any) => {
    // Log prompts-specific error context
    console.error(`Prompts Error (${feature}):`, {
      error: error.message,
      stack: error.stack,
      feature,
      timestamp: new Date().toISOString(),
      componentStack: errorInfo.componentStack
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ErrorBoundary
      fallback={customFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}

interface PromptsErrorFallbackProps {
  error: Error;
  errorInfo: any;
  feature: 'list' | 'form' | 'manager' | 'general';
  onRetry: () => void;
}

/**
 * Specialized fallback UI for prompts errors
 */
function PromptsErrorFallback({ error, feature, onRetry }: PromptsErrorFallbackProps) {
  // Get feature-specific error messages and recovery suggestions
  const getFeatureContext = (feature: string) => {
    switch (feature) {
      case 'list':
        return {
          title: 'Unable to Load Prompts',
          message: 'There was an error loading your prompts list. This might be due to a network issue or server problem.',
          suggestions: [
            'Check your internet connection',
            'Verify your API key is valid',
            'Try refreshing the page'
          ],
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        };
      
      case 'form':
        return {
          title: 'Prompt Form Error',
          message: 'There was an error with the prompt form. Your changes have not been saved.',
          suggestions: [
            'Try submitting again',
            'Check your form data',
            'Ensure all required fields are filled'
          ],
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          )
        };
      
      case 'manager':
        return {
          title: 'Prompts Manager Error',
          message: 'The prompts management interface encountered an error. You can still use existing prompts.',
          suggestions: [
            'Close and reopen the manager',
            'Use the dropdown to select existing prompts',
            'Refresh the page if the issue persists'
          ],
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )
        };
      
      default:
        return {
          title: 'Prompts Feature Error',
          message: 'An error occurred in the prompts system. Basic functionality should still work.',
          suggestions: [
            'Try using the default prompts',
            'Refresh the page',
            'Contact support if the issue persists'
          ],
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const context = getFeatureContext(feature);

  return (
    <div className="min-h-[300px] flex items-center justify-center p-6 border-2 border-dashed border-orange-300 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-950/20">
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
            {context.icon}
          </div>
        </div>

        {/* Title and Message */}
        <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-3">
          {context.title}
        </h3>

        <p className="text-sm text-orange-700 dark:text-orange-300 mb-6 leading-relaxed">
          {context.message}
        </p>

        {/* Suggestions */}
        <div className="mb-6 text-left">
          <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-3">
            Try these solutions:
          </h4>
          <ul className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
            {context.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-orange-500 dark:bg-orange-400 rounded-full mt-2 mr-3" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left mb-6 p-4 bg-orange-100 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <summary className="cursor-pointer text-sm font-medium text-orange-800 dark:text-orange-200 mb-3">
              Technical Details (Development)
            </summary>
            <div className="text-xs text-orange-700 dark:text-orange-300 font-mono space-y-2">
              <div>
                <strong>Feature:</strong> {feature}
              </div>
              <div>
                <strong>Error:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack Trace:</strong>
                  <pre className="mt-1 whitespace-pre-wrap break-all bg-orange-50 dark:bg-orange-950/40 p-2 rounded border max-h-32 overflow-y-auto">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-orange-600 dark:border-orange-400 text-sm font-medium rounded-md text-orange-600 dark:text-orange-400 bg-transparent hover:bg-orange-50 dark:hover:bg-orange-950/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reload Page
          </button>
        </div>

        {/* Fallback Note for List Feature */}
        {feature === 'list' && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> You can still use the default prompts from the dropdown while we resolve this issue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Higher-order component for wrapping prompts components with error boundary
 */
export function withPromptsErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature?: PromptsErrorBoundaryProps['feature']
) {
  const WithPromptsErrorBoundaryComponent = (props: P) => (
    <PromptsErrorBoundary feature={feature}>
      <WrappedComponent {...props} />
    </PromptsErrorBoundary>
  );

  WithPromptsErrorBoundaryComponent.displayName = `withPromptsErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithPromptsErrorBoundaryComponent;
}