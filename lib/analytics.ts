/**
 * Simple Analytics Wrapper
 * 
 * Provides a lightweight analytics tracking system for the Interactive Avatar application.
 * Supports multiple analytics providers and can be easily configured or disabled.
 * 
 * According to Byterover memory layer, this is an optional component for
 * understanding user interactions with the prompts feature.
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export interface AnalyticsProvider {
  name: string;
  track: (event: AnalyticsEvent) => void | Promise<void>;
  identify?: (userId: string, properties?: Record<string, any>) => void | Promise<void>;
  flush?: () => void | Promise<void>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  environment: 'development' | 'production' | 'test';
  debugMode: boolean;
  providers: AnalyticsProvider[];
}

/**
 * Default configuration
 */
const defaultConfig: AnalyticsConfig = {
  enabled: process.env.NODE_ENV === 'production',
  environment: (process.env.NODE_ENV as any) || 'development',
  debugMode: process.env.NODE_ENV === 'development',
  providers: [],
};

/**
 * Simple console provider for development
 */
export const consoleProvider: AnalyticsProvider = {
  name: 'console',
  track: (event: AnalyticsEvent) => {
    console.log('[Analytics]', event.name, event.properties || {});
  },
  identify: (userId: string, properties?: Record<string, any>) => {
    console.log('[Analytics] User:', userId, properties || {});
  },
};

/**
 * Local storage provider for basic usage tracking
 */
export const localStorageProvider: AnalyticsProvider = {
  name: 'localStorage',
  track: (event: AnalyticsEvent) => {
    try {
      const key = 'interactive-avatar-analytics';
      const existing = localStorage.getItem(key);
      const events = existing ? JSON.parse(existing) : [];
      
      // Keep only last 100 events to avoid storage bloat
      const newEvents = [
        ...events.slice(-99),
        {
          ...event,
          timestamp: event.timestamp || Date.now(),
        },
      ];
      
      localStorage.setItem(key, JSON.stringify(newEvents));
    } catch (error) {
      console.warn('[Analytics] Failed to store event:', error);
    }
  },
  flush: () => {
    try {
      localStorage.removeItem('interactive-avatar-analytics');
    } catch (error) {
      console.warn('[Analytics] Failed to clear events:', error);
    }
  },
};

/**
 * Analytics class
 */
class Analytics {
  private config: AnalyticsConfig;
  private isInitialized = false;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.init();
  }

  private init() {
    if (this.isInitialized) return;

    // Add default providers based on environment
    if (this.config.debugMode) {
      this.addProvider(consoleProvider);
    }

    // Always add localStorage provider for basic tracking
    this.addProvider(localStorageProvider);

    this.isInitialized = true;
  }

  /**
   * Add an analytics provider
   */
  addProvider(provider: AnalyticsProvider) {
    const existingIndex = this.config.providers.findIndex(p => p.name === provider.name);
    
    if (existingIndex >= 0) {
      this.config.providers[existingIndex] = provider;
    } else {
      this.config.providers.push(provider);
    }
  }

  /**
   * Remove an analytics provider
   */
  removeProvider(providerName: string) {
    this.config.providers = this.config.providers.filter(p => p.name !== providerName);
  }

  /**
   * Track an event
   */
  async track(eventName: string, properties?: Record<string, any>) {
    if (!this.config.enabled || !this.isInitialized) {
      if (this.config.debugMode) {
        console.log('[Analytics] Tracking disabled or not initialized:', eventName);
      }
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      },
      timestamp: Date.now(),
    };

    // Track with all providers
    const promises = this.config.providers.map(async (provider) => {
      try {
        await provider.track(event);
      } catch (error) {
        if (this.config.debugMode) {
          console.error(`[Analytics] ${provider.name} provider error:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Identify a user
   */
  async identify(userId: string, properties?: Record<string, any>) {
    if (!this.config.enabled || !this.isInitialized) return;

    const promises = this.config.providers.map(async (provider) => {
      if (!provider.identify) return;
      
      try {
        await provider.identify(userId, properties);
      } catch (error) {
        if (this.config.debugMode) {
          console.error(`[Analytics] ${provider.name} identify error:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Flush all pending events
   */
  async flush() {
    const promises = this.config.providers.map(async (provider) => {
      if (!provider.flush) return;
      
      try {
        await provider.flush();
      } catch (error) {
        if (this.config.debugMode) {
          console.error(`[Analytics] ${provider.name} flush error:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Enable or disable analytics
   */
  setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Get stored events (from localStorage provider)
   */
  getStoredEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem('interactive-avatar-analytics');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      if (this.config.debugMode) {
        console.warn('[Analytics] Failed to get stored events:', error);
      }
      return [];
    }
  }
}

// Create global analytics instance
export const analytics = new Analytics();

// Common event names for consistency
export const AnalyticsEvents = {
  // Prompts Management
  PROMPT_CREATED: 'prompt_created',
  PROMPT_UPDATED: 'prompt_updated',
  PROMPT_DELETED: 'prompt_deleted',
  PROMPT_LIST_VIEWED: 'prompt_list_viewed',
  PROMPT_FORM_OPENED: 'prompt_form_opened',
  PROMPT_FORM_SUBMITTED: 'prompt_form_submitted',
  PROMPT_FORM_CANCELLED: 'prompt_form_cancelled',
  PROMPT_MANAGER_OPENED: 'prompt_manager_opened',
  PROMPT_MANAGER_CLOSED: 'prompt_manager_closed',
  
  // Errors and Performance
  ERROR_OCCURRED: 'error_occurred',
  ERROR_BOUNDARY_TRIGGERED: 'error_boundary_triggered',
  API_REQUEST_FAILED: 'api_request_failed',
  NETWORK_ERROR: 'network_error',
  
  // User Interactions
  AVATAR_SESSION_STARTED: 'avatar_session_started',
  AVATAR_MESSAGE_SENT: 'avatar_message_sent',
  FEATURE_USED: 'feature_used',
  
  // Performance
  PAGE_LOAD_TIME: 'page_load_time',
  API_RESPONSE_TIME: 'api_response_time',
} as const;

export type AnalyticsEventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];