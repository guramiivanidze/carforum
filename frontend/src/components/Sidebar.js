import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from './AdBanner';

function Sidebar({ topics, topMembers }) {
  // Calculate popular topics from the topics prop
  const popularTopics = useMemo(() => {
    if (!topics || topics.length === 0) return [];
    return [...topics]
      .sort((a, b) => b.replies_count - a.replies_count)
      .slice(0, 10);
  }, [topics]);

  const getBadgeColor = (index) => {
    const colors = ['purple', 'blue', 'blue', 'blue', 'blue'];
    return colors[index] || 'blue';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>Popular Topics</h3>
        {popularTopics.length > 0 ? (
          popularTopics.map((topic) => (
            <Link to={`/topic/${topic.id}`} key={topic.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="popular-topic">
                <div className="popular-topic-title">
                   {topic.title.length > 50 ? topic.title.substring(0, 50) + '...' : topic.title}
                </div>
                <div className="popular-topic-stats">{topic.replies_count} replies</div>
              </div>
            </Link>
          ))
        ) : (
          <div>Loading...</div>
        )}
      </div>

      <AdBanner location="sidebar_main" />

      <div className="sidebar-section">
        <h3>Top Members</h3>
        {topMembers.length > 0 ? (
          topMembers.map((member, index) => (
            <Link to={`/profile/${member.user_id}`} key={member.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="top-member">
                <div className={`member-badge ${getBadgeColor(index)}`}></div>
                <div className="member-info">
                  <div className="member-name">{member.username}</div>
                  <div className="member-points">{member.points} points</div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
