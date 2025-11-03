import React from 'react';
import { Link } from 'react-router-dom';

function TopicsSection({ topics, loading }) {
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const updated = new Date(dateString);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}min ago`;
    if (diffHours < 24) return `${diffHours}hr ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <section className="topics-section">
        <h2>Latest Topics</h2>
        <div>Loading topics...</div>
      </section>
    );
  }

  return (
    <section className="topics-section">
      <h2>Latest Topics</h2>
      <div className="topics-list">
        {topics.map((topic) => (
          <Link to={`/topic/${topic.id}`} key={topic.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="topic-card">
              <div className="topic-header">
                <div className="topic-image">
                  {topic.author?.user_image_url ? (
                    <img 
                      src={topic.author.user_image_url} 
                      alt={topic.author.username}
                      className="image-display"
                    />
                  ) : (
                    topic.author?.username?.[0]?.toUpperCase() || '?'
                  )}
                </div>
                <div className="topic-info">
                  <div className="topic-title">{topic.title}</div>
                  <div className="topic-meta">
                    <span className="category-tag">{topic.category_name}</span>
                    <span className="topic-stats">
                      💬 {topic.replies_count} replies | 🕒 Updated {getTimeAgo(topic.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default TopicsSection;
