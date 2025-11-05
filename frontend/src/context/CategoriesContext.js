import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCategories } from '../services/api';

const CategoriesContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoriesProvider');
  }
  return context;
};

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchCategories = async (forceRefresh = false) => {
    // If data exists and not forcing refresh, and fetched within last 5 minutes, skip
    if (!forceRefresh && categories.length > 0 && lastFetched) {
      const fiveMinutes = 5 * 60 * 1000;
      if (Date.now() - lastFetched < fiveMinutes) {
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
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Function to manually refresh categories
  const refreshCategories = () => {
    return fetchCategories(true);
  };

  // Get category by ID
  const getCategoryById = (categoryId) => {
    return categories.find(cat => cat.id === parseInt(categoryId));
  };

  // Get category by slug
  const getCategoryBySlug = (slug) => {
    return categories.find(cat => cat.slug === slug);
  };

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        loading,
        error,
        refreshCategories,
        getCategoryById,
        getCategoryBySlug,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};
