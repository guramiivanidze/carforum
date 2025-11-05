/**
 * Custom React Hooks for Data Fetching
 * 
 * Provides reusable hooks for common data fetching patterns.
 * Includes loading states, error handling, and automatic caching.
 * 
 * Benefits:
 * - Reduces code duplication across components
 * - Consistent error handling and loading states
 * - Automatic request caching and deduplication
 * - Easy to test and maintain
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiCache from '../services/apiCache';

/**
 * Generic hook for fetching data with caching
 * 
 * @param {Function} fetchFn - Async function to fetch data
 * @param {Array} dependencies - Dependencies that trigger refetch
 * @param {Object} options - Configuration options
 * @returns {Object} { data, loading, error, refetch }
 * 
 * Example:
 * const { data, loading, error, refetch } = useFetch(
 *   () => getUserProfile(userId),
 *   [userId],
 *   { enabled: !!userId }
 * );
 */
export const useFetch = (fetchFn, dependencies = [], options = {}) => {
  const {
    enabled = true,           // Whether to automatically fetch
    cacheKey = null,          // Optional cache key
    forceRefresh = false,     // Skip cache
    onSuccess = null,         // Callback on successful fetch
    onError = null,           // Callback on error
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  /**
   * Fetch data function with caching support
   */
  const fetchData = useCallback(async (skipCache = false) => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      let result;
      
      // Use cache if cacheKey is provided
      if (cacheKey && !skipCache && !forceRefresh) {
        result = await apiCache.fetch(
          cacheKey,
          fetchFn,
          {},
          false
        );
      } else {
        result = await fetchFn();
      }

      if (isMountedRef.current) {
        setData(result);
        setLoading(false);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'An error occurred');
        setLoading(false);
        
        // Call error callback if provided
        if (onError) {
          onError(err);
        }
        
        console.error('useFetch error:', err);
      }
    }
  }, [enabled, cacheKey, forceRefresh, fetchFn, onSuccess, onError]);

  /**
   * Refetch function that skips cache
   */
  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Fetch data when dependencies change
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
    
    // Cleanup: mark component as unmounted
    return () => {
      isMountedRef.current = false;
    };
  }, [enabled, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching user profile data
 * 
 * @param {string|number} userId - User ID to fetch
 * @param {Object} options - Configuration options
 * @returns {Object} { profile, loading, error, refetch }
 * 
 * Example:
 * const { profile, loading, error } = useUserProfile(userId);
 */
export const useUserProfile = (userId, options = {}) => {
  const { getUserProfile } = require('../services/api');
  
  return useFetch(
    () => getUserProfile(userId),
    [userId],
    {
      enabled: !!userId,
      cacheKey: `profiles/${userId}`,
      ...options,
    }
  );
};

/**
 * Hook for fetching paginated data with tab-based loading
 * 
 * @param {Function} fetchFn - Async function to fetch data
 * @param {string} activeTab - Current active tab
 * @param {string} targetTab - Tab that should trigger fetch
 * @param {Array} additionalDeps - Additional dependencies
 * @returns {Object} { data, loading, error, refetch }
 * 
 * Example:
 * const { data: replies, loading } = useTabData(
 *   () => getUserReplies(userId),
 *   activeTab,
 *   'replies',
 *   [userId]
 * );
 */
export const useTabData = (fetchFn, activeTab, targetTab, additionalDeps = []) => {
  const enabled = activeTab === targetTab;
  
  return useFetch(
    fetchFn,
    [activeTab, ...additionalDeps],
    { enabled }
  );
};

/**
 * Hook for lazy loading data (fetch on demand)
 * 
 * @param {Function} fetchFn - Async function to fetch data
 * @returns {Object} { data, loading, error, fetch, reset }
 * 
 * Example:
 * const { data, loading, fetch: loadData } = useLazyFetch(() => searchUsers(query));
 * // Later: onClick={() => loadData()}
 */
export const useLazyFetch = (fetchFn) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  /**
   * Manual fetch function
   */
  const fetch = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(...args);
      
      if (isMountedRef.current) {
        setData(result);
        setLoading(false);
      }
      
      return result;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'An error occurred');
        setLoading(false);
      }
      throw err;
    }
  }, [fetchFn]);

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    fetch,
    reset,
  };
};

/**
 * Hook for debounced data fetching (useful for search)
 * 
 * @param {Function} fetchFn - Async function to fetch data
 * @param {string} query - Search query or input value
 * @param {number} delay - Debounce delay in milliseconds
 * @param {number} minLength - Minimum query length to trigger fetch
 * @returns {Object} { data, loading, error }
 * 
 * Example:
 * const { data: searchResults, loading } = useDebouncedFetch(
 *   (q) => searchTopics(q),
 *   searchQuery,
 *   500,
 *   3
 * );
 */
export const useDebouncedFetch = (fetchFn, query, delay = 500, minLength = 3) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't fetch if query is too short
    if (!query || query.length < minLength) {
      setData(null);
      setLoading(false);
      return;
    }

    // Set loading state immediately
    setLoading(true);
    setError(null);

    // Debounce the fetch
    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await fetchFn(query);
        
        if (isMountedRef.current) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err.message || 'An error occurred');
          setLoading(false);
        }
        console.error('useDebouncedFetch error:', err);
      }
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, delay, minLength, fetchFn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
  };
};

/**
 * Hook for infinite scroll / pagination
 * 
 * @param {Function} fetchFn - Function that accepts page number
 * @param {Object} options - Configuration options
 * @returns {Object} { data, loading, error, hasMore, loadMore, reset }
 * 
 * Example:
 * const { data, loading, hasMore, loadMore } = usePagination(
 *   (page) => getTopics({ page }),
 *   { pageSize: 10 }
 * );
 */
export const usePagination = (fetchFn, options = {}) => {
  const { pageSize = 10, initialPage = 1 } = options;
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const isMountedRef = useRef(true);

  /**
   * Load more data
   */
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(page);
      
      if (isMountedRef.current) {
        // Handle paginated response
        const newItems = result.results || result;
        
        setData(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
        
        // Check if there's more data
        if (result.next === null || newItems.length < pageSize) {
          setHasMore(false);
        }
        
        setLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'An error occurred');
        setLoading(false);
      }
      console.error('usePagination error:', err);
    }
  }, [fetchFn, page, loading, hasMore, pageSize]);

  /**
   * Reset pagination
   */
  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  }, [initialPage]);

  // Load initial page
  useEffect(() => {
    loadMore();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  };
};
