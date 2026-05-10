import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import ConfettiCelebration from '../../components/ConfettiCelebration';
import ProgressRing from '../../components/ProgressRing';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trophy, CheckCircle, Clock, XCircle, Quote, Star, Heart, Shield, Bolt, ChevronDown, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ICONS = {
  mobility: Star,
  strength: Bolt,
  daily_task: Heart,
  pain: Shield,
  endurance: Trophy,
};

const Milestones = () => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [justUnlocked, setJustUnlocked] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mRes, bRes] = await Promise.all([
        axios.get('/api/patient/milestones'),
        axios.get('/api/patient/badges')
      ]);
      setMilestones(mRes.data.data);
      setBadges(bRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (milestone) => {
    try {
      const res = await axios.patch(`/api/patient/milestones/${milestone.id}/complete`);
      const { newly_unlocked_badge } = res.data.data;
      
      setMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, status: 'completed', badge: newly_unlocked_badge, sub_progress: 100 } : m));
      
      if (newly_unlocked_badge) {
        setBadges(prev => [newly_unlocked_badge, ...prev]);
        const triggered = JSON.parse(localStorage.getItem('confetti_triggered') || '[]');
        if (!triggered.includes(milestone.id)) {
          setJustUnlocked({ milestone, badge: newly_unlocked_badge });
          localStorage.setItem('confetti_triggered', JSON.stringify([...triggered, milestone.id]));
        }
      }
    } catch (err) {
      console.error("Error completing milestone", err);
    }
  };

  const toggleNotes = (id) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)] bg-[#FDFBF7]">
        <div className="w-10 h-10 border-4 border-[#E7D9C9] border-t-[#8BA888] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Analytics
  const total = milestones.length;
  const completed = milestones.filter(m => m.status === 'completed').length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const nextMilestone = milestones.find(m => m.status === 'in_progress' || m.status === 'upcoming');

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2A3B2C] pb-24 font-sans selection:bg-[#8BA888] selection:text-white">
      {justUnlocked && (
        <ConfettiCelebration 
          milestone={justUnlocked.milestone} 
          badge={justUnlocked.badge} 
          onDismiss={() => setJustUnlocked(null)} 
        />
      )}

      {/* Hero Section */}
      <div className="bg-white border-b border-[#E7D9C9] pt-12 pb-16 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8BA888] rounded-full mix-blend-multiply filter blur-3xl opacity-5 pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1"
          >
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 leading-tight text-[#2A3B2C]">
              Your Recovery <span className="text-[#8BA888]">Journey</span>
            </h1>
            <p className="text-[#5F6B63] text-lg max-w-lg leading-relaxed">
              Every step forward is a victory. Track your healing progress, unlock achievements, and celebrate your dedication to wellness.
            </p>
            
            <div className="flex gap-8 mt-8">
              <div className="flex flex-col">
                <span className="text-3xl font-serif text-[#2D6A4F]">{badges.length}</span>
                <span className="text-xs uppercase tracking-wider text-[#8BA888] font-bold mt-1">Badges Earned</span>
              </div>
              <div className="w-px h-12 bg-[#E7D9C9]"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-serif text-[#2D6A4F]">{user?.patient?.streak_count || 0}</span>
                <span className="text-xs uppercase tracking-wider text-[#8BA888] font-bold mt-1">Day Streak</span>
              </div>
            </div>
          </motion.div>

          {/* Progress Ring Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="bg-[#FDFBF7] p-8 rounded-3xl shadow-[0_20px_40px_rgba(45,106,79,0.06)] border border-[#E7D9C9]/50 flex flex-col items-center"
          >
            <div className="relative flex items-center justify-center">
              <ProgressRing radius={70} stroke={8} progress={progressPercent} color="#2D6A4F" />
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-serif font-bold text-[#2A3B2C]">{progressPercent}%</span>
              </div>
            </div>
            <p className="text-[#5F6B63] font-medium mt-6 text-sm">Overall Completion</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-12 mt-16 flex flex-col lg:flex-row gap-16">
        
        {/* Main Timeline Column */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-serif font-bold text-[#2A3B2C]">Milestone Path</h2>
            <span className="text-sm font-medium text-[#8BA888] bg-[#8BA888]/10 px-4 py-1.5 rounded-full">
              {completed} of {total} Complete
            </span>
          </div>

          {milestones.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16 px-6 bg-white rounded-3xl border border-[#E7D9C9] shadow-sm"
            >
              <div className="w-20 h-20 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="text-[#8BA888]" size={32} />
              </div>
              <h3 className="text-xl font-serif text-[#2A3B2C] mb-2">Your journey begins soon</h3>
              <p className="text-[#5F6B63]">Your therapist will assign your first milestones shortly. Rest and prepare!</p>
            </motion.div>
          ) : (
            <div className="relative pl-4 md:pl-8 border-l-2 border-[#E7D9C9]/60 space-y-12">
              {milestones.map((milestone, index) => {
                const Icon = ICONS[milestone.category] || Target;
                const isCompleted = milestone.status === 'completed';
                const isInProgress = milestone.status === 'in_progress';
                const progress = milestone.sub_progress || 0;
                
                let iconBg = 'bg-[#F5F1EA]';
                let iconColor = 'text-[#A0AAB2]';
                if (isCompleted) {
                  iconBg = 'bg-[#2D6A4F]';
                  iconColor = 'text-white';
                } else if (isInProgress) {
                  iconBg = 'bg-[#8BA888]';
                  iconColor = 'text-white';
                }

                return (
                  <motion.div 
                    key={milestone.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Node on timeline */}
                    <div className="absolute -left-[21px] md:-left-[37px] top-6 w-4 h-4 rounded-full bg-[#FDFBF7] border-[3px] border-[#8BA888] z-10 flex items-center justify-center">
                      {isCompleted && <div className="w-2 h-2 bg-[#2D6A4F] rounded-full"></div>}
                      {isInProgress && (
                         <motion.div 
                           className="w-2 h-2 bg-[#8BA888] rounded-full"
                           animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                           transition={{ repeat: Infinity, duration: 2 }}
                         />
                      )}
                    </div>

                    {/* Card */}
                    <motion.div 
                      whileHover={{ y: -4, boxShadow: "0 25px 50px -12px rgba(45,106,79,0.1)" }}
                      className={`bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border transition-all duration-300 ${isCompleted ? 'border-[#8BA888]/30' : 'border-[#E7D9C9]'}`}
                    >
                      <div className="flex items-start gap-4 mb-6">
                        <div className={`p-3 rounded-xl ${iconBg} shadow-sm shrink-0 transition-colors duration-500`}>
                          <Icon size={24} className={iconColor} />
                        </div>
                        <div className="flex-1 pt-1">
                          <h3 className="text-xl font-serif font-bold text-[#2A3B2C] mb-1">{milestone.title}</h3>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-[#8BA888] font-medium capitalize flex items-center gap-1">
                              {isCompleted ? <CheckCircle size={14}/> : <Clock size={14}/>}
                              {milestone.status.replace('_', ' ')}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-[#5F6B63]">Target: {new Date(milestone.target_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {milestone.description && (
                        <p className="text-[#5F6B63] mb-6 leading-relaxed">{milestone.description}</p>
                      )}

                      {/* Animated Progress Bar */}
                      {(!isCompleted) && (
                        <div className="mb-6 bg-[#F5F1EA] p-5 rounded-2xl">
                          <div className="flex justify-between text-sm font-medium mb-3">
                            <span className="text-[#2A3B2C]">Journey Progress</span>
                            <span className="text-[#2D6A4F]">{progress}%</span>
                          </div>
                          <div className="h-2.5 w-full bg-[#E7D9C9] rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${progress}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-[#8BA888] to-[#2D6A4F] rounded-full relative"
                            >
                              <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-shimmer"></div>
                            </motion.div>
                          </div>
                        </div>
                      )}

                      {/* Claim Button */}
                      {isInProgress && progress === 100 && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleComplete(milestone)}
                          className="w-full mb-6 py-3.5 bg-[#2D6A4F] text-white rounded-xl font-medium shadow-[0_8px_20px_rgba(45,106,79,0.2)] hover:bg-[#1B4332] transition-colors"
                        >
                          Claim Achievement
                        </motion.button>
                      )}

                      {/* Therapist Notes Collapsible */}
                      {milestone.therapist_notes && (
                        <div className="border border-[#E7D9C9] rounded-xl overflow-hidden">
                          <button 
                            onClick={() => toggleNotes(milestone.id)}
                            className="w-full flex items-center justify-between p-4 bg-[#FDFBF7] hover:bg-[#F5F1EA] transition-colors text-left"
                          >
                            <span className="flex items-center text-[#5F6B63] font-medium text-sm">
                              <Quote size={16} className="mr-2 text-[#8BA888]" />
                              Therapist Guidance
                            </span>
                            <motion.div
                              animate={{ rotate: expandedNotes[milestone.id] ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown size={18} className="text-[#8BA888]" />
                            </motion.div>
                          </button>
                          
                          <AnimatePresence>
                            {expandedNotes[milestone.id] && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="border-t border-[#E7D9C9]"
                              >
                                <div className="p-5 bg-white">
                                  <p className="text-[#5F6B63] italic font-serif leading-relaxed">
                                    "{milestone.therapist_notes}"
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Badge Earned Display */}
                      {isCompleted && milestone.badge && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 pt-5 border-t border-[#E7D9C9] flex items-center justify-between bg-gradient-to-r from-[#FDFBF7] to-transparent -mx-6 -mb-6 px-6 pb-6 rounded-b-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md border border-white"
                              style={{ backgroundColor: milestone.badge.badge_color || '#8BA888' }}
                            >
                              <Trophy size={18} className="text-white" />
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-[#8BA888] font-bold">Unlocked</p>
                              <p className="text-sm font-bold text-[#2A3B2C]">{milestone.badge.badge_name}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar - Badges Collection */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-8">
            <h2 className="text-2xl font-serif font-bold text-[#2A3B2C] mb-8">Achievements</h2>
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E7D9C9]">
              {badges.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy size={24} className="text-[#E7D9C9]" />
                  </div>
                  <p className="text-sm text-[#5F6B63]">Complete milestones to unlock badges for your collection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {badges.map((badge, idx) => {
                    const Icon = ICONS[badge.badge_icon] || Star;
                    return (
                      <motion.div 
                        key={badge.id} 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex flex-col items-center group relative cursor-pointer"
                      >
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg border-2 border-white"
                          style={{ backgroundColor: badge.badge_color || '#8BA888' }}
                        >
                          <Icon size={20} className="text-white drop-shadow-sm" />
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                          <div className="bg-[#2A3B2C] text-white text-[10px] font-medium py-1 px-2 rounded shadow-xl whitespace-nowrap">
                            {badge.badge_name}
                            {/* Little triangle pointer */}
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-b-4 border-b-[#2A3B2C]"></div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Motivational Quote */}
            <div className="mt-8 bg-[#8BA888] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Quote size={100} />
              </div>
              <p className="font-serif text-lg leading-relaxed relative z-10">
                "Healing is a matter of time, but it is sometimes also a matter of opportunity."
              </p>
              <p className="text-white/80 text-sm mt-4 relative z-10">— Hippocrates</p>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { background-position: 40px 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
      `}} />
    </div>
  );
};

export default Milestones;
