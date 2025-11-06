'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getBanners, trackBannerImpression as apiTrackImpression, trackBannerClick as apiTrackClick } from '@/lib/api';
import { AdBanner } from '@/types';

interface BannersContextType {
  banners: AdBanner[];
  loading: boolean;
  getBannersByLocation: (location: string) => AdBanner[];
  trackImpression: (bannerId: number) => Promise<void>;
  trackClick: (bannerId: number) => Promise<void>;
}

const BannersContext = createContext<BannersContextType | undefined>(undefined);

export const BannersProvider = ({ children }: { children: React.ReactNode }) => {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getBanners();
        // Handle paginated response or direct array
        const bannersData = data.results || data;
        setBanners(Array.isArray(bannersData) ? bannersData : []);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const getBannersByLocation = useCallback(
    (location: string) => {
      // Ensure banners is an array
      if (!Array.isArray(banners)) {
        return [];
      }
      
      return banners.filter(
        (banner) =>
          banner.is_active &&
          Array.isArray(banner.locations) &&
          banner.locations.includes(location) &&
          (!banner.start_date || new Date(banner.start_date) <= new Date()) &&
          (!banner.end_date || new Date(banner.end_date) >= new Date())
      );
    },
    [banners]
  );

  const trackImpression = async (bannerId: number) => {
    if (typeof window === 'undefined') return;

    const sessionKey = `banner_impression_${bannerId}`;
    const hasTracked = sessionStorage.getItem(sessionKey);

    if (!hasTracked) {
      try {
        await apiTrackImpression(bannerId);
        sessionStorage.setItem(sessionKey, 'true');
      } catch (error) {
        console.error('Failed to track impression:', error);
      }
    }
  };

  const trackClick = async (bannerId: number) => {
    try {
      await apiTrackClick(bannerId);
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  return (
    <BannersContext.Provider
      value={{
        banners,
        loading,
        getBannersByLocation,
        trackImpression,
        trackClick,
      }}
    >
      {children}
    </BannersContext.Provider>
  );
};

export const useBanners = () => {
  const context = useContext(BannersContext);
  if (context === undefined) {
    throw new Error('useBanners must be used within a BannersProvider');
  }
  return context;
};
