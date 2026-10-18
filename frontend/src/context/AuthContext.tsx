import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole, AuthResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserRole>;
  register: (data: any) => Promise<UserRole>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('claimsure_access_token');
      if (token) {
        try {
          const res = await api.get('/profile/me');
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('claimsure_access_token');
          localStorage.removeItem('claimsure_refresh_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string): Promise<UserRole> => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    const { access_token, refresh_token, user: userData } = res.data;
    localStorage.setItem('claimsure_access_token', access_token);
    localStorage.setItem('claimsure_refresh_token', refresh_token);
    setUser(userData);
    return userData.role;
  };

  const register = async (data: any): Promise<UserRole> => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    const { access_token, refresh_token, user: userData } = res.data;
    localStorage.setItem('claimsure_access_token', access_token);
    localStorage.setItem('claimsure_refresh_token', refresh_token);
    setUser(userData);
    return userData.role;
  };

  const logout = () => {
    try {
      api.post('/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem('claimsure_access_token');
      localStorage.removeItem('claimsure_refresh_token');
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/profile/me');
      setUser(res.data);
    } catch (e) {
      console.error('Failed to refresh profile:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
