import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import PremiumStatCard from '../../components/PremiumStatCard';
import PainChart from '../../components/PainChart';
import MobilityChart from '../../components/MobilityChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { Activity, TrendingUp, Flame, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, feedbackRes] = await Promise.all([
          api.get('/patient/dashboard'),
          api.get('/patient/feedback')
        ]);
        setData(dashboardRes.data.data);
        setFeedback(feedbackRes.data.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!data) return null;

  return (
    <motion.div
      className="space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="mb-12">
        <h1 className="text-5xl lg:text-6xl font-serif font-bold text-[#233127] mb-4 leading-tight">
          Your Recovery Dashboard
        </h1>
        <p className="text-lg text-[#5F6B63] max-w-2xl leading-relaxed">
          Track your progress with precision. Each metric tells your healing story.
        </p>
      </motion.div>

      {/* Feedback Alerts */}
      {feedback && feedback.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4">
          {feedback.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`rounded-2xl border p-6 flex items-start gap-4 ${
                item.type === 'warning'
                  ? 'bg-red-50 border-red-100'
                  : item.type === 'success'
                  ? 'bg-green-50 border-green-100'
                  : 'bg-blue-50 border-blue-100'
              }`}
            >
              <div className={`flex-shrink-0 mt-1 ${
                item.type === 'warning'
                  ? 'text-red-600'
                  : item.type === 'success'
                  ? 'text-green-600'
                  : 'text-blue-600'
              }`}>
                {item.type === 'warning' ? (
                  <AlertCircle className="h-6 w-6" />
                ) : (
                  <CheckCircle className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className={`font-semibold text-sm ${
                  item.type === 'warning'
                    ? 'text-red-900'
                    : item.type === 'success'
                    ? 'text-green-900'
                    : 'text-blue-900'
                }`}>
                  {item.message}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <PremiumStatCard
          title="Current Pain"
          value={`${data.stats.current_pain_level}/10`}
          subtitle="Lower is better"
          icon={<Activity className="h-8 w-8" />}
          color="primary"
          trend={
            data.stats.current_pain_level < 5
              ? { type: 'down', value: 'improving' }
              : { type: 'up', value: 'monitor' }
          }
        />
        <PremiumStatCard
          title="Mobility"
          value={`${data.stats.mobility_score}/100`}
          subtitle="Higher is better"
          icon={<TrendingUp className="h-8 w-8" />}
          color="lavender"
        />
        <PremiumStatCard
          title="Streak"
          value={`${data.stats.streak_count}d`}
          subtitle="Keep going!"
          icon={<Flame className="h-8 w-8" />}
          color="beige"
        />
        <PremiumStatCard
          title="Today's Exercises"
          value={data.stats.exercises_today}
          subtitle="Active assigned"
          icon={<Zap className="h-8 w-8" />}
          color="soft"
        />
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pain Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl border border-[#E7D9C9]/40 p-8 shadow-md shadow-black/5"
        >
          <h3 className="text-2xl font-serif font-semibold text-[#233127] mb-8">
            Pain Trend
          </h3>
          <div className="h-80">
            <PainChart data={data.pain_trend} />
          </div>
          <p className="text-sm text-[#5F6B63] mt-6 text-center">
            Last 14 days • Track patterns to optimize your treatment
          </p>
        </motion.div>

        {/* Mobility Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl border border-[#E7D9C9]/40 p-8 shadow-md shadow-black/5"
        >
          <h3 className="text-2xl font-serif font-semibold text-[#233127] mb-8">
            Mobility Progress
          </h3>
          <div className="h-80">
            <MobilityChart data={data.mobility_trend} />
          </div>
          <p className="text-sm text-[#5F6B63] mt-6 text-center">
            Increasing range and flexibility • Celebrate small wins
          </p>
        </motion.div>
      </motion.div>

      {/* Recent Comments Section */}
      {data.recent_comments && data.recent_comments.length > 0 && (
        <motion.div variants={itemVariants} className="mt-12">
          <h3 className="text-2xl font-serif font-semibold text-[#233127] mb-8">
            Messages from Your Doctor
          </h3>
          <div className="space-y-4">
            {data.recent_comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + 0.1 * index }}
                className="bg-white rounded-2xl border border-[#E7D9C9]/40 p-6 hover:shadow-md hover:shadow-black/5 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[#233127]">{comment.doctor?.name || 'Your Doctor'}</p>
                    <p className="text-xs text-[#5F6B63] mt-1">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    comment.type === 'encouragement'
                      ? 'bg-green-100 text-green-700'
                      : comment.type === 'warning'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {comment.type}
                  </span>
                </div>
                <p className="text-[#5F6B63] leading-relaxed">{comment.comment}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
