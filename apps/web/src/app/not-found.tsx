import React from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-220px)] max-w-lg flex-col items-center justify-center space-y-5 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vromon-pill text-vromon-deep">
        <Compass className="h-8 w-8" strokeWidth={1.75} />
      </div>
      <div className="space-y-2">
        <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-vromon-olive">
          404 • Off the Map
        </span>
        <h1 className="text-[36px] font-extrabold text-vromon-dark">Page Not Found</h1>
        <p className="text-[16px] font-normal text-vromon-muted">
          The trail you requested does not exist. Let us guide you back to verified destinations.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-11 items-center rounded-full bg-vromon-primary px-6 text-[14px] font-semibold text-white hover:bg-vromon-deep"
      >
        Return Home
      </Link>
    </div>
  );
}
