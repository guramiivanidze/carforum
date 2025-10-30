import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/api';
import '../styles/UserProfilePage.css';

function UserProfilePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { profile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'posts');
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [saving, setSaving] = useState(false);
  
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
          username: data.user?.username || data.username || '',
          email: data.user?.email || data.email || '',
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

    fetchProfile();
  }, [id, currentUserProfile]);

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


  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="profile-error">Profile not found</div>;
  }

  // Mock data for topics/replies - TODO: fetch from API
  const userTopics = [
    {
      id: 1,
      title: 'How to integrate Zephyr Scale with Playwright?',
      category: 'QA Automation',
      views: 230,
      replies: 12,
      likes: 4,
      created_at: '2024-08-15T10:30:00Z'
    },
    {
      id: 2,
      title: 'Best practices for API testing with Python',
      category: 'Testing',
      views: 156,
      replies: 8,
      likes: 7,
      created_at: '2024-09-20T14:15:00Z'
    }
  ];

  const userReplies = [
    {
      id: 1,
      topic_title: 'Deploy Django on Ubuntu',
      content: 'Try restarting Gunicorn and checking service logs. Also make sure your virtual environment is activated properly...',
      created_at: '2024-10-15T09:20:00Z',
      topic_id: 5
    },
    {
      id: 2,
      topic_title: 'React Router v6 migration issues',
      content: 'You need to replace Switch with Routes and update your Route syntax. Check the official migration guide...',
      created_at: '2024-10-20T16:45:00Z',
      topic_id: 8
    }
  ];

  const userActivity = [
    { type: 'joined', text: 'Joined the forum', date: profile.user.date_joined },
    { type: 'badge', text: 'Earned "Problem Solver" badge', date: '2024-05-10T10:00:00Z' },
    { type: 'post', text: 'Posted new topic', title: 'How to integrate Zephyr Scale', date: '2024-08-15T10:30:00Z' },
    { type: 'like', text: 'Received 5 likes on a post', date: '2024-09-01T14:20:00Z' }
  ];

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
          <div className="profile-avatar-section">
            <div className="user-avatar-xlarge">{profile.avatar}</div>
            {isOwnProfile && (
              <button className="change-photo-link">Change photo</button>
            )}
          </div>

          <div className="profile-info-section">
            <div className="profile-name-row">
              <div className="profile-names">
                <h1 className="profile-display-name">{profile.user.username}</h1>
                <p className="profile-handle">@{profile.user.username.toLowerCase().replace(' ', '_')}</p>
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
              <span className="badge-tag moderator">🛡 Moderator</span>
              <span className="badge-tag top-member">⭐ Top Member</span>
              <span className="profile-meta">🌍 Georgia</span>
              <span className="profile-meta">🕓 Joined: {new Date(profile.user.date_joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
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
          <div className="stat-number">{profile.topics_count || 102}</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{profile.replies_count || 345}</div>
          <div className="stat-label">Replies</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">213</div>
          <div className="stat-label">Likes Given</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">481</div>
          <div className="stat-label">Likes Received</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">87</div>
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
              {new Date(profile.user.date_joined).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
            <div className="membership-duration">
              {getTimeAgo(profile.user.date_joined)}
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
              className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
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
            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="posts-list">
                {userTopics.map((topic) => (
                  <Link to={`/topic/${topic.id}`} key={topic.id} className="user-topic-card">
                    <h3 className="user-topic-title">{topic.title}</h3>
                    <div className="user-topic-meta">
                      <span className="topic-category-tag">{topic.category}</span>
                      <span className="topic-date">
                        📅 Posted: {getTimeAgo(topic.created_at)}
                      </span>
                    </div>
                    <div className="user-topic-stats">
                      <span className="topic-stat">👁 {topic.views}</span>
                      <span className="topic-stat">💬 {topic.replies}</span>
                      <span className="topic-stat">👍 {topic.likes}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Replies Tab */}
            {activeTab === 'replies' && (
              <div className="replies-list">
                {userReplies.map((reply) => (
                  <div key={reply.id} className="user-reply-card">
                    <div className="reply-header">
                      <span className="reply-in-text">Replied in</span>
                      <Link to={`/topic/${reply.topic_id}`} className="reply-topic-link">
                        {reply.topic_title}
                      </Link>
                    </div>
                    <p className="reply-excerpt">"{reply.content}"</p>
                    <div className="reply-footer">
                      <span className="reply-date">{getTimeAgo(reply.created_at)}</span>
                      <Link to={`/topic/${reply.topic_id}`} className="view-thread-btn">
                        View full thread →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === 'bookmarks' && (
              <div className="bookmarks-list">
                <div className="empty-state">
                  <div className="empty-icon">🔖</div>
                  <h3>No bookmarks yet</h3>
                  <p>Save topics to read them later</p>
                </div>
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
              <div className="badges-grid">
                {badges.map((badge, index) => (
                  <div key={index} className="badge-card">
                    <div className="badge-icon-large">{badge.icon}</div>
                    <h4 className="badge-name">{badge.name}</h4>
                    <p className="badge-description">{badge.description}</p>
                    <span className="badge-earned-date">
                      Earned: {new Date(badge.earned).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                ))}
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
    </div>
  );
}

export default UserProfilePage;
