import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCategories, getCategoryTopics, searchAll } from '../services/api';
import '../styles/CategoryPage.css';

function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [popularTags, setPopularTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // Track if search button was clicked

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesData, topicsData] = await Promise.all([
          getCategories(),
          getCategoryTopics(id, { page: currentPage, page_size: itemsPerPage })
        ]);
        
        // Handle paginated response - extract results array if paginated
        const allCategories = categoriesData.results || categoriesData;
        const currentCategory = allCategories.find(cat => cat.id === parseInt(id));
        setCategory(currentCategory);
        
        // Handle paginated response from backend
        const allTopics = topicsData.results || topicsData;
        setTopics(allTopics);
        setTotalCount(topicsData.count || allTopics.length);
        setTotalPages(Math.ceil((topicsData.count || 0) / itemsPerPage) || 1);
        
        // Calculate popular tags from all topics in this category
        calculatePopularTags(allTopics);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentPage, itemsPerPage]);

  const calculatePopularTags = (topicsArray) => {
    // Count tag occurrences
    const tagCount = {};
    
    topicsArray.forEach(topic => {
      if (topic.tags && Array.isArray(topic.tags)) {
        topic.tags.forEach(tag => {
          if (tag) {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          }
        });
      }
    });

    // Convert to array and sort by count
    const sortedTags = Object.entries(tagCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 tags

    setPopularTags(sortedTags);
  };

  useEffect(() => {
    // Reset to page 1 when category or items per page changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [id, itemsPerPage]);

  // Manual search function triggered by button click
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true); // Mark that search has been performed
    try {
      const results = await searchAll(searchQuery, {
        filter: 'topics',
        category: id
      });
      setSearchResults(results.topics || []);
    } catch (err) {
      console.error('Error searching topics:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}min ago`;
    if (diffHours < 24) return `${diffHours}hr ago`;
    return `${diffDays}d ago`;
  };

  const getCategoryStats = () => {
    return {
      topics: totalCount,
      replies: topics.reduce((sum, topic) => sum + topic.replies_count, 0),
      members: new Set(topics.map(t => t.author.id)).size,
      activeToday: Math.floor(topics.length * 0.6)
    };
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <button
        key="prev"
        className="page-btn"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
    );

    // First page
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          className="page-btn"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`page-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          className="page-btn"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        className="page-btn"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    );

    return buttons;
  };

  if (loading) {
    return <div className="category-page-loading">Loading category...</div>;
  }

  if (!category) {
    return <div className="category-page-error">Category not found</div>;
  }

  const stats = getCategoryStats();

  // Determine which topics to display based on search and active tab
  let displayedTopics;
  
  // Only use search results if search button was actually clicked
  if (hasSearched) {
    // Use backend search results
    displayedTopics = searchResults;
    
    // If "My Posts" tab is active, filter search results by user
    if (activeTab === 'myposts' && user) {
      displayedTopics = searchResults.filter(topic => topic.author?.id === user.id);
    }
  } else {
    // No search performed - use normal tab filtering
    displayedTopics = activeTab === 'myposts' && user
      ? topics.filter(topic => topic.author?.id === user.id)
      : topics;
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setHasSearched(false); // Reset search state
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Clear search when switching tabs
    if (hasSearched) {
      clearSearch();
    }
  };

  return (
    <div className="category-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-separator">›</span>
        <Link to="/#categories">Categories</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{category.title}</span>
      </div>

      {/* Category Header */}
      <div className="category-header">
        <div className="category-info">
          <h1 className="category-title">
            <span className="category-icon">{category.icon}</span>
            {category.title}
          </h1>
          <p className="category-description">{category.description}</p>
        </div>
      </div>

      {/* Tabs and Sorting Bar */}
      <div className="category-tabs-bar">
        <div className="category-tabs">
          <button 
            className={`tab ${activeTab === 'latest' ? 'active' : ''}`}
            onClick={() => handleTabChange('latest')}
          >
            🆕 Latest
          </button>
          <button 
            className={`tab ${activeTab === 'myposts' ? 'active' : ''}`}
            onClick={() => handleTabChange('myposts')}
            disabled={!user}
          >
            📅 My Posts
          </button>
        </div>
        <div className="pagination-controls">
          <label>Items per page:</label>
          <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="items-per-page-select">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div className="category-content">
        {/* Main Content Area */}
        <div className="category-main-content">
          {/* Search Bar for Topics */}
          <div className="category-search-bar">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="category-search-input"
                placeholder="Search topics in this category..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={clearSearch}>
                  ✕
                </button>
              )}
              <button 
                className="search-submit-btn" 
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
              >
                {isSearching ? '⏳' : (
                  <>
                    🔍
                    <span className="search-btn-text">Search</span>
                  </>
                )}
              </button>
            </div>
            {hasSearched && !isSearching && (
              <div className="search-results-count">
                <span>
                  Found {displayedTopics.length} topic{displayedTopics.length !== 1 ? 's' : ''} for "{searchQuery}"
                </span>
                <button className="clear-search-link" onClick={clearSearch}>
                  Clear Search ✕
                </button>
              </div>
            )}
            {isSearching && (
              <div className="search-results-count searching">
                Searching...
              </div>
            )}
          </div>

          {/* Topics List */}
          <div className="topics-list-container">
          {isSearching ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <h3>Searching topics...</h3>
              <p>Please wait while we search for "{searchQuery}"</p>
            </div>
          ) : displayedTopics.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                {hasSearched ? '🔍' : ''}
              </div>
              <h3>
                {hasSearched 
                  ? `No topics found matching "${searchQuery}"` 
                  : activeTab === 'myposts' 
                    ? 'You haven\'t created any topics in this category yet.' 
                    : 'No topics yet in this category.'}
              </h3>
              <p>
                {hasSearched 
                  ? 'Try a different search term or clear the search to see all topics.' 
                  : activeTab === 'myposts' 
                    ? 'Start a new discussion to see it here.' 
                    : 'Be the first to start a discussion.'}
              </p>
              {hasSearched ? (
                <button className="create-topic-btn" onClick={clearSearch}>Clear Search</button>
              ) : (
                <button className="create-topic-btn" onClick={() => navigate('/create-topic')}>Create Topic</button>
              )}
            </div>
          ) : (
            <div className="topics-list">
              {displayedTopics.map((topic) => (
                <Link to={`/topic/${topic.id}`} key={topic.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="topic-row">
                    <div className="topic-user-info">
                      <div className="user-image">
                        {topic.author?.user_image_url ? (
                          <img 
                            src={topic.author.user_image_url} 
                            alt={topic.author.username}
                            className="image-display"
                          />
                        ) : (
                          topic.author?.username?.[0]?.toUpperCase() || "?"
                        )}
                      </div>
                      <div className="user-meta">
                        <span className="user-name">{topic.author?.username || "Unknown"}</span>
                        <span className="post-time"> • {getTimeAgo(topic.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="topic-content">
                      <h3 className="topic-title-link">{topic.title}</h3>
                      <p className="topic-preview">
                        {topic.content ? topic.content.substring(0, 100) + '...' : 'Click to read more...'}
                      </p>
                      <div className="topic-tags">
                        {topic.tags && topic.tags.length > 0 ? (
                          topic.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))
                        ) : (
                          <span className="tag">{category.title}</span>
                        )}
                      </div>
                    </div>

                    <div className="topic-stats-bar">
                      <span className="stat-item">
                        💬 {topic.replies_count || 0} replies
                      </span>
                      <span className="stat-item">
                        👁 {topic.views || 0} views
                      </span>
                      <span className="last-activity">
                        🕒 Last activity: {getTimeAgo(topic.updated_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {(activeTab === 'latest' ? totalCount : displayedTopics.length) > 0 && (
            <div className="pagination-wrapper">
              <div className="pagination-info">
                {activeTab === 'myposts' 
                  ? `Showing ${displayedTopics.length} of your topics in this category`
                  : `Showing page ${currentPage} of ${totalPages} (${totalCount} total topics)`
                }
              </div>
              {totalPages > 1 && activeTab === 'latest' && (
                <div className="pagination">
                  {renderPaginationButtons()}
                </div>
              )}
            </div>
          )}
        </div>
        </div>

        {/* Right Sidebar */}
        <aside className="category-sidebar">
          {/* New Topic Button */}
          <button className="new-topic-btn" onClick={() => navigate('/create-topic')}>
            <span className="btn-icon">➕</span> New Topic
          </button>

          {/* Category Stats */}
          <div className="sidebar-card stats-card">
            <h3>📊 Category Stats</h3>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-label">Topics:</span>
                <span className="stat-value">{stats.topics}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Replies:</span>
                <span className="stat-value">{stats.replies}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Members:</span>
                <span className="stat-value">{stats.members}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Active Today:</span>
                <span className="stat-value">{stats.activeToday}</span>
              </div>
            </div>
          </div>

          {/* Quick Help / Rules */}
          <div className="sidebar-card rules-card">
            <h3>📋 Category Rules</h3>
            {category.rules && category.rules.length > 0 ? (
              <>
                <ul className="rules-list">
                  {category.rules
                    .filter(rule => rule.is_active)
                    .slice(0, 5)
                    .map((rule, index) => (
                      <li key={rule.id}>
                        <strong>{index + 1}. {rule.title}</strong>
                        <p>{rule.description}</p>
                      </li>
                    ))}
                </ul>
                {category.rules.filter(rule => rule.is_active).length > 5 && (
                  <button className="view-rules-btn">
                    View All {category.rules.filter(rule => rule.is_active).length} Rules
                  </button>
                )}
              </>
            ) : (
              <p className="no-rules">No rules set for this category yet.</p>
            )}
          </div>

          {/* Popular Tags */}
          <div className="sidebar-card tags-card">
            <h3>🏷️ Popular Tags</h3>
            {popularTags.length > 0 ? (
              <div className="tags-cloud">
                {popularTags.map((tag) => (
                  <span key={tag.name} className="tag-pill" title={`Used in ${tag.count} topic(s)`}>
                    {tag.name} <span className="tag-count">({tag.count})</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="no-tags">No tags used in this category yet.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CategoryPage;
