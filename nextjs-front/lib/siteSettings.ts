/**
 * Site Settings Service
 * 
 * Fetches site-wide settings from the backend admin panel.
 * These settings are managed by administrators and include:
 * - SEO metadata (title, description, keywords)
 * - Social media links
 * - Site configuration (maintenance mode, registration)
 * - Content settings (pagination, features)
 */

import { getApiUrl, getSiteUrl } from './config';

const API_URL = getApiUrl();

export interface SiteSettings {
  // SEO
  site_title: string;
  site_description: string;
  site_keywords: string;
  keywords_list: string[];
  
  // Social Media & OG
  og_image_url: string | null;
  twitter_handle: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  
  // Site URLs
  site_url: string;
  
  // Announcement
  show_announcement: boolean;
  announcement_text: string;
  announcement_type: 'info' | 'warning' | 'success' | 'error';
  announcement_link: string;
  announcement_link_text: string;
  
  // Pagination
  topics_per_page: number;
  replies_per_page: number;
  
  // Content Features
  allow_topic_images: boolean;
  allow_polls: boolean;
  max_images_per_topic: number;
  max_poll_options: number;
  
  // Registration
  registration_enabled: boolean;
  registration_message: string;
}

// Default fallback settings
const defaultSettings: SiteSettings = {
  site_title: 'CarForum - The Ultimate Car Enthusiast Community',
  site_description: 'Join thousands of car enthusiasts on CarForum to discuss automotive topics, share experiences, get expert advice, and connect with fellow car lovers worldwide.',
  site_keywords: 'car forum, automotive community, car enthusiasts, car discussion',
  keywords_list: [
    'car forum',
    'automotive community',
    'car enthusiasts',
    'car discussion',
    'auto forum',
    'car advice',
    'vehicle maintenance',
    'car reviews',
    'automotive help',
    'car community',
  ],
  og_image_url: null,
  twitter_handle: 'carforum',
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  site_url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  show_announcement: false,
  announcement_text: '',
  announcement_type: 'info',
  announcement_link: '',
  announcement_link_text: '',
  topics_per_page: 20,
  replies_per_page: 10,
  allow_topic_images: true,
  allow_polls: true,
  max_images_per_topic: 5,
  max_poll_options: 10,
  registration_enabled: true,
  registration_message: '',
};

/**
 * Fetch site settings from the backend
 * Caches the result to avoid repeated API calls
 */
let cachedSettings: SiteSettings | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getSiteSettings(): Promise<SiteSettings> {
  // In development, always fetch fresh data (no cache)
  const isDev = process.env.NODE_ENV === 'development';
  
  // Return cached settings only in production and if still valid
  if (!isDev) {
    const now = Date.now();
    if (cachedSettings && (now - lastFetchTime) < CACHE_DURATION) {
      console.log('🔄 Using cached settings');
      return cachedSettings;
    }
  }

  try {
    const fullUrl = `${API_URL}/site-settings/`;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 Fetching site settings...');
    console.log('📍 API URL:', fullUrl);
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const response = await fetch(fullUrl, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ Failed to fetch site settings:', response.status, response.statusText);
      console.log('⚠️  Using default settings');
      return defaultSettings;
    }

    const settings: SiteSettings = await response.json();
    console.log('✅ Successfully fetched site settings!');
    console.log('📝 Site Title:', settings.site_title);
    console.log('📝 Description:', settings.site_description.substring(0, 50) + '...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Cache the settings
    cachedSettings = settings;
    lastFetchTime = Date.now();
    
    return settings;
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR fetching site settings:');
    console.error(error);
    console.error('⚠️  Using default settings');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return defaultSettings;
  }
}

/**
 * Clear the settings cache
 * Useful when settings are updated and need to be refetched
 */
export function clearSettingsCache(): void {
  cachedSettings = null;
  lastFetchTime = 0;
}

/**
 * Get site settings synchronously (uses cached value or defaults)
 * Use this when you need settings immediately and can't wait for async
 */
export function getCachedSettings(): SiteSettings {
  return cachedSettings || defaultSettings;
}
