'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCategories } from '@/lib/api';
import { Category } from '@/types';

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  getCategoryById: (id: number) => Category | undefined;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider = ({ children }: { children: React.ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchCategories = useCallback(async () => {
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Return cached data if still valid
    if (categories.length > 0 && now - lastFetch < CACHE_DURATION) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      
      // Handle paginated response
      const categoriesData = data.results || data;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setLastFetch(now);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [categories.length, lastFetch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getCategoryById = useCallback(
    (id: number) => {
      return categories.find((cat) => cat.id === id);
    },
    [categories]
  );

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        loading,
        error,
        refreshCategories: fetchCategories,
        getCategoryById,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};
