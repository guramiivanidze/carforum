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
  
  // Load tracked impressions from sessionStorage on mount
  const [impressionTracked, setImpressionTracked] = useState(() => {
    try {
      const stored = sessionStorage.getItem('bannerImpressionsTracked');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    // Fetch all active banners once
    const fetchAllBanners = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/advertisements/banners/`;
      
        
        const response = await fetch(apiUrl, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
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
        
 
        setBanners(bannersByLocation);
      } catch (error) {
        console.error('Error fetching banners:', error);
        console.error('Error details:', error.message);
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
        `${process.env.REACT_APP_API_URL}/advertisements/banners/${bannerId}/track_impression/`,
        { method: 'POST' }
      );
      
      // Update state and persist to sessionStorage
      const newTracked = new Set([...impressionTracked, bannerId]);
      setImpressionTracked(newTracked);
      
      // Save to sessionStorage
      try {
        sessionStorage.setItem('bannerImpressionsTracked', JSON.stringify([...newTracked]));
      } catch (error) {
        console.warn('Failed to save impression tracking to sessionStorage:', error);
      }
    } catch (error) {
      console.error('Failed to track impression:', error);
    }
  };

  const trackClick = async (bannerId) => {
    try {
      await fetch(
        `${process.env.REACT_APP_API_URL}/advertisements/banners/${bannerId}/track_click/`,
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
