/**
 * Authentication Context
 * 
 * Manages user authentication state throughout the application.
 * Handles login, logout, and profile updates.
 * 
 * Features:
 * - Automatic auth check on app mount
 * - Persistent session via localStorage
 * - Token management (access & refresh tokens)
 * - Profile update and refresh functionality
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, logout as apiLogout } from '../services/api';

const AuthContext = createContext();

/**
 * Custom hook to access Auth Context
 * Throws error if used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Auth Provider Component
 * 
 * Wraps the app to provide authentication state and methods.
 */
export const AuthProvider = ({ children }) => {
  // State for user data and profile
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Check authentication status on mount
   * Attempts to fetch fresh data from server, falls back to localStorage
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');

      if (token) {
        try {
          // Fetch fresh user data from server
          const response = await getCurrentUser();
          setUser(response.user);
          setProfile(response.profile);
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('profile', JSON.stringify(response.profile));
          
          console.log('✅ Auth: User authenticated', response.user.username);
        } catch (error) {
          console.error('❌ Auth: Error fetching user data', error);
          
          // Fall back to stored data if server request fails
          const storedUser = localStorage.getItem('user');
          const storedProfile = localStorage.getItem('profile');
          
          if (storedUser && storedProfile) {
            try {
              setUser(JSON.parse(storedUser));
              setProfile(JSON.parse(storedProfile));
              console.log('⚠️ Auth: Using cached user data');
            } catch (parseError) {
              console.error('❌ Auth: Error parsing stored data', parseError);
              // Clear corrupted data
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

  /**
   * Login user and store auth data
   * @param {Object} userData - User data from server
   * @param {Object} profileData - Profile data from server
   * @param {Object} tokens - { access, refresh } tokens
   */
  const login = (userData, profileData, tokens) => {
    setUser(userData);
    setProfile(profileData);
    
    // Store tokens and data in localStorage
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('profile', JSON.stringify(profileData));
    
    console.log('✅ Auth: User logged in', userData.username);
  };

  /**
   * Logout user and clear all auth data
   */
  const logout = async () => {
    try {
      // Call logout API to invalidate tokens on server
      await apiLogout();
    } catch (error) {
      console.error('⚠️ Auth: Logout API error', error);
    } finally {
      // Clear state and localStorage regardless of API success
      setUser(null);
      setProfile(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      
      console.log('✅ Auth: User logged out');
    }
  };

  /**
   * Update profile data in state and localStorage
   * Used after profile edits
   * @param {Object} updatedProfile - Updated profile data
   */
  const updateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('profile', JSON.stringify(updatedProfile));
    console.log('✅ Auth: Profile updated');
  };

  /**
   * Fetch fresh profile data from server
   * Used to sync after external profile changes
   * @returns {Promise<Object>} Fresh profile data
   */
  const refreshProfile = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.user);
      setProfile(response.profile);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('profile', JSON.stringify(response.profile));
      
      console.log('✅ Auth: Profile refreshed from server');
      return response.profile;
    } catch (error) {
      console.error('❌ Auth: Error refreshing profile', error);
      throw error;
    }
  };

  // Context value provided to consumers
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
