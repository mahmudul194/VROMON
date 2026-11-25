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
  sessionExpired: boolean;
  loggedOutNotice: boolean;
  setSession: (token: string, user: AuthUser) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
  clearSessionExpired: () => void;
  clearLoggedOutNotice: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  sessionExpired: false,
  loggedOutNotice: false,
  setSession: () => {},
  refreshUser: async () => {},
  logout: () => {},
  clearSessionExpired: () => {},
  clearLoggedOutNotice: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loggedOutNotice, setLoggedOutNotice] = useState(false);

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
    } catch (err: any) {
      localStorage.removeItem('vromon_token');
      setUser(null);
      if (err?.status === 401) {
        setSessionExpired(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleExpired = () => {
      localStorage.removeItem('vromon_token');
      setUser(null);
      setSessionExpired(true);
    };
    window.addEventListener('vromon:session-expired', handleExpired);
    return () => window.removeEventListener('vromon:session-expired', handleExpired);
  }, []);

  const setSession = useCallback((token: string, nextUser: AuthUser) => {
    localStorage.setItem('vromon_token', token);
    setUser(nextUser);
    setSessionExpired(false);
    setLoggedOutNotice(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vromon_token');
    setUser(null);
    setSessionExpired(false);
    setLoggedOutNotice(true);
  }, []);

  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);
  const clearLoggedOutNotice = useCallback(() => setLoggedOutNotice(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sessionExpired,
        loggedOutNotice,
        setSession,
        refreshUser,
        logout,
        clearSessionExpired,
        clearLoggedOutNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
