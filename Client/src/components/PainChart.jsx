import React from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';

export default function PainChart({ data }) {
  const { isDark } = useTheme();

  const formattedData = data?.map(d => ({
    ...d,
    dateLabel: format(parseISO(d.logged_at), 'MMM dd')
  })) || [];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
            domain={[0, 10]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb',
              color: isDark ? '#f3f4f6' : '#111827',
              borderRadius: '0.5rem'
            }} 
          />
          <Line 
            type="monotone" 
            dataKey="pain_level" 
            name="Pain Level"
            stroke="#ef4444" 
            strokeWidth={3} 
            dot={{ r: 4, strokeWidth: 2 }} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
