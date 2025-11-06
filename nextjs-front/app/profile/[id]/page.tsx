'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserProfile, 
  getUserTopics, 
  followUser, 
  updateUserProfile,
  getUserFollowers,
  getUserFollowing,
  getUserFollowingTopics,
  getUserReplies,
  getUserBookmarks,
  getUserGamification
} from '@/lib/api';
import { UserProfile, Topic } from '@/types';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendar, 
  FaTrophy,
  FaComments,
  FaReply,
  FaThumbsUp,
  FaUserPlus,
  FaUserCheck,
  FaUsers,
  FaEdit,
  FaFacebook,
  FaLinkedin,
  FaTiktok,
  FaSave,
  FaTimes,
  FaBookmark,
  FaChartLine,
  FaMedal,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';

type TabType = 'topics' | 'following' | 'followers' | 'replies' | 'bookmarks' | 'activity' | 'badges';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [followingTopics, setFollowingTopics] = useState<Topic[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<Topic[]>([]);
  const [gamification, setGamification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('topics');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: '',
    skills: '',
    facebook_url: '',
    linkedin_url: '',
    tiktok_url: '',
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        const [profileData, topicsData] = await Promise.all([
          getUserProfile(params.id as string),
          getUserTopics(params.id as string)
        ]);
        
        if (isMounted) {
          setProfile(profileData);
          setTopics(topicsData);
          setEditData({
            bio: profileData.bio || '',
            skills: profileData.skills || '',
            facebook_url: profileData.facebook_url || '',
            linkedin_url: profileData.linkedin_url || '',
            tiktok_url: profileData.tiktok_url || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  // Fetch tab-specific data when tab changes
  useEffect(() => {
    if (!params.id || !profile) return;

    const fetchTabData = async () => {
      setTabLoading(true);
      try {
        switch (activeTab) {
          case 'followers':
            const followersData = await getUserFollowers(params.id as string);
            setFollowers(followersData.results || followersData);
            break;
          case 'following':
            const [followingData, followingTopicsData] = await Promise.all([
              getUserFollowing(params.id as string),
              getUserFollowingTopics(params.id as string)
            ]);
            setFollowing(followingData.results || followingData);
            setFollowingTopics(followingTopicsData.results || followingTopicsData);
            break;
          case 'replies':
            if (user?.id === profile.id) {
              const repliesData = await getUserReplies(params.id as string);
              setReplies(repliesData.results || repliesData);
            }
            break;
          case 'bookmarks':
            if (user?.id === profile.id) {
              const bookmarksData = await getUserBookmarks(params.id as string);
              setBookmarks(bookmarksData.results || bookmarksData);
            }
            break;
          case 'badges':
            const gamificationData = await getUserGamification(params.id as string);
            setGamification(gamificationData);
            break;
        }
      } catch (error) {
        console.error('Failed to fetch tab data:', error);
      } finally {
        setTabLoading(false);
      }
    };

    if (activeTab !== 'topics' && activeTab !== 'activity') {
      fetchTabData();
    }
  }, [activeTab, params.id, profile, user]);

  const handleFollow = async () => {
    if (!user || !profile) {
      router.push('/login');
      return;
    }

    try {
      const response = await followUser(profile.id);
      setProfile({
        ...profile,
        is_following: response.is_following,
        followers_count: response.followers_count,
        following_count: response.following_count,
      });
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile || !user) return;

    try {
      const updatedProfile = await updateUserProfile(profile.id, editData);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {profile.user_image_url ? (
                  <img
                    src={profile.user_image_url}
                    alt={profile.username}
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-32 h-32 bg-blue-600 text-white rounded-full flex items-center justify-center text-4xl font-bold">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {profile.first_name && profile.last_name
                        ? `${profile.first_name} ${profile.last_name}`
                        : profile.username}
                    </h1>
                    <p className="text-gray-600 mb-2">@{profile.username}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaCalendar />
                        Joined {formatDate(profile.date_joined)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isOwnProfile ? (
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <FaEdit />
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                      </button>
                    ) : user ? (
                      <button
                        onClick={handleFollow}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                          profile.is_following
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {profile.is_following ? (
                          <>
                            <FaUserCheck />
                            Following
                          </>
                        ) : (
                          <>
                            <FaUserPlus />
                            Follow
                          </>
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile.points}</div>
                    <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                      <FaTrophy className="text-yellow-500" />
                      Points
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{profile.topics_count}</div>
                    <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                      <FaComments />
                      Topics
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{profile.replies_count}</div>
                    <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                      <FaReply />
                      Replies
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{profile.likes_received}</div>
                    <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                      <FaThumbsUp />
                      Likes
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{profile.followers_count}</div>
                    <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                      <FaUsers />
                      Followers
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {!isEditing && profile.bio && (
                  <div className="mb-4">
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                )}

                {/* Social Links */}
                {!isEditing && (profile.facebook_url || profile.linkedin_url || profile.tiktok_url) && (
                  <div className="flex items-center gap-3">
                    {profile.facebook_url && (
                      <a
                        href={profile.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-xl"
                      >
                        <FaFacebook />
                      </a>
                    )}
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-800 text-xl"
                      >
                        <FaLinkedin />
                      </a>
                    )}
                    {profile.tiktok_url && (
                      <a
                        href={profile.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:text-gray-700 text-xl"
                      >
                        <FaTiktok />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Form */}
            {isEditing && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{editData.bio.length}/500 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills
                    </label>
                    <input
                      type="text"
                      value={editData.skills}
                      onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., JavaScript, React, Node.js"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaFacebook className="inline mr-1" /> Facebook URL
                      </label>
                      <input
                        type="url"
                        value={editData.facebook_url}
                        onChange={(e) => setEditData({ ...editData, facebook_url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://facebook.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaLinkedin className="inline mr-1" /> LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={editData.linkedin_url}
                        onChange={(e) => setEditData({ ...editData, linkedin_url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaTiktok className="inline mr-1" /> TikTok URL
                      </label>
                      <input
                        type="url"
                        value={editData.tiktok_url}
                        onChange={(e) => setEditData({ ...editData, tiktok_url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://tiktok.com/@..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <FaSave />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      <FaTimes />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab('topics')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === 'topics'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaComments className="inline mr-2" />
                  Topics ({profile.topics_count})
                </button>
                <button
                  onClick={() => setActiveTab('following')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === 'following'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaUserPlus className="inline mr-2" />
                  Following ({profile.following_count})
                </button>
                <button
                  onClick={() => setActiveTab('followers')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === 'followers'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaUsers className="inline mr-2" />
                  Followers ({profile.followers_count})
                </button>
                {isOwnProfile && (
                  <button
                    onClick={() => setActiveTab('replies')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                      activeTab === 'replies'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FaReply className="inline mr-2" />
                    Replies ({profile.replies_count})
                  </button>
                )}
                {isOwnProfile && (
                  <button
                    onClick={() => setActiveTab('bookmarks')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                      activeTab === 'bookmarks'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FaBookmark className="inline mr-2" />
                    Bookmarks
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === 'activity'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaChartLine className="inline mr-2" />
                  Activity
                </button>
                <button
                  onClick={() => setActiveTab('badges')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === 'badges'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaMedal className="inline mr-2" />
                  Badges
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {tabLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              ) : (
                <>
                  {/* Topics Tab */}
                  {activeTab === 'topics' && (
                    <div className="space-y-3">
                      {topics.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaComments className="text-blue-600 text-3xl" />
                          </div>
                          <p className="text-gray-500 text-lg">No topics yet.</p>
                        </div>
                      ) : (
                        topics.map((topic, index) => (
                          <div
                            key={topic.id}
                            className="group bg-white rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-100 hover:border-blue-200"
                            onClick={() => router.push(`/topic/${topic.id}`)}
                          >
                            <div className="flex items-start gap-4">
                              {/* Topic Number Badge */}
                              <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg font-bold text-gray-600 text-sm flex-shrink-0 group-hover:from-blue-50 group-hover:to-blue-100 group-hover:text-blue-600 transition-all">
                                {index + 1}
                              </div>

                              {/* Topic Info */}
                              <div className="flex-grow min-w-0">
                                {/* Badges */}
                                {(topic.is_pinned || topic.is_locked) && (
                                  <div className="flex items-center gap-2 mb-2">
                                    {topic.is_pinned && (
                                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                                        📌 Pinned
                                      </span>
                                    )}
                                    {topic.is_locked && (
                                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                                        🔒 Locked
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Title */}
                                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
                                  {topic.title}
                                </h3>

                                {/* Date */}
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <FaCalendar className="text-[10px]" />
                                    {new Date(topic.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              {/* Stats - Compact */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1.5 rounded-lg group-hover:bg-blue-100 transition-colors">
                                  <FaThumbsUp className="text-blue-600 text-xs" />
                                  <span className="text-xs font-bold text-blue-600">{topic.likes_count || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1.5 rounded-lg group-hover:bg-green-100 transition-colors">
                                  <FaComments className="text-green-600 text-xs" />
                                  <span className="text-xs font-bold text-green-600">{topic.replies_count || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Following Tab */}
                  {activeTab === 'following' && (
                    <div className="space-y-6">
                      {following.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Not following anyone yet.</p>
                      ) : (
                        <>
                          {/* Following Users */}
                          <div>
                            <h3 className="text-lg font-semibold mb-3">People</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {following.map((followedUser: any) => (
                                <Link
                                  key={followedUser.id}
                                  href={`/profile/${followedUser.id}`}
                                  className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition"
                                >
                                  {followedUser.user_image_url ? (
                                    <img
                                      src={followedUser.user_image_url}
                                      alt={followedUser.username}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                      {followedUser.username.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="flex-grow">
                                    <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                                      {followedUser.username}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      {followedUser.topics_count} topics • {followedUser.replies_count} replies
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>

                          {/* Topics from Following */}
                          {followingTopics.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Recent Topics from People You Follow</h3>
                              <div className="space-y-3">
                                {followingTopics.map((topic) => (
                                  <div
                                    key={topic.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <Link
                                        href={`/topic/${topic.id}`}
                                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 flex-grow"
                                      >
                                        {topic.title}
                                      </Link>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      <Link 
                                        href={`/profile/${topic.author.id}`}
                                        className="flex items-center gap-2 hover:text-blue-600"
                                      >
                                        {topic.author.user_image_url ? (
                                          <img
                                            src={topic.author.user_image_url}
                                            alt={topic.author.username}
                                            className="w-6 h-6 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                            {topic.author.username.charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <span className="font-medium">{topic.author.username}</span>
                                      </Link>
                                      <span className="flex items-center gap-1">
                                        <FaReply />
                                        {topic.replies_count} replies
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <FaThumbsUp />
                                        {topic.likes_count} likes
                                      </span>
                                      <span>
                                        {new Date(topic.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Followers Tab */}
                  {activeTab === 'followers' && (
                    <div className="space-y-4">
                      {followers.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No followers yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {followers.map((follower: any) => (
                            <Link
                              key={follower.id}
                              href={`/profile/${follower.id}`}
                              className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition"
                            >
                              {follower.user_image_url ? (
                                <img
                                  src={follower.user_image_url}
                                  alt={follower.username}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                  {follower.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex-grow">
                                <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                                  {follower.username}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {follower.topics_count} topics • {follower.replies_count} replies
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Replies Tab */}
                  {activeTab === 'replies' && (
                    <div className="space-y-4">
                      {!user || user.id !== profile.id ? (
                        <p className="text-center text-gray-500 py-8">This information is private.</p>
                      ) : replies.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No replies yet.</p>
                      ) : (
                        replies.map((reply: any) => (
                          <div
                            key={reply.id}
                            className={`border rounded-lg p-4 transition ${
                              reply.pending_reports_count > 0
                                ? 'border-orange-300 bg-orange-50'
                                : reply.resolved_report
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-200 hover:border-blue-500 hover:shadow-md'
                            }`}
                          >
                            {/* Header with Topic Info and Report Status */}
                            <div className="mb-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-grow">
                                  {/* Topic Title */}
                                  <Link
                                    href={`/topic/${reply.topic}`}
                                    className="text-base font-semibold text-gray-900 hover:text-blue-600 block mb-1"
                                  >
                                    {reply.topic_title}
                                  </Link>
                                  
                                  {/* Topic Author */}
                                  {reply.topic_author && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <span>Topic by</span>
                                      <Link
                                        href={`/profile/${reply.topic_author.id}`}
                                        className="flex items-center gap-2 hover:text-blue-600"
                                      >
                                        {reply.topic_author.user_image_url ? (
                                          <img
                                            src={reply.topic_author.user_image_url}
                                            alt={reply.topic_author.username}
                                            className="w-5 h-5 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                            {reply.topic_author.username.charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <span className="font-medium">@{reply.topic_author.username}</span>
                                      </Link>
                                    </div>
                                  )}
                                </div>
                                
                                <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
                                  {new Date(reply.created_at).toLocaleDateString()}
                                </span>
                              </div>

                              {/* Report Status Badges */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {reply.pending_reports_count > 0 && (
                                  <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                    <FaExclamationTriangle />
                                    {reply.pending_reports_count} pending report{reply.pending_reports_count > 1 ? 's' : ''}
                                  </span>
                                )}
                                
                                {reply.resolved_report && (
                                  <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                    <FaCheckCircle />
                                    Resolved report
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Resolved Report Details */}
                            {reply.resolved_report && (
                              <div className="mb-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <FaExclamationTriangle className="text-red-600 mt-1 flex-shrink-0" />
                                  <div className="flex-grow">
                                    <h4 className="text-sm font-semibold text-red-900 mb-1">
                                      Resolved Report: {reply.resolved_report.reason}
                                    </h4>
                                    <p className="text-xs text-red-700 mb-1">
                                      {reply.resolved_report.reason_description}
                                    </p>
                                    {reply.resolved_report.additional_info && (
                                      <p className="text-xs text-red-600 italic">
                                        "{reply.resolved_report.additional_info}"
                                      </p>
                                    )}
                                    {reply.resolved_report.resolved_at && (
                                      <p className="text-xs text-red-500 mt-2">
                                        Resolved on {new Date(reply.resolved_report.resolved_at).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Reply Content */}
                            <div 
                              className="prose prose-sm max-w-none mb-2"
                              dangerouslySetInnerHTML={{ __html: reply.content }}
                            />
                            
                            {/* Reply Stats */}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <FaThumbsUp />
                                {reply.likes_count} likes
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Bookmarks Tab */}
                  {activeTab === 'bookmarks' && (
                    <div className="space-y-3">
                      {!user || user.id !== profile.id ? (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaBookmark className="text-gray-400 text-3xl" />
                          </div>
                          <p className="text-gray-500 text-lg">This information is private.</p>
                        </div>
                      ) : bookmarks.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaBookmark className="text-blue-600 text-3xl" />
                          </div>
                          <p className="text-gray-500 text-lg">No bookmarks yet.</p>
                        </div>
                      ) : (
                        bookmarks.map((bookmark: any, index) => {
                          const topic = bookmark.topic_details;
                          return (
                            <div
                              key={bookmark.id}
                              className="group bg-white rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-100 hover:border-blue-200"
                              onClick={() => router.push(`/topic/${topic.id}`)}
                            >
                              <div className="flex items-start gap-4">
                                {/* Bookmark Number Badge */}
                                <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex-shrink-0">
                                  <FaBookmark className="text-blue-600 text-sm" />
                                </div>

                                {/* Topic Info */}
                                <div className="flex-grow min-w-0">
                                  {/* Title */}
                                  <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
                                    {topic.title}
                                  </h3>

                                  {/* Author */}
                                  {topic.author && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                      <span className="text-gray-500">by</span>
                                      <div className="flex items-center gap-1.5">
                                        {topic.author.user_image_url ? (
                                          <img
                                            src={topic.author.user_image_url}
                                            alt={topic.author.username}
                                            className="w-5 h-5 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                            {topic.author.username.charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <span className="font-medium">{topic.author.username}</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Bookmarked Date */}
                                  <div className="text-[11px] text-gray-500">
                                    Bookmarked {new Date(bookmark.created_at).toLocaleDateString()}
                                  </div>
                                </div>

                                {/* Stats - Compact */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1.5 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <FaThumbsUp className="text-blue-600 text-xs" />
                                    <span className="text-xs font-bold text-blue-600">{topic.likes_count || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1.5 rounded-lg group-hover:bg-green-100 transition-colors">
                                    <FaComments className="text-green-600 text-xs" />
                                    <span className="text-xs font-bold text-green-600">{topic.replies_count || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Activity Tab */}
                  {activeTab === 'activity' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Statistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-3xl font-bold text-blue-600 mb-1">{profile.topics_count}</div>
                            <div className="text-sm text-gray-600">Topics Created</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-3xl font-bold text-blue-600 mb-1">{profile.replies_count}</div>
                            <div className="text-sm text-gray-600">Replies Posted</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-3xl font-bold text-blue-600 mb-1">{profile.likes_given}</div>
                            <div className="text-sm text-gray-600">Likes Given</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-3xl font-bold text-blue-600 mb-1">{profile.likes_received}</div>
                            <div className="text-sm text-gray-600">Likes Received</div>
                          </div>
                        </div>
                      </div>

                      {profile.bio && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">About</h3>
                          <p className="text-gray-700">{profile.bio}</p>
                        </div>
                      )}

                      {profile.skills && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Skills</h3>
                          <p className="text-gray-700">{profile.skills}</p>
                        </div>
                      )}

                      {profile.email && isOwnProfile && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Contact</h3>
                          <p className="text-gray-700 flex items-center gap-2">
                            <FaEnvelope />
                            {profile.email}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Badges Tab */}
                  {activeTab === 'badges' && (
                    <div className="space-y-6">
                      {gamification ? (
                        <>
                          {/* Level Progress */}
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                            <div className="flex items-center gap-4">
                              <div className="bg-white rounded-full p-4 shadow-md">
                                <div className="text-4xl">
                                  {gamification.level_data?.current_level_icon || '⭐'}
                                </div>
                              </div>
                              <div className="flex-grow">
                                <h3 className="text-2xl font-bold text-gray-900">
                                  Level {gamification.level_data?.level || 1}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {gamification.level_data?.level_name || 'Newbie'}
                                </p>
                                <p className="text-gray-600 mt-1">
                                  {gamification.level_data?.total_xp || 0} Total XP
                                </p>
                                
                                {/* Progress Bar */}
                                <div className="mt-3 w-full max-w-md">
                                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                    <span>Current: {gamification.level_data?.current_xp || 0} XP</span>
                                    <span>Next Level: {gamification.level_data?.xp_to_next_level || 0} XP</span>
                                  </div>
                                  <div className="bg-gray-200 rounded-full h-3">
                                    <div
                                      className="bg-blue-600 h-3 rounded-full transition-all"
                                      style={{ 
                                        width: `${gamification.level_data?.xp_progress_percentage || 0}%` 
                                      }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {gamification.level_data?.xp_progress_percentage || 0}% to next level
                                  </p>
                                </div>

                                {/* Next Level Preview */}
                                {gamification.level_data?.next_level_name && (
                                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                    <span>Next:</span>
                                    <span className="font-semibold">
                                      {gamification.level_data.next_level_icon} {gamification.level_data.next_level_name}
                                    </span>
                                    <span className="text-xs">
                                      (Level {gamification.level_data.next_level_number})
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Leaderboard Position */}
                              {gamification.leaderboard_position && (
                                <div className="text-center bg-white rounded-lg p-4 shadow-md">
                                  <div className="text-3xl font-bold text-blue-600">
                                    #{gamification.leaderboard_position}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">Rank</div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Badges */}
                          {gamification.badges && gamification.badges.length > 0 ? (
                            <div>
                              <h3 className="text-lg font-semibold mb-4">
                                {gamification.is_own_profile ? 'Badges Progress' : 'Earned Badges'}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {gamification.badges.map((badge: any) => (
                                  <div
                                    key={badge.id}
                                    className={`border rounded-lg p-4 transition ${
                                      badge.unlocked
                                        ? 'border-green-300 bg-green-50 hover:border-green-500 hover:shadow-md'
                                        : 'border-gray-200 bg-gray-50 opacity-75'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="text-3xl">{badge.icon || '🏆'}</div>
                                      <div className="flex-grow">
                                        <div className="flex items-center justify-between mb-1">
                                          <h4 className="font-semibold text-gray-900">{badge.name}</h4>
                                          {badge.unlocked && (
                                            <span className="text-green-600 text-xl">✓</span>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-1">{badge.category}</p>
                                        <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                                        
                                        {/* Progress bar for own profile */}
                                        {gamification.is_own_profile && !badge.unlocked && (
                                          <div className="mt-2">
                                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                              <span>Progress</span>
                                              <span>{badge.progress} / {badge.required_count}</span>
                                            </div>
                                            <div className="bg-gray-200 rounded-full h-2">
                                              <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${badge.progress_percentage || 0}%` }}
                                              />
                                            </div>
                                          </div>
                                        )}

                                        {/* Earned date */}
                                        {badge.unlocked && badge.earned_date && (
                                          <p className="text-xs text-gray-500 mt-2">
                                            Earned {badge.earned_date}
                                          </p>
                                        )}

                                        {/* XP Reward */}
                                        <p className="text-xs text-blue-600 mt-2">
                                          +{badge.xp_reward} XP
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-8">No badges earned yet.</p>
                          )}

                          {/* Streak Data */}
                          {gamification.streak_data && gamification.streak_data.current_streak > 0 && (
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 mt-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="text-3xl">🔥</div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {gamification.streak_data.current_streak} Day Streak
                                    </h4>
                                    <p className="text-sm text-gray-600">Keep it up!</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-600">Best Streak</div>
                                  <div className="text-2xl font-bold text-orange-600">
                                    {gamification.streak_data.longest_streak}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-center text-gray-500 py-8">Loading gamification data...</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
