import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

interface ApiKeyContextType {
  apiKeys: string[];
  activeKey: string | null;
  setApiKeys: (keys: string[]) => void;
  getNextKey: () => string | null;
  validateKeys: (keys: string[]) => Promise<{ key: string, status: 'valid' | 'invalid' }[]>;
  markKeyExhausted?: (key: string) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKeys, setApiKeysState] = useState<string[]>([]);
  const [activeKeyIndex, setActiveKeyIndex] = useState(0);
  const [exhaustedKeys, setExhaustedKeys] = useState<Record<string, boolean>>({});

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
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <ApiKeyContext.Provider value={{ apiKeys, activeKey, setApiKeys, getNextKey, validateKeys, markKeyExhausted }}>
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
