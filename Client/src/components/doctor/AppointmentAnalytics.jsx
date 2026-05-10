import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AppointmentAnalytics = () => {
  const data = [
    { name: 'Mon', completed: 4, cancelled: 1 },
    { name: 'Tue', completed: 6, cancelled: 0 },
    { name: 'Wed', completed: 5, cancelled: 2 },
    { name: 'Thu', completed: 7, cancelled: 0 },
    { name: 'Fri', completed: 4, cancelled: 1 },
  ];

  const pieData = [
    { name: 'Completed', value: 85, color: '#2D6A4F' },
    { name: 'Cancelled', value: 10, color: '#C97A7E' },
    { name: 'No-Show', value: 5, color: '#E3B062' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
      <div className="bg-white p-8 rounded-3xl border border-[#E7D9C9] shadow-sm">
        <h3 className="text-xl font-serif font-bold text-[#2A3B2C] mb-1">Session Volume</h3>
        <p className="text-sm text-[#5F6B63] mb-8">Completed vs Cancelled sessions this week.</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7D9C9" opacity={0.5} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A0AAB2', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A0AAB2', fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#F5F1EA' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E7D9C9' }} />
              <Bar dataKey="completed" name="Completed" stackId="a" fill="#8BA888" radius={[0, 0, 4, 4]} />
              <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill="#C97A7E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-[#E7D9C9] shadow-sm">
        <h3 className="text-xl font-serif font-bold text-[#2A3B2C] mb-1">Adherence Breakdown</h3>
        <p className="text-sm text-[#5F6B63] mb-8">Overall appointment attendance rate.</p>
        <div className="h-64 w-full flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E7D9C9' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-1/2">
            <ul className="space-y-4">
              {pieData.map(item => (
                <li key={item.name} className="flex items-center text-sm font-bold text-[#2A3B2C]">
                  <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                  {item.name} <span className="ml-auto text-[#5F6B63] font-medium">{item.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentAnalytics;
