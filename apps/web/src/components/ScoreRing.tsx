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
      className="relative inline-flex shrink-0 items-center justify-center"
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
        <span className="text-[16px] font-extrabold text-[#1F2A1F]">{rounded}</span>
        {size >= 68 && (
          <span className="mt-0.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
            Score
          </span>
        )}
      </div>
    </div>
  );
}
