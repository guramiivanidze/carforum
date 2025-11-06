'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { searchAll } from '@/lib/api';
import { FaSearch, FaUser, FaFolder, FaComments, FaEye, FaThumbsUp, FaReply, FaClock } from 'react-icons/fa';

interface SearchResult {
  topics: any[];
  users: any[];
  categories: any[];
  total: number;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [results, setResults] = useState<SearchResult>({
    topics: [],
    users: [],
    categories: [],
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'topics' | 'users' | 'categories'>('all');

  useEffect(() => {
    setSearchQuery(queryParam);
    if (queryParam) {
      performSearch(queryParam);
    }
  }, [queryParam]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await searchAll(query);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults({
        topics: [],
        users: [],
        categories: [],
        total: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getFilteredResults = () => {
    if (activeTab === 'all') return results;
    if (activeTab === 'topics') return { ...results, users: [], categories: [] };
    if (activeTab === 'users') return { ...results, topics: [], categories: [] };
    if (activeTab === 'categories') return { ...results, topics: [], users: [] };
    return results;
  };

  const filteredResults = getFilteredResults();
  const hasResults = filteredResults.topics.length > 0 || 
                     filteredResults.users.length > 0 || 
                     filteredResults.categories.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaSearch className="text-blue-600" />
            Search Forum
          </h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for topics, users, categories..."
              className="w-full px-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Search
            </button>
          </form>

          {/* Results Count */}
          {queryParam && (
            <div className="mt-4 text-sm text-gray-600">
              {loading ? (
                <span>Searching...</span>
              ) : (
                <span>
                  Found <strong className="text-blue-600">{results.total}</strong> results for "{queryParam}"
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        {queryParam && (
          <div className="bg-white rounded-xl shadow-md mb-6 border border-gray-200">
            <div className="flex flex-wrap border-b border-gray-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 min-w-[100px] px-6 py-4 font-medium transition ${
                  activeTab === 'all'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                All ({results.total})
              </button>
              <button
                onClick={() => setActiveTab('topics')}
                className={`flex-1 min-w-[100px] px-6 py-4 font-medium transition ${
                  activeTab === 'topics'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FaComments className="inline mr-2" />
                Topics ({results.topics.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 min-w-[100px] px-6 py-4 font-medium transition ${
                  activeTab === 'users'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FaUser className="inline mr-2" />
                Users ({results.users.length})
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex-1 min-w-[100px] px-6 py-4 font-medium transition ${
                  activeTab === 'categories'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FaFolder className="inline mr-2" />
                Categories ({results.categories.length})
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        ) : queryParam && !hasResults ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
            <FaSearch className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try different keywords or filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Topics Results */}
            {filteredResults.topics.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaComments className="text-blue-600" />
                  Topics ({filteredResults.topics.length})
                </h2>
                <div className="space-y-3">
                  {filteredResults.topics.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => router.push(`/topic/${topic.id}`)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition cursor-pointer"
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
                          <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 transition mb-1">
                            {topic.title}
                          </h3>
                          
                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/profile/${topic.author.id}`);
                              }}
                              className="hover:text-blue-600 transition cursor-pointer font-medium"
                            >
                              <FaUser className="inline mr-1" />
                              {topic.author.username}
                            </span>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/category/${topic.category.id}`);
                              }}
                              className="hover:text-blue-600 transition cursor-pointer"
                            >
                              <FaFolder className="inline mr-1" />
                              {topic.category.title || topic.category.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaClock className="text-gray-400" />
                              {new Date(topic.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1 text-blue-600">
                              <FaEye />
                              {topic.views || 0}
                            </span>
                            <span className="flex items-center gap-1 text-green-600">
                              <FaThumbsUp />
                              {topic.likes_count || 0}
                            </span>
                            <span className="flex items-center gap-1 text-purple-600">
                              <FaReply />
                              {topic.replies_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Results */}
            {filteredResults.users.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUser className="text-green-600" />
                  Users ({filteredResults.users.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredResults.users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg ring-2 ring-green-100">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {user.username}
                        </h3>
                        {user.bio && (
                          <p className="text-xs text-gray-600 truncate">{user.bio}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {user.points || 0} points
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Results */}
            {filteredResults.categories.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaFolder className="text-purple-600" />
                  Categories ({filteredResults.categories.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredResults.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.id}`}
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition"
                    >
                      <div className="flex items-start gap-3">
                        {category.icon && (
                          <span className="text-2xl">{category.icon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {category.title || category.name}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {category.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{category.topics_count || 0} topics</span>
                            {category.replies_count !== undefined && (
                              <span>{category.replies_count} replies</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!queryParam && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
            <FaSearch className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Start Searching</h3>
            <p className="text-gray-600 mb-6">
              Enter keywords to search for topics, users, and categories
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-xs text-gray-500">Popular searches:</span>
              {['Engine', 'Transmission', 'Maintenance', 'Electric'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    router.push(`/search?q=${encodeURIComponent(term)}`);
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-700 transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
