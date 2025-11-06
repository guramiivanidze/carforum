'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteSettings, getCachedSettings } from '@/lib/siteSettings';

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/forum/site-settings/`, {
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
