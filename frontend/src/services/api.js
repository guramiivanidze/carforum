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

export const getTopics = async () => {
  const response = await api.get('/topics/');
  return response.data;
};

export const getTopic = async (id) => {
  const response = await api.get(`/topics/${id}/`);
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

export const likeReply = async (replyId) => {
  const response = await api.post(`/replies/${replyId}/like/`);
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

export default api;
