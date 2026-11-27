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

export interface CachedIdentity {
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  lastKnownUser: CachedIdentity | null;
  loading: boolean;
  sessionExpired: boolean;
  loggedOutNotice: boolean;
  logoutModalOpen: boolean;
  setSession: (token: string, user: AuthUser) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
  clearSessionExpired: () => void;
  clearLoggedOutNotice: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  lastKnownUser: null,
  loading: true,
  sessionExpired: false,
  loggedOutNotice: false,
  logoutModalOpen: false,
  setSession: () => {},
  refreshUser: async () => {},
  logout: () => {},
  openLogoutModal: () => {},
  closeLogoutModal: () => {},
  clearSessionExpired: () => {},
  clearLoggedOutNotice: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [lastKnownUser, setLastKnownUser] = useState<CachedIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loggedOutNotice, setLoggedOutNotice] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('vromon_last_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.email) {
          setLastKnownUser({ name: parsed.name || 'Traveler', email: parsed.email });
        }
      }
    } catch {
      // ignore corrupted cache
    }
  }, []);

  const persistIdentity = useCallback((u: AuthUser) => {
    const cached = { name: u.name, email: u.email };
    setLastKnownUser(cached);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('vromon_last_user', JSON.stringify(cached));
      } catch {
        // ignore storage quota
      }
    }
  }, []);

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
      persistIdentity(res.user);
    } catch (err: any) {
      localStorage.removeItem('vromon_token');
      setUser(null);
      if (err?.status === 401) {
        setSessionExpired(true);
      }
    } finally {
      setLoading(false);
    }
  }, [persistIdentity]);

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

  const setSession = useCallback(
    (token: string, nextUser: AuthUser) => {
      localStorage.setItem('vromon_token', token);
      setUser(nextUser);
      persistIdentity(nextUser);
      setSessionExpired(false);
      setLoggedOutNotice(false);
    },
    [persistIdentity],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('vromon_token');
    setUser(null);
    setSessionExpired(false);
    setLogoutModalOpen(false);
    setLoggedOutNotice(true);
  }, []);

  const openLogoutModal = useCallback(() => setLogoutModalOpen(true), []);
  const closeLogoutModal = useCallback(() => setLogoutModalOpen(false), []);
  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);
  const clearLoggedOutNotice = useCallback(() => setLoggedOutNotice(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        lastKnownUser,
        loading,
        sessionExpired,
        loggedOutNotice,
        logoutModalOpen,
        setSession,
        refreshUser,
        logout,
        openLogoutModal,
        closeLogoutModal,
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
