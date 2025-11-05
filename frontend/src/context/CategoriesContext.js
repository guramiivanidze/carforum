/**
 * Categories Context
 * 
 * Provides categories data throughout the application.
 * Implements caching to prevent redundant API calls.
 * 
 * Features:
 * - Auto-fetch on mount
 * - 5-minute cache with manual refresh option
 * - Helper functions to get categories by ID or slug
 * - Loading and error states
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCategories } from '../services/api';

const CategoriesContext = createContext();

/**
 * Custom hook to access Categories Context
 * Throws error if used outside of CategoriesProvider
 */
export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoriesProvider');
  }
  return context;
};

/**
 * Categories Provider Component
 * 
 * Manages categories state and provides it to child components.
 * Categories are cached and refreshed automatically every 5 minutes.
 */
export const CategoriesProvider = ({ children }) => {
  // State management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  /**
   * Fetch categories from API
   * @param {boolean} forceRefresh - Skip cache and fetch fresh data
   */
  const fetchCategories = async (forceRefresh = false) => {
    // Skip fetch if data exists and is still fresh (< 5 minutes old)
    if (!forceRefresh && categories.length > 0 && lastFetched) {
      const fiveMinutes = 5 * 60 * 1000;
      if (Date.now() - lastFetched < fiveMinutes) {
        console.log('⏭️ Categories: Using existing data (still fresh)');
        return;
      }
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await getCategories();
      
      // Handle paginated response - extract results array if paginated
      const categoriesArray = data.results || data;
      
      setCategories(categoriesArray);
      setLastFetched(Date.now());
      
      console.log(`✅ Categories: Loaded ${categoriesArray.length} categories`);
    } catch (err) {
      console.error('❌ Categories: Error fetching', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch categories on component mount
   * Categories are cached by the API service for 10 minutes
   */
  useEffect(() => {
    fetchCategories();
  }, []);

  /**
   * Manually refresh categories (force fresh data)
   */
  const refreshCategories = () => {
    console.log('🔄 Categories: Manual refresh triggered');
    return fetchCategories(true);
  };

  /**
   * Get category by ID
   * @param {number|string} categoryId - Category ID
   * @returns {Object|undefined} Category object or undefined
   */
  const getCategoryById = (categoryId) => {
    return categories.find(cat => cat.id === parseInt(categoryId));
  };

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Object|undefined} Category object or undefined
   */
  const getCategoryBySlug = (slug) => {
    return categories.find(cat => cat.slug === slug);
  };

  // Context value provided to consumers
  const contextValue = {
    categories,
    loading,
    error,
    refreshCategories,
    getCategoryById,
    getCategoryBySlug,
  };

  return (
    <CategoriesContext.Provider value={contextValue}>
      {children}
    </CategoriesContext.Provider>
  );
};