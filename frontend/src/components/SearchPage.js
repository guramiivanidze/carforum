import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTopics, getCategories } from '../services/api';
import '../styles/SearchPage.css';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
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
    tags: []
  });

  // Active filters
  const [filters, setFilters] = useState({
    tag: null,
    category: null,
    minReplies: null,
    dateRange: null,
    solved: false,
    followedAuthors: false
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
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
  }, [searchQuery, activeFilter]);

  const fetchInitialData = async () => {
    try {
      const [topicsData, categoriesData] = await Promise.all([
        getTopics(),
        getCategories()
      ]);

      setAllTopics(topicsData);
      setAllCategories(categoriesData);

      // Calculate trending topics (high engagement recently)
      const trending = [...topicsData]
        .sort((a, b) => (b.replies_count + b.views * 0.1) - (a.replies_count + a.views * 0.1))
        .slice(0, 8);
      setTrendingTopics(trending);

      // Latest topics
      const latest = [...topicsData]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 6);
      setLatestTopics(latest);

      // Extract popular tags (mock for now)
      const tags = [
        { name: 'python', count: 245, trending: true },
        { name: 'django', count: 189, trending: true },
        { name: 'react', count: 167, trending: false },
        { name: 'qa', count: 143, trending: false },
        { name: 'selenium', count: 128, trending: false },
        { name: 'cars', count: 98, trending: true },
        { name: 'devops', count: 87, trending: false },
        { name: 'javascript', count: 156, trending: false }
      ];
      setPopularTags(tags.sort((a, b) => b.count - a.count));

      // Mock top contributors
      setTopContributors([
        { id: 1, username: 'guka_dev', avatar: '👨‍💻', posts: 142, reputation: 543 },
        { id: 2, username: 'tech_guru', avatar: '🧑‍💼', posts: 128, reputation: 489 },
        { id: 3, username: 'qa_master', avatar: '👩‍🔬', posts: 115, reputation: 421 },
        { id: 4, username: 'code_ninja', avatar: '🥷', posts: 98, reputation: 387 }
      ]);

    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ topics: [], users: [], tags: [] });
      return;
    }

    setIsSearching(true);
    const lowerQuery = query.toLowerCase();

    // Filter topics
    let topicResults = allTopics.filter(topic =>
      topic.title.toLowerCase().includes(lowerQuery) ||
      topic.content?.toLowerCase().includes(lowerQuery)
    );

    // Apply active filter
    if (activeFilter === 'topics') {
      // Already filtered
    } else if (activeFilter === 'categories') {
      topicResults = [];
    } else if (activeFilter === 'users') {
      topicResults = [];
    } else if (activeFilter === 'tags') {
      topicResults = [];
    }

    // Filter users (mock)
    const userResults = topContributors.filter(user =>
      user.username.toLowerCase().includes(lowerQuery)
    );

    // Filter tags
    const tagResults = popularTags.filter(tag =>
      tag.name.toLowerCase().includes(lowerQuery)
    );

    setSearchResults({
      topics: topicResults,
      users: activeFilter === 'all' || activeFilter === 'users' ? userResults : [],
      tags: activeFilter === 'all' || activeFilter === 'tags' ? tagResults : []
    });

    setShowSuggestions(query.length > 0);
    setIsSearching(false);
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
    setSearchResults({ topics: [], users: [], tags: [] });
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
  const hasAnyResults = searchResults.topics.length > 0 || 
                        searchResults.users.length > 0 || 
                        searchResults.tags.length > 0;

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
                {searchResults.topics.length > 0 && (
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

                {searchResults.users.length > 0 && (
                  <div className="suggestions-section">
                    <div className="suggestions-header">Users</div>
                    {searchResults.users.slice(0, 3).map(user => (
                      <Link
                        key={user.id}
                        to={`/profile/${user.id}`}
                        className="suggestion-item"
                        onClick={() => setShowSuggestions(false)}
                      >
                        <span className="suggestion-avatar">{user.avatar}</span>
                        <span className="suggestion-text">{user.username}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.tags.length > 0 && (
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
                {searchResults.topics.length > 0 && (activeFilter === 'all' || activeFilter === 'topics') && (
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
                {searchResults.users.length > 0 && (activeFilter === 'all' || activeFilter === 'users') && (
                  <div className="search-results-section">
                    <h2 className="results-section-title">Users ({searchResults.users.length})</h2>
                    <div className="results-grid">
                      {searchResults.users.map(user => (
                        <Link key={user.id} to={`/profile/${user.id}`} className="user-result-card">
                          <div className="user-result-avatar">{user.avatar}</div>
                          <div className="user-result-info">
                            <h3 className="user-result-name">@{user.username}</h3>
                            <p className="user-result-stats">Posts: {user.posts} | Rep: {user.reputation}</p>
                          </div>
                          <button className="follow-user-btn">Follow</button>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tag Results */}
                {searchResults.tags.length > 0 && (activeFilter === 'all' || activeFilter === 'tags') && (
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
                        <div className="contributor-avatar">{user.avatar}</div>
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
