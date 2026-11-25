'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface ClimateChartProps {
  conditions: Array<{
    month_no: number;
    weather_rating: number;
    crowd_level: string;
    weather_note: string | null;
  }>;
  highlightMonth?: number;
}

export function ClimateChart({ conditions, highlightMonth }: ClimateChartProps) {
  const data = conditions.map((c) => ({
    month: MONTH_NAMES[(c.month_no - 1) % 12],
    month_no: c.month_no,
    rating: c.weather_rating,
    crowd: c.crowd_level,
    note: c.weather_note || 'Seasonal estimate',
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 12, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d5e6cf" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: '#41493e', fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fill: '#41493e', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2a1f',
              borderRadius: '16px',
              border: 'none',
              color: '#ffffff',
              fontSize: '12px',
              padding: '10px 14px',
            }}
            formatter={(value: any, _name: any, props: any) => [
              `${value}/5 (${props.payload.crowd} Crowd)`,
              'Weather Rating',
            ]}
          />
          <Bar dataKey="rating" radius={[8, 8, 8, 8]}>
            {data.map((entry) => (
              <Cell
                key={entry.month_no}
                fill={
                  entry.month_no === highlightMonth
                    ? '#ffcb3d'
                    : entry.rating >= 4
                      ? '#2f6b2f'
                      : entry.rating === 3
                        ? '#5d9253'
                        : '#95d68e'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
