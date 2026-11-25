'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'TRAVELER' | 'ADMIN';
  avatar_url?: string | null;
  preferred_city?: string | null;
  budget_tier?: string | null;
  is_verified: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  setSession: (token: string, user: AuthUser) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  setSession: () => {},
  refreshUser: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('vromon_token') : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch<{ user: AuthUser }>('/auth/me');
      setUser(res.user);
    } catch {
      localStorage.removeItem('vromon_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const setSession = useCallback((token: string, nextUser: AuthUser) => {
    localStorage.setItem('vromon_token', token);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vromon_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setSession, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
