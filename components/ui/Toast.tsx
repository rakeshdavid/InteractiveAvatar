"use client";

import React, { useState, useCallback, createContext, useContext } from "react";

// Toast types and interfaces
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastSeverity = 'low' | 'medium' | 'high' | 'critical';

interface Toast {
  id: string;
  type: ToastType;
  severity?: ToastSeverity;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

// Toast Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider Component
interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    
    // Determine default duration based on type and severity
    let defaultDuration = 5000; // Default 5 seconds
    if (toast.type === 'error') {
      switch (toast.severity) {
        case 'critical':
          defaultDuration = 0; // Never auto-dismiss critical errors
          break;
        case 'high':
          defaultDuration = 12000; // 12 seconds
          break;
        case 'medium':
          defaultDuration = 8000; // 8 seconds
          break;
        default:
          defaultDuration = 6000; // 6 seconds for low severity errors
      }
    } else if (toast.type === 'warning') {
      defaultDuration = toast.severity === 'high' ? 8000 : 6000;
    } else if (toast.type === 'success') {
      defaultDuration = 4000; // Success messages can be shorter
    }
    
    const newToast = {
      ...toast,
      id,
      duration: toast.duration ?? defaultDuration,
      dismissible: toast.dismissible ?? true,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-dismiss if not loading type and has duration
    if (toast.type !== 'loading' && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <>
      <style jsx>{`
        .toast-slide-in {
          animation: slideInFromRight 0.3s ease-out;
        }
        .toast-slide-out {
          animation: slideOutToRight 0.3s ease-in;
        }
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutToRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        .progress-bar {
          animation: progressCountdown var(--duration) linear;
        }
        @keyframes progressCountdown {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast, index) => (
          <ToastComponent 
            key={toast.id} 
            toast={toast} 
            index={index}
          />
        ))}
      </div>
    </>
  );
};

// Individual Toast Component
interface ToastComponentProps {
  toast: Toast;
  index: number;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, index }) => {
  const { removeToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300); // Match animation duration
  };

  const getTypeConfig = (type: ToastType, severity?: ToastSeverity) => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-500',
          borderColor: 'border-green-400',
          icon: (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
        };
      case 'error':
        // Vary error styling based on severity
        let errorBgColor = 'bg-red-500';
        let borderColor = 'border-red-400';
        if (severity === 'critical') {
          errorBgColor = 'bg-red-600';
          borderColor = 'border-red-500';
        } else if (severity === 'high') {
          errorBgColor = 'bg-red-500';
          borderColor = 'border-red-400';
        } else if (severity === 'medium') {
          errorBgColor = 'bg-red-400';
          borderColor = 'border-red-300';
        }
        
        return {
          bgColor: errorBgColor,
          borderColor,
          icon: severity === 'critical' ? (
            // Critical error icon (alert triangle)
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : (
            // Standard error icon (X)
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
        };
      case 'warning':
        return {
          bgColor: severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500',
          borderColor: severity === 'high' ? 'border-orange-400' : 'border-yellow-400',
          icon: (
            <svg className="w-4 h-4 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
        };
      case 'info':
        return {
          bgColor: 'bg-purple-500',
          borderColor: 'border-purple-400',
          icon: (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'loading':
        return {
          bgColor: 'bg-blue-500',
          borderColor: 'border-blue-400',
          icon: (
            <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
          ),
        };
      default:
        return {
          bgColor: 'bg-zinc-600',
          borderColor: 'border-zinc-500',
          icon: null,
        };
    }
  };

  const config = getTypeConfig(toast.type, toast.severity);
  const animationDelay = index * 0.1; // Stagger animations

  return (
    <div
      className={`${isExiting ? 'toast-slide-out' : 'toast-slide-in'} bg-zinc-800 border ${config.borderColor || 'border-zinc-700'} rounded-lg shadow-2xl overflow-hidden pointer-events-auto ${
        toast.severity === 'critical' ? 'ring-2 ring-red-500/50' : ''
      }`}
      style={{ 
        animationDelay: `${animationDelay}s`,
        '--duration': `${toast.duration}ms`,
      } as React.CSSProperties}
    >
      {/* Progress Bar */}
      {toast.type !== 'loading' && toast.duration && toast.duration > 0 && (
        <div className="h-1 bg-zinc-700">
          <div 
            className={`progress-bar h-full ${config.bgColor}`}
            style={{ 
              '--duration': `${toast.duration}ms`,
              animationDelay: `${animationDelay}s`,
            } as React.CSSProperties}
          />
        </div>
      )}
      
      {/* Content */}
      <div className="p-4 flex items-start space-x-3">
        {/* Icon */}
        {config.icon && (
          <div className={`flex-shrink-0 w-6 h-6 ${config.bgColor} rounded-full flex items-center justify-center mt-0.5`}>
            {config.icon}
          </div>
        )}
        
        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
          {toast.message && (
            <p className="text-sm text-zinc-400 mt-1">{toast.message}</p>
          )}
        </div>
        
        {/* Close Button */}
        {toast.dismissible && toast.type !== 'loading' && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Action Buttons */}
      {toast.actions && toast.actions.length > 0 && (
        <div className="px-4 pb-3 flex space-x-2 justify-end border-t border-zinc-700 pt-3 mt-1">
          {toast.actions.map((action, actionIndex) => (
            <button
              key={actionIndex}
              onClick={() => {
                action.action();
                if (toast.dismissible) {
                  handleDismiss();
                }
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                action.variant === 'primary'
                  ? `${config.bgColor} text-white hover:opacity-90`
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper hook for common toast patterns
export const useToastHelpers = () => {
  const { addToast } = useToast();

  const showSuccess = (title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string, severity: ToastSeverity = 'medium') => {
    addToast({ type: 'error', severity, title, message }); // Duration auto-calculated based on severity
  };

  const showWarning = (title: string, message?: string, severity: ToastSeverity = 'medium') => {
    addToast({ type: 'warning', severity, title, message });
  };
  
  // Additional severity-specific helpers
  const showCriticalError = (title: string, message?: string, actions?: Toast['actions']) => {
    addToast({ 
      type: 'error', 
      severity: 'critical', 
      title, 
      message,
      actions,
      dismissible: false // Critical errors require explicit action
    });
  };
  
  const showNetworkError = (onRetry?: () => void) => {
    const actions = onRetry ? [{
      label: 'Retry',
      action: onRetry,
      variant: 'primary' as const
    }] : undefined;
    
    addToast({
      type: 'error',
      severity: 'high',
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      actions
    });
  };

  const showInfo = (title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  };

  const showLoading = (title: string, message?: string) => {
    return addToast({ 
      type: 'loading', 
      title, 
      message, 
      duration: 0, // No auto-dismiss
      dismissible: false 
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showCriticalError,
    showNetworkError,
  };
};

// Utility functions for common prompt toast operations
export const usePromptToasts = () => {
  const helpers = useToastHelpers();

  return {
    promptCreated: (name: string) => 
      helpers.showSuccess("Prompt created successfully", `Your new "${name}" prompt is ready to use`),
    
    promptUpdated: (name: string) => 
      helpers.showSuccess("Prompt updated successfully", `Your "${name}" changes have been saved`),
    
    promptDeleted: (name: string) => 
      helpers.showSuccess("Prompt deleted", `"${name}" has been removed`),
    
    promptError: (error: string) => 
      helpers.showError("Failed to update prompt", error),
    
    syncInProgress: () => 
      helpers.showInfo("Sync in progress", "Updating Maslow AI with latest changes..."),
    
    syncCompleted: () => 
      helpers.showSuccess("Prompt sync completed", "All your prompts are now up to date"),
    
    nameExists: () => 
      helpers.showWarning("Prompt name already exists", "Choose a different name or edit the existing prompt"),
    
    creating: () => 
      helpers.showLoading("Creating prompt...", "Please wait while we process your request"),
  };
};