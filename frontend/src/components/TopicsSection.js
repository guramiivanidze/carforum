import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopics } from '../services/api';

function TopicsSection() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getTopics();
        setTopics(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError('Failed to load topics');
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

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

  if (error) {
    return (
      <section className="topics-section">
        <h2>Latest Topics</h2>
        <div style={{ color: 'red' }}>{error}</div>
      </section>
    );
  }

  return (
    <section className="topics-section">
      <h2>Latest Topics</h2>
      {topics.map((topic) => (
        <Link to={`/topic/${topic.id}`} key={topic.id} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="topic-card">
            <div className="topic-header">
              <div className="topic-avatar">{topic.author.avatar}</div>
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
    </section>
  );
}

export default TopicsSection;
