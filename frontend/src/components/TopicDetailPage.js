import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTopic, getRelatedTopics, createReply, likeTopic, likeReply, deleteReply, bookmarkTopic, votePoll } from '../services/api';
import ReportModal from './ReportModal';
import AdBanner from './AdBanner';
import '../styles/TopicDetailPage.css';

function TopicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // Store parent reply info
  const [submitting, setSubmitting] = useState(false);
  const [likingTopic, setLikingTopic] = useState(false);
  const [likingReplyId, setLikingReplyId] = useState(null);
  const replyBoxRef = useRef(null); // Ref for reply editor box
  const [reportingReplyId, setReportingReplyId] = useState(null);
  const [bookmarking, setBookmarking] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  const [votingPoll, setVotingPoll] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null); // For image lightbox
  const [pendingLikeReplyId, setPendingLikeReplyId] = useState(null); // Store reply ID to like after login
  const [pendingReportReplyId, setPendingReportReplyId] = useState(null); // Store reply ID to report after login
  const [flashingReplyId, setFlashingReplyId] = useState(null); // For flash effect
  const [flashColor, setFlashColor] = useState('blue'); // Color for flash effect (blue for like, red for report)
  const [relatedTopics, setRelatedTopics] = useState([]); // Related topics with matching tags

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

  // Fetch related topics with at least 3 matching tags
  useEffect(() => {
    const fetchRelatedTopics = async () => {
      if (!topic) return;

      try {
        const related = await getRelatedTopics(topic.id);
        setRelatedTopics(related);
      } catch (err) {
        console.error('Error fetching related topics:', err);
      }
    };

    fetchRelatedTopics();
  }, [topic]);

  // Check for pending like from sessionStorage on mount
  useEffect(() => {
    const storedPendingLike = sessionStorage.getItem('pendingLikeReplyId');
    if (storedPendingLike) {
      // Convert to number to match reply.id type
      setPendingLikeReplyId(parseInt(storedPendingLike, 10));
    }

    const storedPendingReport = sessionStorage.getItem('pendingReportReplyId');
    if (storedPendingReport) {
      // Convert to number to match reply.id type
      setPendingReportReplyId(parseInt(storedPendingReport, 10));
    }
  }, []);

  // Handle pending like after login
  useEffect(() => {
    const executePendingLike = async () => {
      if (user && pendingLikeReplyId && topic) {
        console.log('Executing pending like for reply:', pendingLikeReplyId);

        // Store the reply ID before clearing
        const replyIdToFlash = pendingLikeReplyId;

        // Clear immediately to prevent re-runs
        setPendingLikeReplyId(null);
        sessionStorage.removeItem('pendingLikeReplyId');

        // User just logged in and there's a pending like
        await handleLikeReply(replyIdToFlash);

        // Wait for DOM to update after like
        setTimeout(() => {
          // Add flash effect with blue color
          console.log('Setting flash effect for reply:', replyIdToFlash);
          console.log('Reply ID type:', typeof replyIdToFlash);
          setFlashColor('blue');
          setFlashingReplyId(replyIdToFlash);

          // Scroll to the reply
          setTimeout(() => {
            const replyElement = document.getElementById(`reply-${replyIdToFlash}`);
            console.log('Reply element:', replyElement);
            console.log('Current flashingReplyId state:', replyIdToFlash);
            console.log('Reply classes after flash set:', replyElement?.className);

            if (replyElement) {
              replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);

          // Remove flash after animation completes
          setTimeout(() => {
            console.log('Removing flash effect');
            setFlashingReplyId(null);
            setFlashColor('blue'); // Reset to blue
          }, 2000);
        }, 300);
      }
    };

    executePendingLike();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, topic]); // Removed pendingLikeReplyId from dependencies to prevent loop

  // Handle pending report after login
  useEffect(() => {
    const executePendingReport = async () => {
      if (user && pendingReportReplyId && topic) {
        console.log('Executing pending report for reply:', pendingReportReplyId);

        // Store the reply ID before clearing
        const replyIdToFlash = pendingReportReplyId;

        // Clear immediately to prevent re-runs
        setPendingReportReplyId(null);
        sessionStorage.removeItem('pendingReportReplyId');

        // Wait for DOM to update
        setTimeout(() => {
          // Set flash color to red for report
          setFlashColor('red');
          setFlashingReplyId(replyIdToFlash);

          // Scroll to the reply
          setTimeout(() => {
            const replyElement = document.getElementById(`reply-${replyIdToFlash}`);

            if (replyElement) {
              replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Open report modal after scrolling
            setTimeout(() => {
              setReportingReplyId(replyIdToFlash);
            }, 500);
          }, 100);

          // Remove flash after animation completes
          setTimeout(() => {
            console.log('Removing flash effect');
            setFlashingReplyId(null);
            setFlashColor('blue'); // Reset to blue
          }, 2000);
        }, 300);
      }
    };

    executePendingReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, topic]); // Removed pendingReportReplyId from dependencies to prevent loop


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

  const handleReplyClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/topic/${id}` } });
      return;
    }
    setReplyingTo(null);
    setShowReplyBox(true);
    setReplyText('');

    // Scroll to reply box after it's rendered
    setTimeout(() => {
      replyBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleReplyToReply = (reply) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/topic/${id}` } });
      return;
    }
    setReplyingTo(reply);
    setShowReplyBox(true);
    setReplyText('');
    // Scroll to reply box
    setTimeout(() => {
      document.querySelector('.reply-editor-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }

    setSubmitting(true);
    try {
      const replyData = {
        content: replyText,
        parent: replyingTo?.id || null  // Include parent ID if replying to a reply
      };
      await createReply(id, replyData);

      // Refresh the topic to get updated replies with proper nesting
      const updatedTopic = await getTopic(id);
      setTopic(updatedTopic);

      setReplyText('');
      setReplyingTo(null);
      setShowReplyBox(false);
      setSuccessMessage({
        title: 'Reply Posted Successfully!',
        message: 'Your reply has been added to the discussion.'
      });
      setShowSuccessModal(true);

      // Auto-hide modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error) {
      console.error('Error posting reply:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.content?.[0] || error.response?.data?.error || 'Failed to post reply. Please try again.';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
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
      const errorMsg = error.response?.data?.error || 'Failed to like reply. Please try again.';
      alert(errorMsg);
    } finally {
      setLikingReplyId(null);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/topic/${id}` } });
      return;
    }

    if (!window.confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteReply(replyId);

      // Remove the deleted reply from the topic's replies array
      setTopic(prev => ({
        ...prev,
        replies: prev.replies.filter(reply => reply.id !== replyId)
      }));

      setSuccessMessage({
        title: 'Reply Deleted Successfully!',
        message: 'Your reply has been removed from the discussion.'
      });
      setShowSuccessModal(true);

      // Auto-hide modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error) {
      console.error('Error deleting reply:', error);
      const errorMsg = error.response?.data?.error || 'Failed to delete reply. Please try again.';
      alert(errorMsg);
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

      // Update the topic's bookmark status and count
      setTopic(prev => ({
        ...prev,
        user_has_bookmarked: response.user_has_bookmarked,
        bookmarks_count: response.user_has_bookmarked
          ? (prev.bookmarks_count || 0) + 1
          : Math.max((prev.bookmarks_count || 0) - 1, 0)
      }));
    } catch (error) {
      console.error('Error bookmarking topic:', error);
      alert('Failed to bookmark topic. Please try again.');
    } finally {
      setBookmarking(false);
    }
  };

  const handleLikeTopic = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/topic/${id}` } });
      return;
    }

    setLikingTopic(true);
    try {
      const response = await likeTopic(id);

      // Update the topic's like status and count
      setTopic(prev => ({
        ...prev,
        user_has_liked: response.user_has_liked,
        likes_count: response.likes_count
      }));
    } catch (error) {
      console.error('Error liking topic:', error);
      const errorMsg = error.response?.data?.error || 'Failed to like topic. Please try again.';
      alert(errorMsg);
    } finally {
      setLikingTopic(false);
    }
  };

  const handlePollVote = async (optionId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/topic/${id}` } });
      return;
    }

    setVotingPoll(true);
    try {
      await votePoll(topic.poll.id, optionId);

      // Refresh topic to get updated poll results
      const updatedTopic = await getTopic(id);
      setTopic(updatedTopic);
    } catch (error) {
      console.error('Error voting on poll:', error);
      alert('Failed to vote. Please try again.');
    } finally {
      setVotingPoll(false);
    }
  };

  const handleReportClick = (replyId) => {
    if (!isAuthenticated) {
      // Store which reply to report after login in sessionStorage
      sessionStorage.setItem('pendingReportReplyId', replyId);
      setPendingReportReplyId(replyId);
      navigate('/login', { state: { from: `/topic/${id}` } });
      return;
    }
    setReportingReplyId(replyId);
  };

  const handleReportSuccess = () => {
    setSuccessMessage({
      title: 'Report Submitted Successfully!',
      message: 'Our moderators will review it shortly.'
    });
    setShowSuccessModal(true);

    // Auto-hide modal after 3 seconds
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  // Function to flatten all nested replies into a single array (sorted by date)
  const flattenReplies = (replies) => {
    const flattened = [];
    const flatten = (replyList) => {
      replyList.forEach(reply => {
        flattened.push(reply);
        if (reply.child_replies && reply.child_replies.length > 0) {
          flatten(reply.child_replies);
        }
      });
    };
    flatten(replies);
    // Sort by created_at chronologically (oldest first)
    return flattened.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  };

  // Component to render a single reply (flat structure)
  const RenderReply = ({ reply, isNested = false }) => {
    const isFlashing = flashingReplyId === reply.id;
    const flashClass = isFlashing ? (flashColor === 'red' ? 'flash-reply-red' : 'flash-reply') : '';

    if (reply.id === flashingReplyId || isFlashing) {
      console.log(`Reply ${reply.id} - flashingReplyId: ${flashingReplyId}, match: ${isFlashing}, types:`, typeof reply.id, typeof flashingReplyId);
    }

    return (
      <div
        id={`reply-${reply.id}`}
        className={`reply-card ${reply.resolved_report ? 'reported-reply' : ''} ${isNested ? 'nested-reply' : ''} ${flashClass}`}
        style={isNested ? { marginLeft: '3rem' } : {}}
      >
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

        <div className="reply-main">
          {/* Reply Header - Author Info (Left Side) */}
          <div className="reply-header">
            <div className="user-image-medium">
              {reply.author.user_image_url ? (
                <img
                  src={reply.author.user_image_url}
                  alt={reply.author.username}
                  className="image-display"
                />
              ) : (
                reply.author.username?.[0]?.toUpperCase() || '?'
              )}
            </div>
            <div className="reply-meta">
              <Link to={`/profile/${reply.author.id}`} className="reply-username">{reply.author.username}</Link>
              <div className="reply-time">{getTimeAgo(reply.created_at)}</div>
            </div>
          </div>

          {/* Reply Content (Right Side) */}
          <div className="reply-content">
            {/* Mention Badge - Show who this reply is responding to */}
            {reply.parent_author && (
              <div className="reply-mention">
                <span className="mention-icon">↳</span>
                Replying to <Link to={`/profile/${reply.parent_author.id}`} className="mention-link">
                  @{reply.parent_author.username}
                </Link>
              </div>
            )}

            <div dangerouslySetInnerHTML={{ __html: reply.content }} />

            {/* Reply Actions */}
            <div className="reply-actions">
              <button
                className={`reply-action-btn ${reply.user_has_liked ? 'liked' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (!user) {
                    // Store which reply to like after login in sessionStorage
                    sessionStorage.setItem('pendingLikeReplyId', reply.id);
                    setPendingLikeReplyId(reply.id);
                    navigate('/login', { state: { from: `/topic/${id}` } });
                    return;
                  }
                  handleLikeReply(reply.id);
                }}
                disabled={user && (likingReplyId === reply.id || reply.author.id === user.id)}
                style={{ opacity: user && reply.author.id === user.id ? 0.5 : 1 }}
              >
                {reply.user_has_liked ? '❤️' : '👍'} Like {reply.likes_count > 0 && `(${reply.likes_count})`}
              </button>
              <button
                className="reply-action-btn"
                onClick={() => handleReplyToReply(reply)}
              >
                💬 Reply {reply.replies_count > 0 && `(${reply.replies_count})`}
              </button>
              {(!user || reply.author.id !== user.id) && (
                <button
                  className="reply-action-btn"
                  onClick={() => handleReportClick(reply.id)}
                >
                  🚩 Report
                </button>
              )}
              {user && reply.author.id === user.id && (
                <button
                  className="reply-action-btn delete-btn"
                  onClick={() => handleDeleteReply(reply.id)}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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
      </div>

      <div className="topic-detail-content">
        {/* Main Content */}
        <div className="topic-main-content">
          {/* Original Post - Title and Content */}
          <div className="post-card op-post">
            {/* Topic Title and Meta */}
            <div className="topic-title-section">
              <h1 className="topic-detail-title">{topic.title}</h1>
              <div className="topic-meta">
                <span className="category-tag">{topic.category.title}</span>
                <span className="meta-item">👁 {topic.views} views</span>
                <span className="meta-item">💬 {topic.replies_count} replies</span>
                <span className="meta-item">🕒 {getTimeAgo(topic.created_at)} ({new Date(topic.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})</span>
              </div>
            </div>

            {/* Content Only */}
            <div className="post-content-main">
              <div dangerouslySetInnerHTML={{ __html: topic.content }} />
            </div>

            {/* Topic Images */}
            {topic.images && topic.images.length > 0 && (
              <div className="topic-images">
                <div className="topic-images-grid">
                  {topic.images.map((image) => (
                    <div key={image.id} className="topic-image-item" onClick={() => setLightboxImage(image)}>
                      <img
                        src={image.image_url || image.image}
                        alt={image.caption || 'Topic image'}
                      />
                      {image.caption && (
                        <p className="image-caption">{image.caption}</p>
                      )}
                      <div className="image-overlay">
                        <span className="zoom-icon">🔍</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Poll Section */}
            {topic.poll && (
              <div className="topic-poll">
                <h3 className="poll-question">📊 {topic.poll.question}</h3>
                <div className="poll-options">
                  {topic.poll.options.map((option) => {
                    const isUserVote = topic.poll.user_vote === option.id;
                    const hasVoted = topic.poll.user_vote !== null;

                    return (
                      <div key={option.id} className="poll-option-wrapper">
                        {!hasVoted ? (
                          // Show clickable option before voting
                          <button
                            className="poll-option-button"
                            onClick={() => handlePollVote(option.id)}
                            disabled={votingPoll}
                          >
                            <span className="poll-option-text">{option.text}</span>
                            <span className="poll-option-arrow">→</span>
                          </button>
                        ) : (
                          // Show results after voting
                          <div className={`poll-option-result ${isUserVote ? 'user-voted' : ''}`}>
                            <div className="poll-option-header">
                              <span className="poll-option-text">
                                {option.text}
                                {isUserVote && <span className="vote-badge">✓ Your vote</span>}
                              </span>
                              <span className="poll-option-stats">
                                {option.votes_count} {option.votes_count === 1 ? 'vote' : 'votes'} · {option.percentage}%
                              </span>
                            </div>
                            <div className="poll-option-bar">
                              <div
                                className="poll-option-bar-fill"
                                style={{ width: `${option.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="poll-footer">
                  <span className="poll-total-votes">
                    {topic.poll.total_votes} total {topic.poll.total_votes === 1 ? 'vote' : 'votes'}
                  </span>
                </div>
              </div>
            )}

            {/* Tags */}
            {topic.tags && topic.tags.length > 0 && (
              <div className="topic-tags">
                {topic.tags.map((tag, index) => (
                  <span key={index} className="topic-tag">
                    🏷️ {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="post-actions">
              {user && topic.author.id === user.id && (
                <Link to={`/edit-topic/${topic.id}`} className="action-btn">
                  ✏️ Edit
                </Link>
              )}
              {(!user || topic.author.id !== user.id) && (
                <button
                  className={`action-btn ${topic.user_has_liked ? 'active' : ''}`}
                  onClick={handleLikeTopic}
                  disabled={likingTopic}
                >
                  {topic.user_has_liked ? '❤️' : '👍'} Like {topic.likes_count > 0 && `(${topic.likes_count})`}
                </button>
              )}
              <button className="action-btn" onClick={handleReplyClick}>💬 Reply</button>
              {(!user || topic.author.id !== user.id) && (
                <button
                  className={`action-btn ${topic.user_has_bookmarked ? 'active' : ''}`}
                  onClick={handleBookmark}
                  disabled={bookmarking}
                >
                  {topic.user_has_bookmarked ? '✓ Bookmarked' : '🔖 Bookmark'}
                </button>
              )}
            </div>
          </div>

          {/* Active Users Card - Moved from sidebar */}
          <div className="sidebar-card active-users-card">
            <h3>👥 Active Users</h3>
            <div className="active-users-list">
              <div className="active-user-images">
                <span className="image-tiny">👤</span>
                <span className="image-tiny">👨</span>
                <span className="image-tiny">👩</span>
              </div>
              <p className="active-users-text">3 people are viewing this topic</p>
            </div>
          </div>

          <AdBanner location="topic_before_replies" />

          {/* Replies Section */}
          <div className="replies-section">
            <h2 className="replies-heading">{topic.replies_count} Replies</h2>

            {topic.replies && topic.replies.length > 0 ? (
              topic.replies.map((reply) => {
                // Render main reply
                const mainReply = <RenderReply key={reply.id} reply={reply} isNested={false} />;

                // Render all sub-replies flattened (no deep nesting)
                const subReplies = reply.child_replies && reply.child_replies.length > 0
                  ? flattenReplies(reply.child_replies).map(subReply => (
                    <RenderReply key={subReply.id} reply={subReply} isNested={true} />
                  ))
                  : null;

                return (
                  <React.Fragment key={reply.id}>
                    {mainReply}
                    {subReplies}
                  </React.Fragment>
                );
              })
            ) : (
              <div className="no-replies">
                <p>No replies yet. Be the first to reply!</p>
              </div>
            )}
          </div>

          {/* Reply Editor Box */}
          {showReplyBox && (
            <div className="reply-editor-box" ref={replyBoxRef}>
              <div className="editor-header">
                <div className="user-image-small">
                  {user?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  {replyingTo ? (
                    <span>Replying to <strong>{replyingTo.author.username}</strong>...</span>
                  ) : (
                    <span>Write your reply as {user?.username}...</span>
                  )}
                  {replyingTo && (
                    <button
                      type="button"
                      className="cancel-reply-to-btn"
                      onClick={() => setReplyingTo(null)}
                      title="Cancel reply to this user"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <form onSubmit={handleReplySubmit}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  rows={10}
                  style={{ width: '100%', padding: '10px', fontSize: '14px' }}
                />
                <div className="editor-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowReplyBox(false);
                      setReplyText('');
                      setReplyingTo(null);
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
        <aside className="topic-sidebar">

          {/* Author Info Card */}
          <div className="sidebar-card author-info-card">
            <h3>👤 Topic Author</h3>
            
            <div className="author-info-content">
              <div className="user-image-large">
                {topic.author.user_image_url ? (
                  <img
                    src={topic.author.user_image_url}
                    alt={topic.author.username}
                    className="image-display"
                  />
                ) : (
                  topic.author.username?.[0]?.toUpperCase() || '?'
                )}
              </div>

              <div className='author-name-and-role'>

                <Link to={`/profile/${topic.author.id}`} className="author-username">{topic.author.username}</Link>
                <div className="user-role-tag">Member</div>
              </div>
              

            </div>
          </div>

          {/* Thread Info Card */}
          <div className="sidebar-card thread-info-card">
            <h3>✅ Thread Info</h3>
            <div className="thread-info-list">
              <div className="info-row">
                <span className="info-label">Created:</span>
                <span className="info-value">
                  {getTimeAgo(topic.created_at)}
                  <br />
                  <small style={{ color: '#6b7280', fontSize: '0.85em' }}>
                    {new Date(topic.created_at).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </small>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Followers:</span>
                <span className="info-value">{topic.bookmarks_count || 0}</span>
              </div>
            </div>
            {(!user || topic.author.id !== user.id) && (
              <button
                className={`follow-topic-btn ${topic.user_has_bookmarked ? 'bookmarked' : ''}`}
                onClick={handleBookmark}
                disabled={bookmarking}
              >
                {bookmarking ? '⏳ Loading...' : topic.user_has_bookmarked ? '✓ Bookmarked' : '🔖 Bookmark topic'}
              </button>
            )}
          </div>

          <AdBanner location="topic_sidebar" />

          {/* Related Topics Card */}
          {relatedTopics.length > 0 && (
            <div className="sidebar-card related-topics-card">
              <h3>📚 Related Topics</h3>
              <div className="related-topics-list">
                {relatedTopics.map(relatedTopic => (
                  <Link
                    key={relatedTopic.id}
                    to={`/topic/${relatedTopic.id}`}
                    className="related-topic-link"
                  >
                    {relatedTopic.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div >

      {/* Report Modal */}
      {
        reportingReplyId && (
          <ReportModal
            replyId={reportingReplyId}
            onClose={() => setReportingReplyId(null)}
            onSuccess={handleReportSuccess}
          />
        )
      }

      {/* Success Modal */}
      {
        showSuccessModal && (
          <div className="success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
            <div className="success-modal" onClick={(e) => e.stopPropagation()}>
              <div className="success-modal-icon">✅</div>
              <h3 className="success-modal-title">{successMessage.title}</h3>
              <p className="success-modal-message">{successMessage.message}</p>
              <button
                className="success-modal-button"
                onClick={() => setShowSuccessModal(false)}
              >
                Got it!
              </button>
            </div>
          </div>
        )
      }

      {/* Image Lightbox */}
      {
        lightboxImage && (
          <div className="image-lightbox-overlay" onClick={() => setLightboxImage(null)}>
            <div className="image-lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={() => setLightboxImage(null)}>
                ✕
              </button>
              <img
                src={lightboxImage.image_url || lightboxImage.image}
                alt={lightboxImage.caption || 'Topic image'}
                className="lightbox-image"
              />
              {lightboxImage.caption && (
                <p className="lightbox-caption">{lightboxImage.caption}</p>
              )}
            </div>
          </div>
        )
      }
    </div >
  );
}

export default TopicDetailPage;
