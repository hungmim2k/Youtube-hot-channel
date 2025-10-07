import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';

// YouTube API has a daily quota limit (typically 10,000 units)
const DAILY_QUOTA_LIMIT = 10000;

// Different operations cost different amounts of quota
const QUOTA_COSTS = {
  search: 100,  // Search operations cost 100 units
  list: 1,      // List operations cost 1 unit per resource
  default: 1    // Default cost for unknown operations
};

interface QuotaInfo {
  used: number;
  remaining: number;
  percentage: number;
}

interface ApiKeyContextType {
  apiKeys: string[];
  activeKey: string | null;
  setApiKeys: (keys: string[]) => void;
  getNextKey: () => string | null;
  validateKeys: (keys: string[]) => Promise<{ key: string, status: 'valid' | 'invalid' }[]>;
  markKeyExhausted?: (key: string) => void;
  incrementQuotaUsage: (key: string, operation: string, count?: number) => void;
  getQuotaInfo: (key: string) => QuotaInfo;
  activeKeyQuotaInfo: QuotaInfo;
  resetQuotaUsage: (key?: string) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKeys, setApiKeysState] = useState<string[]>([]);
  const [activeKeyIndex, setActiveKeyIndex] = useState(0);
  const [exhaustedKeys, setExhaustedKeys] = useState<Record<string, boolean>>({});
  const [quotaUsage, setQuotaUsage] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const storedKeys = localStorage.getItem('yt-api-keys');
      if (storedKeys) {
        setApiKeysState(JSON.parse(storedKeys));
      }
    } catch (error) {
      console.error("Failed to parse API keys from localStorage", error);
    }
  }, []);

  const setApiKeys = (keys: string[]) => {
    setApiKeysState(keys);
    setActiveKeyIndex(0);
    localStorage.setItem('yt-api-keys', JSON.stringify(keys));
  };

  const markKeyExhausted = useCallback((key: string) => {
    setExhaustedKeys(prev => {
      const next = { ...prev, [key]: true };
      localStorage.setItem('yt-exhausted-keys', JSON.stringify(next));
      return next;
    });
  }, []);

  // Rotate to the next available non-exhausted key. Returns null if none available.
  const getNextKey = useCallback(() => {
    if (apiKeys.length === 0) return null;
    // try to find a non-exhausted key, starting after the current index
    for (let offset = 1; offset <= apiKeys.length; offset++) {
      const idx = (activeKeyIndex + offset) % apiKeys.length;
      const candidate = apiKeys[idx];
      if (!exhaustedKeys[candidate]) {
        setActiveKeyIndex(idx);
        return candidate;
      }
    }
    // If all keys exhausted, return the current active key (may still be exhausted)
    return apiKeys[activeKeyIndex] || null;
  }, [apiKeys, activeKeyIndex, exhaustedKeys]);

  const activeKey = apiKeys.length > 0 ? apiKeys[activeKeyIndex] : null;

  const validateKeys = async (keys: string[]) => {
    // A real implementation makes a cheap API call (e.g., i18nLanguages) for each key.
    // This costs 1 quota point per key validation.
    const validationPromises = keys.map(async (key) => {
        try {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/i18nLanguages?part=snippet&key=${key}`);
            if (response.ok) {
                return { key, status: 'valid' as const };
            }
            return { key, status: 'invalid' as const };
        } catch (error) {
            return { key, status: 'invalid' as const };
        }
    });

    return Promise.all(validationPromises);
  };

  useEffect(() => {
    try {
      const storedExhausted = localStorage.getItem('yt-exhausted-keys');
      if (storedExhausted) setExhaustedKeys(JSON.parse(storedExhausted));

      const storedQuota = localStorage.getItem('yt-quota-usage');
      if (storedQuota) setQuotaUsage(JSON.parse(storedQuota));
    } catch (e) {
      // ignore
    }
  }, []);

  // Increment quota usage for a specific key
  const incrementQuotaUsage = useCallback((key: string, operation: string, count: number = 1) => {
    if (!key) return;

    const cost = QUOTA_COSTS[operation as keyof typeof QUOTA_COSTS] || QUOTA_COSTS.default;
    const totalCost = cost * count;

    setQuotaUsage(prev => {
      const currentUsage = prev[key] || 0;
      const newUsage = currentUsage + totalCost;

      // If quota is exhausted, mark the key as exhausted
      if (newUsage >= DAILY_QUOTA_LIMIT) {
        markKeyExhausted(key);
      }

      const updated = { ...prev, [key]: newUsage };
      localStorage.setItem('yt-quota-usage', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get quota information for a specific key
  const getQuotaInfo = useCallback((key: string): QuotaInfo => {
    if (!key) {
      return { used: 0, remaining: DAILY_QUOTA_LIMIT, percentage: 0 };
    }

    const used = quotaUsage[key] || 0;
    const remaining = Math.max(0, DAILY_QUOTA_LIMIT - used);
    const percentage = Math.min(100, Math.round((used / DAILY_QUOTA_LIMIT) * 100));

    return { used, remaining, percentage };
  }, [quotaUsage]);

  // Reset quota usage for a specific key or all keys
  const resetQuotaUsage = useCallback((key?: string) => {
    if (key) {
      setQuotaUsage(prev => {
        const updated = { ...prev, [key]: 0 };
        localStorage.setItem('yt-quota-usage', JSON.stringify(updated));
        return updated;
      });

      // Also remove from exhausted keys if it was marked as exhausted
      if (exhaustedKeys[key]) {
        setExhaustedKeys(prev => {
          const updated = { ...prev };
          delete updated[key];
          localStorage.setItem('yt-exhausted-keys', JSON.stringify(updated));
          return updated;
        });
      }
    } else {
      // Reset all keys
      setQuotaUsage({});
      localStorage.setItem('yt-quota-usage', JSON.stringify({}));
      setExhaustedKeys({});
      localStorage.setItem('yt-exhausted-keys', JSON.stringify({}));
    }
  }, [exhaustedKeys]);

  // Get quota information for the active key
  const activeKeyQuotaInfo = useMemo(() => {
    return getQuotaInfo(activeKey || '');
  }, [activeKey, getQuotaInfo]);

  return (
    <ApiKeyContext.Provider value={{ 
      apiKeys, 
      activeKey, 
      setApiKeys, 
      getNextKey, 
      validateKeys, 
      markKeyExhausted,
      incrementQuotaUsage,
      getQuotaInfo,
      activeKeyQuotaInfo,
      resetQuotaUsage
    }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKeys = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKeys must be used within an ApiKeyProvider');
  }
  return context;
};
