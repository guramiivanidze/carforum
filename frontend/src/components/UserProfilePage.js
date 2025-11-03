import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserReplies, getUserBookmarks, getUserTopics, getUserGamification, uploadUserImage } from '../services/api';
import SuccessModal from './SuccessModal';
import '../styles/UserProfilePage.css';

function UserProfilePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { profile: currentUserProfile, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'topics');
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userReplies, setUserReplies] = useState([]);
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [userTopics, setUserTopics] = useState([]);
  const [saving, setSaving] = useState(false);
  
  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Badges gamification state
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [gamificationData, setGamificationData] = useState(null);
  const [gamificationLoading, setGamificationLoading] = useState(false);
  
  // Settings form state
  const [settingsData, setSettingsData] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    githubUrl: '',
    linkedinUrl: '',
    theme: 'Light',
    language: 'English',
    emailNotifications: true,
    emailDigest: true,
    showOnlineStatus: false,
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    // Update active tab when URL changes
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(id);
        setProfile(data);
        
        // Initialize settings data with profile data
        setSettingsData({
          username: data.username || '',
          email: data.email || '',
          bio: data.bio || '',
          location: '',
          githubUrl: '',
          linkedinUrl: '',
          theme: 'Light',
          language: 'English',
          emailNotifications: true,
          emailDigest: true,
          showOnlineStatus: false,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        
        setLoading(false);
        // Check if this is current user's profile
        if (currentUserProfile && currentUserProfile.id === parseInt(id)) {
          setIsOwnProfile(true);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setLoading(false);
      }
    };

    const fetchGamificationData = async () => {
      try {
        const data = await getUserGamification(id);
        setGamificationData(data);
      } catch (error) {
        console.error('Error fetching gamification data:', error);
      }
    };

    fetchProfile();
    fetchGamificationData();
  }, [id, currentUserProfile]);

  // Fetch user replies when replies tab is active
  useEffect(() => {
    const fetchReplies = async () => {
      if (activeTab === 'replies' && id) {
        try {
          const replies = await getUserReplies(id);
          setUserReplies(replies);
        } catch (err) {
          console.error('Error fetching replies:', err);
        }
      }
    };
    
    fetchReplies();
  }, [activeTab, id]);

  // Fetch user bookmarks when bookmarks tab is active
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (activeTab === 'bookmarks' && id) {
        try {
          const bookmarks = await getUserBookmarks(id);
          setUserBookmarks(bookmarks);
        } catch (err) {
          console.error('Error fetching bookmarks:', err);
        }
      }
    };

    fetchBookmarks();
  }, [activeTab, id]);

  // Fetch user topics when topics tab is active
  useEffect(() => {
    const fetchTopics = async () => {
      if (activeTab === 'topics' && id) {
        try {
          const topics = await getUserTopics(id);
          setUserTopics(topics);
        } catch (err) {
          console.error('Error fetching topics:', err);
        }
      }
    };

    fetchTopics();
  }, [activeTab, id]);

  // Fetch gamification data when badges tab is active
  useEffect(() => {
    const fetchGamificationData = async () => {
      if (activeTab === 'badges' && id) {
        setGamificationLoading(true);
        try {
          const data = await getUserGamification(id);
          console.log('Gamification data received:', data);
          console.log('Badges array:', data?.badges);
          setGamificationData(data);
        } catch (error) {
          console.error('Error fetching gamification data:', error);
          console.error('Error details:', error.response?.data);
        } finally {
          setGamificationLoading(false);
        }
      }
    };

    fetchGamificationData();
  }, [activeTab, id]);

  // Manual refresh function for gamification data
  const refreshGamificationData = async () => {
    if (id) {
      setGamificationLoading(true);
      try {
        const data = await getUserGamification(id);
        console.log('Gamification data refreshed:', data);
        console.log('Badges array:', data?.badges);
        setGamificationData(data);
      } catch (error) {
        console.error('Error refreshing gamification data:', error);
        console.error('Error details:', error.response?.data);
      } finally {
        setGamificationLoading(false);
      }
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return 'Today';
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: API call to follow/unfollow
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save settings
      // For now, just simulate a save with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Settings saved successfully! 🎉\n\nNote: Full backend integration coming soon.');
      console.log('Settings to save:', settingsData);
      
      setSaving(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
      setSaving(false);
    }
  };

  const handleImageClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const updatedProfile = await uploadUserImage(profile.id, file);
      setProfile(updatedProfile);
      
      // Update auth context
      if (currentUserProfile && currentUserProfile.id === updatedProfile.id) {
        updateProfile(updatedProfile);
      }
      
      setSuccessMessage('Profile image updated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMsg = error.response?.data?.error || 'Failed to upload image. Please try again.';
      alert(errorMsg);
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };


  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="profile-error">Profile not found</div>;
  }

  const userActivity = [
    { type: 'joined', text: 'Joined the forum', date: profile?.date_joined },
    { type: 'badge', text: 'Earned "Problem Solver" badge', date: '2024-05-10T10:00:00Z' },
    { type: 'post', text: 'Posted new topic', title: 'How to integrate Zephyr Scale', date: '2024-08-15T10:30:00Z' },
    { type: 'like', text: 'Received 5 likes on a post', date: '2024-09-01T14:20:00Z' }
  ];

  // Badge categories
  const badgeCategories = [
    { id: 'all', label: 'All', icon: '🎖' },
    { id: 'unlocked', label: 'Unlocked', icon: '✅' },
    { id: 'locked', label: 'Locked', icon: '🔒' },
    { id: 'contribution', label: 'Contributions', icon: '📚' },
    { id: 'social', label: 'Social', icon: '❤️' },
    { id: 'helpful', label: 'Helpful', icon: '✅' },
    { id: 'streaks', label: 'Streaks', icon: '🔥' },
    { id: 'special', label: 'Special', icon: '🎄' }
  ];

  // Get all badges from gamification data
  const allBadges = gamificationData?.badges || [];

  // Filter badges
  const filteredBadges = allBadges.filter(badge => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unlocked') return badge.unlocked;
    if (activeFilter === 'locked') return !badge.unlocked;
    return badge.category === activeFilter;
  });

  // Debug logging
  console.log('All badges:', allBadges);
  console.log('Active filter:', activeFilter);
  console.log('Filtered badges:', filteredBadges);

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setShowBadgeModal(true);
  };

  const closeBadgeModal = () => {
    setShowBadgeModal(false);
    setSelectedBadge(null);
  };

  const xpPercentage = gamificationData?.level_data 
    ? (gamificationData.level_data.current_xp / gamificationData.level_data.xp_to_next_level) * 100 
    : 0;

  const badges = [
    { name: 'Problem Solver', icon: '🏅', description: 'Awarded for 10 helpful answers', earned: '2024-05-10' },
    { name: 'Active Member', icon: '⭐', description: 'Posted 50+ times in one month', earned: '2024-06-20' },
    { name: 'Community Helper', icon: '🤝', description: 'Helped 25+ members', earned: '2024-07-15' }
  ];

  return (
    <div className="user-profile-page">
      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="profile-header-content">
          <div className="profile-image-section">
            <div 
              className="user-image-xlarge" 
              onClick={handleImageClick}
              style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
            >
              {uploadingImage ? (
                <div className="uploading-spinner">⏳</div>
              ) : profile.user_image_url ? (
                <img 
                  src={profile.user_image_url} 
                  alt={profile.username}
                  className="image-display"
                />
              ) : (
                profile.username?.[0]?.toUpperCase() || '?'
              )}
            </div>
            {isOwnProfile && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <button 
                  className="change-photo-btn"
                  onClick={handleImageClick}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? '⏳ Uploading...' : '📷 Change Photo'}
                </button>
              </>
            )}
          </div>

          <div className="profile-info-section">
            <div className="profile-name-row">
              <div className="profile-names">
                <h1 className="profile-display-name">{profile.username}</h1>
                <p className="profile-handle">@{profile.username.toLowerCase().replace(' ', '_')}</p>
              </div>
              {!isOwnProfile && (
                <div className="profile-action-buttons">
                  <button 
                    className={`follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollow}
                  >
                    {isFollowing ? '✓ Following' : '+ Follow'}
                  </button>
                  <button className="message-btn">💬 Message</button>
                </div>
              )}
            </div>

            <p className="profile-bio">
              QA Automation Engineer | Python & Playwright | Mentor
            </p>

            <div className="profile-badges-row">
              {/* Display User Level */}
              {gamificationData?.level_data && (
                <span 
                  className="badge-tag level-badge" 
                  style={{ 
                    backgroundColor: gamificationData.level_data.current_level_color + '20',
                    color: gamificationData.level_data.current_level_color,
                    border: `1px solid ${gamificationData.level_data.current_level_color}`,
                    fontWeight: '600'
                  }}
                >
                  {gamificationData.level_data.current_level_image ? (
                    <img 
                      src={gamificationData.level_data.current_level_image} 
                      alt={gamificationData.level_data.level_name}
                      className="level-image"
                    />
                  ) : (
                    gamificationData.level_data.current_level_icon
                  )}{' '}
                  {gamificationData.level_data.level_name}
                </span>
              )}
              
              {/* Display Earned Badges */}
              {gamificationData?.badges && gamificationData.badges
                .filter(badge => badge.unlocked)
                .slice(0, 3)
                .map(badge => (
                  <span 
                    key={badge.id} 
                    className="badge-tag earned-badge"
                    title={badge.description}
                  >
                    {badge.icon} {badge.name}
                  </span>
                ))}
              
              {/* Show badge count if more than 3 */}
              {gamificationData?.badges && gamificationData.badges.filter(b => b.unlocked).length > 3 && (
                <span className="badge-tag more-badges">
                  +{gamificationData.badges.filter(b => b.unlocked).length - 3} more
                </span>
              )}
              
              <span className="profile-meta">🌍 Georgia</span>
              <span className="profile-meta">🕓 Joined: {new Date(profile.date_joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>

            <div className="profile-social-links">
              <a href="#" className="social-link" title="GitHub">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="social-link" title="LinkedIn">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="profile-stats-row">
        <div className="stat-box">
          <div className="stat-number">{profile.topics_count || 0}</div>
          <div className="stat-label">Topics</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{profile.replies_count || 0}</div>
          <div className="stat-label">Replies</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{profile.likes_given || 0}</div>
          <div className="stat-label">Likes Given</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{profile.likes_received || 0}</div>
          <div className="stat-label">Likes Received</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{profile.followers_count || 0}</div>
          <div className="stat-label">Followers</div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="profile-content-layout">
        {/* Left Sidebar */}
        <div className="profile-left-sidebar">
          {/* About Me Card */}
          <div className="sidebar-card">
            <h3>About Me</h3>
            <p className="about-text">
              Passionate about quality assurance and test automation. 
              Love working with Python, Playwright, and building robust testing frameworks.
            </p>
            <div className="skills-list">
              <span className="skill-tag">Python</span>
              <span className="skill-tag">Playwright</span>
              <span className="skill-tag">Django</span>
              <span className="skill-tag">React</span>
              <span className="skill-tag">CI/CD</span>
            </div>
          </div>

          {/* Member Since Card */}
          <div className="sidebar-card">
            <h3>Member Since</h3>
            <p className="joined-date">
              {new Date(profile.date_joined).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
            <div className="membership-duration">
              {getTimeAgo(profile.date_joined)}
            </div>
          </div>

          {/* Participation Stats Card */}
          <div className="sidebar-card">
            <h3>Forum Participation</h3>
            <div className="participation-stats">
              <div className="participation-row">
                <span className="participation-label">Topics Started</span>
                <span className="participation-value">{profile.topics_count || 102}</span>
              </div>
              <div className="participation-row">
                <span className="participation-label">Replies Posted</span>
                <span className="participation-value">{profile.replies_count || 345}</span>
              </div>
              <div className="participation-row">
                <span className="participation-label">Reputation Points</span>
                <span className="participation-value">{profile.points}</span>
              </div>
            </div>
          </div>

          {/* Following / Followers Card */}
          <div className="sidebar-card">
            <h3>Social</h3>
            <div className="social-stats">
              <a href="#" className="social-stat-link">
                <span className="social-stat-number">124</span>
                <span className="social-stat-label">Following</span>
              </a>
              <a href="#" className="social-stat-link">
                <span className="social-stat-number">87</span>
                <span className="social-stat-label">Followers</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="profile-right-content">
          {/* Navigation Tabs */}
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === 'topics' ? 'active' : ''}`}
              onClick={() => setActiveTab('topics')}
            >
              Topics
            </button>
            {isOwnProfile && (
              <>
                <button
                  className={`profile-tab ${activeTab === 'replies' ? 'active' : ''}`}
                  onClick={() => setActiveTab('replies')}
                >
                  Replies
                </button>
                <button
                  className={`profile-tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bookmarks')}
                >
                  Bookmarks
                </button>
                <button
                  className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`}
                  onClick={() => setActiveTab('activity')}
                >
                  Activity
                </button>
                <button
                  className={`profile-tab ${activeTab === 'badges' ? 'active' : ''}`}
                  onClick={() => setActiveTab('badges')}
                >
                  Badges
                </button>
              </>
            )}
            {isOwnProfile && (
              <button
                className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ Settings
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="profile-tab-content">
            {/* Topics Tab */}
            {activeTab === 'topics' && (
              <div className="topics-list">
                {userTopics.length > 0 ? (
                  userTopics.map((topic) => (
                    <Link to={`/topic/${topic.id}`} key={topic.id} className="user-topic-card">
                      <h3 className="user-topic-title">{topic.title}</h3>
                      <div className="user-topic-meta">
                        <span className="topic-category-tag">{topic.category.title}</span>
                        <span className="topic-date">
                          📅 Posted: {getTimeAgo(topic.created_at)}
                        </span>
                      </div>
                      <div className="user-topic-stats">
                        <span className="topic-stat">👁 {topic.views}</span>
                        <span className="topic-stat">💬 {topic.replies_count}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">�</div>
                    <h3>No topics yet</h3>
                    <p>This user hasn't created any topics</p>
                  </div>
                )}
              </div>
            )}

            {/* Replies Tab */}
            {activeTab === 'replies' && (
              <div className="replies-list">
                {userReplies.length > 0 ? (
                  userReplies.map((reply) => (
                    <div 
                      key={reply.id} 
                      className={`user-reply-card ${reply.resolved_report ? 'reported-reply' : ''}`}
                    >
                      {reply.resolved_report && (
                        <div className="report-banner">
                          <span className="report-icon">⚠️</span>
                          <div className="report-info">
                            <strong>This reply was reported and hidden</strong>
                            <div className="report-reason">
                              <strong>Reason:</strong> {reply.resolved_report.reason}
                            </div>
                            {reply.resolved_report.additional_info && (
                              <div className="report-details">
                                <strong>Details:</strong> {reply.resolved_report.additional_info}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="reply-header">
                        <span className="reply-in-text">Replied in</span>
                        <Link to={`/topic/${reply.topic}`} className="reply-topic-link">
                          Topic #{reply.topic}
                        </Link>
                      </div>
                      <p className="reply-excerpt">"{reply.content}"</p>
                      <div className="reply-footer">
                        <span className="reply-date">{getTimeAgo(reply.created_at)}</span>
                        <Link to={`/topic/${reply.topic}`} className="view-thread-btn">
                          View full thread →
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">💬</div>
                    <h3>No replies yet</h3>
                    <p>This user hasn't posted any replies</p>
                  </div>
                )}
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === 'bookmarks' && (
              <div className="bookmarks-list">
                {userBookmarks.length > 0 ? (
                  userBookmarks.map((bookmark) => (
                    <Link to={`/topic/${bookmark.topic_details.id}`} key={bookmark.id} className="bookmark-card">
                      <div className="bookmark-ribbon">
                        <span className="bookmark-icon">🔖</span>
                      </div>
                      <div className="bookmark-content">
                        <h3 className="bookmark-title">{bookmark.topic_details.title}</h3>
                        <div className="bookmark-meta">
                          <span className="bookmark-category-tag">
                            {bookmark.topic_details.category.title}
                          </span>
                          <span className="bookmark-date">
                            {getTimeAgo(bookmark.created_at)}
                          </span>
                        </div>
                        <div className="bookmark-stats">
                          <span className="bookmark-stat">
                            <span className="stat-icon">👁</span>
                            <span className="stat-value">{bookmark.topic_details.views}</span>
                          </span>
                          <span className="bookmark-stat">
                            <span className="stat-icon">💬</span>
                            <span className="stat-value">{bookmark.topic_details.replies_count}</span>
                          </span>
                          <span className="bookmark-author">
                            by {bookmark.topic_details.author.username}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">🔖</div>
                    <h3>No bookmarks yet</h3>
                    <p>Save topics to read them later</p>
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="activity-timeline">
                {userActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'joined' && '🎉'}
                      {activity.type === 'badge' && '🏅'}
                      {activity.type === 'post' && '📝'}
                      {activity.type === 'like' && '👍'}
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">
                        {activity.text}
                        {activity.title && <span className="activity-title"> "{activity.title}"</span>}
                      </p>
                      <span className="activity-date">{getTimeAgo(activity.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Badges Tab */}
            {activeTab === 'badges' && (
              <div className="badges-content">
                {gamificationLoading ? (
                  <div className="loading-state">Loading gamification data...</div>
                ) : gamificationData ? (
                  <>
                    {/* XP Progress Card */}
                    <div className="gamification-progress-card">
                      <div className="gamification-header">
                        <div className="level-info">
                          <div className="level-icon-wrapper" style={{ backgroundColor: gamificationData.level_data?.current_level_color || '#3b82f6' }}>
                            {gamificationData.level_data?.current_level_image ? (
                              <img 
                                src={gamificationData.level_data.current_level_image} 
                                alt={gamificationData.level_data.level_name}
                                className="level-icon-image"
                              />
                            ) : (
                              <span className="level-icon">{gamificationData.level_data?.current_level_icon || '⭐'}</span>
                            )}
                          </div>
                          <div className="level-details">
                            <h2>
                              Level {gamificationData.level_data?.level || 1} - {gamificationData.level_data?.level_name || 'Newcomer'}
                            </h2>
                            <p className="xp-total">Total XP: {(gamificationData.level_data?.total_xp || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="leaderboard-position">
                          ⭐ Rank #{gamificationData.leaderboard_position || 'N/A'}
                          <button 
                            className="refresh-button" 
                            onClick={refreshGamificationData}
                            disabled={gamificationLoading}
                            title="Refresh gamification data"
                          >
                            🔄 Refresh
                          </button>
                        </div>
                      </div>
                      
                      <div className="xp-section">
                        <div className="xp-text">
                          {gamificationData.level_data?.next_level_name ? (
                            <>
                              <span className="current-xp">{(gamificationData.level_data?.current_xp || 0).toLocaleString()} XP</span>
                              <span className="xp-divider">/</span>
                              <span className="required-xp">{((gamificationData.level_data?.current_xp || 0) + (gamificationData.level_data?.xp_to_next_level || 0)).toLocaleString()} XP</span>
                              <span className="next-level-info">
                                to reach Level {gamificationData.level_data?.next_level_number} 
                                <span className="next-level-icon">{gamificationData.level_data?.next_level_icon}</span>
                                {gamificationData.level_data?.next_level_name}
                              </span>
                            </>
                          ) : (
                            <span className="max-level">🏆 Maximum Level Reached!</span>
                          )}
                        </div>
                        <div className="xp-progress-bar">
                          <div 
                            className="xp-progress-fill" 
                            style={{ 
                              width: `${xpPercentage}%`,
                              backgroundColor: gamificationData.level_data?.current_level_color || '#3b82f6'
                            }}
                          ></div>
                        </div>
                        {gamificationData.level_data?.next_level_name && (
                          <div className="xp-remaining">
                            {(gamificationData.level_data?.xp_to_next_level || 0).toLocaleString()} XP needed for next level
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Badge Filters */}
                    <div className="badge-filters">
                      {badgeCategories.map(cat => (
                        <button
                          key={cat.id}
                          className={`badge-filter-btn ${activeFilter === cat.id ? 'active' : ''}`}
                          onClick={() => setActiveFilter(cat.id)}
                        >
                          <span className="filter-icon">{cat.icon}</span>
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Badges Grid */}
                    <div className="badges-grid-enhanced">
                      {filteredBadges.length > 0 ? (
                        filteredBadges.map(badge => (
                          <div
                            key={badge.id}
                            className={`badge-card-enhanced ${badge.unlocked ? 'unlocked' : 'locked'}`}
                            onClick={() => handleBadgeClick(badge)}
                          >
                            <div className="badge-status-indicator">
                              {badge.unlocked ? '✅' : '🔒'}
                            </div>
                            <div className="badge-icon-large">{badge.icon}</div>
                            <h4 className="badge-name">{badge.name}</h4>
                            
                            {badge.unlocked ? (
                              <div className="badge-unlocked-info">
                                <p className="badge-earned">Earned: {badge.earned_date}</p>
                                <p className="badge-description">{badge.description}</p>
                              </div>
                            ) : (
                              <div className="badge-locked-info">
                                <p className="badge-requirement">{badge.requirement}</p>
                                <div className="badge-progress-section">
                                  <div className="progress-text">
                                    {badge.progress}/{badge.required_count}
                                  </div>
                                  <div className="progress-bar-small">
                                    <div 
                                      className="progress-fill-small" 
                                      style={{ width: `${(badge.progress / badge.required_count) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="no-badges-message">
                          <p>No badges found in this category.</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="no-data-message">
                    <p>Gamification data not available.</p>
                  </div>
                )}

                {/* Badge Details Modal */}
                {showBadgeModal && selectedBadge && (
                  <div className="badge-modal-overlay" onClick={closeBadgeModal}>
                    <div className="badge-modal" onClick={(e) => e.stopPropagation()}>
                      <button className="modal-close-btn" onClick={closeBadgeModal}>✕</button>
                      
                      <div className="modal-header">
                        <div className="modal-badge-icon">{selectedBadge.icon}</div>
                        <h2>{selectedBadge.name}</h2>
                      </div>

                      <div className="modal-body">
                        <p className="modal-description">{selectedBadge.description}</p>
                        
                        {selectedBadge.unlocked ? (
                          <div className="modal-unlocked">
                            <p className="earned-date">✅ Earned: {selectedBadge.earned_date}</p>
                            <div className="requirement-complete">
                              ✔ {selectedBadge.requirement} (completed)
                            </div>
                            <div className="xp-reward">
                              🌟 +{selectedBadge.xp_reward || 0} XP
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
                                <span>{selectedBadge.progress} / {selectedBadge.required_count}</span>
                              </div>
                              <div className="progress-bar-modal">
                                <div 
                                  className="progress-fill-modal" 
                                  style={{ width: `${(selectedBadge.progress / selectedBadge.required_count) * 100}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="xp-reward-preview">
                              🌟 Earn {selectedBadge.xp_reward || 0} XP when unlocked
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && isOwnProfile && (
              <div className="settings-panel">
                {/* Account Info Section */}
                <div className="settings-section">
                  <h3 className="settings-heading">Account Info</h3>
                  <div className="settings-card">
                    <div className="form-group">
                      <label>Username</label>
                      <input 
                        type="text" 
                        name="username"
                        value={settingsData.username}
                        onChange={handleSettingsChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input 
                        type="email" 
                        name="email"
                        value={settingsData.email}
                        onChange={handleSettingsChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Bio</label>
                      <textarea 
                        rows="4" 
                        name="bio"
                        value={settingsData.bio}
                        onChange={handleSettingsChange}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input 
                        type="text" 
                        name="location"
                        value={settingsData.location}
                        onChange={handleSettingsChange}
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="form-group">
                      <label>GitHub URL</label>
                      <input 
                        type="url" 
                        name="githubUrl"
                        value={settingsData.githubUrl}
                        onChange={handleSettingsChange}
                        placeholder="https://github.com/username" 
                      />
                    </div>
                    <div className="form-group">
                      <label>LinkedIn URL</label>
                      <input 
                        type="url" 
                        name="linkedinUrl"
                        value={settingsData.linkedinUrl}
                        onChange={handleSettingsChange}
                        placeholder="https://linkedin.com/in/username" 
                      />
                    </div>
                  </div>
                </div>

                {/* Preferences Section */}
                <div className="settings-section">
                  <h3 className="settings-heading">Preferences</h3>
                  <div className="settings-card">
                    <div className="form-group">
                      <label>Theme</label>
                      <select 
                        name="theme"
                        value={settingsData.theme}
                        onChange={handleSettingsChange}
                      >
                        <option>Light</option>
                        <option>Dark</option>
                        <option>Auto</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Language</label>
                      <select 
                        name="language"
                        value={settingsData.language}
                        onChange={handleSettingsChange}
                      >
                        <option>English</option>
                        <option>Georgian</option>
                        <option>Russian</option>
                      </select>
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input 
                          type="checkbox" 
                          name="emailNotifications"
                          checked={settingsData.emailNotifications}
                          onChange={handleSettingsChange}
                        />
                        <span>Email notifications for replies</span>
                      </label>
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input 
                          type="checkbox" 
                          name="emailDigest"
                          checked={settingsData.emailDigest}
                          onChange={handleSettingsChange}
                        />
                        <span>Email digest (weekly summary)</span>
                      </label>
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input 
                          type="checkbox" 
                          name="showOnlineStatus"
                          checked={settingsData.showOnlineStatus}
                          onChange={handleSettingsChange}
                        />
                        <span>Show online status</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div className="settings-section">
                  <h3 className="settings-heading">Security</h3>
                  <div className="settings-card">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input 
                        type="password" 
                        name="currentPassword"
                        value={settingsData.currentPassword}
                        onChange={handleSettingsChange}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input 
                        type="password" 
                        name="newPassword"
                        value={settingsData.newPassword}
                        onChange={handleSettingsChange}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input 
                        type="password" 
                        name="confirmNewPassword"
                        value={settingsData.confirmNewPassword}
                        onChange={handleSettingsChange}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="form-group">
                      <button className="secondary-btn">View Login Sessions</button>
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input type="checkbox" />
                        <span>Enable Two-Factor Authentication (2FA)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button 
                  className="save-settings-btn"
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  {saving ? '💾 Saving...' : '💾 Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          icon={successMessage.includes('successfully') ? '🎉' : '⚠️'}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
}

export default UserProfilePage;
