import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const ExerciseAnalytics = ({ historyData }) => {
  if (!historyData || historyData.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 bg-[#FDFBF7] rounded-3xl border border-[#E7D9C9]">
        <p className="text-[#5F6B63] font-serif italic">Record more exercises to unlock your recovery insights.</p>
      </div>
    );
  }

  // Process data for charts
  // We need to aggregate by date
  const processedData = historyData.reduce((acc, log) => {
    const date = new Date(log.logged_at).toLocaleDateString('en-US', { weekday: 'short' });
    
    let existing = acc.find(item => item.date === date);
    if (!existing) {
      existing = { date, painAvg: 0, rpeAvg: 0, count: 0, duration: 0 };
      acc.push(existing);
    }
    
    existing.painAvg += log.pain_level;
    existing.rpeAvg += log.rpe_level;
    existing.duration += Math.round(log.duration_seconds / 60);
    existing.count += 1;
    
    return acc;
  }, []).map(item => ({
    ...item,
    painAvg: Math.round((item.painAvg / item.count) * 10) / 10,
    rpeAvg: Math.round((item.rpeAvg / item.count) * 10) / 10,
  })).reverse(); // Oldest to newest for the chart (assuming historyData comes newest first)

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-[#E7D9C9] shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-xl">
          <p className="font-bold text-[#2A3B2C] mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Pain & Exertion Trends */}
      <div className="bg-[#FDFBF7] p-8 rounded-3xl border border-[#E7D9C9] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
        <h3 className="text-xl font-serif font-bold text-[#2A3B2C] mb-1">Pain & Exertion Trends</h3>
        <p className="text-sm text-[#5F6B63] mb-8">Your average pain and exertion levels per session.</p>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C97A7E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#C97A7E" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRpe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8BA888" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8BA888" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7D9C9" opacity={0.5} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#A0AAB2', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A0AAB2', fontSize: 12 }} domain={[0, 10]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#5F6B63', paddingTop: '20px' }} />
              <Area type="monotone" dataKey="painAvg" name="Avg Pain (1-10)" stroke="#C97A7E" strokeWidth={3} fillOpacity={1} fill="url(#colorPain)" />
              <Area type="monotone" dataKey="rpeAvg" name="Avg Exertion (1-10)" stroke="#8BA888" strokeWidth={3} fillOpacity={1} fill="url(#colorRpe)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Session Duration */}
      <div className="bg-[#FDFBF7] p-8 rounded-3xl border border-[#E7D9C9] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
        <h3 className="text-xl font-serif font-bold text-[#2A3B2C] mb-1">Therapy Volume</h3>
        <p className="text-sm text-[#5F6B63] mb-8">Total minutes spent exercising each day.</p>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7D9C9" opacity={0.5} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#A0AAB2', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A0AAB2', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F1EA' }} />
              <Bar dataKey="duration" name="Duration (mins)" fill="#2D6A4F" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default ExerciseAnalytics;
