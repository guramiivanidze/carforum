import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // If sending FormData, let the browser set the Content-Type (with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refresh_token');
          
          // If no refresh token, just reject (user is not logged in)
          if (!refreshToken) {
            return Promise.reject(error);
          }
          
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed - clear tokens but don't redirect
        // Let the page handle whether login is required
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication APIs
export const login = async (username: string, password: string) => {
  // Backend expects 'email' field but accepts username or email as value
  const response = await api.post('/auth/login/', { email: username, password });
  return response.data;
};

export const register = async (
  username: string, 
  email: string, 
  password: string, 
  confirmPassword: string,
  firstName?: string,
  lastName?: string
) => {
  const response = await api.post('/auth/register/', { 
    username, 
    email, 
    password,
    confirmPassword,
    firstName,
    lastName
  });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout/');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me/');
  return response.data;
};

// Categories APIs
export const getCategories = async () => {
  const response = await api.get('/categories/');
  return response.data;
};

export const getCategoryTopics = async (
  categoryId: string | number,
  params?: { page?: number; page_size?: number; ordering?: string }
) => {
  const response = await api.get(`/categories/${categoryId}/topics/`, { params });
  return response.data;
};

// Topics APIs
export const getTopics = async (params?: { page?: number; page_size?: number }) => {
  const response = await api.get('/topics/', { params });
  return response.data;
};

export const getTopic = async (topicId: string | number) => {
  const response = await api.get(`/topics/${topicId}/`);
  return response.data;
};

export const createTopic = async (topicData: any) => {
  const response = await api.post('/topics/', topicData);
  return response.data;
};

export const updateTopic = async (topicId: string | number, topicData: any) => {
  const response = await api.put(`/topics/${topicId}/`, topicData);
  return response.data;
};

export const deleteTopic = async (topicId: string | number) => {
  const response = await api.delete(`/topics/${topicId}/`);
  return response.data;
};

export const getTopicParticipants = async (topicId: string | number) => {
  const response = await api.get(`/topics/${topicId}/participants/`);
  return response.data;
};

export const likeTopic = async (topicId: string | number) => {
  const response = await api.post(`/topics/${topicId}/like/`);
  return response.data;
};

// Replies APIs
export const getReplies = async (topicId: string | number) => {
  const response = await api.get(`/replies/?topic_id=${topicId}`);
  return response.data;
};

export const createReply = async (
  topicId: string | number, 
  content: string, 
  parentId?: number,
  images?: File[],
  captions?: string[]
) => {
  const formData = new FormData();
  formData.append('topic', topicId.toString());
  formData.append('content', content);
  
  if (parentId) {
    formData.append('parent', parentId.toString());
  }
  
  // Add images if provided
  if (images && images.length > 0) {
    images.forEach((image, index) => {
      formData.append('images', image);
      if (captions && captions[index]) {
        formData.append(`caption_${index}`, captions[index]);
      }
    });
  }
  
  const response = await api.post(`/replies/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const likeReply = async (replyId: string | number) => {
  const response = await api.post(`/replies/${replyId}/like/`);
  return response.data;
};

// User Profile APIs
export const getUserProfile = async (userId: string | number) => {
  const response = await api.get(`/profiles/${userId}/`);
  return response.data;
};

export const updateUserProfile = async (userId: string | number, profileData: any) => {
  const response = await api.put(`/profiles/${userId}/`, profileData);
  return response.data;
};

export const getUserTopics = async (userId: string | number) => {
  const response = await api.get(`/profiles/${userId}/topics/`);
  return response.data;
};

export const getUserReplies = async (userId: string | number) => {
  const response = await api.get(`/profiles/${userId}/replies/`);
  return response.data;
};

export const followUser = async (userId: string | number) => {
  const response = await api.post(`/profiles/${userId}/follow/`);
  return response.data;
};

export const getUserFollowers = async (userId: string | number, params?: { page?: number }) => {
  const response = await api.get(`/profiles/${userId}/followers/`, { params });
  return response.data;
};

export const getUserFollowing = async (userId: string | number, params?: { page?: number }) => {
  const response = await api.get(`/profiles/${userId}/following/`, { params });
  return response.data;
};

export const getUserFollowingTopics = async (userId: string | number, params?: { page?: number }) => {
  const response = await api.get(`/profiles/${userId}/following_topics/`, { params });
  return response.data;
};

export const getUserBookmarks = async (userId: string | number, params?: { page?: number }) => {
  const response = await api.get(`/profiles/${userId}/bookmarks/`, { params });
  return response.data;
};

export const getTopMembers = async () => {
  const response = await api.get('/profiles/top_members/');
  return response.data;
};

// Search APIs
export const searchAll = async (query: string) => {
  const response = await api.get('/search/', { params: { q: query } });
  return response.data;
};

// Tags APIs
export const getPopularTags = async () => {
  const response = await api.get('/tags/popular/');
  return response.data;
};

// Bookmarks APIs
export const getBookmarks = async () => {
  const response = await api.get('/bookmarks/');
  return response.data;
};

export const addBookmark = async (topicId: string | number) => {
  const response = await api.post(`/topics/${topicId}/bookmark/`);
  return response.data;
};

export const removeBookmark = async (topicId: string | number) => {
  const response = await api.delete(`/topics/${topicId}/bookmark/`);
  return response.data;
};

// Advertisements APIs
export const getBanners = async () => {
  const response = await api.get('/advertisements/banners/', {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  });
  return response.data;
};

export const trackBannerImpression = async (bannerId: string | number) => {
  const response = await api.post(`/advertisements/banners/${bannerId}/track_impression/`);
  return response.data;
};

export const trackBannerClick = async (bannerId: string | number) => {
  const response = await api.post(`/advertisements/banners/${bannerId}/track_click/`);
  return response.data;
};

// Gamification APIs
export const getUserGamification = async (userId: string | number) => {
  const response = await api.get(`/gamification/user/${userId}/`);
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await api.get('/gamification/leaderboard/');
  return response.data;
};

// Report APIs
export const getReportReasons = async () => {
  const response = await api.get('/report-reasons/');
  return response.data;
};

export const createReport = async (replyId: number, reasonId: number, additionalInfo?: string) => {
  const response = await api.post('/reports/', {
    reply: replyId,
    reason: reasonId,
    additional_info: additionalInfo || '',
  });
  return response.data;
};

export default api;
