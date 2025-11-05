/**
 * API Cache Service
 * 
 * Prevents duplicate API requests by caching responses in memory.
 * Provides automatic cache invalidation based on time-to-live (TTL).
 * 
 * Features:
 * - In-memory caching with TTL
 * - Request deduplication (prevents multiple simultaneous identical requests)
 * - Manual cache invalidation
 * - Configurable cache duration per endpoint
 */

class ApiCacheService {
  constructor() {
    // Store cached responses with their metadata
    this.cache = new Map();
    
    // Track pending requests to prevent duplicates
    this.pendingRequests = new Map();
    
    // Default cache duration: 5 minutes
    this.defaultTTL = 5 * 60 * 1000;
    
    // Custom TTL for specific endpoint patterns (in milliseconds)
    this.customTTL = {
      'categories': 10 * 60 * 1000,      // 10 minutes - categories change rarely
      'profiles': 3 * 60 * 1000,          // 3 minutes - profile data
      'topics': 2 * 60 * 1000,            // 2 minutes - topics list
      'topic': 1 * 60 * 1000,             // 1 minute - individual topic
      'replies': 1 * 60 * 1000,           // 1 minute - replies
      'gamification': 5 * 60 * 1000,      // 5 minutes - gamification data
      'badges': 10 * 60 * 1000,           // 10 minutes - badges change rarely
      'tags': 5 * 60 * 1000,              // 5 minutes - tags
    };
  }

  /**
   * Generate a unique cache key from URL and parameters
   * @param {string} url - API endpoint URL
   * @param {Object} params - Query parameters
   * @returns {string} Unique cache key
   */
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});
    
    return `${url}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Determine TTL based on endpoint pattern
   * @param {string} url - API endpoint URL
   * @returns {number} TTL in milliseconds
   */
  getTTL(url) {
    // Check for matching patterns in customTTL
    for (const [pattern, ttl] of Object.entries(this.customTTL)) {
      if (url.includes(pattern)) {
        return ttl;
      }
    }
    return this.defaultTTL;
  }

  /**
   * Check if cached data is still valid
   * @param {string} key - Cache key
   * @returns {boolean} True if cache is valid
   */
  isValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    return now - cached.timestamp < cached.ttl;
  }

  /**
   * Get data from cache if valid
   * @param {string} url - API endpoint URL
   * @param {Object} params - Query parameters
   * @returns {any|null} Cached data or null if not found/expired
   */
  get(url, params = {}) {
    const key = this.generateKey(url, params);
    
    if (this.isValid(key)) {
      const cached = this.cache.get(key);
      console.log(`✅ Cache HIT: ${url}`);
      return cached.data;
    }
    
    console.log(`❌ Cache MISS: ${url}`);
    return null;
  }

  /**
   * Store data in cache
   * @param {string} url - API endpoint URL
   * @param {Object} params - Query parameters
   * @param {any} data - Data to cache
   */
  set(url, params = {}, data) {
    const key = this.generateKey(url, params);
    const ttl = this.getTTL(url);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      url,
      params
    });
    
    console.log(`💾 Cached: ${url} (TTL: ${ttl / 1000}s)`);
  }

  /**
   * Execute API request with caching and deduplication
   * @param {string} url - API endpoint URL
   * @param {Function} fetchFn - Async function that performs the actual API call
   * @param {Object} params - Query parameters
   * @param {boolean} forceRefresh - Skip cache and fetch fresh data
   * @returns {Promise<any>} API response data
   */
  async fetch(url, fetchFn, params = {}, forceRefresh = false) {
    const key = this.generateKey(url, params);
    
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh) {
      const cachedData = this.get(url, params);
      if (cachedData !== null) {
        return cachedData;
      }
    }
    
    // Check if there's already a pending request for this key
    if (this.pendingRequests.has(key)) {
      console.log(`⏳ Request already pending: ${url}`);
      return this.pendingRequests.get(key);
    }
    
    // Create new request promise
    const requestPromise = fetchFn()
      .then(data => {
        // Cache the response
        this.set(url, params, data);
        
        // Remove from pending requests
        this.pendingRequests.delete(key);
        
        return data;
      })
      .catch(error => {
        // Remove from pending requests on error
        this.pendingRequests.delete(key);
        throw error;
      });
    
    // Store pending request
    this.pendingRequests.set(key, requestPromise);
    
    console.log(`🌐 Fetching: ${url}`);
    return requestPromise;
  }

  /**
   * Invalidate cache for specific URL or pattern
   * @param {string} urlPattern - URL or pattern to invalidate
   */
  invalidate(urlPattern) {
    let count = 0;
    
    for (const [key, cached] of this.cache.entries()) {
      if (cached.url.includes(urlPattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    console.log(`🗑️ Invalidated ${count} cache entries for: ${urlPattern}`);
  }

  /**
   * Clear all cached data
   */
  clearAll() {
    const count = this.cache.size;
    this.cache.clear();
    this.pendingRequests.clear();
    console.log(`🗑️ Cleared all ${count} cache entries`);
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;
    
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp < cached.ttl) {
        validCount++;
      } else {
        expiredCount++;
      }
    }
    
    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
      pending: this.pendingRequests.size
    };
  }

  /**
   * Clean expired cache entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp >= cached.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
    }
  }
}

// Create singleton instance
const apiCache = new ApiCacheService();

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  apiCache.cleanup();
}, 5 * 60 * 1000);

export default apiCache;
