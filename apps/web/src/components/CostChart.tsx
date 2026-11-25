'use client';

import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CostBreakdown } from '@vromon/shared';

const COLORS = ['#2f6b2f', '#5d9253', '#ffcb3d', '#557945', '#c1c9bb'];

export function CostChart({ breakdown }: { breakdown: CostBreakdown }) {
  const data = [
    { name: 'Round-Trip Transit', value: breakdown.round_trip_transport },
    { name: 'Accommodation', value: breakdown.hotel_stay },
    { name: 'Food & Dining', value: breakdown.food_total },
    { name: 'Local Fees & Transit', value: breakdown.local_fees },
    { name: '10% Safety Buffer', value: breakdown.safety_buffer },
  ].filter((d) => d.value > 0);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="h-52 w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, 'Amount']}
              contentStyle={{
                backgroundColor: '#1f2a1f',
                borderRadius: '14px',
                border: 'none',
                color: '#ffffff',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 w-full space-y-2.5">
        {data.map((item, idx) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2.5">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-vromon-muted font-medium">{item.name}</span>
            </div>
            <span className="font-bold text-vromon-dark">
              ৳{item.value.toLocaleString()}
            </span>
          </div>
        ))}
        <div className="pt-2 border-t border-vromon-pill flex items-center justify-between text-sm font-extrabold text-vromon-deep">
          <span>Total Estimated Cost</span>
          <span>৳{breakdown.total_cost.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
