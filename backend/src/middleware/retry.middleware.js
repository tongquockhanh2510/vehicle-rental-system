/**
 * Retry Logic Middleware
 * 
 * Implements automatic retry with exponential backoff for failed API calls.
 * Based on best practices for resilient distributed systems.
 */

// Retry configuration
const retryConfig = {
  maxRetries: 3,           // Maximum number of retry attempts
  initialDelay: 1000,       // Initial delay in ms (1 second)
  maxDelay: 10000,          // Maximum delay cap in ms (10 seconds)
  backoffMultiplier: 2,     // Exponential backoff multiplier
  jitter: true,             // Add random jitter to prevent thundering herd
  retryableStatuses: [      // HTTP status codes that should trigger retry
    408,    // Request Timeout
    429,    // Too Many Requests
    500,    // Internal Server Error
    502,    // Bad Gateway
    503,    // Service Unavailable
    504     // Gateway Timeout
  ],
  retryableErrors: [        // Error types that should trigger retry
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'EHOSTUNREACH',
    'ENETUNREACH',
    'Socket hang up',
    'Network Error'
  ]
};

/**
 * Calculate delay with exponential backoff
 */
const calculateDelay = (attempt, config) => {
  // Exponential backoff: initialDelay * (multiplier ^ attempt)
  let delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt);
  
  // Cap at max delay
  delay = Math.min(delay, config.maxDelay);
  
  // Add jitter (±25%) to prevent thundering herd
  if (config.jitter) {
    const jitterFactor = 0.5 + Math.random(); // 0.5 to 1.5
    delay = Math.floor(delay * jitterFactor);
  }
  
  return delay;
};

/**
 * Check if error/status is retryable
 */
const isRetryable = (error) => {
  if (!error) return false;
  
  // Check HTTP status code
  if (error.status && retryConfig.retryableStatuses.includes(error.status)) {
    return true;
  }
  
  // Check error code
  if (error.code && retryConfig.retryableErrors.includes(error.code)) {
    return true;
  }
  
  // Check error message
  if (error.message) {
    for (const retryableError of retryConfig.retryableErrors) {
      if (error.message.includes(retryableError)) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Sleep utility
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry wrapper function
 */
const withRetry = async (fn, options = {}) => {
  const config = { ...retryConfig, ...options };
  let lastError;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await fn();
      return {
        success: true,
        data: result,
        attempts: attempt + 1
      };
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt < config.maxRetries && isRetryable(error)) {
        const delay = calculateDelay(attempt, config);
        
        console.log(`🔄 Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms - ${error.message || error.status || 'Unknown error'}`);
        
        await sleep(delay);
      } else {
        // No more retries or not retryable
        break;
      }
    }
  }
  
  return {
    success: false,
    error: lastError,
    attempts: config.maxRetries + 1,
    message: `Failed after ${config.maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`
  };
};

/**
 * Retry middleware for HTTP requests
 */
const retryMiddleware = (options = {}) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json to add retry info to response headers
    res.json = async function(data) {
      // Add retry info headers
      res.set({
        'X-Retry-Config-MaxRetries': options.maxRetries || retryConfig.maxRetries,
        'X-Retry-Config-Backoff': options.backoffMultiplier || retryConfig.backoffMultiplier
      });
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Retry decorator for class methods
 */
const retryable = (options = {}) => {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      return withRetry(() => originalMethod.apply(this, args), options);
    };
    
    return descriptor;
  };
};

/**
 * Fetch with built-in retry
 */
const fetchWithRetry = async (url, options = {}) => {
  const fetchOptions = {
    ...options,
    retries: options.retries || retryConfig.maxRetries,
    retryDelay: options.retryDelay || retryConfig.initialDelay
  };
  
  return withRetry(async () => {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers
      }
    });
    
    if (!response.ok && retryConfig.retryableStatuses.includes(response.status)) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }
    
    return response;
  }, { maxRetries: fetchOptions.retries });
};

/**
 * Health check for retry system
 */
const getRetryStatus = () => {
  return {
    config: retryConfig,
    status: 'active',
    description: 'Automatic retry with exponential backoff'
  };
};

module.exports = {
  retryConfig,
  withRetry,
  retryMiddleware,
  retryable,
  fetchWithRetry,
  calculateDelay,
  isRetryable,
  getRetryStatus
};
