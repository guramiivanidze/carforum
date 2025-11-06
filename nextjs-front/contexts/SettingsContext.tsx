'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteSettings, getCachedSettings } from '@/lib/siteSettings';
import { buildApiUrl } from '@/lib/config';

interface SettingsContextType {
  settings: SiteSettings;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children, initialSettings }: { children: React.ReactNode; initialSettings: SiteSettings }) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);

  const refreshSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(buildApiUrl('/forum/site-settings/'), {
        cache: 'no-store',
      });

      if (response.ok) {
        const newSettings = await response.json();
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error refreshing settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
