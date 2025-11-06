'use client';

import { useCategories } from '@/contexts/CategoriesContext';
import { useBanners } from '@/contexts/BannersContext';
import { useState, useEffect } from 'react';
import { getTopics } from '@/lib/api';
import { Topic } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdBannerComponent from '@/components/AdBanner';
import { FaComments, FaReply, FaClock, FaUser, FaEye, FaThumbsUp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Home() {
  const { categories, loading: categoriesLoading } = useCategories();
  const { getBannersByLocation } = useBanners();
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTopics, setTotalTopics] = useState(0);
  const [hotTopics, setHotTopics] = useState<Topic[]>([]);
  const pageSize = 10;

  const topBanners = getBannersByLocation('home_top');
  const sideBanners = getBannersByLocation('home_sidebar');
  const bottomBanners = getBannersByLocation('home_bottom');

  // Fetch hot topics once on mount
  useEffect(() => {
    const fetchHotTopics = async () => {
      try {
        const response = await getTopics({ page: 1, page_size: 5 });
        const topicsData = response.results || response;
        
        // Sort by views + likes + replies to get "hot" topics
        const sorted = [...topicsData].sort((a, b) => {
          const scoreA = (a.views || 0) + (a.likes_count || 0) * 2 + (a.replies_count || 0) * 3;
          const scoreB = (b.views || 0) + (b.likes_count || 0) * 2 + (b.replies_count || 0) * 3;
          return scoreB - scoreA;
        });
        
        setHotTopics(sorted.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch hot topics:', error);
      }
    };

    fetchHotTopics();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setTopicsLoading(true);
        const response = await getTopics({ page: currentPage, page_size: pageSize });
        
        // Handle both paginated and non-paginated responses
        if (response.results) {
          setTopics(response.results);
          setTotalTopics(response.count || 0);
          setTotalPages(Math.ceil((response.count || 0) / pageSize));
        } else {
          setTopics(response);
          setTotalTopics(response.length);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Failed to fetch topics:', error);
        setTopics([]);
      } finally {
        setTopicsLoading(false);
      }
    };

    fetchTopics();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Banner */}
      {topBanners.length > 0 && (
        <div className="container mx-auto px-4 py-4">
          <AdBannerComponent location="home_top" />
        </div>
      )}

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">🚗 Welcome to Car Forum</h1>
              <p className="text-blue-100">
                Join thousands of car enthusiasts discussing everything automotive.
              </p>
            </div>

            {/* Categories Section */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Explore Categories
                </h2>
                <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {categories.length} Categories
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {categories.map((category, index) => {
                  // Generate gradient colors based on index
                  const gradients = [
                    'from-blue-500 to-blue-600',
                    'from-green-500 to-green-600',
                    'from-purple-500 to-purple-600',
                    'from-orange-500 to-orange-600',
                    'from-pink-500 to-pink-600',
                    'from-indigo-500 to-indigo-600',
                  ];
                  const gradient = gradients[index % gradients.length];
                  
                  return (
                    <Link
                      key={category.id}
                      href={`/category/${category.id}`}
                      className="group relative bg-white rounded-xl p-5 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent overflow-hidden"
                    >
                      {/* Gradient Background on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                      
                      {/* Header with Icon and Stats */}
                      <div className="relative flex items-start justify-between mb-3">
                        {/* Icon Circle */}
                        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                          <span className="text-xl">{category.icon || '💬'}</span>
                        </div>
                        
                        {/* Stats - Moved to top right */}
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1 text-blue-600 font-semibold">
                            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FaComments className="text-[10px]" />
                            </div>
                            <span>{category.topics_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600 font-semibold">
                            <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                              <FaReply className="text-[10px]" />
                            </div>
                            <span>{category.replies_count || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Category Title */}
                      <h3 className="relative text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                        {category.title || category.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="relative text-gray-600 text-sm mb-3 line-clamp-2 leading-snug">
                        {category.description}
                      </p>
                      
                      {/* Latest Topic */}
                      {category.latest_topic && (
                        <div className="relative pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <FaClock className="text-gray-400 text-[10px] flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] text-gray-500 mb-0.5">Latest</p>
                              <p className="text-xs text-gray-700 font-medium truncate">
                                {category.latest_topic.title}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Hover Arrow */}
                      <div className="absolute bottom-3 right-3 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Latest Topics Section */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 md:px-6 py-4 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-blue-600">📋</span>
                    Latest Topics
                  </h2>
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {totalTopics} Topics
                  </div>
                </div>
              </div>

              <div className="p-3 md:p-4">
                {topicsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-3 text-gray-500 text-sm">Loading topics...</p>
                  </div>
                ) : topics.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-lg mb-2">📭 No topics yet</p>
                    <p className="text-sm">Be the first to create a topic!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => router.push(`/topic/${topic.id}`)}
                        className="block p-3 md:p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 bg-white cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          {/* Author Avatar */}
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/profile/${topic.author.id}`);
                            }}
                            className="flex-shrink-0 cursor-pointer"
                          >
                            {topic.author.user_image_url ? (
                              <img
                                src={topic.author.user_image_url}
                                alt={topic.author.username}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-blue-100">
                                {topic.author.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Topic Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title and Badges */}
                            <div className="flex items-start gap-2 mb-2">
                              <h3 className="text-base md:text-lg font-semibold text-gray-900 hover:text-blue-600 transition flex-1 line-clamp-2">
                                {topic.title}
                              </h3>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {topic.is_pinned && (
                                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium border border-yellow-200">
                                    📌
                                  </span>
                                )}
                                {topic.is_locked && (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium border border-gray-200">
                                    🔒
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center gap-3 md:gap-4 text-xs text-gray-500 flex-wrap mb-2">
                              <span className="flex items-center gap-1 font-medium">
                                <FaUser className="text-blue-500 text-[10px]" />
                                <span 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/profile/${topic.author.id}`);
                                  }}
                                  className="hover:text-blue-600 transition cursor-pointer"
                                >
                                  {topic.author.username}
                                </span>
                              </span>
                              <span className="flex items-center gap-1">
                                <FaClock className="text-gray-400 text-[10px]" />
                                {formatDate(topic.created_at)}
                              </span>
                              {topic.category && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/category/${topic.category.id}`);
                                  }}
                                  className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition font-medium cursor-pointer"
                                >
                                  <span>{topic.category.icon || '📁'}</span>
                                  <span>{topic.category.name}</span>
                                </span>
                              )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-3 md:gap-4 text-xs">
                              <span className="flex items-center gap-1 text-green-600 font-medium">
                                <FaEye className="text-[10px]" />
                                {topic.views}
                              </span>
                              <span className="flex items-center gap-1 text-purple-600 font-medium">
                                <FaReply className="text-[10px]" />
                                {topic.replies_count}
                              </span>
                              <span className="flex items-center gap-1 text-blue-600 font-medium">
                                <FaThumbsUp className="text-[10px]" />
                                {topic.likes_count}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {!topicsLoading && topics.length > 0 && totalPages > 1 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                      >
                        <FaChevronLeft className="text-xs" />
                        <span className="hidden sm:inline">Previous</span>
                      </button>

                      <div className="flex items-center gap-1 md:gap-2">
                        {/* First page */}
                        {currentPage > 3 && (
                          <>
                            <button
                              onClick={() => handlePageChange(1)}
                              className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-sm font-medium"
                            >
                              1
                            </button>
                            {currentPage > 4 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                          </>
                        )}

                        {/* Page numbers around current page */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            return page === currentPage || 
                                   page === currentPage - 1 || 
                                   page === currentPage + 1 ||
                                   (page === 1 && currentPage <= 3) ||
                                   (page === totalPages && currentPage >= totalPages - 2);
                          })
                          .map(page => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border transition text-sm font-medium ${
                                page === currentPage
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}

                        {/* Last page */}
                        {currentPage < totalPages - 2 && (
                          <>
                            {currentPage < totalPages - 3 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(totalPages)}
                              className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-sm font-medium"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <FaChevronRight className="text-xs" />
                      </button>
                    </div>

                    <div className="text-center mt-3 text-xs text-gray-500">
                      Page {currentPage} of {totalPages} • {totalTopics} total topics
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Sidebar Banner */}
            {sideBanners.length > 0 && (
              <div>
                <AdBannerComponent location="home_sidebar" />
              </div>
            )}

            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-blue-600">📊</span>
                Forum Stats
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-transparent rounded-lg">
                  <span className="text-sm text-gray-600 font-medium">Categories:</span>
                  <span className="font-bold text-blue-600">{categories.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gradient-to-r from-purple-50 to-transparent rounded-lg">
                  <span className="text-sm text-gray-600 font-medium">Topics:</span>
                  <span className="font-bold text-purple-600">{totalTopics}</span>
                </div>
                {(() => {
                  // Calculate total replies from categories if available
                  const categoryReplies = categories.reduce((sum, cat) => sum + (cat.replies_count || 0), 0);
                  
                  // Only show replies stat if we have data
                  if (categoryReplies > 0) {
                    return (
                      <div className="flex justify-between items-center p-2 bg-gradient-to-r from-green-50 to-transparent rounded-lg">
                        <span className="text-sm text-gray-600 font-medium">Replies:</span>
                        <span className="font-bold text-green-600">{categoryReplies}</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Hot Topics */}
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-orange-600">🔥</span>
                Hot Topics
              </h3>
              <div className="space-y-2.5">
                {hotTopics.length > 0 ? (
                  hotTopics.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => router.push(`/topic/${topic.id}`)}
                      className="flex items-start gap-2 p-2 bg-gradient-to-r from-orange-50 to-transparent rounded-lg hover:from-orange-100 transition cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-gray-800 truncate mb-1">
                          {topic.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaEye className="text-blue-500" />
                            {topic.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaThumbsUp className="text-green-500" />
                            {topic.likes_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-2">No topics yet</p>
                )}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-md p-5 border border-yellow-100">
              <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-yellow-600">👑</span>
                Top Contributors
              </h3>
              <div className="space-y-2.5">
                {(() => {
                  // Calculate top contributors from topics
                  const contributorMap = new Map();
                  
                  topics.forEach(topic => {
                    const author = topic.author;
                    if (author) {
                      const key = author.id;
                      if (!contributorMap.has(key)) {
                        contributorMap.set(key, {
                          id: author.id,
                          username: author.username,
                          avatar: author.user_image_url,
                          count: 0
                        });
                      }
                      contributorMap.get(key).count += 1;
                    }
                  });

                  const topContributors = Array.from(contributorMap.values())
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                  return topContributors.length > 0 ? (
                    topContributors.map((contributor) => (
                      <div
                        key={contributor.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/profile/${contributor.id}`);
                        }}
                        className="flex items-center gap-2.5 p-2 bg-white rounded-lg hover:bg-gradient-to-r hover:from-yellow-100 hover:to-transparent transition cursor-pointer"
                      >
                        {contributor.avatar ? (
                          <img
                            src={contributor.avatar}
                            alt={contributor.username}
                            className="w-8 h-8 rounded-full object-cover border-2 border-yellow-300"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 text-white rounded-full flex items-center justify-center font-bold text-xs border-2 border-yellow-300">
                            {contributor.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {contributor.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            {contributor.count} {contributor.count === 1 ? 'topic' : 'topics'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-2">No contributors yet</p>
                  );
                })()}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-5 border border-blue-100">
              <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-blue-600">🔗</span>
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/leaderboard" 
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition p-2 rounded-lg hover:bg-white"
                  >
                    <span>🏆</span>
                    Top Members
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/tags" 
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition p-2 rounded-lg hover:bg-white"
                  >
                    <span>🏷️</span>
                    Popular Tags
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/guidelines" 
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition p-2 rounded-lg hover:bg-white"
                  >
                    <span>📖</span>
                    Community Guidelines
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      {bottomBanners.length > 0 && (
        <div className="container mx-auto px-4 py-4">
          <AdBannerComponent location="home_bottom" />
        </div>
      )}
    </div>
  );
}

