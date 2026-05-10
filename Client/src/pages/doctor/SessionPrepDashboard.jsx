import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../api/axios';
import { ArrowLeft, Activity, Target, Brain, BrainCircuit, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SessionPrepDashboard = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrepData();
  }, [id]);

  const fetchPrepData = async () => {
    try {
      const res = await axios.get(`/api/doctor/patients/${id}/session-prep`);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      // For demonstration, mock the data if API fails
      setData({
        patient: { name: 'Demo Patient', streak_count: 5 },
        metrics: { avg_pain: 4.2, avg_rpe: 6.5, total_duration_mins: 120, session_count: 4 },
        insights: [
          "Pain trends are elevated (Avg: 4.2/10). Consider adjusting intensity.",
          "Excellent adherence this week (4 sessions logged)."
        ],
        active_milestones: [{ id: 1, title: 'Walk 1km without pain', sub_progress: 60 }],
        previous_notes: 'Patient responded well to the new stretching routine. Still tight in the lower back.',
        recent_logs: [
          { logged_at: '2026-05-01', pain_level: 3, rpe_level: 5 },
          { logged_at: '2026-05-03', pain_level: 4, rpe_level: 6 },
          { logged_at: '2026-05-05', pain_level: 5, rpe_level: 7 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-[#8BA888] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!data) return <div className="p-20 text-center">Error loading prep data.</div>;

  const chartData = data.recent_logs.map(log => ({
    date: new Date(log.logged_at).toLocaleDateString('en-US', { weekday: 'short' }),
    pain: log.pain_level,
    rpe: log.rpe_level
  }));

  return (
    <div className="bg-[#FDFBF7] min-h-screen p-8 text-[#2A3B2C] font-sans">
      <div className="max-w-6xl mx-auto">
        <Link to="/doctor/dashboard" className="inline-flex items-center text-[#8BA888] hover:text-[#2A3B2C] mb-6 font-bold transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </Link>
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Session Prep</h1>
            <p className="text-[#5F6B63] text-lg">Intelligent clinical assistant for <span className="font-bold text-[#2A3B2C]">{data.patient.name}</span></p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full border border-[#E7D9C9] shadow-sm flex items-center">
            <TrendingUp size={16} className="text-[#E3B062] mr-2" />
            <span className="text-sm font-bold text-[#5F6B63]">{data.patient.streak_count} Day Streak</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* AI Insights */}
            <div className="bg-[#2D6A4F] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              <h2 className="text-xl font-serif font-bold mb-6 flex items-center">
                <BrainCircuit size={24} className="mr-3 text-[#DCE6D8]" /> 
                Clinical Insights (Last 7 Days)
              </h2>
              <div className="space-y-4 relative z-10">
                {data.insights.map((insight, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-sm flex items-start">
                    <div className="w-2 h-2 bg-[#E3B062] rounded-full mt-2 mr-3 shrink-0"></div>
                    <p className="leading-relaxed">{insight}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Volume (Mins)', value: data.metrics.total_duration_mins, color: '#8BA888' },
                { label: 'Avg Pain', value: data.metrics.avg_pain, color: '#C97A7E' },
                { label: 'Avg Exertion', value: data.metrics.avg_rpe, color: '#E3B062' },
              ].map((m, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-[#E7D9C9] shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#A0AAB2] mb-2">{m.label}</span>
                  <span className="text-3xl font-serif font-bold text-[#2A3B2C]">{m.value}</span>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-white p-8 rounded-3xl border border-[#E7D9C9] shadow-sm">
              <h2 className="text-xl font-serif font-bold mb-6 text-[#2A3B2C]">Pain & Exertion Trajectory</h2>
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="prepColorPain" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C97A7E" stopOpacity={0.3}/><stop offset="95%" stopColor="#C97A7E" stopOpacity={0}/></linearGradient>
                        <linearGradient id="prepColorRpe" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8BA888" stopOpacity={0.3}/><stop offset="95%" stopColor="#8BA888" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7D9C9" opacity={0.5} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#A0AAB2', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A0AAB2', fontSize: 12 }} domain={[0, 10]} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E7D9C9', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
                      <Area type="monotone" dataKey="pain" name="Pain" stroke="#C97A7E" strokeWidth={3} fillOpacity={1} fill="url(#prepColorPain)" />
                      <Area type="monotone" dataKey="rpe" name="Exertion" stroke="#8BA888" strokeWidth={3} fillOpacity={1} fill="url(#prepColorRpe)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#A0AAB2] italic text-sm">Not enough data to graph this week.</div>
                )}
              </div>
            </div>

          </div>

          {/* Right Sidebar Area */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Previous Notes */}
            <div className="bg-white p-6 rounded-3xl border border-[#E7D9C9] shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#8BA888] mb-4 flex items-center"><Calendar size={16} className="mr-2" /> Previous Session Notes</h2>
              <div className="bg-[#F5F1EA] p-5 rounded-2xl">
                <p className="text-sm text-[#5F6B63] leading-relaxed font-serif italic">
                  {data.previous_notes ? `"${data.previous_notes}"` : "No notes from previous sessions."}
                </p>
              </div>
            </div>

            {/* Active Milestones */}
            <div className="bg-white p-6 rounded-3xl border border-[#E7D9C9] shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#8BA888] mb-4 flex items-center"><Target size={16} className="mr-2" /> Active Milestones</h2>
              {data.active_milestones.length > 0 ? (
                <div className="space-y-4">
                  {data.active_milestones.map(m => (
                    <div key={m.id}>
                      <div className="flex justify-between text-sm mb-1 font-bold text-[#2A3B2C]">
                        <span>{m.title}</span>
                        <span className="text-[#2D6A4F]">{m.sub_progress || 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-[#E7D9C9] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${m.sub_progress || 0}%` }} transition={{ duration: 1 }} className="h-full bg-[#2D6A4F] rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#5F6B63]">No active milestones.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPrepDashboard;
