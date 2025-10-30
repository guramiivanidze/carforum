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
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      const storedProfile = localStorage.getItem('profile');

      if (token && storedUser && storedProfile) {
        try {
          setUser(JSON.parse(storedUser));
          setProfile(JSON.parse(storedProfile));
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          localStorage.removeItem('profile');
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

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
