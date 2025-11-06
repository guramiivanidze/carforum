'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCategories } from '@/contexts/CategoriesContext';
import { getCategoryTopics } from '@/lib/api';
import { Topic } from '@/types';
import Link from 'next/link';
import AdBannerComponent from '@/components/AdBanner';
import { FaThumbsUp, FaComments, FaEye, FaClock, FaUser } from 'react-icons/fa';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { getCategoryById, loading: categoriesLoading } = useCategories();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ordering, setOrdering] = useState('-created_at');

  const category = getCategoryById(Number(params.id));

  useEffect(() => {
    const fetchTopics = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const data = await getCategoryTopics(params.id as string, {
          page,
          page_size: 20,
          ordering,
        });
        
        // Handle paginated response
        const topicsData = data.results || data;
        setTopics(Array.isArray(topicsData) ? topicsData : []);
        
        if (data.count) {
          setTotalPages(Math.ceil(data.count / 20));
        }
      } catch (error) {
        console.error('Failed to fetch topics:', error);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [params.id, page, ordering]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (categoriesLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-4">The category you're looking for doesn't exist.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold mb-2">{category.title || category.name}</h1>
              <p className="text-gray-600 mb-4">{category.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FaComments />
                  {category.topics_count} topics
                </span>
                <span className="flex items-center gap-1">
                  <FaComments />
                  {category.replies_count} replies
                </span>
              </div>
            </div>

            {/* Top Banner */}
            <div className="mb-6">
              <AdBannerComponent location="category_top" />
            </div>

            {/* Sorting Options */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Sort by:</span>
                <select
                  value={ordering}
                  onChange={(e) => setOrdering(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="-created_at">Latest</option>
                  <option value="-updated_at">Recently Updated</option>
                  <option value="-likes_count">Most Liked</option>
                  <option value="-replies_count">Most Replies</option>
                  <option value="-views">Most Viewed</option>
                </select>
              </div>

              <Link
                href="/create-topic"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create Topic
              </Link>
            </div>

            {/* Topics List */}
            <div className="bg-white rounded-lg shadow-md">
              {topics.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="mb-4">No topics yet in this category.</p>
                  <Link
                    href="/create-topic"
                    className="text-blue-600 hover:underline"
                  >
                    Be the first to create a topic!
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-4 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => router.push(`/topic/${topic.id}`)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Topic Info */}
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            {topic.is_pinned && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                Pinned
                              </span>
                            )}
                            {topic.is_locked && (
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                Locked
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 mb-2">
                            {topic.title}
                          </h3>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <FaUser />
                              {topic.author.username}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaClock />
                              {formatDate(topic.created_at)}
                            </span>
                          </div>

                          {/* Tags */}
                          {topic.tags && topic.tags.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              {topic.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 min-w-[150px] text-sm">
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <FaThumbsUp className="text-blue-600" />
                            <span className="font-medium">{topic.likes_count || 0}</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <FaComments className="text-green-600" />
                            <span className="font-medium">{topic.replies_count || 0}</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <FaEye className="text-purple-600" />
                            <span className="font-medium">{topic.views || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1 rounded-lg ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Sidebar Banner */}
            <div className="mb-6">
              <AdBannerComponent location="category_sidebar" />
            </div>

            {/* Category Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Category Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Topics:</span>
                  <span className="font-bold">{category.topics_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Replies:</span>
                  <span className="font-bold">{category.replies_count}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/create-topic"
                  className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Create Topic
                </Link>
                <Link
                  href="/"
                  className="block w-full border border-gray-300 text-center px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  All Categories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
