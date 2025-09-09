/**
 * React Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * According to Byterover memory layer, this provides graceful error
 * handling for the Interactive Avatar application components.
 */

import React, { Component, ReactNode } from 'react';

interface ErrorInfo {
  componentStack: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Generic Error Boundary for catching React component errors
 * 
 * Features:
 * - Catches component tree errors
 * - Custom fallback UI
 * - Retry functionality
 * - Error reporting callback
 * - Development-friendly error display
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Reset the error boundary state to retry rendering
   */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Custom fallback UI
      if (fallback && errorInfo) {
        return fallback(error, errorInfo, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div className="min-h-[200px] flex items-center justify-center p-6 border-2 border-dashed border-red-300 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Something went wrong
            </h3>

            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              An error occurred while rendering this component. Please try again or refresh the page.
            </p>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded border">
                <summary className="cursor-pointer text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Error Details (Development)
                </summary>
                <div className="text-xs text-red-700 dark:text-red-300 font-mono">
                  <div className="mb-2">
                    <strong>Error:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap break-all">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap break-all">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <button
              onClick={this.handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Hook-based error boundary for functional components
 * 
 * Note: This is a wrapper around the class-based ErrorBoundary
 * since React hooks don't have equivalent error boundary functionality
 */
interface UseErrorBoundaryProps {
  fallback?: ErrorBoundaryProps['fallback'];
  onError?: ErrorBoundaryProps['onError'];
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: UseErrorBoundaryProps
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithErrorBoundaryComponent;
}