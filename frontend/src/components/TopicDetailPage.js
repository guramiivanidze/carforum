import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTopic, createReply, likeReply, bookmarkTopic } from '../services/api';
import ReportModal from './ReportModal';
import '../styles/TopicDetailPage.css';

function TopicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [likingReplyId, setLikingReplyId] = useState(null);
  const [reportingReplyId, setReportingReplyId] = useState(null);
  const [bookmarking, setBookmarking] = useState(false);

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

  const renderContent = (content) => {
    // Parse [quote="username"]content[/quote] format
    const quoteRegex = /\[quote="([^"]+)"\]([\s\S]*?)\[\/quote\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = quoteRegex.exec(content)) !== null) {
      // Add text before quote
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }
      
      // Add quote
      parts.push({
        type: 'quote',
        author: match[1],
        content: match[2].trim()
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  const renderFormattedContent = (content) => {
    if (!content) return 'No content available.';
    
    let formatted = content;
    
    // Bold **text**
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic *text*
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Code blocks ```code```
    formatted = formatted.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code `code`
    formatted = formatted.replace(/`(.+?)`/g, '<code class="inline-code">$1</code>');
    
    // Quotes > text
    formatted = formatted.replace(/^> (.+)$/gm, '<blockquote class="markdown-quote">$1</blockquote>');
    
    // Links [text](url)
    formatted = formatted.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Bullet lists - item
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Numbered lists 1. item
    formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }

    setSubmitting(true);
    try {
      const newReply = await createReply(id, { content: replyText });
      
      // Add the new reply to the topic's replies
      setTopic(prev => ({
        ...prev,
        replies: [...prev.replies, newReply],
        replies_count: prev.replies_count + 1
      }));
      
      setReplyText('');
      setShowReplyBox(false);
      alert('Reply posted successfully! 🎉');
    } catch (error) {
      console.error('Error posting reply:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.content?.[0] || error.response?.data?.error || 'Failed to post reply. Please try again.';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyClick = () => {
    if (!isAuthenticated) {
      // Redirect to login with return path
      navigate('/login', { state: { from: `/topic/${id}` } });
    } else {
      setShowReplyBox(true);
    }
  };

  const handleLikeReply = async (replyId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/topic/${id}` } });
      return;
    }

    setLikingReplyId(replyId);
    try {
      const response = await likeReply(replyId);
      
      // Update the specific reply in the topic's replies array
      setTopic(prev => ({
        ...prev,
        replies: prev.replies.map(reply => 
          reply.id === replyId 
            ? { 
                ...reply, 
                likes_count: response.likes_count,
                user_has_liked: response.user_has_liked 
              }
            : reply
        )
      }));
    } catch (error) {
      console.error('Error liking reply:', error);
      alert('Failed to like reply. Please try again.');
    } finally {
      setLikingReplyId(null);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/topic/${id}` } });
      return;
    }

    setBookmarking(true);
    try {
      const response = await bookmarkTopic(id);
      
      // Update the topic's bookmark status
      setTopic(prev => ({
        ...prev,
        user_has_bookmarked: response.user_has_bookmarked
      }));
    } catch (error) {
      console.error('Error bookmarking topic:', error);
      alert('Failed to bookmark topic. Please try again.');
    } finally {
      setBookmarking(false);
    }
  };

  const handleQuoteReply = (reply) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/topic/${id}` } });
      return;
    }

    const quotedText = `[quote="${reply.author.username}"]\n${reply.content}\n[/quote]\n\n`;
    setReplyText(quotedText);
    setShowReplyBox(true);
    
    // Scroll to reply box
    setTimeout(() => {
      const replyBox = document.querySelector('.reply-textarea');
      if (replyBox) {
        replyBox.focus();
        replyBox.setSelectionRange(quotedText.length, quotedText.length);
      }
    }, 100);
  };

  const handleReportClick = (replyId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/topic/${id}` } });
      return;
    }
    setReportingReplyId(replyId);
  };

  const handleReportSuccess = () => {
    alert('Report submitted successfully! Our moderators will review it shortly.');
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
        <div className="header-actions">
          {user && topic.author.id === user.id && (
            <Link to={`/edit-topic/${topic.id}`} className="edit-btn-header">
              ✏️ Edit
            </Link>
          )}
          <button className="reply-btn-header" onClick={handleReplyClick}>
            Reply
          </button>
        </div>
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
                <div dangerouslySetInnerHTML={{ __html: renderFormattedContent(topic.content) }} />
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
                <div key={reply.id} className={`post-card reply-card ${reply.resolved_report ? 'reported-reply' : ''}`}>
                  {reply.resolved_report && (
                    <div className="report-warning">
                      <span className="report-icon">⚠️</span>
                      <div className="report-text">
                        <strong>Your reply was reported and hidden</strong>
                        <div className="report-reason-inline">
                          Reason: {reply.resolved_report.reason}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="post-left">
                    <div className="user-avatar-medium">{reply.author.avatar}</div>
                    <div className="reply-user-info">
                      <Link to={`/profile/${reply.author.id}`} className="username-medium">{reply.author.username}</Link>
                      <div className="reply-time">{getTimeAgo(reply.created_at)}</div>
                    </div>
                  </div>
                  <div className="post-right">
                    <div className="post-content">
                      {renderContent(reply.content).map((part, idx) => (
                        part.type === 'quote' ? (
                          <div key={idx} className="quoted-content">
                            <div className="quote-header">
                              {part.author} said:
                            </div>
                            <div className="quote-body">
                              {part.content}
                            </div>
                          </div>
                        ) : (
                          <p key={idx}>{part.content}</p>
                        )
                      ))}
                    </div>
                    <div className="post-actions">
                      <button 
                        className={`action-btn-small ${reply.user_has_liked ? 'liked' : ''}`}
                        onClick={() => handleLikeReply(reply.id)}
                        disabled={likingReplyId === reply.id}
                      >
                        {reply.user_has_liked ? '❤️' : '👍'} Like {reply.likes_count > 0 && `(${reply.likes_count})`}
                      </button>
                      <button 
                        className="action-btn-small"
                        onClick={() => handleQuoteReply(reply)}
                      >
                        Quote
                      </button>
                      <button 
                        className="action-btn-small"
                        onClick={() => handleReportClick(reply.id)}
                      >
                        Report
                      </button>
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
                <div className="user-avatar-small">
                  {user?.avatar || '👤'}
                </div>
                <span>Write your reply as {user?.username}...</span>
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
                    <button 
                      type="submit" 
                      className="post-reply-btn"
                      disabled={submitting || !replyText.trim()}
                    >
                      {submitting ? 'Posting...' : 'Post Reply'}
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
              onClick={handleReplyClick}
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
            <button 
              className={`follow-topic-btn ${topic.user_has_bookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmark}
              disabled={bookmarking}
            >
              {bookmarking ? '⏳ Loading...' : topic.user_has_bookmarked ? '✓ Bookmarked' : '🔖 Bookmark topic'}
            </button>
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

      {/* Report Modal */}
      {reportingReplyId && (
        <ReportModal
          replyId={reportingReplyId}
          onClose={() => setReportingReplyId(null)}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  );
}

export default TopicDetailPage;
