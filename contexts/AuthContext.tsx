import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAllUsers, 
  getUserByUsername, 
  createUser as dbCreateUser, 
  updateUser as dbUpdateUser, 
  deleteUser as dbDeleteUser, 
  authenticateUser,
  isUserExpired as dbIsUserExpired
} from '../database/services/userServiceSupabase';
import {
  trackKeyword as dbTrackKeyword,
  getKeywordsWithFilters
} from '../database/services/keywordServiceSupabase';

// Import types from Supabase configuration
import { Role, Expiration, UserRecord as IUser, KeywordRecord as IKeyword } from '../database/supabase';

// Define simplified types for the context
interface UserRecord {
  id?: string;
  username: string;
  password: string;
  role: Role;
  expiration: Expiration;
  api_keys?: string[];
  created_at?: string;
}

interface KeywordRecord {
  id?: string;
  keyword: string;
  username: string;
  ip: string;
  timestamp?: string;
}

interface AuthContextType {
  user: UserRecord | null;
  users: UserRecord[];
  keywords: KeywordRecord[];
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (username: string, password: string, expiration: Expiration, api_keys?: string[]) => Promise<boolean>;
  updateUser: (username: string, updates: Partial<Omit<UserRecord, 'username' | 'role'>>) => Promise<boolean>;
  deleteUser: (username: string) => Promise<boolean>;
  trackKeyword: (keyword: string, ip: string) => Promise<void>;
  getKeywords: (filters?: { username?: string; fromDate?: string; toDate?: string }) => Promise<KeywordRecord[]>;
  isUserExpired: (user: UserRecord) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Current user session key
const CURRENT_KEY = 'yt_app_current_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [keywords, setKeywords] = useState<KeywordRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load users and current user from database
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Load all users from database
        const dbUsers = await getAllUsers();
        setUsers(dbUsers as UserRecord[]);

        // Load current user from session storage
        const cur = localStorage.getItem(CURRENT_KEY);
        if (cur) {
          const userData = JSON.parse(cur);
          const currentUser = await getUserByUsername(userData.username);
          if (currentUser) {
            setUser(currentUser as UserRecord);
          } else {
            // If user doesn't exist in DB anymore, clear local storage
            localStorage.removeItem(CURRENT_KEY);
          }
        }

        // Load initial keywords (empty for now, will be loaded when needed)
        setKeywords([]);
      } catch (e) {
        console.error("Error loading auth data:", e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Check if a user's account has expired
  const isUserExpired = (user: UserRecord) => {
    return dbIsUserExpired(user);
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const authResult = await authenticateUser(username, password);

      if (authResult) {
        // Check if account has expired
        if (authResult.expired) {
          return false;
        }

        setUser(authResult as UserRecord);
        localStorage.setItem(CURRENT_KEY, JSON.stringify(authResult));

        // Refresh users list
        const dbUsers = await getAllUsers();
        setUsers(dbUsers as UserRecord[]);

        return true;
      }
      return false;
    } catch (e) {
      console.error("Login error:", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      // Create user in database
      const newUser = await dbCreateUser({
        username,
        password,
        role: 'user',
        expiration: 'never',
        api_keys: []
      });

      if (newUser) {
        // Update local state
        setUser(newUser as UserRecord);
        localStorage.setItem(CURRENT_KEY, JSON.stringify(newUser));

        // Refresh users list
        const dbUsers = await getAllUsers();
        setUsers(dbUsers as UserRecord[]);

        return true;
      }
      return false;
    } catch (e) {
      console.error("Register error:", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(CURRENT_KEY); } catch (e) {}
  };

  // Add a new user (admin only)
  const addUser = async (username: string, password: string, expiration: Expiration, api_keys: string[] = []) => {
    try {
      setIsLoading(true);

      // Create user in database
      const newUser = await dbCreateUser({
        username,
        password,
        role: 'user',
        expiration,
        api_keys
      });

      if (newUser) {
        // Refresh users list
        const dbUsers = await getAllUsers();
        setUsers(dbUsers as UserRecord[]);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Add user error:", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing user (admin only)
  const updateUser = async (username: string, updates: Partial<Omit<UserRecord, 'username' | 'role'>>) => {
    try {
      setIsLoading(true);

      // Update user in database
      const updatedUser = await dbUpdateUser(username, updates);

      if (updatedUser) {
        // Refresh users list
        const dbUsers = await getAllUsers();
        setUsers(dbUsers as UserRecord[]);

        // If updating the current user, update the current user state and localStorage
        if (user && user.username === username) {
          setUser(updatedUser as UserRecord);
          localStorage.setItem(CURRENT_KEY, JSON.stringify(updatedUser));
        }

        return true;
      }
      return false;
    } catch (e) {
      console.error("Update user error:", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a user (admin only)
  const deleteUser = async (username: string) => {
    try {
      setIsLoading(true);

      // Cannot delete current user
      if (user && user.username === username) {
        return false;
      }

      // Delete user from database
      const result = await dbDeleteUser(username);

      if (result.success) {
        // Refresh users list
        const dbUsers = await getAllUsers();
        setUsers(dbUsers as UserRecord[]);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Delete user error:", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Track a keyword search
  const trackKeyword = async (keyword: string, ip: string) => {
    if (!user) return;

    try {
      // Track keyword in database
      await dbTrackKeyword({
        keyword,
        username: user.username,
        ip
      });

      // Refresh keywords list (optional, can be removed if performance is an issue)
      const updatedKeywords = await getKeywords();
      setKeywords(updatedKeywords);
    } catch (e) {
      console.error("Error tracking keyword:", e);
    }
  };

  // Get keywords with optional filtering
  const getKeywords = async (filters?: { username?: string; fromDate?: string; toDate?: string }) => {
    try {
      setIsLoading(true);

      // Build filter object for database query
      const dbFilters: any = {};

      if (filters) {
        if (filters.username) {
          dbFilters.username = filters.username;
        }

        if (filters.fromDate) {
          dbFilters.fromDate = new Date(filters.fromDate);
        }

        if (filters.toDate) {
          dbFilters.toDate = new Date(filters.toDate);
        }
      }

      // Get keywords from database
      const dbKeywords = await getKeywordsWithFilters(dbFilters);

      // Update state
      setKeywords(dbKeywords as KeywordRecord[]);

      return dbKeywords as KeywordRecord[];
    } catch (e) {
      console.error("Error getting keywords:", e);
      return [];
    } finally {
      setIsLoading(false);
    }
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
      isUserExpired,
      isLoading
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
