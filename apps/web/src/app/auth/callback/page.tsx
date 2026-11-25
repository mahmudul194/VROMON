'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('vromon_token', token);
      refreshUser().then(() => router.replace('/plan'));
    } else {
      router.replace('/login?error=missing_token');
    }
  }, [params, refreshUser, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-vromon-primary" />
      <p className="text-sm font-semibold text-vromon-muted">Completing Google Sign In...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm">Loading...</div>}>
      <CallbackInner />
    </Suspense>
  );
}
