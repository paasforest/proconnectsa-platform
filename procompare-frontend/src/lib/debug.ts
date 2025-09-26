// Debug utility with proper environment controls and rate limiting
// This replaces scattered console.log statements with a controlled debug system

const DEBUG_MODES = {
  FORM: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_FORM === 'true',
  API: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_API === 'true',
  VALIDATION: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_VALIDATION === 'true',
  PERFORMANCE: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_PERFORMANCE === 'true',
} as const;

// Rate-limited debug to prevent console spam
const createThrottledDebug = () => {
  const lastCall = new Map<string, number>();
  
  return (key: string, fn: () => void, delay = 1000) => {
    const now = Date.now();
    if (!lastCall.has(key) || now - lastCall.get(key)! > delay) {
      lastCall.set(key, now);
      fn();
    }
  };
};

const throttledDebug = createThrottledDebug();

// Performance monitoring
const performanceTracker = {
  start: (label: string) => {
    if (DEBUG_MODES.PERFORMANCE) {
      if (typeof window !== 'undefined' && window.performance) {
        window.performance.mark(`${label}-start`);
      }
    }
  },
  end: (label: string) => {
    if (DEBUG_MODES.PERFORMANCE) {
      if (typeof window !== 'undefined' && window.performance) {
        window.performance.mark(`${label}-end`);
        window.performance.measure(label, `${label}-start`, `${label}-end`);
        const measure = window.performance.getEntriesByName(label)[0];
        if (measure) {
          console.log(`⏱️ [PERFORMANCE] ${label}: ${measure.duration.toFixed(2)}ms`);
        }
      }
    }
  },
};

export const debug = {
  // Form-specific debugging
  form: (...args: any[]) => {
    if (DEBUG_MODES.FORM) {
      console.log('🔍 [FORM DEBUG]', ...args);
    }
  },

  // API debugging
  api: (...args: any[]) => {
    if (DEBUG_MODES.API) {
      console.log('🌐 [API DEBUG]', ...args);
    }
  },

  // Validation debugging
  validation: (...args: any[]) => {
    if (DEBUG_MODES.VALIDATION) {
      console.log('✅ [VALIDATION DEBUG]', ...args);
    }
  },

  // Performance debugging
  performance: performanceTracker,

  // Rate-limited debug (prevents spam)
  throttled: throttledDebug,

  // Step-by-step form debugging
  step: (step: number, data: any) => {
    if (DEBUG_MODES.FORM) {
      console.log(`📝 [STEP ${step}]`, data);
    }
  },

  // Form submission debugging
  submission: (data: any, success: boolean) => {
    if (DEBUG_MODES.FORM) {
      const icon = success ? '✅' : '❌';
      console.log(`${icon} [SUBMISSION]`, data);
    }
  },

  // Error debugging with stack trace
  error: (error: Error, context?: string) => {
    if (DEBUG_MODES.FORM || DEBUG_MODES.API) {
      console.error(`💥 [ERROR] ${context || 'Unknown context'}:`, error);
      console.error('Stack trace:', error.stack);
    }
  },

  // State change debugging
  state: (component: string, oldState: any, newState: any) => {
    if (DEBUG_MODES.FORM) {
      console.log(`🔄 [STATE CHANGE] ${component}:`, {
        from: oldState,
        to: newState,
        changed: Object.keys(newState).filter(key => oldState[key] !== newState[key])
      });
    }
  },

  // Network debugging
  network: (url: string, method: string, status?: number, duration?: number) => {
    if (DEBUG_MODES.API) {
      const statusIcon = status ? (status < 400 ? '✅' : '❌') : '⏳';
      const durationText = duration ? ` (${duration}ms)` : '';
      console.log(`${statusIcon} [NETWORK] ${method} ${url}${durationText}`);
    }
  },

  // Debug mode status
  getStatus: () => ({
    form: DEBUG_MODES.FORM,
    api: DEBUG_MODES.API,
    validation: DEBUG_MODES.VALIDATION,
    performance: DEBUG_MODES.PERFORMANCE,
  }),

  // Enable/disable debug modes at runtime (for development)
  setMode: (mode: keyof typeof DEBUG_MODES, enabled: boolean) => {
    if (process.env.NODE_ENV === 'development') {
      (DEBUG_MODES as any)[mode] = enabled;
      console.log(`🔧 Debug mode ${mode} ${enabled ? 'enabled' : 'disabled'}`);
    }
  },
};

// Export individual debug functions for convenience
export const { form, api, validation, performance, throttled, step, submission, error, state, network } = debug;

// Export debug status checker
export const isDebugEnabled = (mode: keyof typeof DEBUG_MODES) => DEBUG_MODES[mode];

// Export debug configuration helper
export const configureDebug = (config: Partial<Record<keyof typeof DEBUG_MODES, boolean>>) => {
  if (process.env.NODE_ENV === 'development') {
    Object.entries(config).forEach(([mode, enabled]) => {
      (DEBUG_MODES as any)[mode] = enabled;
    });
    console.log('🔧 Debug configuration updated:', config);
  }
};

export default debug;
