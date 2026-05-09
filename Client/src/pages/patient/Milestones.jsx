import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { Flag, CheckCircle2, Calendar, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function Milestones() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await api.get('/patient/milestones');
        setMilestones(response.data.data);
      } catch (err) {
        setError('Failed to load milestones');
      } finally {
        setLoading(false);
      }
    };
    fetchMilestones();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  const activeMilestones = milestones.filter(m => m.status !== 'completed');
  const completedMilestones = milestones.filter(m => m.status === 'completed');

  const categoryIcons = {
    mobility: <Target className="h-6 w-6" />,
    strength: <Flag className="h-6 w-6" />,
    daily_task: <CheckCircle2 className="h-6 w-6" />
  };

  return (
    <motion.div
      className="space-y-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-12">
        <h1 className="text-5xl lg:text-6xl font-serif font-bold text-[#233127] mb-4">
          Your Milestones
        </h1>
        <p className="text-lg text-[#5F6B63] max-w-2xl">
          Major recovery goals set by your healthcare team. Each milestone celebrates your progress.
        </p>
      </motion.div>

      {/* Active Milestones */}
      {activeMilestones.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-8">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-[#233127] mb-8">
              In Progress
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeMilestones.map((milestone, index) => {
                const daysLeft = Math.ceil(
                  (new Date(milestone.target_date) - new Date()) / (1000 * 60 * 60 * 24)
                );
                const isUrgent = daysLeft <= 14;

                return (
                  <motion.div
                    key={milestone.id}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    className={`rounded-3xl border p-8 transition-all hover:shadow-lg hover:shadow-black/10 ${
                      isUrgent
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-white border-[#E7D9C9]/40'
                    }`}
                  >
                    {/* Category & Status */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isUrgent
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-[#DCE6D8] text-[#2D6A4F]'
                      }`}>
                        {categoryIcons[milestone.category] || <Flag className="h-6 w-6" />}
                      </div>
                      <span className="text-xs px-3 py-1.5 rounded-full font-semibold uppercase tracking-wide bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-serif font-semibold text-[#233127] mb-3">
                      {milestone.title}
                    </h3>

                    {/* Description */}
                    {milestone.description && (
                      <p className="text-[#5F6B63] mb-6 leading-relaxed">
                        {milestone.description}
                      </p>
                    )}

                    {/* Target Date */}
                    <div className="bg-white/50 rounded-xl p-4 flex items-center gap-3 mb-6">
                      <Calendar className="h-5 w-5 text-[#5F6B63]" />
                      <div>
                        <p className="text-xs text-[#5F6B63] uppercase tracking-wide">Target Date</p>
                        <p className="font-serif font-semibold text-[#233127]">
                          {new Date(milestone.target_date).toLocaleDateString()}
                        </p>
                      </div>
                      {daysLeft > 0 && (
                        <div className={`ml-auto text-right ${isUrgent ? 'text-orange-600' : 'text-[#2D6A4F]'}`}>
                          <p className="text-xs font-semibold uppercase">{daysLeft}d left</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Completed Milestones */}
      {completedMilestones.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-8">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-[#233127] mb-8">
              Completed
            </h2>
            <div className="space-y-4">
              {completedMilestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  variants={itemVariants}
                  className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-2xl border border-green-200 p-6 flex items-start justify-between group hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-serif font-semibold text-[#233127] mb-1">
                        {milestone.title}
                      </h4>
                      <p className="text-sm text-green-700">
                        Completed on {new Date(milestone.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {activeMilestones.length === 0 && completedMilestones.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl border-2 border-dashed border-[#E7D9C9] p-16 text-center"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#DCE6D8] text-[#2D6A4F] mb-6">
            <Flag className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-serif font-semibold text-[#233127] mb-2">
            No milestones yet
          </h3>
          <p className="text-[#5F6B63]">
            Your healthcare provider will set milestones for your recovery journey.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
