import React, { useEffect } from 'react';
import { useBanners } from '../context/BannersContext';
import '../styles/AdBanner.css';

function AdBanner({ location, size = 'medium', className = '' }) {
  const { getBannerForLocation, trackImpression, trackClick, loading } = useBanners();
  const banner = getBannerForLocation(location);

  useEffect(() => {
    // Track impression when banner is loaded and visible
    if (banner) {
      trackImpression(banner.id);
    }
  }, [banner, trackImpression]);

  const handleClick = () => {
    if (!banner) return;

    // Track click
    trackClick(banner.id);

    // Open link if provided
    if (banner.link_url) {
      window.open(banner.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  // If no location specified or no banner found, show nothing
  if (!location || (!loading && !banner)) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className={`ad-banner ad-banner-${size} ${className}`}>
        <div className="ad-banner-content ad-banner-loading">
          <span className="ad-label">Advertisement</span>
          <div className="ad-placeholder">
            <span className="ad-icon">⏳</span>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`ad-banner ad-banner-${banner.size} ${className}`}
      onClick={handleClick}
      style={{ cursor: banner.link_url ? 'pointer' : 'default' }}
    >
      <span className="ad-label">Advertisement</span>
      
      {banner.media_type === 'image' ? (
        <img 
          src={banner.media_url} 
          alt={banner.alt_text || 'Advertisement'} 
          className="ad-banner-image"
        />
      ) : banner.media_type === 'video' ? (
        <video 
          src={banner.media_url} 
          className="ad-banner-video"
          autoPlay 
          loop 
          muted 
          playsInline
        >
          Your browser does not support video.
        </video>
      ) : null}
    </div>
  );
}

export default AdBanner;

