import React, { createContext, useState, useContext, useEffect } from 'react';

// Default optimization values
const DEFAULT_OPTIMIZATION_SETTINGS = {
  // HotChannelsFinder settings
  searchDepth: 3,
  channelSearchDepth: 1,
  relatedSearchDepth: 1,
  cacheDurationHours: 24,
  
  // Trending settings
  trendingMaxPages: 3,
};

// Type for the optimization settings
interface OptimizationSettings {
  searchDepth: number;
  channelSearchDepth: number;
  relatedSearchDepth: number;
  cacheDurationHours: number;
  trendingMaxPages: number;
}

// Type for the context
interface OptimizationContextType {
  settings: OptimizationSettings;
  updateSetting: <K extends keyof OptimizationSettings>(key: K, value: OptimizationSettings[K]) => void;
  resetToDefaults: () => void;
}

// Create the context
const OptimizationContext = createContext<OptimizationContextType | undefined>(undefined);

// Storage key for persisting settings
const STORAGE_KEY = 'yt-optimization-settings';

export const OptimizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<OptimizationSettings>(DEFAULT_OPTIMIZATION_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Merge with defaults to ensure all properties exist
        setSettings({ ...DEFAULT_OPTIMIZATION_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error("Failed to load optimization settings from localStorage", error);
    }
  }, []);

  // Update a single setting
  const updateSetting = <K extends keyof OptimizationSettings>(key: K, value: OptimizationSettings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Reset all settings to defaults
  const resetToDefaults = () => {
    setSettings(DEFAULT_OPTIMIZATION_SETTINGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_OPTIMIZATION_SETTINGS));
  };

  return (
    <OptimizationContext.Provider value={{ settings, updateSetting, resetToDefaults }}>
      {children}
    </OptimizationContext.Provider>
  );
};

// Hook for using the optimization context
export const useOptimization = () => {
  const context = useContext(OptimizationContext);
  if (context === undefined) {
    throw new Error('useOptimization must be used within an OptimizationProvider');
  }
  return context;
};