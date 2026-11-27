'use client';

import React from 'react';
import { OfflineDispatchCard } from '@/components/OfflineBanner';

export default function OfflinePage() {
  return (
    <div className="flex min-h-[calc(100vh-180px)] w-full flex-col items-center justify-center px-4 py-12 sm:px-6">
      <OfflineDispatchCard />
    </div>
  );
}
