import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { Dumbbell, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
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

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingId, setCompletingId] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await api.get('/patient/exercises');
        setExercises(response.data.data);
      } catch (err) {
        setError('Failed to load exercises');
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  const handleLogExercise = async (exercise) => {
    if (!window.confirm(`Ready to complete ${exercise.name}?`)) return;
    
    setCompletingId(exercise.id);
    try {
      await api.post(`/patient/exercises/${exercise.id}/log`, {
        actual_reps: exercise.target_reps || 0,
        actual_duration_minutes: exercise.target_duration_minutes || 0,
        difficulty_rating: 3,
        notes: 'Logged via quick action'
      });
      alert('Exercise logged successfully!');
    } catch (err) {
      alert('Failed to log exercise.');
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  const categoryColors = {
    strength: { bg: 'from-red-50 to-red-100/50', border: 'border-red-200', label: 'bg-red-100 text-red-700' },
    mobility: { bg: 'from-blue-50 to-blue-100/50', border: 'border-blue-200', label: 'bg-blue-100 text-blue-700' },
    cardio: { bg: 'from-green-50 to-green-100/50', border: 'border-green-200', label: 'bg-green-100 text-green-700' },
    balance: { bg: 'from-purple-50 to-purple-100/50', border: 'border-purple-200', label: 'bg-purple-100 text-purple-700' }
  };

  return (
    <motion.div
      className="space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-12">
        <h1 className="text-5xl lg:text-6xl font-serif font-bold text-[#233127] mb-4">
          Your Exercises
        </h1>
        <p className="text-lg text-[#5F6B63] max-w-2xl">
          Complete your assigned exercises daily. Each repetition is progress.
        </p>
      </motion.div>

      {/* Empty State */}
      {exercises.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl border-2 border-dashed border-[#E7D9C9] p-16 text-center"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#DCE6D8] text-[#2D6A4F] mb-6">
            <Dumbbell className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-serif font-semibold text-[#233127] mb-2">
            No exercises yet
          </h3>
          <p className="text-[#5F6B63]">
            Your healthcare provider will assign exercises as part of your recovery plan.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {exercises.map((exercise, index) => {
            const colors = categoryColors[exercise.category] || categoryColors.strength;
            return (
              <motion.div
                key={exercise.id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-2xl p-8 transition-all hover:shadow-lg hover:shadow-black/10`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full w-fit ${colors.label} mb-3`}>
                      {exercise.category}
                    </p>
                    <h3 className="text-2xl font-serif font-semibold text-[#233127]">
                      {exercise.name}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                {exercise.description && (
                  <p className="text-[#5F6B63] text-sm mb-6 leading-relaxed">
                    {exercise.description}
                  </p>
                )}

                {/* Metrics */}
                <div className="space-y-3 mb-8 bg-white/50 rounded-xl p-4">
                  {exercise.target_reps && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#5F6B63]">Target Reps</span>
                      <span className="font-serif font-bold text-lg text-[#233127]">
                        {exercise.target_reps}
                      </span>
                    </div>
                  )}
                  {exercise.target_duration_minutes && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#5F6B63] flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Duration
                      </span>
                      <span className="font-serif font-bold text-lg text-[#233127]">
                        {exercise.target_duration_minutes} min
                      </span>
                    </div>
                  )}
                  {exercise.frequency_per_week && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#5F6B63]">Per Week</span>
                      <span className="font-serif font-bold text-lg text-[#233127]">
                        {exercise.frequency_per_week}x
                      </span>
                    </div>
                  )}
                </div>

                {/* Log Button */}
                <motion.button
                  onClick={() => handleLogExercise(exercise)}
                  disabled={completingId === exercise.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full flex items-center justify-center gap-2 font-semibold disabled:opacity-70"
                >
                  {completingId === exercise.id ? (
                    <>
                      <RotateCcw className="h-5 w-5 animate-spin" />
                      Logging...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Log Completion
                    </>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
