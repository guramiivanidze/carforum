import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If sending FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
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

// Authentication APIs
export const register = async (userData) => {
  const response = await api.post('/auth/register/', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login/', credentials);
  return response.data;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  const response = await api.post('/auth/logout/', { refresh_token: refreshToken });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me/');
  return response.data;
};

// Forum APIs
export const getCategories = async () => {
  const response = await api.get('/categories/');
  return response.data;
};

export const getCategoryTopics = async (categoryId, params = {}) => {
  const response = await api.get(`/categories/${categoryId}/topics/`, { params });
  return response.data;
};

export const getTopics = async (params = {}) => {
  const response = await api.get('/topics/', { params });
  return response.data;
};

export const getTopic = async (id) => {
  const response = await api.get(`/topics/${id}/`);
  return response.data;
};

export const getRelatedTopics = async (id) => {
  const response = await api.get(`/topics/${id}/related/`);
  return response.data;
};

export const getTopMembers = async () => {
  const response = await api.get('/profiles/top_members/');
  return response.data;
};

export const getUserProfile = async (id) => {
  const response = await api.get(`/profiles/${id}/`);
  return response.data;
};

export const updateUserProfile = async (id, profileData) => {
  const response = await api.put(`/profiles/${id}/`, profileData);
  return response.data;
};

export const uploadUserImage = async (userId, imageFile) => {
  const formData = new FormData();
  formData.append('user_image', imageFile);
  
  const response = await api.post(`/profiles/${userId}/upload_image/`, formData);
  return response.data;
};

export const updateProfile = async (userId, profileData) => {
  const response = await api.patch(`/profiles/${userId}/update_profile/`, profileData);
  return response.data;
};

export const changePassword = async (userId, passwordData) => {
  const response = await api.post(`/profiles/${userId}/change_password/`, passwordData);
  return response.data;
};

export const getUserReplies = async (profileId) => {
  const response = await api.get(`/profiles/${profileId}/replies/`);
  return response.data;
};

export const createTopic = async (topicData) => {
  const response = await api.post('/topics/', topicData);
  return response.data;
};

export const updateTopic = async (topicId, topicData) => {
  const response = await api.put(`/topics/${topicId}/`, topicData);
  return response.data;
};

export const createReply = async (topicId, replyData) => {
  const response = await api.post(`/topics/${topicId}/replies/`, replyData);
  return response.data;
};

export const likeTopic = async (topicId) => {
  const response = await api.post(`/topics/${topicId}/like/`);
  return response.data;
};

export const likeReply = async (replyId) => {
  const response = await api.post(`/replies/${replyId}/like/`);
  return response.data;
};

export const deleteReply = async (replyId) => {
  const response = await api.delete(`/replies/${replyId}/`);
  return response.data;
};

export const getReportReasons = async () => {
  const response = await api.get('/report-reasons/');
  return response.data;
};

export const createReport = async (reportData) => {
  const response = await api.post('/reports/', reportData);
  return response.data;
};

export const bookmarkTopic = async (topicId) => {
  const response = await api.post(`/topics/${topicId}/bookmark/`);
  return response.data;
};

export const getUserBookmarks = async (profileId) => {
  const response = await api.get(`/profiles/${profileId}/bookmarks/`);
  return response.data;
};

export const getUserTopics = async (profileId) => {
  const response = await api.get(`/profiles/${profileId}/topics/`);
  return response.data;
};

export const searchAll = async (query, filters = {}) => {
  const params = new URLSearchParams({ q: query, ...filters });
  const response = await api.get(`/search/?${params.toString()}`);
  return response.data;
};

export const votePoll = async (pollId, optionId) => {
  const response = await api.post(`/polls/${pollId}/vote/`, { option_id: optionId });
  return response.data;
};

// Gamification API calls
export const getUserGamification = async (userId) => {
  const response = await api.get(`/gamification/user/${userId}/`);
  return response.data;
};

export const getMyLevel = async () => {
  const response = await api.get('/gamification/user-levels/my_level/');
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await api.get('/gamification/user-levels/leaderboard/');
  return response.data;
};

export const getAllBadges = async () => {
  const response = await api.get('/gamification/badges/');
  return response.data;
};

export const getBadgesByCategory = async () => {
  const response = await api.get('/gamification/badges/categories/');
  return response.data;
};

export const getMyBadges = async () => {
  const response = await api.get('/gamification/user-badges/my_badges/');
  return response.data;
};

export const getUserBadges = async (userId) => {
  const response = await api.get(`/gamification/user-badges/user_badges/?user_id=${userId}`);
  return response.data;
};

export const getMyStreak = async () => {
  const response = await api.get('/gamification/streaks/my_streak/');
  return response.data;
};

export const updateStreak = async () => {
  const response = await api.post('/gamification/streaks/update_streak/');
  return response.data;
};

// Tags API
export const getPopularTags = async () => {
  const response = await api.get('/tags/popular/');
  return response.data;
};

// Follow/Following APIs
export const toggleFollow = async (userId) => {
  const response = await api.post(`/profiles/${userId}/follow/`);
  return response.data;
};

export const getFollowers = async (userId, params = {}) => {
  const response = await api.get(`/profiles/${userId}/followers/`, { params });
  return response.data;
};

export const getFollowing = async (userId, params = {}) => {
  const response = await api.get(`/profiles/${userId}/following/`, { params });
  return response.data;
};

export const getFollowingTopics = async (userId, params = {}) => {
  const response = await api.get(`/profiles/${userId}/following_topics/`, { params });
  return response.data;
};

export default api;
