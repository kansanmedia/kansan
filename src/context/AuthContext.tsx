import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { fetchJson } from '../lib/api';
import type { AdminUser } from '../types/admin';

interface AuthContextType {
  token: string | null;
  user: AdminUser | null;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (token) {
      fetchJson<{ user?: AdminUser }>('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      }, 'Failed to verify session')
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          logout();
        }
      })
      .catch(() => logout());
    }
  }, [token]);

  const login = (newToken: string, newUser: AdminUser) => {
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
