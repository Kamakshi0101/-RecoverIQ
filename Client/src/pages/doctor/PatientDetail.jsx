import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { ArrowLeft, MessageSquare, Dumbbell, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [assignedMilestones, setAssignedMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('feedback');
  const [commentType, setCommentType] = useState('feedback');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    description: '',
    category: 'strength',
    target_reps: '',
    target_duration_minutes: '',
    frequency_per_week: 3,
  });
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    category: 'mobility',
    target_date: '',
  });
  const [submittingExercise, setSubmittingExercise] = useState(false);
  const [submittingMilestone, setSubmittingMilestone] = useState(false);

  const tabs = [
    { id: 'feedback', label: 'Clinical Feedback', icon: MessageSquare },
    { id: 'exercises', label: 'Exercises', icon: Dumbbell },
    { id: 'milestones', label: 'Milestones', icon: Flag }
  ];

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const [patientRes, milestonesRes] = await Promise.all([
          api.get(`/doctor/patients/${id}`),
          api.get(`/doctor/patients/${id}/milestones`),
        ]);
        setPatient(patientRes.data.data);
        setAssignedMilestones(milestonesRes.data.data || []);
      } catch (err) {
        setError('Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/doctor/patients/${id}/comment`, {
        type: commentType,
        comment: commentText,
      });
      setCommentText('');
      const response = await api.get(`/doctor/patients/${id}`);
      setPatient(response.data.data);
    } catch (err) {
      alert('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignExercise = async (e) => {
    e.preventDefault();
    setSubmittingExercise(true);
    try {
      await api.post(`/doctor/patients/${id}/exercises`, {
        ...exerciseForm,
        target_reps: exerciseForm.target_reps || 0,
        target_duration_minutes: exerciseForm.target_duration_minutes || 0,
      });
      setExerciseForm({
        ...exerciseForm,
        name: '',
        description: '',
        target_reps: '',
        target_duration_minutes: '',
      });
      const response = await api.get(`/doctor/patients/${id}`);
      setPatient(response.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign exercise.');
    } finally {
      setSubmittingExercise(false);
    }
  };

  const handleAssignMilestone = async (e) => {
    e.preventDefault();
    setSubmittingMilestone(true);
    try {
      const res = await api.post(`/doctor/patients/${id}/milestones`, milestoneForm);
      setMilestoneForm({
        ...milestoneForm,
        title: '',
        description: '',
        target_date: '',
      });
      setAssignedMilestones((prev) => [res.data.data, ...prev]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign milestone.');
    } finally {
      setSubmittingMilestone(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!patient) return null;

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start gap-6">
        <motion.button
          onClick={() => navigate('/doctor/patients')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 rounded-full bg-[#DCE6D8] text-[#2D6A4F] flex items-center justify-center hover:bg-[#2D6A4F] hover:text-white transition-all flex-shrink-0"
        >
          <ArrowLeft className="h-6 w-6" />
        </motion.button>
        <div>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-[#233127] mb-2">
            {patient.user?.name}
          </h1>
          <p className="text-lg text-[#5F6B63]">
            {patient.user?.email}
          </p>
        </div>
      </motion.div>

      {/* Metrics Section */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center">
          <p className="text-xs text-red-600 font-semibold uppercase mb-2">Current Pain</p>
          <p className="text-4xl font-serif font-bold text-red-600">
            {patient.current_pain_level !== null ? patient.current_pain_level : '—'}
          </p>
          <p className="text-xs text-red-600/70 mt-2">/10</p>
        </div>
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 text-center">
          <p className="text-xs text-blue-600 font-semibold uppercase mb-2">Mobility Score</p>
          <p className="text-4xl font-serif font-bold text-blue-600">
            {patient.mobility_score !== null ? patient.mobility_score : '—'}
          </p>
          <p className="text-xs text-blue-600/70 mt-2">/100</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-6 text-center">
          <p className="text-xs text-yellow-600 font-semibold uppercase mb-2">Energy Level</p>
          <p className="text-4xl font-serif font-bold text-yellow-600">
            {patient.energy_level !== null ? patient.energy_level : '—'}
          </p>
          <p className="text-xs text-yellow-600/70 mt-2">/10</p>
        </div>
        <div className={`rounded-2xl border p-6 text-center ${
          patient.status === 'active'
            ? 'bg-green-50 border-green-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <p className={`text-xs font-semibold uppercase mb-2 ${
            patient.status === 'active' ? 'text-green-600' : 'text-gray-600'
          }`}>Status</p>
          <p className={`text-2xl font-serif font-bold capitalize ${
            patient.status === 'active' ? 'text-green-600' : 'text-gray-600'
          }`}>
            {patient.status}
          </p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-[#E7D9C9]/40 overflow-hidden"
      >
        <div className="flex gap-1 p-2 bg-[#F7F5F1]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-[#2D6A4F] shadow-md shadow-black/5'
                    : 'text-[#5F6B63] hover:text-[#233127]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-serif font-semibold text-[#233127] mb-6">
                    Send Clinical Feedback
                  </h3>
                  <form onSubmit={handleSubmitFeedback} className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-[#233127]">Feedback Type</label>
                      <select
                        value={commentType}
                        onChange={(e) => setCommentType(e.target.value)}
                        className="w-full rounded-2xl border border-[#E7D9C9]/50 bg-white px-4 py-3 text-[#233127] transition-all focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/10"
                      >
                        <option value="feedback">General Feedback</option>
                        <option value="encouragement">Encouragement</option>
                        <option value="warning">Warning / Alert</option>
                      </select>
                    </div>
                    <div>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows="6"
                        className="w-full rounded-2xl border border-[#E7D9C9]/50 bg-white px-4 py-3 text-[#233127] placeholder-[#5F6B63] transition-all focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/10"
                        placeholder="Share your clinical observations, encouragement, or adjustments to the treatment plan..."
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || !commentText.trim()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary px-8 py-3.5 font-semibold disabled:opacity-70"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Feedback'}
                    </motion.button>
                  </form>
                </div>

                {/* Comments History */}
                <div className="mt-8 pt-8 border-t border-[#E7D9C9]/40">
                  <h4 className="text-xl font-serif font-semibold text-[#233127] mb-6">
                    Feedback History
                  </h4>
                  {patient.comments && patient.comments.length > 0 ? (
                    <div className="space-y-4">
                      {patient.comments.map((comment) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-[#F7F5F1] rounded-xl p-6 border border-[#E7D9C9]/40"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <p className="font-semibold text-[#233127]">
                              {comment.doctor?.user?.name || 'Dr. Unknown'}
                            </p>
                            <p className="text-xs text-[#5F6B63]">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-[#5F6B63] leading-relaxed">
                            {comment.comment}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#5F6B63] text-center py-8">
                      No feedback yet. Start by sharing your clinical observations.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Exercises Tab */}
            {activeTab === 'exercises' && (
              <motion.div
                key="exercises"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-semibold text-[#233127]">
                    Assign Exercise
                  </h3>
                  <form onSubmit={handleAssignExercise} className="space-y-4">
                    <input
                      type="text"
                      required
                      value={exerciseForm.name}
                      onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                      className="w-full rounded-2xl border border-[#E7D9C9]/50 bg-white px-4 py-3 text-[#233127] placeholder-[#5F6B63] transition-all focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/10"
                      placeholder="Exercise name"
                    />
                    <select
                      value={exerciseForm.category}
                      onChange={(e) => setExerciseForm({ ...exerciseForm, category: e.target.value })}
                      className="w-full rounded-2xl border border-[#E7D9C9]/50 bg-white px-4 py-3 text-[#233127] transition-all focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/10"
                    >
                      <option value="strength">Strength</option>
                      <option value="mobility">Mobility</option>
                      <option value="cardio">Cardio</option>
                      <option value="balance">Balance</option>
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        min="0"
                        value={exerciseForm.target_reps}
                        onChange={(e) => setExerciseForm({ ...exerciseForm, target_reps: e.target.value })}
                        className="w-full rounded-2xl border border-[#E7D9C9]/50 bg-white px-4 py-3 text-[#233127] placeholder-[#5F6B63] transition-all focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/10"
                        placeholder="Target reps"
                      />
                      <input
                        type="number"
                        min="0"
                        value={exerciseForm.target_duration_minutes}
                        onChange={(e) => setExerciseForm({ ...exerciseForm, target_duration_minutes: e.target.value })}
                        className="w-full rounded-2xl border border-[#E7D9C9]/50 bg-white px-4 py-3 text-[#233127] placeholder-[#5F6B63] transition-all focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/10"
                        placeholder="Duration (min)"
                      />
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={exerciseForm.frequency_per_week}
                      onChange={(e) => setExerciseForm({ ...exerciseForm, frequency_per_week: e.target.value })}
                      className="w-full rounded-2xl border border-[#E7D9C9]/50 bg-white px-4 py-3 text-[#233127] placeholder-[#5F6B63] transition-all focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/10"
                      placeholder="Frequency (days/week)"
                    />
                    <textarea
                      rows="3"
                      value={exerciseForm.description}
                      onChange={(e) => setExerciseForm({ ...exerciseForm, description: e.target.value })}
                      className="w-full rounded-2xl border border-[#E7D9C9]/50 bg-white px-4 py-3 text-[#233127] placeholder-[#5F6B63] transition-all focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/10"
                      placeholder="Instructions for the patient"
                    />
                    <motion.button
                      type="submit"
                      disabled={submittingExercise}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary px-8 py-3.5 font-semibold disabled:opacity-70"
                    >
                      {submittingExercise ? 'Assigning...' : 'Assign Exercise'}
                    </motion.button>
                  </form>
                </div>

                <h3 className="text-2xl font-serif font-semibold text-[#233127]">
                  Assigned Exercises
                </h3>
                {patient.exercises && patient.exercises.length > 0 ? (
                  <div className="grid gap-4">
                    {patient.exercises.map((exercise) => (
                      <motion.div
                        key={exercise.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-[#E7D9C9]/40 p-6 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-serif font-semibold text-[#233127] mb-2">
                              {exercise.name}
                            </h4>
                            {exercise.description && (
                              <p className="text-sm text-[#5F6B63] mb-3">
                                {exercise.description}
                              </p>
                            )}
                            <div className="flex gap-4 text-sm text-[#5F6B63]">
                              {exercise.target_reps && (
                                <span>Reps: <strong>{exercise.target_reps}</strong></span>
                              )}
                              {exercise.target_duration_minutes && (
                                <span>Duration: <strong>{exercise.target_duration_minutes} min</strong></span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs px-3 py-1.5 rounded-full font-semibold uppercase bg-green-100 text-green-700">
                            Active
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#5F6B63] text-center py-8">
                    No exercises assigned yet. Visit the patient's dashboard to add exercises.
                  </p>
                )}
              </motion.div>
            )}

            {/* Milestones Tab */}
            {activeTab === 'milestones' && (
              <motion.div
                key="milestones"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-semibold text-[#233127]">
                    Set Milestone
                  </h3>
                  <form onSubmit={handleAssignMilestone} className="space-y-4">
                    <input
                      type="text"
                      required
                      value={milestoneForm.title}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                      className="w-full rounded-2xl border border-[#E7D9C9]/50 bg-white px-4 py-3 text-[#233127] placeholder-[#5F6B63] transition-all focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/10"
                      placeholder="Milestone title"
                    />
                    <select
                      value={milestoneForm.category}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, category: e.target.value })}
                      className="w-full rounded-2xl border border-[#E7D9C9]/50 bg-white px-4 py-3 text-[#233127] transition-all focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/10"
                    >
                      <option value="mobility">Mobility</option>
                      <option value="strength">Strength</option>
                      <option value="daily_task">Daily Task</option>
                    </select>
                    <input
                      type="date"
                      required
                      value={milestoneForm.target_date}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, target_date: e.target.value })}
                      className="w-full rounded-2xl border border-[#E7D9C9]/50 bg-white px-4 py-3 text-[#233127] transition-all focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/10"
                    />
                    <textarea
                      rows="3"
                      value={milestoneForm.description}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                      className="w-full rounded-2xl border border-[#E7D9C9]/50 bg-white px-4 py-3 text-[#233127] placeholder-[#5F6B63] transition-all focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/10"
                      placeholder="What needs to be achieved"
                    />
                    <motion.button
                      type="submit"
                      disabled={submittingMilestone}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary px-8 py-3.5 font-semibold disabled:opacity-70"
                    >
                      {submittingMilestone ? 'Setting...' : 'Set Milestone'}
                    </motion.button>
                  </form>
                </div>

                <h3 className="text-2xl font-serif font-semibold text-[#233127]">
                  Recovery Milestones
                </h3>
                {assignedMilestones.length > 0 ? (
                  <div className="grid gap-4">
                    {assignedMilestones.map((milestone) => (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-[#E7D9C9]/40 p-6 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-serif font-semibold text-[#233127] mb-2">
                              {milestone.title}
                            </h4>
                            {milestone.description && (
                              <p className="text-sm text-[#5F6B63] mb-3">
                                {milestone.description}
                              </p>
                            )}
                            <p className="text-sm text-[#5F6B63]">
                              Target: {new Date(milestone.target_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold uppercase ${
                            milestone.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {milestone.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#5F6B63] text-center py-8">
                    No milestones set yet. Visit the patient's dashboard to create milestones.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
