import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCategories, getTopics } from '../services/api';
import '../styles/CategoryPage.css';

function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('latest');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, topicsData] = await Promise.all([
          getCategories(),
          getTopics()
        ]);
        
        const currentCategory = categoriesData.find(cat => cat.id === parseInt(id));
        setCategory(currentCategory);
        
        const categoryTopics = topicsData.filter(topic => topic.category === parseInt(id));
        setTopics(categoryTopics);
        setFilteredTopics(categoryTopics);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    handleSorting(activeTab);
  }, [topics, activeTab, sortBy]);

  const handleSorting = (tab) => {
    let sorted = [...topics];
    
    switch (tab) {
      case 'trending':
        sorted.sort((a, b) => (b.replies_count + b.views) - (a.replies_count + a.views));
        break;
      case 'latest':
        sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        break;
      case 'top':
        sorted.sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }
    
    setFilteredTopics(sorted);
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
      topics: topics.length,
      posts: topics.reduce((sum, topic) => sum + topic.replies_count, 0),
      members: new Set(topics.map(t => t.author.id)).size,
      activeToday: Math.floor(topics.length * 0.6)
    };
  };

  if (loading) {
    return <div className="category-page-loading">Loading category...</div>;
  }

  if (!category) {
    return <div className="category-page-error">Category not found</div>;
  }

  const stats = getCategoryStats();

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
            className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            🔥 Trending
          </button>
          <button
            className={`tab ${activeTab === 'latest' ? 'active' : ''}`}
            onClick={() => setActiveTab('latest')}
          >
            🆕 Latest
          </button>
          <button
            className={`tab ${activeTab === 'top' ? 'active' : ''}`}
            onClick={() => setActiveTab('top')}
          >
            👑 Top
          </button>
          <button className="tab" disabled>
            📅 My Posts
          </button>
        </div>
        <div className="sort-dropdown">
          <label>Sort by</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="most-replies">Most replies</option>
            <option value="most-views">Most views</option>
          </select>
        </div>
      </div>

      <div className="category-content">
        {/* Main Content - Topics List */}
        <div className="topics-list-container">
          {filteredTopics.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No topics yet in this category.</h3>
              <p>Be the first to start a discussion.</p>
              <button className="create-topic-btn">Create Topic</button>
            </div>
          ) : (
            <div className="topics-list">
              {filteredTopics.map((topic) => (
                <Link to={`/topic/${topic.id}`} key={topic.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="topic-row">
                    <div className="topic-user-info">
                      <div className="user-avatar">{topic.author.avatar}</div>
                      <div className="user-meta">
                        <span className="user-name">{topic.author.username}</span>
                        <span className="post-time"> • {getTimeAgo(topic.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="topic-content">
                      <h3 className="topic-title-link">{topic.title}</h3>
                      <p className="topic-preview">
                        {topic.content ? topic.content.substring(0, 100) + '...' : 'Click to read more...'}
                      </p>
                      <div className="topic-tags">
                        <span className="tag">{category.title}</span>
                      </div>
                    </div>

                    <div className="topic-stats-bar">
                      <span className="stat-item">
                        💬 {topic.replies_count} replies
                      </span>
                      <span className="stat-item">
                        👁 {topic.views} views
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
          {filteredTopics.length > 0 && (
            <div className="pagination">
              <button className="page-btn" disabled>Previous</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <button className="page-btn">Next</button>
            </div>
          )}
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
                <span className="stat-label">Posts:</span>
                <span className="stat-value">{stats.posts}</span>
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
            <h3>🧠 Category Rules</h3>
            <ul className="rules-list">
              <li>Be respectful</li>
              <li>No spam or ads</li>
              <li>Keep topics {category.title.toLowerCase()} related</li>
            </ul>
            <button className="view-rules-btn">View Full Rules</button>
          </div>

          {/* Popular Tags */}
          <div className="sidebar-card tags-card">
            <h3>🏷️ Popular Tags</h3>
            <div className="tags-cloud">
              <span className="tag-pill">React</span>
              <span className="tag-pill">Python</span>
              <span className="tag-pill">Docker</span>
              <span className="tag-pill">Next.js</span>
              <span className="tag-pill">Testing</span>
              <span className="tag-pill">Django</span>
              <span className="tag-pill">Node.js</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CategoryPage;
