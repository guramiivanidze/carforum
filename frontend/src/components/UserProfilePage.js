import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getUserProfile, getUserReplies, getUserBookmarks, getUserTopics, getUserGamification,
  uploadUserImage, toggleFollow, getFollowers, getFollowing, getFollowingTopics,
  updateProfile as updateProfileAPI, changePassword
} from '../services/api';
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
  const [userReplies, setUserReplies] = useState([]);
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [userTopics, setUserTopics] = useState([]);

  // Follower/Following state
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followingTopics, setFollowingTopics] = useState([]);
  const [followingSubTab, setFollowingSubTab] = useState('topics'); // 'topics' or 'users'
  const [followLoading, setFollowLoading] = useState(false);

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
    firstName: '',
    lastName: '',
    bio: '',
    skills: '',
    facebookUrl: '',
    linkedinUrl: '',
    tiktokUrl: ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          bio: data.bio || '',
          skills: data.skills || '',
          facebookUrl: data.facebook_url || '',
          linkedinUrl: data.linkedin_url || '',
          tiktokUrl: data.tiktok_url || ''
        });

        setLoading(false);
        // Check if this is current user's profile - MUST set to false if not own profile
        const isOwn = currentUserProfile && currentUserProfile.id === parseInt(id);
        setIsOwnProfile(isOwn);
        
        // If viewing another user's profile and current tab is private, reset to topics
        if (!isOwn) {
          const privateTabs = ['following', 'followers', 'replies', 'bookmarks', 'settings'];
          if (privateTabs.includes(activeTab)) {
            setActiveTab('topics');
          }
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

  // Fetch followers when followers tab is active
  useEffect(() => {
    const fetchFollowersData = async () => {
      if (activeTab === 'followers' && id) {
        try {
          const data = await getFollowers(id);
          setFollowers(data.results || data);
        } catch (err) {
          console.error('Error fetching followers:', err);
        }
      }
    };

    fetchFollowersData();
  }, [activeTab, id]);

  // Fetch following users and topics when following tab is active
  useEffect(() => {
    const fetchFollowingData = async () => {
      if (activeTab === 'following' && id) {
        try {
          if (followingSubTab === 'users') {
            const data = await getFollowing(id);
            setFollowing(data.results || data);
          } else if (followingSubTab === 'topics') {
            const data = await getFollowingTopics(id);
            setFollowingTopics(data.results || data);
          }
        } catch (err) {
          console.error('Error fetching following data:', err);
        }
      }
    };

    fetchFollowingData();
  }, [activeTab, followingSubTab, id]);

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

  const handleFollow = async () => {
    if (!currentUserProfile) {
      alert('Please login to follow users');
      return;
    }

    setFollowLoading(true);
    try {
      const result = await toggleFollow(id);
      setProfile(prev => ({
        ...prev,
        is_following: result.is_following,
        followers_count: result.followers_count,
        following_count: result.following_count
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert(error.response?.data?.error || 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (profileErrors[name]) {
      setProfileErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfile = () => {
    const errors = {};

    if (!settingsData.firstName || !settingsData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!settingsData.lastName || !settingsData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (settingsData.bio && settingsData.bio.length > 500) {
      errors.bio = 'Bio must be 500 characters or less';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/\d/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one number';
    } else if (!/[a-zA-Z]/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one letter';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfileAPI(id, {
        firstName: settingsData.firstName,
        lastName: settingsData.lastName,
        bio: settingsData.bio,
        skills: settingsData.skills,
        facebookUrl: settingsData.facebookUrl,
        linkedinUrl: settingsData.linkedinUrl,
        tiktokUrl: settingsData.tiktokUrl
      });

      // Update local profile state with new data
      const updatedProfileData = {
        ...profile,
        first_name: settingsData.firstName,
        last_name: settingsData.lastName,
        bio: settingsData.bio,
        skills: settingsData.skills,
        facebook_url: settingsData.facebookUrl,
        linkedin_url: settingsData.linkedinUrl,
        tiktok_url: settingsData.tiktokUrl
      };

      setProfile(updatedProfileData);

      // Update AuthContext if viewing own profile
      if (isOwnProfile && currentUserProfile) {
        updateProfile(updatedProfileData);
      }

      setSuccessMessage('Profile updated successfully! 🎉');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving profile:', error);
      if (error.response?.data) {
        setProfileErrors(error.response.data);
      } else {
        setProfileErrors({ general: 'Failed to save profile. Please try again.' });
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(id, {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword
      });

      // Clear password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setSuccessMessage('Password changed successfully! Please login again with your new password.');
      setShowSuccessModal(true);

      // Optionally redirect to login after a delay
      setTimeout(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.data) {
        setPasswordErrors(error.response.data);
      } else {
        setPasswordErrors({ general: 'Failed to change password. Please try again.' });
      }
    } finally {
      setSavingPassword(false);
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
                    className={`follow-btn ${profile.is_following ? 'following' : ''}`}
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    {followLoading ? '...' : (profile.is_following ? '✓ Following' : '+ Follow')}
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
              {profile.facebook_url && (
                <a href={profile.facebook_url} className="social-link" title="Facebook" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} className="social-link" title="LinkedIn" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              )}
              {profile.tiktok_url && (
                <a href={profile.tiktok_url} className="social-link" title="TikTok" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              )}
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
        <div
          className="stat-box clickable"
          onClick={() => setActiveTab('followers')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-number">{profile.followers_count || 0}</div>
          <div className="stat-label">Followers</div>
        </div>
        <div
          className="stat-box clickable"
          onClick={() => setActiveTab('following')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-number">{profile.following_count || 0}</div>
          <div className="stat-label">Following</div>
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
              {profile.bio || 'No bio added yet.'}
            </p>
            {profile.skills && profile.skills.trim() && (
              <div className="skills-list">
                {profile.skills.split(',').map((skill, index) => (
                  <span key={index} className="skill-tag">{skill.trim()}</span>
                ))}
              </div>
            )}
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

          {/* Following / Followers Card */}
          <div className="sidebar-card">
            <h3>Social</h3>
            <div className="social-stats">
              <div
                className="social-stat-link"
                onClick={() => setActiveTab('following')}
                style={{ cursor: 'pointer' }}
              >
                <span className="social-stat-number">{profile.following_count || 0}</span>
                <span className="social-stat-label">Following</span>
              </div>
              <div
                className="social-stat-link"
                onClick={() => setActiveTab('followers')}
                style={{ cursor: 'pointer' }}
              >
                <span className="social-stat-number">{profile.followers_count || 0}</span>
                <span className="social-stat-label">Followers</span>
              </div>
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
                  className={`profile-tab ${activeTab === 'following' ? 'active' : ''}`}
                  onClick={() => setActiveTab('following')}
                >
                  Following
                </button>
                <button
                  className={`profile-tab ${activeTab === 'followers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('followers')}
                >
                  Followers
                </button>
              </>
            )}
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
                        <span className="topic-category-tag">{topic.category_name}</span>
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
                    <div className="empty-icon">📝</div>
                    <h3>No topics yet</h3>
                    <p>This user hasn't created any topics</p>
                  </div>
                )}
              </div>
            )}

            {/* Following Tab */}
            {activeTab === 'following' && (
              <div className="following-content">
                {/* Sub-tabs for Following */}
                <div className="following-sub-tabs">
                  <button
                    className={`sub-tab ${followingSubTab === 'topics' ? 'active' : ''}`}
                    onClick={() => setFollowingSubTab('topics')}
                  >
                    📝 Topics Feed
                  </button>
                  <button
                    className={`sub-tab ${followingSubTab === 'users' ? 'active' : ''}`}
                    onClick={() => setFollowingSubTab('users')}
                  >
                    � Users
                  </button>
                </div>

                {/* Topics Feed Sub-tab */}
                {followingSubTab === 'topics' && (
                  <div className="following-topics-list">
                    {followingTopics.length > 0 ? (
                      followingTopics.map((topic) => (
                        <div key={topic.id} className="user-topic-card compact-horizontal">

                          {/* Right side - Topic data */}
                          <div className="topic-content-section">
                            <Link to={`/topic/${topic.id}`} className="topic-link">
                              <h3 className="user-topic-title">{topic.title}</h3>
                            </Link>
                            <div className="topic-meta-row">
                              <span className="topic-category-tag">{topic.category_name}</span>
                              <div className="user-topic-stats">
                                <span className="topic-stat">👁 {topic.views}</span>
                                <span className="topic-stat">💬 {topic.replies_count}</span>
                              </div>
                            </div>
                          </div>
                          {/* Left side - User info */}
                          <div className="topic-user-section">
                            <Link to={`/profile/${topic.author.id}`} className="author-avatar">
                              {topic.author.user_image_url ? (
                                <img src={topic.author.user_image_url} alt={topic.author.username} />
                              ) : (
                                topic.author.username[0].toUpperCase()
                              )}
                            </Link>
                            <div className="user-details">
                              <Link to={`/profile/${topic.author.id}`} className="author-name">
                                {topic.author.username}
                              </Link>
                              <span className="topic-date">
                                {getTimeAgo(topic.created_at)}
                              </span>
                            </div>
                          </div>


                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <h3>No topics yet</h3>
                        <p>Users you follow haven't posted any topics yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Users Sub-tab */}
                {followingSubTab === 'users' && (
                  <div className="following-users-list">
                    {following.length > 0 ? (
                      following.map((user) => (
                        <div key={user.id} className="user-card">
                          <Link to={`/profile/${user.id}`} className="user-card-link">
                            <div className="user-avatar-large">
                              {user.user_image_url ? (
                                <img src={user.user_image_url} alt={user.username} />
                              ) : (
                                user.username[0].toUpperCase()
                              )}
                            </div>
                            <div className="user-info">
                              <h4 className="user-name">{user.username}</h4>
                              <p className="user-points">⭐ {user.points} points</p>
                            </div>
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h3>Not following anyone yet</h3>
                        <p>Start following users to see them here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Followers Tab */}
            {activeTab === 'followers' && (
              <div className="followers-list">
                {followers.length > 0 ? (
                  followers.map((user) => (
                    <div key={user.id} className="user-card">
                      <Link to={`/profile/${user.id}`} className="user-card-link">
                        <div className="user-avatar-large">
                          {user.user_image_url ? (
                            <img src={user.user_image_url} alt={user.username} />
                          ) : (
                            user.username[0].toUpperCase()
                          )}
                        </div>
                        <div className="user-info">
                          <h4 className="user-name">{user.username}</h4>
                          <p className="user-points">⭐ {user.points} points</p>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No followers yet</h3>
                    <p>When others follow this user, they'll appear here</p>
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
                {/* Profile Info Section */}
                <div className="settings-section">
                  <h3 className="settings-heading">Profile Information</h3>
                  <div className="settings-card">
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={settingsData.firstName}
                          onChange={handleSettingsChange}
                          placeholder="Enter first name"
                        />
                        {profileErrors.firstName && (
                          <small className="field-error">{profileErrors.firstName}</small>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={settingsData.lastName}
                          onChange={handleSettingsChange}
                          placeholder="Enter last name"
                        />
                        {profileErrors.lastName && (
                          <small className="field-error">{profileErrors.lastName}</small>
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Username</label>
                      <input
                        type="text"
                        value={profile?.username || ''}
                        disabled
                        className="disabled-input"
                      />
                      <small className="field-hint">Username cannot be changed</small>
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="disabled-input"
                      />
                      <small className="field-hint">Email cannot be changed</small>
                    </div>
                    <div className="form-group">
                      <label>Bio</label>
                      <textarea
                        rows="4"
                        name="bio"
                        value={settingsData.bio}
                        onChange={handleSettingsChange}
                        placeholder="Tell us about yourself..."
                        maxLength="500"
                      />
                      <div className="field-info">
                        <small className={profileErrors.bio ? "field-error" : "field-hint"}>
                          {profileErrors.bio || `${settingsData.bio.length}/500 characters`}
                        </small>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Skills</label>
                      <input
                        type="text"
                        name="skills"
                        value={settingsData.skills}
                        onChange={handleSettingsChange}
                        placeholder="Enter skills separated by commas (e.g., Python, Django, React)"
                      />
                      <small className="field-hint">
                        Separate multiple skills with commas
                      </small>
                      {profileErrors.skills && (
                        <small className="field-error">{profileErrors.skills}</small>
                      )}
                    </div>
                    
                    {/* Social Media Links */}
                    <div className="form-group">
                      <label>Facebook URL</label>
                      <input
                        type="url"
                        name="facebookUrl"
                        value={settingsData.facebookUrl}
                        onChange={handleSettingsChange}
                        placeholder="https://facebook.com/yourprofile"
                      />
                      {profileErrors.facebookUrl && (
                        <small className="field-error">{profileErrors.facebookUrl}</small>
                      )}
                    </div>
                    <div className="form-group">
                      <label>LinkedIn URL</label>
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={settingsData.linkedinUrl}
                        onChange={handleSettingsChange}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                      {profileErrors.linkedinUrl && (
                        <small className="field-error">{profileErrors.linkedinUrl}</small>
                      )}
                    </div>
                    <div className="form-group">
                      <label>TikTok URL</label>
                      <input
                        type="url"
                        name="tiktokUrl"
                        value={settingsData.tiktokUrl}
                        onChange={handleSettingsChange}
                        placeholder="https://tiktok.com/@yourprofile"
                      />
                      {profileErrors.tiktokUrl && (
                        <small className="field-error">{profileErrors.tiktokUrl}</small>
                      )}
                    </div>
                    
                    {profileErrors.general && (
                      <div className="error-message">{profileErrors.general}</div>
                    )}
                    <button
                      className="save-btn primary-btn"
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                    >
                      {savingProfile ? '💾 Saving...' : '💾 Save Profile'}
                    </button>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="settings-section">
                  <h3 className="settings-heading">Change Password</h3>
                  <div className="settings-card">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                      />
                      {passwordErrors.currentPassword && (
                        <small className="field-error">{passwordErrors.currentPassword}</small>
                      )}
                      {passwordErrors.current_password && (
                        <small className="field-error">{passwordErrors.current_password}</small>
                      )}
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                      />
                      {passwordErrors.newPassword && (
                        <small className="field-error">{passwordErrors.newPassword}</small>
                      )}
                      {passwordErrors.new_password && (
                        <small className="field-error">{passwordErrors.new_password}</small>
                      )}
                      <small className="field-hint">
                        At least 8 characters, must contain letters and numbers
                      </small>
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                      />
                      {passwordErrors.confirmPassword && (
                        <small className="field-error">{passwordErrors.confirmPassword}</small>
                      )}
                      {passwordErrors.confirm_password && (
                        <small className="field-error">{passwordErrors.confirm_password}</small>
                      )}
                    </div>
                    {passwordErrors.general && (
                      <div className="error-message">{passwordErrors.general}</div>
                    )}
                    <button
                      className="save-btn primary-btn"
                      onClick={handleSavePassword}
                      disabled={savingPassword}
                    >
                      {savingPassword ? '� Changing...' : '� Change Password'}
                    </button>
                  </div>
                </div>
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
