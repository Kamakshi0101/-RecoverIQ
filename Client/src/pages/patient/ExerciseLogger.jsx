import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Dumbbell, Activity, Calendar, Clock, CheckCircle, ChevronDown, Check, X, Info } from 'lucide-react';
import PainSlider from '../../components/PainSlider';
import MoodPicker from '../../components/MoodPicker';
import RecoveryTimer from '../../components/RecoveryTimer';
import ExertionScale from '../../components/ExertionScale';
import ExerciseAnalytics from '../../components/ExerciseAnalytics';

const ExerciseLogger = () => {
  const { user } = useAuth();
  const [library, setLibrary] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Selection state
  const [selectedExercise, setSelectedExercise] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    sets_completed: '',
    reps_completed: '',
    duration_seconds: 0,
    pain_level: 0,
    rpe_level: 1,
    mood: 'neutral',
    notes: '',
    incomplete: false,
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [libRes, todayRes, histRes] = await Promise.all([
        axios.get('/api/exercises/library'),
        axios.get('/api/patient/exercises/today'),
        axios.get('/api/patient/exercise-logs/history')
      ]);
      setLibrary(libRes.data.data);
      setAssigned(todayRes.data.data);
      setHistory(histRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const currentExerciseData = assigned.find(e => e.exercise_id == selectedExercise) || 
                              library.find(e => e.id == selectedExercise);

  const isAssigned = assigned.some(e => e.exercise_id == selectedExercise);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExercise) return;

    setLoading(true);
    setSuccessMsg('');
    setFeedback(null);

    const payload = {
      exercise_id: selectedExercise,
      sets_completed: formData.incomplete ? 0 : (formData.sets_completed || null),
      reps_completed: formData.incomplete ? 0 : (formData.reps_completed || null),
      duration_seconds: formData.duration_seconds,
      pain_level: formData.pain_level,
      rpe_level: formData.rpe_level,
      mood: formData.mood,
      notes: formData.notes
    };

    try {
      const res = await axios.post('/api/patient/exercise-logs', payload);
      setSuccessMsg('Session logged successfully. Excellent effort!');
      setFeedback(res.data.data.feedback);
      
      // Reset form
      setFormData({
        sets_completed: '', reps_completed: '', duration_seconds: 0,
        pain_level: 0, rpe_level: 1, mood: 'neutral', notes: '', incomplete: false
      });
      setSelectedExercise('');
      
      // Refresh history
      const histRes = await axios.get('/api/patient/exercise-logs/history');
      setHistory(histRes.data.data);

      setTimeout(() => {
        setSuccessMsg('');
        setFeedback(null);
      }, 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Analytics Calculations
  const todayLogs = history.filter(log => {
    const today = new Date().toISOString().split('T')[0];
    return log.logged_at.startsWith(today);
  });
  const totalMinsToday = Math.round(todayLogs.reduce((acc, curr) => acc + curr.duration_seconds, 0) / 60);
  const avgPainToday = todayLogs.length ? Math.round(todayLogs.reduce((acc, curr) => acc + curr.pain_level, 0) / todayLogs.length) : 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2A3B2C] pb-24 font-sans selection:bg-[#8BA888] selection:text-white">
      
      {/* Hero Dashboard Section */}
      <div className="bg-white border-b border-[#E7D9C9] pt-12 pb-16 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#8BA888] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold font-serif mb-2 text-[#2A3B2C]"
          >
            Good Morning, {user?.name?.split(' ')[0] || 'Patient'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-[#5F6B63] text-lg mb-10"
          >
            "Healing is a matter of time, but it is sometimes also a matter of opportunity."
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Exercises Today', value: todayLogs.length, icon: Dumbbell, color: '#2D6A4F' },
              { label: 'Therapy Time', value: `${totalMinsToday}m`, icon: Clock, color: '#8BA888' },
              { label: 'Avg Pain', value: avgPainToday, icon: Activity, color: '#C97A7E' },
              { label: 'Day Streak', value: user?.patient?.streak_count || 0, icon: Calendar, color: '#E3B062' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-[#FDFBF7] p-6 rounded-3xl border border-[#E7D9C9] shadow-sm flex items-center space-x-4"
              >
                <div className="p-3 rounded-2xl" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#8BA888] uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-3xl font-serif font-bold text-[#2A3B2C]">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column - Form */}
        <div className="lg:col-span-8">
          
          <AnimatePresence>
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                className="bg-[#8BA888]/10 border border-[#8BA888]/30 rounded-2xl p-6 mb-8 flex items-start space-x-4"
              >
                <CheckCircle className="text-[#8BA888] shrink-0 mt-0.5" size={24} />
                <div>
                  <h4 className="text-[#2D6A4F] font-serif font-bold text-lg mb-1">{successMsg}</h4>
                  {feedback?.insights && (
                    <p className="text-[#5F6B63]">{feedback.insights}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Custom Exercise Selector */}
            <div className="relative">
              <label className="block text-sm font-bold text-[#8BA888] uppercase tracking-wider mb-3">Select Exercise</label>
              <div 
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full bg-white border border-[#E7D9C9] p-5 rounded-2xl flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              >
                {selectedExercise ? (
                  <span className="text-xl font-serif text-[#2A3B2C]">{currentExerciseData?.exercise_name || currentExerciseData?.name}</span>
                ) : (
                  <span className="text-xl font-serif text-[#A0AAB2]">Choose from library or assigned...</span>
                )}
                <ChevronDown className={`text-[#8BA888] transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E7D9C9] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-50 max-h-96 overflow-y-auto"
                  >
                    {assigned.length > 0 && (
                      <div className="p-4 bg-[#FDFBF7] border-b border-[#E7D9C9]">
                        <p className="text-xs font-bold text-[#8BA888] uppercase tracking-wider mb-3 px-2">Assigned Today</p>
                        {assigned.map(ex => (
                          <div 
                            key={`assigned-${ex.exercise_id}`}
                            onClick={() => { setSelectedExercise(ex.exercise_id); setShowDropdown(false); }}
                            className="p-3 hover:bg-white rounded-xl cursor-pointer flex justify-between items-center transition-colors"
                          >
                            <span className="font-serif text-[#2A3B2C] text-lg">{ex.exercise_name}</span>
                            <span className="text-xs bg-[#8BA888] text-white px-2 py-1 rounded-full font-medium">Assigned</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs font-bold text-[#8BA888] uppercase tracking-wider mb-3 px-2">Exercise Library</p>
                      {library.map(ex => (
                        <div 
                          key={`lib-${ex.id}`}
                          onClick={() => { setSelectedExercise(ex.id); setShowDropdown(false); }}
                          className="p-3 hover:bg-[#FDFBF7] rounded-xl cursor-pointer flex items-center space-x-3 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#E7D9C9]/30 flex items-center justify-center">
                            <Dumbbell size={14} className="text-[#8BA888]" />
                          </div>
                          <span className="font-serif text-[#2A3B2C] text-lg">{ex.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {selectedExercise && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-10"
                >
                  
                  {/* Targets & Timer Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-[#E7D9C9] shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-[#8BA888] uppercase tracking-wider">Volume</h3>
                        {isAssigned && (
                          <span className="text-xs bg-[#F5F1EA] text-[#5F6B63] px-3 py-1 rounded-full">Target: {currentExerciseData.sets} sets × {currentExerciseData.reps} reps</span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm text-[#5F6B63] mb-2 font-medium">Sets Completed</label>
                          <input 
                            type="number" min="0" required={!formData.incomplete}
                            value={formData.sets_completed} onChange={e => setFormData({...formData, sets_completed: e.target.value})}
                            disabled={formData.incomplete}
                            className="w-full bg-[#FDFBF7] border border-[#E7D9C9] rounded-xl p-4 text-2xl font-serif text-center focus:ring-2 focus:ring-[#8BA888] focus:border-[#8BA888] outline-none disabled:opacity-50"
                            placeholder={currentExerciseData?.sets || 0}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[#5F6B63] mb-2 font-medium">Reps per Set</label>
                          <input 
                            type="number" min="0" required={!formData.incomplete}
                            value={formData.reps_completed} onChange={e => setFormData({...formData, reps_completed: e.target.value})}
                            disabled={formData.incomplete}
                            className="w-full bg-[#FDFBF7] border border-[#E7D9C9] rounded-xl p-4 text-2xl font-serif text-center focus:ring-2 focus:ring-[#8BA888] focus:border-[#8BA888] outline-none disabled:opacity-50"
                            placeholder={currentExerciseData?.reps || 0}
                          />
                        </div>
                      </div>

                      {/* Incomplete Toggle */}
                      <label className="mt-8 flex items-center space-x-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${formData.incomplete ? 'bg-[#8BA888] border-[#8BA888]' : 'bg-[#FDFBF7] border-[#E7D9C9] group-hover:border-[#8BA888]'}`}>
                          {formData.incomplete && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-[#5F6B63] text-sm">Attempted but not completed</span>
                        <input type="checkbox" className="hidden" checked={formData.incomplete} onChange={e => setFormData({...formData, incomplete: e.target.checked})} />
                      </label>
                      
                      <AnimatePresence>
                        {formData.incomplete && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <p className="mt-4 text-sm text-[#C97A7E] italic">"Recovery takes time. Every effort matters."</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-[#E7D9C9] shadow-sm flex flex-col justify-center">
                      <h3 className="text-sm font-bold text-[#8BA888] uppercase tracking-wider mb-6">Duration</h3>
                      <RecoveryTimer onStop={(s) => setFormData({...formData, duration_seconds: s})} initialSeconds={formData.duration_seconds} />
                    </div>
                  </div>

                  {/* Tracking Sliders */}
                  <PainSlider value={formData.pain_level} onChange={(v) => setFormData({...formData, pain_level: v})} />
                  <ExertionScale value={formData.rpe_level} onChange={(v) => setFormData({...formData, rpe_level: v})} />
                  
                  {/* Wellness & Notes */}
                  <div className="bg-white p-8 rounded-3xl border border-[#E7D9C9] shadow-sm">
                    <h3 className="text-sm font-bold text-[#8BA888] uppercase tracking-wider mb-6">Emotional Wellness</h3>
                    <MoodPicker value={formData.mood} onChange={(v) => setFormData({...formData, mood: v})} />
                    
                    <div className="mt-10">
                      <h3 className="text-sm font-bold text-[#8BA888] uppercase tracking-wider mb-4">Therapy Notes</h3>
                      <textarea 
                        rows="3"
                        value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                        className="w-full bg-[#FDFBF7] border border-[#E7D9C9] rounded-2xl p-5 text-[#5F6B63] focus:ring-2 focus:ring-[#8BA888] focus:border-[#8BA888] outline-none resize-none"
                        placeholder="E.g. 'Felt a sharp pull in the knee at rep 8...'"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <motion.button 
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      type="submit" disabled={loading}
                      className="w-full bg-[#2D6A4F] text-white py-5 rounded-2xl font-serif text-xl tracking-wide shadow-[0_10px_30px_rgba(45,106,79,0.2)] hover:bg-[#1B4332] transition-colors disabled:opacity-70 flex justify-center items-center"
                    >
                      {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Log Session'}
                    </motion.button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Right Column - Recovery Feedback */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-[#E7D9C9] shadow-sm sticky top-8">
            <h2 className="text-2xl font-serif font-bold text-[#2A3B2C] mb-8">Recovery Insights</h2>
            
            <div className="space-y-6">
              <div className="p-5 bg-[#FDFBF7] rounded-2xl border border-[#E7D9C9] border-l-4 border-l-[#8BA888]">
                <div className="flex items-center space-x-3 mb-2">
                  <Activity size={18} className="text-[#8BA888]" />
                  <h4 className="font-bold text-[#2A3B2C]">Mobility Trend</h4>
                </div>
                <p className="text-[#5F6B63] text-sm leading-relaxed">Your consistency is paying off. Mobility is improving steadily across sessions this week.</p>
              </div>

              <div className="p-5 bg-[#FDFBF7] rounded-2xl border border-[#E7D9C9] border-l-4 border-l-[#2D6A4F]">
                <div className="flex items-center space-x-3 mb-2">
                  <CheckCircle size={18} className="text-[#2D6A4F]" />
                  <h4 className="font-bold text-[#2A3B2C]">Volume</h4>
                </div>
                <p className="text-[#5F6B63] text-sm leading-relaxed">You've logged {todayLogs.length} exercises today. Keep up the momentum to hit your daily goal!</p>
              </div>
            </div>

            <div className="mt-10 bg-[#E7D9C9]/30 rounded-2xl p-6 flex items-start space-x-4">
              <Info size={24} className="text-[#8BA888] shrink-0" />
              <p className="text-sm text-[#5F6B63] italic font-serif">"Listen to your body. Resting when needed is just as important as the exercises themselves."</p>
            </div>
          </div>
        </div>

      </div>

      {/* Analytics Section at Bottom */}
      <div className="max-w-6xl mx-auto px-6 lg:px-12 mt-20 border-t border-[#E7D9C9] pt-20">
        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold text-[#2A3B2C] mb-4">Premium Analytics</h2>
          <p className="text-[#5F6B63] text-lg max-w-2xl">Track your recovery trends over time to see the true impact of your daily dedication.</p>
        </div>
        <ExerciseAnalytics historyData={history} />
      </div>

    </div>
  );
};

export default ExerciseLogger;
