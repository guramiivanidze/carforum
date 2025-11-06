'use client';

import { useBanners } from '@/contexts/BannersContext';
import { useEffect, useState } from 'react';
import { AdBanner as AdBannerType } from '@/types';

interface AdBannerProps {
  location: string;
}

export default function AdBanner({ location }: AdBannerProps) {
  const { getBannersByLocation, trackImpression, trackClick } = useBanners();
  const [banner, setBanner] = useState<AdBannerType | null>(null);

  useEffect(() => {
    const banners = getBannersByLocation(location);
    if (banners.length > 0) {
      // Random banner from location
      const randomBanner = banners[Math.floor(Math.random() * banners.length)];
      setBanner(randomBanner);
      
      // Track impression
      trackImpression(randomBanner.id);
    }
  }, [location, getBannersByLocation, trackImpression]);

  if (!banner) return null;

  const handleClick = () => {
    trackClick(banner.id);
  };

  return (
    <div className="relative overflow-hidden rounded-lg shadow-md">
      <a
        href={banner.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block"
      >
        {banner.video ? (
          <video
            src={banner.video}
            autoPlay
            loop
            muted
            className="w-full h-auto"
          />
        ) : banner.image ? (
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full h-auto"
          />
        ) : (
          <div className="bg-gray-200 p-4 text-center">
            <p className="text-gray-600">{banner.title}</p>
          </div>
        )}
      </a>
      <div className="absolute top-2 right-2">
        <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Ad
        </span>
      </div>
    </div>
  );
}
