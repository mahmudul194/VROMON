import React from 'react';

export function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const rounded = Math.round(score);
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, rounded)) / 100) * circumference;

  const strokeColor = rounded >= 75 ? '#2f6b2f' : rounded >= 55 ? '#ffcb3d' : '#f28c28';

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(85, 121, 69, 0.16)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center leading-none">
        <span className="text-base font-extrabold text-vromon-dark">{rounded}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-vromon-muted">
          Score
        </span>
      </div>
    </div>
  );
}
