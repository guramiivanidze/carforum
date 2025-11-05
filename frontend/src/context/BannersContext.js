import React, { createContext, useContext, useState, useEffect } from 'react';

const BannersContext = createContext();

export const useBanners = () => {
  const context = useContext(BannersContext);
  if (!context) {
    throw new Error('useBanners must be used within BannersProvider');
  }
  return context;
};

export const BannersProvider = ({ children }) => {
  const [banners, setBanners] = useState({});
  const [loading, setLoading] = useState(true);
  const [impressionTracked, setImpressionTracked] = useState(new Set());

  useEffect(() => {
    // Fetch all active banners once
    const fetchAllBanners = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/advertisements/banners/');
        const data = await response.json();
        
        // Handle paginated response (data.results) or plain array
        const bannersArray = data.results || data;
        
        // Organize banners by location
        const bannersByLocation = {};
        bannersArray.forEach(banner => {
          if (banner.locations && Array.isArray(banner.locations)) {
            banner.locations.forEach(location => {
              bannersByLocation[location] = banner;
            });
          }
        });
        
        console.log('Banners loaded:', bannersByLocation); // Debug log
        setBanners(bannersByLocation);
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBanners();
  }, []);

  const trackImpression = async (bannerId) => {
    // Only track once per banner per session
    if (impressionTracked.has(bannerId)) return;
    
    try {
      await fetch(
        `http://localhost:8000/api/advertisements/banners/${bannerId}/track_impression/`,
        { method: 'POST' }
      );
      setImpressionTracked(prev => new Set([...prev, bannerId]));
    } catch (error) {
      console.error('Failed to track impression:', error);
    }
  };

  const trackClick = async (bannerId) => {
    try {
      await fetch(
        `http://localhost:8000/api/advertisements/banners/${bannerId}/track_click/`,
        { method: 'POST' }
      );
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  const getBannerForLocation = (location) => {
    return banners[location] || null;
  };

  return (
    <BannersContext.Provider
      value={{
        banners,
        loading,
        getBannerForLocation,
        trackImpression,
        trackClick,
      }}
    >
      {children}
    </BannersContext.Provider>
  );
};
