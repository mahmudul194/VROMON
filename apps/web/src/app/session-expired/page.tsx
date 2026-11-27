'use client';

import React from 'react';
import { SessionExpiredGatewayCard } from '@/components/AuthStatusBanners';

export default function SessionExpiredPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-180px)] w-full flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      {/* Ambient Blurred Blobs matching Stitch #35 */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#5D9253]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 -right-36 h-96 w-96 rounded-full bg-[#FFCB3D]/35 blur-3xl" />

      <SessionExpiredGatewayCard standalone />
    </div>
  );
}
