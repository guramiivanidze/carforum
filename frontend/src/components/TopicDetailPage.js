import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTopic } from '../services/api';
import '../styles/TopicDetailPage.css';

function TopicDetailPage() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const data = await getTopic(id);
        setTopic(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching topic:', err);
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id]);

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    console.log('Reply submitted:', replyText);
    setReplyText('');
    setShowReplyBox(false);
  };

  if (loading) {
    return <div className="topic-detail-loading">Loading topic...</div>;
  }

  if (!topic) {
    return <div className="topic-detail-error">Topic not found</div>;
  }

  return (
    <div className="topic-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-separator">›</span>
        <Link to="/#categories">Categories</Link>
        <span className="breadcrumb-separator">›</span>
        <Link to={`/category/${topic.category.id}`}>{topic.category.title}</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{topic.title}</span>
      </div>

      {/* Topic Header */}
      <div className="topic-header-block">
        <div className="topic-header-content">
          <h1 className="topic-detail-title">{topic.title}</h1>
          <div className="topic-meta">
            <span className="category-tag">{topic.category.title}</span>
            <span className="meta-item">Created: {getTimeAgo(topic.created_at)}</span>
            <span className="meta-item">👁 {topic.views} views</span>
            <span className="meta-item">💬 {topic.replies_count} replies</span>
            <span className="meta-item">🕒 Last update: {getTimeAgo(topic.updated_at)}</span>
          </div>
        </div>
        <button className="reply-btn-header" onClick={() => setShowReplyBox(true)}>
          Reply
        </button>
      </div>

      <div className="topic-detail-content">
        {/* Main Content */}
        <div className="topic-main-content">
          {/* Original Post */}
          <div className="post-card op-post">
            <div className="post-left">
              <div className="user-avatar-large">{topic.author.avatar}</div>
              <div className="user-info">
                <Link to={`/profile/${topic.author.id}`} className="username-large">{topic.author.username}</Link>
                <div className="user-role-tag">Member</div>
                <div className="user-stats-small">
                  <div>Joined: 2024</div>
                  <div>Posts: {topic.author.points}</div>
                </div>
              </div>
            </div>
            <div className="post-right">
              <div className="post-content">
                <p>{topic.content || 'No content available.'}</p>
              </div>
              <div className="post-actions">
                <button className="action-btn">👍 Like</button>
                <button className="action-btn">Share</button>
              </div>
            </div>
          </div>

          {/* Replies Section */}
          <div className="replies-section">
            <h2 className="replies-heading">{topic.replies_count} Replies</h2>
            
            {topic.replies && topic.replies.length > 0 ? (
              topic.replies.map((reply) => (
                <div key={reply.id} className="post-card reply-card">
                  <div className="post-left">
                    <div className="user-avatar-medium">{reply.author.avatar}</div>
                    <div className="reply-user-info">
                      <Link to={`/profile/${reply.author.id}`} className="username-medium">{reply.author.username}</Link>
                      <div className="reply-time">{getTimeAgo(reply.created_at)}</div>
                    </div>
                  </div>
                  <div className="post-right">
                    <div className="post-content">
                      <p>{reply.content}</p>
                    </div>
                    <div className="post-actions">
                      <button className="action-btn-small">👍 Like</button>
                      <button className="action-btn-small">Quote</button>
                      <button className="action-btn-small">Report</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-replies">
                <p>No replies yet. Be the first to reply!</p>
              </div>
            )}
          </div>

          {/* Reply Editor Box */}
          {showReplyBox && (
            <div className="reply-editor-box">
              <div className="editor-header">
                <div className="user-avatar-small">{topic.author.avatar}</div>
                <span>Write your reply...</span>
              </div>
              <form onSubmit={handleReplySubmit}>
                <textarea
                  className="reply-textarea"
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows="6"
                />
                <div className="editor-toolbar">
                  <div className="toolbar-buttons">
                    <button type="button" className="toolbar-btn" title="Bold">B</button>
                    <button type="button" className="toolbar-btn" title="Italic">I</button>
                    <button type="button" className="toolbar-btn" title="Link">🔗</button>
                    <button type="button" className="toolbar-btn" title="Code">{'</>'}</button>
                    <button type="button" className="toolbar-btn" title="Quote">❝</button>
                    <button type="button" className="toolbar-btn" title="Emoji">🙂</button>
                  </div>
                  <div className="editor-actions">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => {
                        setShowReplyBox(false);
                        setReplyText('');
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="post-reply-btn">
                      Post Reply
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Sticky Reply Button */}
          {!showReplyBox && (
            <button 
              className="floating-reply-btn"
              onClick={() => setShowReplyBox(true)}
            >
              ✍️ Write a Reply
            </button>
          )}
        </div>

        {/* Sidebar */}
        <aside className="topic-detail-sidebar">
          {/* Thread Info Card */}
          <div className="sidebar-card thread-info-card">
            <h3>✅ Thread Info</h3>
            <div className="thread-info-list">
              <div className="info-row">
                <span className="info-label">Topic starter:</span>
                <span className="info-value">{topic.author.username}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Created:</span>
                <span className="info-value">{getTimeAgo(topic.created_at)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Followers:</span>
                <span className="info-value">14</span>
              </div>
              <div className="info-row">
                <span className="info-label">Tags:</span>
                <div className="tag-list">
                  <span className="tag-small">{topic.category.title}</span>
                </div>
              </div>
            </div>
            <button className="follow-topic-btn">⭐ Follow topic</button>
          </div>

          {/* Active Users Card */}
          <div className="sidebar-card active-users-card">
            <h3>👥 Active Users</h3>
            <div className="active-users-list">
              <div className="active-user-avatars">
                <span className="avatar-tiny">👤</span>
                <span className="avatar-tiny">👨</span>
                <span className="avatar-tiny">👩</span>
              </div>
              <p className="active-users-text">3 people are viewing this topic</p>
            </div>
          </div>

          {/* Related Topics Card */}
          <div className="sidebar-card related-topics-card">
            <h3>📚 Related Topics</h3>
            <div className="related-topics-list">
              <a href="#" className="related-topic-link">Deploy FastAPI on VPS?</a>
              <a href="#" className="related-topic-link">Nginx vs Apache for Python app</a>
              <a href="#" className="related-topic-link">Best Linux for backend dev</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default TopicDetailPage;
