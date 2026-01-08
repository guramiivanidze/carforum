'use client';

import { useState, useEffect } from 'react';
import { getCategories } from '@/lib/api';
import { Category } from '@/types';
import Link from 'next/link';
import { FaHome, FaBook, FaCheckCircle } from 'react-icons/fa';

export default function RulesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        // Handle paginated response
        const categoriesData = data.results || data;
        // Filter categories that have rules
        const categoriesWithRules = categoriesData.filter((cat: Category) => cat.rules && cat.rules.length > 0);
        setCategories(categoriesWithRules);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm bg-white px-4 py-3 rounded-lg shadow-sm">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium transition flex items-center gap-1">
            <FaHome className="text-xs" />
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 flex items-center gap-1">
            <FaBook className="text-xs" />
            Community Rules
          </span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 rounded-xl">
              <FaBook className="text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Rules</h1>
              <p className="text-gray-600 mt-1">Please read and follow these guidelines to maintain a respectful community</p>
            </div>
          </div>
        </div>

        {/* Rules by Category */}
        {categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">No rules have been set yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon || '💬'}</span>
                    <div>
                      <h2 className="text-xl font-bold">{category.title || category.name}</h2>
                      {category.description && (
                        <p className="text-blue-100 text-sm mt-1">{category.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rules List */}
                <div className="p-6">
                  <div className="space-y-4">
                    {category.rules?.filter(rule => rule.is_active).map((rule, index) => (
                      <div 
                        key={rule.id} 
                        className="flex gap-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-blue-300 transition-all duration-200"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <FaCheckCircle className="text-green-500 text-sm" />
                            {rule.title}
                          </h3>
                          <p className="text-gray-700 leading-relaxed">{rule.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Important Notice</h3>
              <p className="text-yellow-800 text-sm">
                Violation of these rules may result in warnings, temporary suspensions, or permanent bans depending on the severity. 
                If you have any questions about these rules, please contact the moderators.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
