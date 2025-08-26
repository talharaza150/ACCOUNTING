import { ref, reactive, onMounted } from 'vue';

export interface AnalyticsEvent {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
}

export interface AnalyticsConfig {
  enabled?: boolean;
  debug?: boolean;
  trackPageViews?: boolean;
  trackUserInteractions?: boolean;
  trackPerformance?: boolean;
  trackErrors?: boolean;
  sessionTimeout?: number;
  batchSize?: number;
  flushInterval?: number;
}

export interface UserProperties {
  userId?: string;
  role?: string;
  email?: string;
  company?: string;
  firstVisit?: boolean;
  returningUser?: boolean;
  sessionCount?: number;
  lastActive?: number;
}

class AnalyticsService {
  private config: Required<AnalyticsConfig>;
  private eventQueue: AnalyticsEvent[] = [];
  private userProperties: UserProperties = {};
  private sessionId: string;
  private sessionStartTime: number;
  private pageLoadTime: number;
  private flushTimer?: number;

  constructor(config: AnalyticsConfig = {}) {
    this.config = {
      enabled: true,
      debug: false,
      trackPageViews: true,
      trackUserInteractions: true,
      trackPerformance: true,
      trackErrors: true,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      batchSize: 20,
      flushInterval: 5000, // 5 seconds
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.pageLoadTime = performance.now();

    this.initializeSession();
    this.setupEventListeners();
    this.startFlushTimer();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSession() {
    // Load existing session data from localStorage
    const existingSession = localStorage.getItem('analytics-session');
    const lastActive = localStorage.getItem('analytics-last-active');
    
    if (existingSession && lastActive) {
      const timeSinceLastActive = Date.now() - parseInt(lastActive);
      if (timeSinceLastActive < this.config.sessionTimeout) {
        // Continue existing session
        this.sessionId = existingSession;
        this.userProperties.returningUser = true;
      }
    } else {
      this.userProperties.firstVisit = true;
    }

    // Save session data
    localStorage.setItem('analytics-session', this.sessionId);
    localStorage.setItem('analytics-last-active', Date.now().toString());

    // Increment session count
    const sessionCount = parseInt(localStorage.getItem('analytics-session-count') || '0') + 1;
    localStorage.setItem('analytics-session-count', sessionCount.toString());
    this.userProperties.sessionCount = sessionCount;
  }

  private setupEventListeners() {
    if (!this.config.enabled) return;

    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden');
        this.flush(); // Ensure events are sent before page becomes hidden
      } else {
        this.track('page_visible');
      }
    });

    // Before unload
    window.addEventListener('beforeunload', () => {
      this.track('page_unload', {
        session_duration: Date.now() - this.sessionStartTime
      });
      this.flush(true); // Force immediate flush
    });

    // Error tracking
    if (this.config.trackErrors) {
      window.addEventListener('error', (event) => {
        this.trackError(event.error, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.trackError(event.reason, {
          type: 'unhandled_promise_rejection'
        });
      });
    }

    // Performance tracking
    if (this.config.trackPerformance) {
      // Track page load performance
      window.addEventListener('load', () => {
        this.trackPerformance();
      });
    }
  }

  private startFlushTimer() {
    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // Public methods
  identify(userId: string, properties: Partial<UserProperties> = {}) {
    this.userProperties = {
      ...this.userProperties,
      userId,
      ...properties
    };

    this.track('identify', {
      user_id: userId,
      ...properties
    });
  }

  track(event: string, properties: Record<string, any> = {}) {
    if (!this.config.enabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight
      },
      userId: this.userProperties.userId,
      sessionId: this.sessionId,
      timestamp: Date.now()
    };

    this.eventQueue.push(analyticsEvent);

    // Update last active time
    localStorage.setItem('analytics-last-active', Date.now().toString());

    if (this.config.debug) {
      console.log('Analytics Event:', analyticsEvent);
    }

    // Auto-flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  trackPageView(path?: string, title?: string) {
    if (!this.config.trackPageViews) return;

    this.track('page_view', {
      path: path || window.location.pathname,
      title: title || document.title,
      search: window.location.search,
      hash: window.location.hash
    });
  }

  trackClick(element: string, properties: Record<string, any> = {}) {
    if (!this.config.trackUserInteractions) return;

    this.track('click', {
      element,
      ...properties
    });
  }

  trackFileAction(action: string, fileId: string, fileName: string, properties: Record<string, any> = {}) {
    this.track('file_action', {
      action,
      file_id: fileId,
      file_name: fileName,
      ...properties
    });
  }

  trackSearch(query: string, results: number, filters: Record<string, any> = {}) {
    this.track('search', {
      query,
      results_count: results,
      filters
    });
  }

