import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopMembers, getTopics } from '../services/api';

function Sidebar() {
  const [topMembers, setTopMembers] = useState([]);
  const [popularTopics, setPopularTopics] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch top members
        const membersData = await getTopMembers();
        setTopMembers(membersData.slice(0, 5)); // Get top 5 members

        // Fetch topics and sort by replies
        const topicsData = await getTopics();
        const sortedByReplies = [...topicsData]
          .sort((a, b) => b.replies_count - a.replies_count)
          .slice(0, 3);
        setPopularTopics(sortedByReplies);
      } catch (err) {
        console.error('Error fetching sidebar data:', err);
      }
    };

    fetchData();
  }, []);

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
            <div key={topic.id} className="popular-topic">
              <div className="popular-topic-title">🔥 {topic.title}</div>
              <div className="popular-topic-stats">{topic.replies_count} replies</div>
            </div>
          ))
        ) : (
          <div>Loading...</div>
        )}
      </div>

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

      <button className="new-topic-btn">Start New Topic</button>
    </aside>
  );
}

export default Sidebar;
