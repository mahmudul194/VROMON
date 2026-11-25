import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { FeasibilityStatus } from '@vromon/shared';

export function FeasibilityBadge({ status }: { status: FeasibilityStatus }) {
  if (status === 'Fits') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-vromon-accent px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-white">
        <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.2} />
        <span>Fits Budget</span>
      </span>
    );
  }

  if (status === 'Tight') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-vromon-amber px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-vromon-dark">
        <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.2} />
        <span>Tight Budget</span>
      </span>
    );
  }

  if (status === 'Over budget') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-vromon-over px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-white">
        <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.2} />
        <span>Over Budget</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-vromon-danger px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-white">
      <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.2} />
      <span>Infeasible</span>
    </span>
  );
}
