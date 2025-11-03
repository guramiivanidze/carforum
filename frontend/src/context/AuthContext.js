import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, logout as apiLogout } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount and refresh from server
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');

      if (token) {
        try {
          // Fetch fresh data from server
          const response = await getCurrentUser();
          setUser(response.user);
          setProfile(response.profile);
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('profile', JSON.stringify(response.profile));
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fall back to stored data if server request fails
          const storedUser = localStorage.getItem('user');
          const storedProfile = localStorage.getItem('profile');
          if (storedUser && storedProfile) {
            try {
              setUser(JSON.parse(storedUser));
              setProfile(JSON.parse(storedProfile));
            } catch (parseError) {
              console.error('Error parsing stored user data:', parseError);
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              localStorage.removeItem('profile');
            }
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData, profileData, tokens) => {
    setUser(userData);
    setProfile(profileData);
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('profile', JSON.stringify(profileData));
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
    }
  };

  const updateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('profile', JSON.stringify(updatedProfile));
  };

  const refreshProfile = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.user);
      setProfile(response.profile);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('profile', JSON.stringify(response.profile));
      return response.profile;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
