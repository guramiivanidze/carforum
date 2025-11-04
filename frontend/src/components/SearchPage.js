import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTopics, getCategories, searchAll, getPopularTags } from '../services/api';
import '../styles/SearchPage.css';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);

  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Data state
  const [allTopics, setAllTopics] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [latestTopics, setLatestTopics] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [topContributors, setTopContributors] = useState([]);

  // Search results
  const [searchResults, setSearchResults] = useState({
    topics: [],
    users: [],
    categories: [],
    tags: []
  });

  // Active filters - keeping filters even though setFilters is unused for now
  const [filters] = useState({
    tag: null,
    category: null,
    minReplies: null,
    dateRange: null,
    solved: false,
    followedAuthors: false
  });

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const timer = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults({ topics: [], users: [], tags: [] });
      setShowSuggestions(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeFilter]);

  const fetchInitialData = async () => {
    try {
      const [topicsData, categoriesData, tagsData] = await Promise.all([
        getTopics(),
        getCategories(),
        getPopularTags()
      ]);

      // Handle paginated responses - extract results array if paginated
      const allTopicsArray = topicsData.results || topicsData;
      const allCategoriesArray = categoriesData.results || categoriesData;

      setAllTopics(allTopicsArray);
      setAllCategories(allCategoriesArray);

      // Calculate trending topics (high engagement recently)
      const trending = [...allTopicsArray]
        .sort((a, b) => (b.replies_count + b.views * 0.1) - (a.replies_count + a.views * 0.1))
        .slice(0, 8);
      setTrendingTopics(trending);

      // Latest topics
      const latest = [...allTopicsArray]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 6);
      setLatestTopics(latest);

      // Set popular tags from API
      const tags = tagsData.map(tag => ({
        name: tag.name,
        count: tag.usage_count,
        trending: tag.usage_count > 100 // Mark as trending if used more than 100 times
      }));
      setPopularTags(tags);

      // Mock top contributors
      setTopContributors([
        { id: 1, username: 'guka_dev', posts: 142, reputation: 543 },
        { id: 2, username: 'tech_guru', posts: 128, reputation: 489 },
        { id: 3, username: 'qa_master', posts: 115, reputation: 421 },
        { id: 4, username: 'code_ninja', posts: 98, reputation: 387 }
      ]);

    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ topics: [], users: [], tags: [], categories: [] });
      return;
    }

    setIsSearching(true);

    try {
      // Call the backend search API
      const searchFilters = {
        filter: activeFilter
      };

      // Only add filters if they have values
      if (filters.category) {
        searchFilters.category = filters.category;
      }
      if (filters.minReplies) {
        searchFilters.min_replies = filters.minReplies;
      }
      searchFilters.sort = 'relevance';

      const results = await searchAll(query, searchFilters);
      
      setSearchResults({
        topics: results.topics || [],
        users: results.users || [],
        categories: results.categories || [],
        tags: results.tags || []  // Keep tags for compatibility
      });

      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ topics: [], users: [], tags: [], categories: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setSearchResults({ topics: [], users: [], tags: [], categories: [] });
    setShowSuggestions(false);
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const hasSearchResults = searchQuery.length > 0;
  const hasAnyResults = (searchResults.topics?.length > 0 || 
                        searchResults.users?.length > 0 || 
                        searchResults.categories?.length > 0 ||
                        searchResults.tags?.length > 0);

  return (
    <div className="search-page">
      <div className="search-page-container">
        {/* Top Section */}
        <div className="search-header">
          <h1 className="search-page-title">Explore & Search</h1>
          <p className="search-page-subtitle">Find conversations, users, and topics on the forum.</p>

          {/* Search Bar */}
          <div className="search-bar-wrapper">
            <div className="search-bar-container">
              <span className="search-icon">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="Search topics, users, tags..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery && setShowSuggestions(true)}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={clearSearch}>
                  ❌
                </button>
              )}
            </div>

            {/* Auto-suggestions Dropdown */}
            {showSuggestions && hasAnyResults && (
              <div className="search-suggestions-dropdown">
                {searchResults.topics?.length > 0 && (
                  <div className="suggestions-section">
                    <div className="suggestions-header">Topics</div>
                    {searchResults.topics.slice(0, 3).map(topic => (
                      <Link
                        key={topic.id}
                        to={`/topic/${topic.id}`}
                        className="suggestion-item"
                        onClick={() => setShowSuggestions(false)}
                      >
                        <span className="suggestion-icon">💬</span>
                        <span className="suggestion-text">{topic.title}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.users?.length > 0 && (
                  <div className="suggestions-section">
                    <div className="suggestions-header">Users</div>
                    {searchResults.users.slice(0, 3).map(user => (
                      <Link
                        key={user.id}
                        to={`/profile/${user.id}`}
                        className="suggestion-item"
                        onClick={() => setShowSuggestions(false)}
                      >
                        <span className="suggestion-image">{user.username?.[0]?.toUpperCase() || '?'}</span>
                        <span className="suggestion-text">{user.username}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.tags?.length > 0 && (
                  <div className="suggestions-section">
                    <div className="suggestions-header">Tags</div>
                    <div className="suggestions-tags">
                      {searchResults.tags.slice(0, 3).map(tag => (
                        <span key={tag.name} className="suggestion-tag">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.categories?.length > 0 && (
                  <div className="suggestions-section">
                    <div className="suggestions-header">Categories</div>
                    {searchResults.categories.slice(0, 3).map(category => (
                      <Link
                        key={category.id}
                        to={`/category/${category.id}`}
                        className="suggestion-item"
                        onClick={() => setShowSuggestions(false)}
                      >
                        <span className="suggestion-icon">{category.icon}</span>
                        <span className="suggestion-text">{category.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="search-filters">
            {['all', 'topics', 'users', 'tags', 'categories'].map(filter => (
              <button
                key={filter}
                className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        {hasSearchResults ? (
          // Search Results View
          <div className="search-results-container">
            {!hasAnyResults ? (
              <div className="empty-search">
                <div className="empty-search-icon">😕</div>
                <h2>No results found</h2>
                <p>Try another keyword or search broader terms.</p>
              </div>
            ) : (
              <>
                {/* Topic Results */}
                {searchResults.topics?.length > 0 && (activeFilter === 'all' || activeFilter === 'topics') && (
                  <div className="search-results-section">
                    <h2 className="results-section-title">Topics ({searchResults.topics.length})</h2>
                    <div className="results-list">
                      {searchResults.topics.map(topic => (
                        <Link key={topic.id} to={`/topic/${topic.id}`} className="search-result-card">
                          <h3 className="result-title">{topic.title}</h3>
                          <p className="result-snippet">
                            {topic.content?.substring(0, 150)}...
                          </p>
                          <div className="result-meta">
                            <span className="result-category">{topic.category.title}</span>
                            <span className="result-stat">👁 {topic.views}</span>
                            <span className="result-stat">💬 {topic.replies_count}</span>
                            <span className="result-time">🕓 {getTimeAgo(topic.created_at)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Results */}
                {searchResults.users?.length > 0 && (activeFilter === 'all' || activeFilter === 'users') && (
                  <div className="search-results-section">
                    <h2 className="results-section-title">Users ({searchResults.users.length})</h2>
                    <div className="results-grid">
                      {searchResults.users.map(user => (
                        <Link key={user.id} to={`/profile/${user.id}`} className="user-result-card">
                          <div className="user-result-avatar">{user.username?.[0]?.toUpperCase() || '?'}</div>
                          <div className="user-result-info">
                            <h3 className="user-result-name">@{user.username}</h3>
                            <p className="user-result-stats">Points: {user.points || 0}</p>
                            {user.bio && <p className="user-result-bio">{user.bio}</p>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tag Results */}
                {searchResults.tags?.length > 0 && (activeFilter === 'all' || activeFilter === 'tags') && (
                  <div className="search-results-section">
                    <h2 className="results-section-title">Tags ({searchResults.tags.length})</h2>
                    <div className="results-grid">
                      {searchResults.tags.map(tag => (
                        <div key={tag.name} className="tag-result-card">
                          <h3 className="tag-result-name">#{tag.name}</h3>
                          <p className="tag-result-count">{tag.count} topics</p>
                          {tag.trending && (
                            <span className="tag-trending">📈 trending</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Results */}
                {searchResults.categories?.length > 0 && (activeFilter === 'all' || activeFilter === 'categories') && (
                  <div className="search-results-section">
                    <h2 className="results-section-title">Categories ({searchResults.categories.length})</h2>
                    <div className="results-grid">
                      {searchResults.categories.map(category => (
                        <Link key={category.id} to={`/category/${category.id}`} className="category-result-card">
                          <div className="category-result-icon">{category.icon}</div>
                          <div className="category-result-info">
                            <h3 className="category-result-name">{category.title}</h3>
                            <p className="category-result-desc">{category.description}</p>
                            <p className="category-result-stats">
                              {category.topics_count} topics
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          // Explore View (no search)
          <div className="explore-content">
            <div className="explore-grid">
              {/* Trending Topics */}
              <div className="explore-card">
                <h2 className="explore-card-title">🔥 Trending Now</h2>
                <div className="trending-list">
                  {trendingTopics.map(topic => (
                    <Link key={topic.id} to={`/topic/${topic.id}`} className="trending-item">
                      <span className="trending-icon">🔥</span>
                      <div className="trending-info">
                        <h3 className="trending-title">{topic.title}</h3>
                        <div className="trending-stats">
                          <span>💬 {topic.replies_count}</span>
                          <span>👁 {topic.views}</span>
                          <span className="trending-time">Updated {getTimeAgo(topic.updated_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Latest Discussions */}
              <div className="explore-card">
                <h2 className="explore-card-title">🆕 Latest Posts</h2>
                <div className="latest-list">
                  {latestTopics.map((topic, index) => (
                    <div key={topic.id}>
                      <Link to={`/topic/${topic.id}`} className="latest-item">
                        <h3 className="latest-title">{topic.title}</h3>
                        <div className="latest-meta">
                          <span>by @{topic.author.username}</span>
                          <span>•</span>
                          <span>{getTimeAgo(topic.created_at)}</span>
                        </div>
                        <div className="latest-stats">
                          <span>💬 {topic.replies_count} replies</span>
                          <span>•</span>
                          <span>👁 {topic.views} views</span>
                        </div>
                      </Link>
                      {index < latestTopics.length - 1 && <div className="latest-divider" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div className="explore-card">
                <h2 className="explore-card-title">🏷️ Popular Tags</h2>
                <div className="tags-cloud">
                  {popularTags.map(tag => (
                    <span
                      key={tag.name}
                      className={`tag-pill ${tag.trending ? 'tag-trending' : ''}`}
                      style={{ fontSize: `${0.9 + (tag.count / 300)}rem` }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
                <Link to="/tags" className="explore-see-all">See all tags →</Link>
              </div>

              {/* Top Categories */}
              <div className="explore-card">
                <h2 className="explore-card-title">📂 Top Categories</h2>
                <div className="categories-grid">
                  {allCategories.slice(0, 4).map(category => (
                    <Link key={category.id} to={`/category/${category.id}`} className="category-tile">
                      <div className="category-tile-icon">{category.icon}</div>
                      <h3 className="category-tile-name">{category.title}</h3>
                      <p className="category-tile-count">{category.topics_count} topics</p>
                      <span className="category-tile-arrow">➜ Open</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Top Contributors */}
              <div className="explore-card">
                <h2 className="explore-card-title">⭐ Top Contributors</h2>
                <div className="contributors-list">
                  {topContributors.map(user => (
                    <div key={user.id} className="contributor-item">
                      <Link to={`/profile/${user.id}`} className="contributor-info">
                        <div className="contributor-image">{user.username?.[0]?.toUpperCase() || '?'}</div>
                        <div className="contributor-details">
                          <h3 className="contributor-name">@{user.username}</h3>
                          <p className="contributor-stats">
                            Posts: {user.posts} | Reputation: {user.reputation}
                          </p>
                        </div>
                      </Link>
                      <button className="contributor-follow-btn">Follow</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
