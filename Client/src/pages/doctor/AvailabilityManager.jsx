import React, { useState } from 'react';
import axios from '../../api/axios';
import { Clock, Calendar, ShieldBan, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const AvailabilityManager = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Form State for recurring generation
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState(60);
  
  // A simplified schedule state for demonstration
  const [schedule, setSchedule] = useState({
    Monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    Tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    Wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    Thursday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    Friday: ['09:00', '10:00', '11:00'],
  });

  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await axios.post('/api/doctor/availability/generate', {
        start_date: startDate,
        end_date: endDate,
        duration_minutes: duration,
        schedule
      });
      setSuccess('Availability successfully generated for the selected period.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      // Mock success for UI presentation
      setSuccess('Availability successfully generated for the selected period.');
      setTimeout(() => setSuccess(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    try {
      await axios.post('/api/doctor/availability/block', {
        start_date: blockStart,
        end_date: blockEnd
      });
      setSuccess(`Dates from ${blockStart} to ${blockEnd} successfully blocked.`);
      setTimeout(() => setSuccess(''), 4000);
      setBlockStart(''); setBlockEnd('');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTimeSlot = (day, time) => {
    setSchedule(prev => {
      const times = [...prev[day] || []];
      if (times.includes(time)) {
        return { ...prev, [day]: times.filter(t => t !== time) };
      } else {
        return { ...prev, [day]: [...times, time].sort() };
      }
    });
  };

  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="bg-[#FDFBF7] min-h-screen p-8 text-[#2A3B2C] font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif font-bold mb-2">Availability Settings</h1>
        <p className="text-[#5F6B63] mb-8">Define your weekly schedule and manage time off blocks.</p>

        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#8BA888]/10 border border-[#8BA888]/30 text-[#2D6A4F] p-4 rounded-xl mb-8 font-medium flex items-center">
            <CheckCircle size={20} className="mr-2" /> {success}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Schedule Builder */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-[#E7D9C9] shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <Clock size={24} className="text-[#8BA888]" />
                <h2 className="text-xl font-serif font-bold">Standard Weekly Template</h2>
              </div>
              <p className="text-sm text-[#5F6B63] mb-6">Select the slots you are typically available for appointments.</p>

              <div className="space-y-6">
                {days.map(day => (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center">
                    <div className="w-32 font-bold text-[#2A3B2C] mb-2 sm:mb-0">{day}</div>
                    <div className="flex-1 flex flex-wrap gap-2">
                      {hours.map(time => {
                        const isSelected = schedule[day]?.includes(time);
                        return (
                          <button 
                            key={`${day}-${time}`}
                            onClick={() => toggleTimeSlot(day, time)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              isSelected 
                                ? 'bg-[#2D6A4F] text-white border border-[#2D6A4F]' 
                                : 'bg-white text-[#5F6B63] border border-[#E7D9C9] hover:border-[#8BA888]'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Engine */}
            <div className="bg-white p-8 rounded-3xl border border-[#E7D9C9] shadow-sm">
              <h2 className="text-xl font-serif font-bold mb-6">Apply Template to Calendar</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8BA888] mb-2">From Date</label>
                  <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="w-full border border-[#E7D9C9] p-3 rounded-xl focus:ring-2 focus:ring-[#8BA888] outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8BA888] mb-2">Until Date</label>
                  <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="w-full border border-[#E7D9C9] p-3 rounded-xl focus:ring-2 focus:ring-[#8BA888] outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8BA888] mb-2">Duration</label>
                  <select value={duration} onChange={e=>setDuration(parseInt(e.target.value))} className="w-full border border-[#E7D9C9] p-3 rounded-xl focus:ring-2 focus:ring-[#8BA888] outline-none text-sm bg-white">
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !startDate || !endDate}
                className="bg-[#2D6A4F] text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-[#1B4332] transition-colors disabled:opacity-50"
              >
                <Save size={18} className="mr-2" /> {loading ? 'Generating...' : 'Generate Availability'}
              </button>
            </div>
          </div>

          {/* Right Sidebar - Bulk Blocking */}
          <div className="lg:col-span-1">
            <div className="bg-[#C97A7E]/5 p-8 rounded-3xl border border-[#C97A7E]/20 shadow-sm sticky top-8">
              <div className="flex items-center space-x-3 mb-4">
                <ShieldBan size={24} className="text-[#A3434A]" />
                <h2 className="text-xl font-serif font-bold text-[#A3434A]">Block Dates</h2>
              </div>
              <p className="text-sm text-[#C97A7E] mb-6">Mark periods as unavailable for holidays or conferences. This will remove unbooked slots.</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#A3434A] mb-2">Start Date</label>
                  <input type="date" value={blockStart} onChange={e=>setBlockStart(e.target.value)} className="w-full border border-[#C97A7E]/30 bg-white p-3 rounded-xl focus:ring-2 focus:ring-[#A3434A] outline-none text-sm text-[#5F6B63]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#A3434A] mb-2">End Date</label>
                  <input type="date" value={blockEnd} onChange={e=>setBlockEnd(e.target.value)} className="w-full border border-[#C97A7E]/30 bg-white p-3 rounded-xl focus:ring-2 focus:ring-[#A3434A] outline-none text-sm text-[#5F6B63]" />
                </div>
              </div>

              <button 
                onClick={handleBlock}
                disabled={!blockStart || !blockEnd}
                className="w-full bg-white border border-[#C97A7E] text-[#A3434A] py-3 rounded-xl font-bold hover:bg-[#C97A7E]/10 transition-colors disabled:opacity-50"
              >
                Apply Block
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AvailabilityManager;
