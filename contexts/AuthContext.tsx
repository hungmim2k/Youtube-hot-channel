import React, { createContext, useContext, useEffect, useState } from 'react';

type Role = 'admin' | 'user';

// Expiration type can be 'never' for no expiration or a date string
type Expiration = 'never' | string;

interface UserRecord {
  username: string;
  password: string;
  role: Role;
  expiration: Expiration;
  apiKeys?: string[];
  createdAt: string;
}

interface KeywordRecord {
  keyword: string;
  username: string;
  ip: string;
  timestamp: string;
}

interface AuthContextType {
  user: UserRecord | null;
  users: UserRecord[];
  keywords: KeywordRecord[];
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (username: string, password: string, expiration: Expiration, apiKeys?: string[]) => Promise<boolean>;
  updateUser: (username: string, updates: Partial<Omit<UserRecord, 'username' | 'role'>>) => Promise<boolean>;
  deleteUser: (username: string) => Promise<boolean>;
  trackKeyword: (keyword: string, ip: string) => void;
  getKeywords: (filters?: { username?: string; fromDate?: string; toDate?: string }) => KeywordRecord[];
  isUserExpired: (user: UserRecord) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN: UserRecord = { 
  username: 'admin', 
  password: '0968885430', 
  role: 'admin',
  expiration: 'never',
  createdAt: new Date().toISOString()
};
const USERS_KEY = 'yt_app_users_v1';
const CURRENT_KEY = 'yt_app_current_user_v1';
const KEYWORDS_KEY = 'yt_app_keywords_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [keywords, setKeywords] = useState<KeywordRecord[]>([]);

  // Load users and keywords from localStorage
  useEffect(() => {
    try {
      // Load users
      const rawUsers = localStorage.getItem(USERS_KEY);
      let loadedUsers: UserRecord[] = [];
      if (rawUsers) loadedUsers = JSON.parse(rawUsers);

      // Ensure admin account exists
      const hasAdmin = loadedUsers.some(u => u.username === DEFAULT_ADMIN.username);
      if (!hasAdmin) {
        loadedUsers.unshift(DEFAULT_ADMIN);
        localStorage.setItem(USERS_KEY, JSON.stringify(loadedUsers));
      }

      // Update users with missing fields if needed
      const updatedUsers = loadedUsers.map(u => ({
        ...u,
        expiration: u.expiration || 'never',
        createdAt: u.createdAt || new Date().toISOString(),
        apiKeys: u.apiKeys || []
      }));

      setUsers(updatedUsers);
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

      // Load current user
      const cur = localStorage.getItem(CURRENT_KEY);
      if (cur) setUser(JSON.parse(cur));

      // Load keywords
      const rawKeywords = localStorage.getItem(KEYWORDS_KEY);
      if (rawKeywords) setKeywords(JSON.parse(rawKeywords));
    } catch (e) {
      console.error("Error loading auth data:", e);
    }
  }, []);

  // Persist users to localStorage
  const persistUsers = (updatedUsers: UserRecord[]) => {
    try { 
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers)); 
      setUsers(updatedUsers);
    } catch (e) {
      console.error("Error persisting users:", e);
    }
  };

  // Persist keywords to localStorage
  const persistKeywords = (updatedKeywords: KeywordRecord[]) => {
    try { 
      localStorage.setItem(KEYWORDS_KEY, JSON.stringify(updatedKeywords)); 
      setKeywords(updatedKeywords);
    } catch (e) {
      console.error("Error persisting keywords:", e);
    }
  };

  // Check if a user's account has expired
  const isUserExpired = (user: UserRecord) => {
    if (user.expiration === 'never') return false;
    const expirationDate = new Date(user.expiration);
    return expirationDate < new Date();
  };

  const login = async (username: string, password: string) => {
    try {
      const found = users.find(u => u.username === username && u.password === password);
      if (found) {
        // Check if account has expired
        if (isUserExpired(found)) {
          return false;
        }

        setUser(found);
        localStorage.setItem(CURRENT_KEY, JSON.stringify(found));
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login error:", e);
      return false;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      // admin account cannot be registered or overwritten
      if (username === DEFAULT_ADMIN.username) return false;
      if (users.some(u => u.username === username)) return false;

      const newUser: UserRecord = { 
        username, 
        password, 
        role: 'user',
        expiration: 'never',
        apiKeys: [],
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...users, newUser];
      persistUsers(updatedUsers);
      setUser(newUser);
      localStorage.setItem(CURRENT_KEY, JSON.stringify(newUser));
      return true;
    } catch (e) {
      console.error("Register error:", e);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(CURRENT_KEY); } catch (e) {}
  };

  // Add a new user (admin only)
  const addUser = async (username: string, password: string, expiration: Expiration, apiKeys: string[] = []) => {
    try {
      if (users.some(u => u.username === username)) return false;

      const newUser: UserRecord = {
        username,
        password,
        role: 'user',
        expiration,
        apiKeys,
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...users, newUser];
      persistUsers(updatedUsers);
      return true;
    } catch (e) {
      console.error("Add user error:", e);
      return false;
    }
  };

  // Update an existing user (admin only)
  const updateUser = async (username: string, updates: Partial<Omit<UserRecord, 'username' | 'role'>>) => {
    try {
      // Cannot update admin account except by admin
      if (username === DEFAULT_ADMIN.username && (!user || user.role !== 'admin')) {
        return false;
      }

      const updatedUsers = users.map(u => {
        if (u.username === username) {
          return { ...u, ...updates };
        }
        return u;
      });

      persistUsers(updatedUsers);

      // If updating the current user, update the current user state and localStorage
      if (user && user.username === username) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem(CURRENT_KEY, JSON.stringify(updatedUser));
      }

      return true;
    } catch (e) {
      console.error("Update user error:", e);
      return false;
    }
  };

  // Delete a user (admin only)
  const deleteUser = async (username: string) => {
    try {
      // Cannot delete admin account
      if (username === DEFAULT_ADMIN.username) {
        return false;
      }

      // Cannot delete current user
      if (user && user.username === username) {
        return false;
      }

      const updatedUsers = users.filter(u => u.username !== username);
      persistUsers(updatedUsers);
      return true;
    } catch (e) {
      console.error("Delete user error:", e);
      return false;
    }
  };

  // Track a keyword search
  const trackKeyword = (keyword: string, ip: string) => {
    if (!user) return;

    const newKeyword: KeywordRecord = {
      keyword,
      username: user.username,
      ip,
      timestamp: new Date().toISOString()
    };

    const updatedKeywords = [...keywords, newKeyword];
    persistKeywords(updatedKeywords);
  };

  // Get keywords with optional filtering
  const getKeywords = (filters?: { username?: string; fromDate?: string; toDate?: string }) => {
    if (!filters) return keywords;

    return keywords.filter(k => {
      let match = true;

      if (filters.username && k.username !== filters.username) {
        match = false;
      }

      if (filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        const keywordDate = new Date(k.timestamp);
        if (keywordDate < fromDate) match = false;
      }

      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        const keywordDate = new Date(k.timestamp);
        if (keywordDate > toDate) match = false;
      }

      return match;
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users, 
      keywords, 
      login, 
      register, 
      logout, 
      addUser, 
      updateUser, 
      deleteUser, 
      trackKeyword, 
      getKeywords,
      isUserExpired
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export type { Role, UserRecord };