  trackFormSubmit(formName: string, properties: Record<string, any> = {}) {
    this.track('form_submit', {
      form_name: formName,
      ...properties
    });
  }

  trackError(error: Error | string, properties: Record<string, any> = {}) {
    if (!this.config.trackErrors) return;

    const errorInfo = typeof error === 'string' ? error : {
      message: error.message,
      stack: error.stack,
      name: error.name
    };

    this.track('error', {
      error: errorInfo,
      ...properties
    });
  }

  trackPerformance() {
    if (!this.config.trackPerformance) return;

    // Use Performance API if available
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      const metrics = {
        page_load_time: navigation.loadEventEnd - navigation.fetchStart,
        dom_ready_time: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        first_paint: paint.find(p => p.name === 'first-paint')?.startTime,
        first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
        dns_time: navigation.domainLookupEnd - navigation.domainLookupStart,
        connect_time: navigation.connectEnd - navigation.connectStart,
        response_time: navigation.responseEnd - navigation.responseStart
      };

      this.track('performance', metrics);
    }
  }

  private async flush(immediate: boolean = false) {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // In a real implementation, you would send this to your analytics endpoint
      // For now, we'll just store it locally and log it
      
      if (this.config.debug) {
        console.log('Flushing analytics events:', events);
      }

      // Store events locally for development/debugging
      const existingEvents = JSON.parse(localStorage.getItem('analytics-events') || '[]');
      const allEvents = [...existingEvents, ...events];
      
      // Keep only the last 1000 events to prevent localStorage from growing too large
      if (allEvents.length > 1000) {
        allEvents.splice(0, allEvents.length - 1000);
      }
      
      localStorage.setItem('analytics-events', JSON.stringify(allEvents));

      // In production, replace this with actual API call:
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ events })
      // });

    } catch (error) {
      // On error, put events back in queue
      this.eventQueue.unshift(...events);
      console.error('Analytics flush failed:', error);
    }
  }

  // Cleanup
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush(true);
  }

  // Get analytics data for debugging/reporting
  getStoredEvents(): AnalyticsEvent[] {
    return JSON.parse(localStorage.getItem('analytics-events') || '[]');
  }

  clearStoredEvents() {
    localStorage.removeItem('analytics-events');
  }
}

// Composable
export function useAnalytics(config: AnalyticsConfig = {}) {
  const analytics = new AnalyticsService(config);
  const isEnabled = ref(config.enabled !== false);

  // Reactive user properties
  const userProperties = reactive<UserProperties>({});

  const identify = (userId: string, properties: Partial<UserProperties> = {}) => {
    Object.assign(userProperties, { userId, ...properties });
    analytics.identify(userId, properties);
  };

  const track = (event: string, properties?: Record<string, any>) => {
    if (!isEnabled.value) return;
    analytics.track(event, properties);
  };

  const trackPageView = (path?: string, title?: string) => {
    if (!isEnabled.value) return;
    analytics.trackPageView(path, title);
  };

  const trackClick = (element: string, properties?: Record<string, any>) => {
    if (!isEnabled.value) return;
    analytics.trackClick(element, properties);
  };

  const trackFileAction = (action: string, fileId: string, fileName: string, properties?: Record<string, any>) => {
    if (!isEnabled.value) return;
    analytics.trackFileAction(action, fileId, fileName, properties);
  };

  const trackSearch = (query: string, results: number, filters?: Record<string, any>) => {
    if (!isEnabled.value) return;
    analytics.trackSearch(query, results, filters);
  };

  const trackFormSubmit = (formName: string, properties?: Record<string, any>) => {
    if (!isEnabled.value) return;
    analytics.trackFormSubmit(formName, properties);
  };

  const trackError = (error: Error | string, properties?: Record<string, any>) => {
    if (!isEnabled.value) return;
    analytics.trackError(error, properties);
  };

  // Enable/disable analytics
  const enable = () => {
    isEnabled.value = true;
  };

  const disable = () => {
    isEnabled.value = false;
  };

  // Cleanup on unmount
  onMounted(() => {
    // Auto-track page view on mount
    trackPageView();
  });

  return {
    // State
    isEnabled,
    userProperties,

    // Methods
    identify,
    track,
    trackPageView,
    trackClick,
    trackFileAction,
    trackSearch,
    trackFormSubmit,
    trackError,
    enable,
    disable,

    // Debug methods
    getStoredEvents: () => analytics.getStoredEvents(),
    clearStoredEvents: () => analytics.clearStoredEvents(),

    // Cleanup
    destroy: () => analytics.destroy()
  };
}