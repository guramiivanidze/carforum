import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/BadgesPage.css';

const BadgesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Mock user data - replace with actual API call
  const userData = {
    username: user?.username || 'User',
    avatar: '👤',
    level: 8,
    levelName: 'Veteran',
    xp: 4580,
    xpToNextLevel: 5000,
    rank: '🥇 Gold Member',
    leaderboardPosition: 12
  };

  // Badge categories
  const categories = [
    { id: 'all', label: 'All', icon: '🎖' },
    { id: 'unlocked', label: 'Unlocked', icon: '✅' },
    { id: 'locked', label: 'Locked', icon: '🔒' },
    { id: 'contribution', label: 'Contributions', icon: '📚' },
    { id: 'social', label: 'Social', icon: '❤️' },
    { id: 'helpful', label: 'Helpful', icon: '✅' },
    { id: 'streaks', label: 'Streaks', icon: '🔥' },
    { id: 'special', label: 'Special', icon: '🎄' }
  ];

  // Mock badges data
  const badges = [
    {
      id: 1,
      name: 'First Post',
      icon: '📚',
      category: 'contribution',
      unlocked: true,
      earnedDate: 'Jan 10, 2025',
      description: 'Created your first forum post',
      requirement: 'Create 1 post',
      progress: 1,
      total: 1
    },
    {
      id: 2,
      name: 'Helpful Contributor',
      icon: '🏅',
      category: 'helpful',
      unlocked: true,
      earnedDate: 'Jan 15, 2025',
      description: 'You helped 10 users get answers',
      requirement: 'Help 10 users',
      progress: 10,
      total: 10
    },
    {
      id: 3,
      name: '100 Replies',
      icon: '💯',
      category: 'contribution',
      unlocked: false,
      description: 'Reply to 100 topics',
      requirement: 'Create 100 replies',
      progress: 42,
      total: 100,
      tip: 'Keep answering questions to unlock this badge!'
    },
    {
      id: 4,
      name: 'Expert Mechanic',
      icon: '🔧',
      category: 'contribution',
      unlocked: false,
      description: 'Become an expert in automotive topics',
      requirement: 'Get 100 accepted answers',
      progress: 42,
      total: 100,
      tip: 'Focus on providing detailed, helpful answers'
    },
    {
      id: 5,
      name: '50 Likes',
      icon: '❤️',
      category: 'social',
      unlocked: true,
      earnedDate: 'Feb 3, 2025',
      description: 'Received 50 likes on your posts',
      requirement: 'Get 50 likes',
      progress: 50,
      total: 50
    },
    {
      id: 6,
      name: '7 Days Active',
      icon: '🔥',
      category: 'streaks',
      unlocked: true,
      earnedDate: 'Jan 20, 2025',
      description: 'Visited the forum for 7 consecutive days',
      requirement: '7-day streak',
      progress: 7,
      total: 7
    },
    {
      id: 7,
      name: '30 Days Active',
      icon: '🕒',
      category: 'streaks',
      unlocked: false,
      description: 'Visit the forum for 30 consecutive days',
      requirement: '30-day streak',
      progress: 12,
      total: 30,
      tip: 'Come back daily to maintain your streak!'
    },
    {
      id: 8,
      name: 'Forum Anniversary',
      icon: '🏆',
      category: 'special',
      unlocked: false,
      description: 'Celebrate 1 year on the forum',
      requirement: 'Member for 1 year',
      progress: 0,
      total: 1,
      tip: 'Keep being an active member!'
    }
  ];

  // Filter badges
  const filteredBadges = badges.filter(badge => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unlocked') return badge.unlocked;
    if (activeFilter === 'locked') return !badge.unlocked;
    return badge.category === activeFilter;
  });

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBadge(null);
  };

  const xpPercentage = (userData.xp / userData.xpToNextLevel) * 100;

  return (
    <div className="badges-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-separator">›</span>
        <Link to="/profile">Profile</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Achievements</span>
      </div>

      {/* Page Header */}
      <div className="badges-header">
        <h1>🎖 Achievements & Badges</h1>
        <p className="badges-subtitle">Earn badges by contributing to the community</p>
      </div>

      {/* User Info Header */}
      <div className="user-progress-card">
        <div className="user-info-header">
          <div className="user-avatar-large">{userData.avatar}</div>
          <div className="user-stats">
            <h2>{userData.username} <span className="level-badge">Level {userData.level} - {userData.levelName}</span></h2>
            <div className="xp-info">
              <span className="xp-text">XP: {userData.xp.toLocaleString()} / {userData.xpToNextLevel.toLocaleString()} to next level</span>
            </div>
            <div className="xp-progress-bar">
              <div className="xp-progress-fill" style={{ width: `${xpPercentage}%` }}></div>
            </div>
            <div className="rank-info">Rank: {userData.rank}</div>
          </div>
        </div>
        
        <div className="action-buttons">
          <Link to="/leaderboard" className="btn-leaderboard">
            🔥 View Leaderboard
          </Link>
          <button className="btn-how-to" onClick={() => alert('Check the badges below to see how to earn them!')}>
            🎯 How to earn badges?
          </button>
        </div>

        <div className="leaderboard-preview">
          ⭐ Top Rank: #{userData.leaderboardPosition} this month
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="badges-filters">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`filter-btn ${activeFilter === cat.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(cat.id)}
          >
            <span className="filter-icon">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="badges-grid">
        {filteredBadges.map(badge => (
          <div
            key={badge.id}
            className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}
            onClick={() => handleBadgeClick(badge)}
          >
            <div className="badge-icon">{badge.icon}</div>
            <h3 className="badge-name">{badge.name}</h3>
            
            {badge.unlocked ? (
              <div className="badge-unlocked-info">
                <p className="badge-earned">✅ Earned: {badge.earnedDate}</p>
                <p className="badge-description">{badge.description}</p>
              </div>
            ) : (
              <div className="badge-locked-info">
                <p className="badge-requirement">🔒 {badge.requirement}</p>
                <div className="badge-progress">
                  <div className="progress-text">Progress: {badge.progress}/{badge.total}</div>
                  <div className="progress-bar-small">
                    <div 
                      className="progress-fill-small" 
                      style={{ width: `${(badge.progress / badge.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Badge Details Modal */}
      {showModal && selectedBadge && (
        <div className="badge-modal-overlay" onClick={closeModal}>
          <div className="badge-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            
            <div className="modal-header">
              <div className="modal-badge-icon">{selectedBadge.icon}</div>
              <h2>{selectedBadge.name}</h2>
            </div>

            <div className="modal-content">
              <p className="modal-description">{selectedBadge.description}</p>
              
              {selectedBadge.unlocked ? (
                <div className="modal-unlocked">
                  <p className="earned-date">✅ Earned: {selectedBadge.earnedDate}</p>
                  <div className="requirement-complete">
                    ✔ {selectedBadge.requirement} (completed)
                  </div>
                </div>
              ) : (
                <div className="modal-locked">
                  <h3>Requirements:</h3>
                  <div className="requirement-item">
                    {selectedBadge.requirement}
                  </div>
                  
                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span>{selectedBadge.progress} / {selectedBadge.total}</span>
                    </div>
                    <div className="progress-bar-modal">
                      <div 
                        className="progress-fill-modal" 
                        style={{ width: `${(selectedBadge.progress / selectedBadge.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {selectedBadge.tip && (
                    <div className="tip-box">
                      💡 Tip: {selectedBadge.tip}
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedBadge.unlocked && (
              <button className="btn-view-activity">
                View My Activity
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgesPage;
