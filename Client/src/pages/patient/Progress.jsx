import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { format, parseISO } from 'date-fns';
import { Activity, Heart, Zap, MessageCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Progress() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pain_level: 5,
    mobility_score: 50,
    energy_level: 5,
    notes: ''
  });

  const fetchLogs = async () => {
    try {
      const response = await api.get('/patient/progress');
      setLogs(response.data.data.data);
    } catch (err) {
      setError('Failed to load progress logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/patient/progress', formData);
      setFormData({ pain_level: 5, mobility_score: 50, energy_level: 5, notes: '' });
      fetchLogs();
    } catch (err) {
      alert('Failed to log progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <motion.div
      className="space-y-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-12">
        <h1 className="text-5xl lg:text-6xl font-serif font-bold text-[#233127] mb-4">
          Daily Progress Log
        </h1>
        <p className="text-lg text-[#5F6B63] max-w-2xl">
          Track your daily metrics. Consistency is key to recovery.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-3xl border border-[#E7D9C9]/40 p-8 shadow-md shadow-black/5 sticky top-32">
            <h2 className="text-2xl font-serif font-semibold text-[#233127] mb-8">
              Log Today
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pain Level */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold text-[#233127] flex items-center gap-2">
                    <Activity className="h-4 w-4 text-red-500" />
                    Pain Level
                  </label>
                  <span className="text-2xl font-serif font-bold text-red-600">
                    {formData.pain_level}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.pain_level}
                  onChange={(e) => setFormData({...formData, pain_level: parseInt(e.target.value)})}
                  className="w-full h-2 bg-red-100 rounded-full appearance-none cursor-pointer accent-red-500"
                />
                <p className="text-xs text-[#5F6B63] mt-2">Scale: 1 (none) to 10 (severe)</p>
              </div>

              {/* Mobility Score */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold text-[#233127] flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                    Mobility
                  </label>
                  <span className="text-2xl font-serif font-bold text-blue-600">
                    {formData.mobility_score}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.mobility_score}
                  onChange={(e) => setFormData({...formData, mobility_score: parseInt(e.target.value)})}
                  className="w-full h-2 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-xs text-[#5F6B63] mt-2">Range: 0 (limited) to 100 (full)</p>
              </div>

              {/* Energy Level */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold text-[#233127] flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Energy
                  </label>
                  <span className="text-2xl font-serif font-bold text-yellow-600">
                    {formData.energy_level}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.energy_level}
                  onChange={(e) => setFormData({...formData, energy_level: parseInt(e.target.value)})}
                  className="w-full h-2 bg-yellow-100 rounded-full appearance-none cursor-pointer accent-yellow-500"
                />
                <p className="text-xs text-[#5F6B63] mt-2">Scale: 1 (exhausted) to 10 (energized)</p>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold text-[#233127] flex items-center gap-2 mb-3">
                  <MessageCircle className="h-4 w-4 text-[#2D6A4F]" />
                  Notes
                </label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full rounded-2xl border border-[#E7D9C9]/50 bg-white px-4 py-3 text-[#233127] placeholder-[#5F6B63] transition-all focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/10"
                  placeholder="How are you feeling? Any observations?"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-semibold disabled:opacity-70"
              >
                {isSubmitting ? 'Saving...' : 'Save Progress'}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* History Section */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-[#233127]">
              Your History
            </h2>
            <p className="text-[#5F6B63] mt-2">
              Review your progress over time
            </p>
          </div>

          <div className="space-y-4">
            {logs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-[#E7D9C9]/50 p-12 text-center">
                <p className="text-[#5F6B63]">No progress logs yet. Start by logging today!</p>
              </div>
            ) : (
              logs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-2xl border border-[#E7D9C9]/40 p-6 hover:shadow-md hover:shadow-black/5 transition-all"
                >
                  {/* Date Header */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-[#5F6B63] uppercase tracking-wide">
                      {format(parseISO(log.logged_at), 'MMMM dd, yyyy')}
                    </p>
                    <p className="text-xs text-[#5F6B63]">
                      {format(parseISO(log.logged_at), 'h:mm a')}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                      <p className="text-xs text-red-600 font-semibold uppercase">Pain</p>
                      <p className="text-2xl font-serif font-bold text-red-600 mt-1">
                        {log.pain_level}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                      <p className="text-xs text-blue-600 font-semibold uppercase">Mobility</p>
                      <p className="text-2xl font-serif font-bold text-blue-600 mt-1">
                        {log.mobility_score}
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100">
                      <p className="text-xs text-yellow-600 font-semibold uppercase">Energy</p>
                      <p className="text-2xl font-serif font-bold text-yellow-600 mt-1">
                        {log.energy_level}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {log.notes && (
                    <p className="text-sm text-[#5F6B63] bg-[#F5F1EA] p-4 rounded-xl italic border-l-4 border-[#2D6A4F]">
                      "{log.notes}"
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
