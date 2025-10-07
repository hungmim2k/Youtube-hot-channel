import React, { createContext, useContext, useEffect, useState } from 'react';

type Role = 'admin' | 'user';

interface UserRecord {
  username: string;
  password: string;
  role: Role;
}

interface AuthContextType {
  user: UserRecord | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN: UserRecord = { username: 'admin', password: '0968885430', role: 'admin' };
const USERS_KEY = 'yt_app_users_v1';
const CURRENT_KEY = 'yt_app_current_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRecord | null>(null);

  useEffect(() => {
    try {
      const rawUsers = localStorage.getItem(USERS_KEY);
      let users: UserRecord[] = [];
      if (rawUsers) users = JSON.parse(rawUsers);
      const hasAdmin = users.some(u => u.username === DEFAULT_ADMIN.username);
      if (!hasAdmin) {
        users.unshift(DEFAULT_ADMIN);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
      const cur = localStorage.getItem(CURRENT_KEY);
      if (cur) setUser(JSON.parse(cur));
    } catch (e) {
      // ignore
    }
  }, []);

  const persistUsers = (users: UserRecord[]) => {
    try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (e) {}
  };

  const login = async (username: string, password: string) => {
    try {
      const raw = localStorage.getItem(USERS_KEY) || '[]';
      const users: UserRecord[] = JSON.parse(raw);
      const found = users.find(u => u.username === username && u.password === password);
      if (found) {
        setUser(found);
        localStorage.setItem(CURRENT_KEY, JSON.stringify(found));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      // admin account cannot be registered or overwritten
      if (username === DEFAULT_ADMIN.username) return false;
      const raw = localStorage.getItem(USERS_KEY) || '[]';
      const users: UserRecord[] = JSON.parse(raw);
      if (users.some(u => u.username === username)) return false;
      const newUser: UserRecord = { username, password, role: 'user' };
      users.push(newUser);
      persistUsers(users);
      setUser(newUser);
      localStorage.setItem(CURRENT_KEY, JSON.stringify(newUser));
      return true;
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(CURRENT_KEY); } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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
