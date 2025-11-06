/**
 * API Configuration
 * 
 * Centralized API URL configuration to ensure consistency
 * across the entire application.
 */

/**
 * Get the backend API URL
 * Works in both server and client environments
 */
export function getApiUrl(): string {
  // In server-side (Node.js) environment
  if (typeof window === 'undefined') {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
      throw new Error(
        'NEXT_PUBLIC_API_URL is not defined in environment variables. ' +
        'Please set it in .env.local (development) or Render dashboard (production)'
      );
    }

    // Ensure the URL has a protocol
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      // In production, always use https
      const protocol = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
      return `${protocol}${apiUrl}`;
    }

    return apiUrl;
  }
  
  // In client-side (browser) environment
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    // Fallback for development
    if (process.env.NODE_ENV === 'development') {
      console.warn('NEXT_PUBLIC_API_URL not set, using default: http://localhost:8000/api');
      return 'http://localhost:8000/api';
    }
    
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
  }

  // Ensure the URL has a protocol
  if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
    const protocol = window.location.protocol;
    return `${protocol}//${apiUrl}`;
  }

  return apiUrl;
}

/**
 * Get the site URL (frontend URL)
 * Works in both server and client environments
 */
export function getSiteUrl(): string {
  // In server-side environment
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }
  
  // In client-side environment
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
}

/**
 * Build a full API endpoint URL
 */
export function buildApiUrl(path: string): string {
  const baseUrl = getApiUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

// Export a constant for direct use
export const API_URL = getApiUrl();
export const SITE_URL = getSiteUrl();
