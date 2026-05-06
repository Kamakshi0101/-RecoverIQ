import React from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';

export default function MobilityChart({ data }) {
  const { isDark } = useTheme();

  const formattedData = data?.map(d => ({
    ...d,
    dateLabel: format(parseISO(d.logged_at), 'MMM dd')
  })) || [];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="colorMobility" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} vertical={false} />
          <XAxis 
            dataKey="dateLabel" 
            stroke={isDark ? '#9ca3af' : '#6b7280'} 
            fontSize={12} 
            tickLine={false}
          />
          <YAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'} 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb',
              color: isDark ? '#f3f4f6' : '#111827',
              borderRadius: '0.5rem'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="mobility_score" 
            name="Mobility Score"
            stroke="#6366f1" 
            fillOpacity={1} 
            fill="url(#colorMobility)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
