/**
 * API Service
 * 
 * Centralized HTTP client for all backend API calls.
 * Uses Axios for HTTP requests with automatic JWT token injection and refresh.
 * Integrates with cache service to prevent duplicate requests.
 * 
 * Features:
 * - Automatic JWT token authentication
 * - Token refresh on 401 errors
 * - Request/response interceptors
 * - FormData support for file uploads
 * - Integrated caching for GET requests
 */

import axios from 'axios';
import apiCache from './apiCache';

// Base URL from environment variable or default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Create Axios instance with default configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * 
 * Automatically adds JWT token to all requests if available.
 * Handles FormData content type for file uploads.
 */
api.interceptors.request.use(
  (config) => {
    // Inject JWT token from localStorage if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Let browser set Content-Type for FormData (includes boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles automatic token refresh on 401 Unauthorized errors.
 * If refresh token is available, attempts to get new access token.
 * On refresh failure, clears auth and redirects to login.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if request failed due to unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Attempt to refresh the access token
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed - clear auth data and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTHENTICATION APIs
// ============================================================================

/**
 * Register a new user account
 * @param {Object} userData - User registration data (username, email, password, firstName, lastName)
 * @returns {Promise<Object>} Response with user data and tokens
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register/', userData);
  return response.data;
};

/**
 * Login with credentials
 * @param {Object} credentials - Login credentials (username/email and password)
 * @returns {Promise<Object>} Response with user data and tokens
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login/', credentials);
  return response.data;
};

/**
 * Logout current user and invalidate tokens
 * @returns {Promise<Object>} Logout confirmation
 */
export const logout = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  const response = await api.post('/auth/logout/', { refresh_token: refreshToken });
  
  // Clear cache on logout
  apiCache.clearAll();
  
  return response.data;
};

/**
 * Get current authenticated user data
 * @returns {Promise<Object>} Current user and profile data
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me/');
  return response.data;
};

// ============================================================================
// FORUM APIs - Categories & Topics
// ============================================================================

/**
 * Get all forum categories with caching (10 min TTL)
 * @returns {Promise<Array>} List of categories
 */
export const getCategories = async () => {
  return apiCache.fetch(
    'categories',
    async () => {
      const response = await api.get('/categories/');
      return response.data;
    }
  );
};

/**
 * Get topics in a specific category with pagination
 * @param {number} categoryId - Category ID
 * @param {Object} params - Query params (page, page_size, ordering)
 * @returns {Promise<Object>} Paginated topics response
 */
export const getCategoryTopics = async (categoryId, params = {}) => {
  const cacheKey = `categories/${categoryId}/topics`;
  return apiCache.fetch(
    cacheKey,
    async () => {
      const response = await api.get(`/categories/${categoryId}/topics/`, { params });
      return response.data;
    },
    params
  );
};

/**
 * Get all topics with pagination
 * @param {Object} params - Query params (page, page_size, ordering)
 * @returns {Promise<Object>} Paginated topics response
 */
export const getTopics = async (params = {}) => {
  return apiCache.fetch(
    'topics',
    async () => {
      const response = await api.get('/topics/', { params });
      return response.data;
    },
    params
  );
};

/**
 * Get single topic by ID with caching (1 min TTL)
 * @param {number} id - Topic ID
 * @returns {Promise<Object>} Topic details with replies
 */
export const getTopic = async (id) => {
  return apiCache.fetch(
    `topics/${id}`,
    async () => {
      const response = await api.get(`/topics/${id}/`);
      return response.data;
    }
  );
};

/**
 * Get related topics for a specific topic
 * @param {number} id - Topic ID
 * @returns {Promise<Array>} List of related topics
 */
export const getRelatedTopics = async (id) => {
  return apiCache.fetch(
    `topics/${id}/related`,
    async () => {
      const response = await api.get(`/topics/${id}/related/`);
      return response.data;
    }
  );
};

/**
 * Create a new topic
 * @param {Object} topicData - Topic data (title, content, category, tags, images, poll)
 * @returns {Promise<Object>} Created topic
 */
export const createTopic = async (topicData) => {
  const response = await api.post('/topics/', topicData);
  
  // Invalidate topics cache after creation
  apiCache.invalidate('topics');
  apiCache.invalidate('categories');
  
  return response.data;
};

/**
 * Update an existing topic
 * @param {number} topicId - Topic ID
 * @param {Object} topicData - Updated topic data
 * @returns {Promise<Object>} Updated topic
 */
export const updateTopic = async (topicId, topicData) => {
  const response = await api.put(`/topics/${topicId}/`, topicData);
  
  // Invalidate specific topic cache
  apiCache.invalidate(`topics/${topicId}`);
  apiCache.invalidate('topics');
  
  return response.data;
};

/**
 * Like/unlike a topic
 * @param {number} topicId - Topic ID
 * @returns {Promise<Object>} Updated like status
 */
export const likeTopic = async (topicId) => {
  const response = await api.post(`/topics/${topicId}/like/`);
  
  // Invalidate topic cache to reflect new like count
  apiCache.invalidate(`topics/${topicId}`);
  
  return response.data;
};

/**
 * Bookmark/unbookmark a topic
 * @param {number} topicId - Topic ID
 * @returns {Promise<Object>} Updated bookmark status
 */
export const bookmarkTopic = async (topicId) => {
  const response = await api.post(`/topics/${topicId}/bookmark/`);
  
  // Invalidate bookmarks cache
  apiCache.invalidate('bookmarks');
  
  return response.data;
};

/**
 * Search across all content (topics, replies, users)
 * @param {string} query - Search query
 * @param {Object} filters - Search filters (category, author, date_range)
 * @returns {Promise<Object>} Search results
 */
export const searchAll = async (query, filters = {}) => {
  const params = new URLSearchParams({ q: query, ...filters });
  const response = await api.get(`/search/?${params.toString()}`);
  return response.data;
};

// ============================================================================
// REPLIES APIs
// ============================================================================

/**
 * Create a reply to a topic
 * @param {number} topicId - Topic ID
 * @param {Object} replyData - Reply data (content, parent_id for nested replies)
 * @returns {Promise<Object>} Created reply
 */
export const createReply = async (topicId, replyData) => {
  const response = await api.post(`/topics/${topicId}/replies/`, replyData);
  
  // Invalidate topic cache to show new reply
  apiCache.invalidate(`topics/${topicId}`);
  
  return response.data;
};

/**
 * Like/unlike a reply
 * @param {number} replyId - Reply ID
 * @returns {Promise<Object>} Updated like status
 */
export const likeReply = async (replyId) => {
  const response = await api.post(`/replies/${replyId}/like/`);
  return response.data;
};

/**
 * Delete a reply
 * @param {number} replyId - Reply ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteReply = async (replyId) => {
  const response = await api.delete(`/replies/${replyId}/`);
  return response.data;
};

// ============================================================================
// USER PROFILE APIs
// ============================================================================

/**
 * Get top members ranked by points
 * @returns {Promise<Array>} Top 10 members
 */
export const getTopMembers = async () => {
  return apiCache.fetch(
    'profiles/top_members',
    async () => {
      const response = await api.get('/profiles/top_members/');
      return response.data;
    }
  );
};

/**
 * Get user profile by ID
 * @param {number} id - User ID
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (id) => {
  return apiCache.fetch(
    `profiles/${id}`,
    async () => {
      const response = await api.get(`/profiles/${id}/`);
      return response.data;
    }
  );
};

/**
 * Update user profile (full update)
 * @param {number} id - User ID
 * @param {Object} profileData - Complete profile data
 * @returns {Promise<Object>} Updated profile
 */
export const updateUserProfile = async (id, profileData) => {
  const response = await api.put(`/profiles/${id}/`, profileData);
  
  // Invalidate profile cache
  apiCache.invalidate(`profiles/${id}`);
  
  return response.data;
};

/**
 * Update user profile (partial update)
 * Used for settings page - updates firstName, lastName, bio
 * @param {number} userId - User ID
 * @param {Object} profileData - Partial profile data
 * @returns {Promise<Object>} Updated profile
 */
export const updateProfile = async (userId, profileData) => {
  const response = await api.patch(`/profiles/${userId}/update_profile/`, profileData);
  
  // Invalidate profile cache
  apiCache.invalidate(`profiles/${userId}`);
  
  return response.data;
};

/**
 * Upload user profile image
 * @param {number} userId - User ID
 * @param {File} imageFile - Image file to upload
 * @returns {Promise<Object>} Updated profile with new image URL
 */
export const uploadUserImage = async (userId, imageFile) => {
  const formData = new FormData();
  formData.append('user_image', imageFile);
  
  const response = await api.post(`/profiles/${userId}/upload_image/`, formData);
  
  // Invalidate profile cache
  apiCache.invalidate(`profiles/${userId}`);
  
  return response.data;
};

/**
 * Change user password
 * @param {number} userId - User ID
 * @param {Object} passwordData - { currentPassword, newPassword, confirmPassword }
 * @returns {Promise<Object>} Success confirmation
 */
export const changePassword = async (userId, passwordData) => {
  const response = await api.post(`/profiles/${userId}/change_password/`, passwordData);
  return response.data;
};

/**
 * Get user's replies
 * @param {number} profileId - Profile ID
 * @returns {Promise<Array>} List of replies
 */
export const getUserReplies = async (profileId) => {
  return apiCache.fetch(
    `profiles/${profileId}/replies`,
    async () => {
      const response = await api.get(`/profiles/${profileId}/replies/`);
      return response.data;
    }
  );
};

/**
 * Get user's topics
 * @param {number} profileId - Profile ID
 * @returns {Promise<Array>} List of topics
 */
export const getUserTopics = async (profileId) => {
  return apiCache.fetch(
    `profiles/${profileId}/topics`,
    async () => {
      const response = await api.get(`/profiles/${profileId}/topics/`);
      return response.data;
    }
  );
};

/**
 * Get user's bookmarked topics
 * @param {number} profileId - Profile ID
 * @returns {Promise<Array>} List of bookmarked topics
 */
export const getUserBookmarks = async (profileId) => {
  return apiCache.fetch(
    `profiles/${profileId}/bookmarks`,
    async () => {
      const response = await api.get(`/profiles/${profileId}/bookmarks/`);
      return response.data;
    }
  );
};

// ============================================================================
// FOLLOW/FOLLOWING APIs
// ============================================================================

/**
 * Toggle follow/unfollow for a user
 * @param {number} userId - User ID to follow/unfollow
 * @returns {Promise<Object>} Updated follow status
 */
export const toggleFollow = async (userId) => {
  const response = await api.post(`/profiles/${userId}/follow/`);
  
  // Invalidate follow-related caches
  apiCache.invalidate('followers');
  apiCache.invalidate('following');
  
  return response.data;
};

/**
 * Get user's followers
 * @param {number} userId - User ID
 * @param {Object} params - Pagination params
 * @returns {Promise<Object>} Paginated followers list
 */
export const getFollowers = async (userId, params = {}) => {
  return apiCache.fetch(
    `profiles/${userId}/followers`,
    async () => {
      const response = await api.get(`/profiles/${userId}/followers/`, { params });
      return response.data;
    },
    params
  );
};

/**
 * Get users that a user is following
 * @param {number} userId - User ID
 * @param {Object} params - Pagination params
 * @returns {Promise<Object>} Paginated following list
 */
export const getFollowing = async (userId, params = {}) => {
  return apiCache.fetch(
    `profiles/${userId}/following`,
    async () => {
      const response = await api.get(`/profiles/${userId}/following/`, { params });
      return response.data;
    },
    params
  );
};

/**
 * Get topics that a user is following
 * @param {number} userId - User ID
 * @param {Object} params - Pagination params
 * @returns {Promise<Object>} Paginated following topics list
 */
export const getFollowingTopics = async (userId, params = {}) => {
  return apiCache.fetch(
    `profiles/${userId}/following_topics`,
    async () => {
      const response = await api.get(`/profiles/${userId}/following_topics/`, { params });
      return response.data;
    },
    params
  );
};

// ============================================================================
// REPORTING APIs
// ============================================================================

/**
 * Get all available report reasons
 * @returns {Promise<Array>} List of report reasons
 */
export const getReportReasons = async () => {
  return apiCache.fetch(
    'report-reasons',
    async () => {
      const response = await api.get('/report-reasons/');
      return response.data;
    }
  );
};

/**
 * Create a new report for content (topic or reply)
 * @param {Object} reportData - { content_type, object_id, reason, description }
 * @returns {Promise<Object>} Created report
 */
export const createReport = async (reportData) => {
  const response = await api.post('/reports/', reportData);
  return response.data;
};

// ============================================================================
// POLLS APIs
// ============================================================================

/**
 * Vote on a poll option
 * @param {number} pollId - Poll ID
 * @param {number} optionId - Poll option ID
 * @returns {Promise<Object>} Updated poll results
 */
export const votePoll = async (pollId, optionId) => {
  const response = await api.post(`/polls/${pollId}/vote/`, { option_id: optionId });
  
  // Invalidate topic cache that contains this poll
  apiCache.invalidate('topics');
  
  return response.data;
};

// ============================================================================
// TAGS APIs
// ============================================================================

/**
 * Get popular tags across all topics
 * @returns {Promise<Array>} List of popular tags with usage count
 */
export const getPopularTags = async () => {
  return apiCache.fetch(
    'tags/popular',
    async () => {
      const response = await api.get('/tags/popular/');
      return response.data;
    }
  );
};

// ============================================================================
// GAMIFICATION APIs
// ============================================================================

/**
 * Get user's gamification data (level, badges, streak, points)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Gamification data
 */
export const getUserGamification = async (userId) => {
  return apiCache.fetch(
    `gamification/user/${userId}`,
    async () => {
      const response = await api.get(`/gamification/user/${userId}/`);
      return response.data;
    }
  );
};

/**
 * Get current user's level data
 * @returns {Promise<Object>} Level data with XP and progress
 */
export const getMyLevel = async () => {
  const response = await api.get('/gamification/user-levels/my_level/');
  return response.data;
};

/**
 * Get leaderboard of top users by points
 * @returns {Promise<Array>} Leaderboard data
 */
export const getLeaderboard = async () => {
  return apiCache.fetch(
    'gamification/leaderboard',
    async () => {
      const response = await api.get('/gamification/user-levels/leaderboard/');
      return response.data;
    }
  );
};

/**
 * Get all available badges
 * @returns {Promise<Array>} List of all badges
 */
export const getAllBadges = async () => {
  return apiCache.fetch(
    'gamification/badges',
    async () => {
      const response = await api.get('/gamification/badges/');
      return response.data;
    }
  );
};

/**
 * Get badges grouped by category
 * @returns {Promise<Object>} Badges organized by category
 */
export const getBadgesByCategory = async () => {
  return apiCache.fetch(
    'gamification/badges/categories',
    async () => {
      const response = await api.get('/gamification/badges/categories/');
      return response.data;
    }
  );
};

/**
 * Get current user's earned badges
 * @returns {Promise<Array>} User's badges
 */
export const getMyBadges = async () => {
  const response = await api.get('/gamification/user-badges/my_badges/');
  return response.data;
};

/**
 * Get badges earned by a specific user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} User's badges
 */
export const getUserBadges = async (userId) => {
  return apiCache.fetch(
    `gamification/user-badges/${userId}`,
    async () => {
      const response = await api.get(`/gamification/user-badges/user_badges/?user_id=${userId}`);
      return response.data;
    }
  );
};

/**
 * Get current user's activity streak
 * @returns {Promise<Object>} Streak data
 */
export const getMyStreak = async () => {
  const response = await api.get('/gamification/streaks/my_streak/');
  return response.data;
};

/**
 * Update user's activity streak (called on daily login)
 * @returns {Promise<Object>} Updated streak data
 */
export const updateStreak = async () => {
  const response = await api.post('/gamification/streaks/update_streak/');
  
  // Invalidate gamification cache
  apiCache.invalidate('gamification');
  
  return response.data;
};

export default api;
