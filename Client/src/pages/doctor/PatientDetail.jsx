import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import PainChart from '../../components/PainChart';
import MobilityChart from '../../components/MobilityChart';
import { User, Download, Send, Dumbbell, Target, MessageSquare } from 'lucide-react';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [progress, setProgress] = useState([]);
  const [assignedMilestones, setAssignedMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tabs State
  const [activeTab, setActiveTab] = useState('feedback');

  // Feedback Form State
  const [commentType, setCommentType] = useState('feedback');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Exercise Form State
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    description: '',
    category: 'strength',
    target_reps: '',
    target_duration_minutes: '',
    frequency_per_week: 3
  });
  const [submittingExercise, setSubmittingExercise] = useState(false);

  // Milestone Form State
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    category: 'mobility',
    target_date: ''
  });
  const [submittingMilestone, setSubmittingMilestone] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, progressRes, milestonesRes] = await Promise.all([
          api.get(`/doctor/patients/${id}`),
          api.get(`/doctor/patients/${id}/progress`),
          api.get(`/doctor/patients/${id}/milestones`)
        ]);
        setPatient(patientRes.data.data);
        // Transform paginated progress into array suitable for charts
        setProgress(progressRes.data.data.data.reverse()); // chronological order for charts
        setAssignedMilestones(milestonesRes.data.data);
      } catch (err) {
        setError('Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    try {
      await api.post(`/doctor/patients/${id}/comment`, {
        type: commentType,
        comment: commentText
      });
      setCommentText('');
      alert('Feedback sent successfully.');
    } catch (err) {
      alert('Failed to send feedback.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAssignExercise = async (e) => {
    e.preventDefault();
    setSubmittingExercise(true);
    try {
      await api.post(`/doctor/patients/${id}/exercises`, exerciseForm);
      setExerciseForm({ ...exerciseForm, name: '', description: '', target_reps: '', target_duration_minutes: '' });
      alert('Exercise assigned successfully.');
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
      setAssignedMilestones([...assignedMilestones, res.data.data]);
      setMilestoneForm({ ...milestoneForm, title: '', description: '', target_date: '' });
      alert('Milestone assigned successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign milestone.');
    } finally {
      setSubmittingMilestone(false);
    }
  };

  const handleCompleteMilestone = async (milestoneId) => {
    try {
      await api.put(`/doctor/milestones/${milestoneId}`, { status: 'completed' });
      setAssignedMilestones(assignedMilestones.map(m => 
        m.id === milestoneId ? { ...m, status: 'completed', completed_at: new Date().toISOString() } : m
      ));
    } catch (err) {
      alert('Failed to complete milestone.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!patient) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <button 
        onClick={() => navigate('/doctor/patients')}
        className="text-indigo-600 dark:text-indigo-400 hover:underline mb-2 inline-block text-sm font-medium"
      >
        &larr; Back to Patients
      </button>

      {/* Header */}
      <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-indigo-500">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.user?.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">{patient.user?.email} • {patient.injury_type}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="btn-primary flex items-center gap-2 bg-gray-800 hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white text-white">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Pain Progression</h3>
            <PainChart data={progress} />
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Mobility Progression</h3>
            <MobilityChart data={progress} />
          </div>
        </div>

        {/* Actions Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card sticky top-24 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button 
                onClick={() => setActiveTab('feedback')}
                className={`flex-1 py-3 px-2 text-sm font-medium text-center flex items-center justify-center gap-2 ${activeTab === 'feedback' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                <MessageSquare className="h-4 w-4" /> Message
              </button>
              <button 
                onClick={() => setActiveTab('exercise')}
                className={`flex-1 py-3 px-2 text-sm font-medium text-center flex items-center justify-center gap-2 ${activeTab === 'exercise' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                <Dumbbell className="h-4 w-4" /> Exercise
              </button>
              <button 
                onClick={() => setActiveTab('milestone')}
                className={`flex-1 py-3 px-2 text-sm font-medium text-center flex items-center justify-center gap-2 ${activeTab === 'milestone' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                <Target className="h-4 w-4" /> Milestone
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {activeTab === 'feedback' && (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Send Feedback</h3>
                  <form onSubmit={handleAddComment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Feedback Type</label>
                      <select 
                        value={commentType}
                        onChange={(e) => setCommentType(e.target.value)}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="feedback">General Feedback</option>
                        <option value="encouragement">Encouragement</option>
                        <option value="warning">Warning / Alert</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                      <textarea 
                        rows="4"
                        required
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Leave a note for the patient..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="w-full btn-primary flex justify-center items-center gap-2"
                    >
                      <Send className="h-4 w-4" /> {submittingComment ? 'Sending...' : 'Send to Patient'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'exercise' && (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assign Exercise</h3>
                  <form onSubmit={handleAssignExercise} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exercise Name</label>
                      <input 
                        type="text" required
                        value={exerciseForm.name} onChange={e => setExerciseForm({...exerciseForm, name: e.target.value})}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="e.g. Wall Squats"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                      <select 
                        value={exerciseForm.category} onChange={e => setExerciseForm({...exerciseForm, category: e.target.value})}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="strength">Strength</option>
                        <option value="mobility">Mobility</option>
                        <option value="cardio">Cardio</option>
                        <option value="balance">Balance</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Reps</label>
                        <input 
                          type="number" min="0"
                          value={exerciseForm.target_reps} onChange={e => setExerciseForm({...exerciseForm, target_reps: e.target.value})}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="e.g. 15"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (min)</label>
                        <input 
                          type="number" min="0"
                          value={exerciseForm.target_duration_minutes} onChange={e => setExerciseForm({...exerciseForm, target_duration_minutes: e.target.value})}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="e.g. 10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency (days/week)</label>
                      <input 
                        type="number" min="1" max="7" required
                        value={exerciseForm.frequency_per_week} onChange={e => setExerciseForm({...exerciseForm, frequency_per_week: e.target.value})}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea 
                        rows="2"
                        value={exerciseForm.description} onChange={e => setExerciseForm({...exerciseForm, description: e.target.value})}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Instructions for the patient..."
                      ></textarea>
                    </div>

                    <button type="submit" disabled={submittingExercise} className="w-full btn-primary flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                      <Dumbbell className="h-4 w-4" /> {submittingExercise ? 'Assigning...' : 'Assign Exercise'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'milestone' && (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Set Milestone</h3>
                  <form onSubmit={handleAssignMilestone} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Milestone Title</label>
                      <input 
                        type="text" required
                        value={milestoneForm.title} onChange={e => setMilestoneForm({...milestoneForm, title: e.target.value})}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="e.g. Walk without crutches"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                      <select 
                        value={milestoneForm.category} onChange={e => setMilestoneForm({...milestoneForm, category: e.target.value})}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="mobility">Mobility</option>
                        <option value="strength">Strength</option>
                        <option value="daily_task">Daily Task</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date</label>
                      <input 
                        type="date" required
                        value={milestoneForm.target_date} onChange={e => setMilestoneForm({...milestoneForm, target_date: e.target.value})}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea 
                        rows="3"
                        value={milestoneForm.description} onChange={e => setMilestoneForm({...milestoneForm, description: e.target.value})}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="What needs to be achieved..."
                      ></textarea>
                    </div>

                    <button type="submit" disabled={submittingMilestone} className="w-full btn-primary flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                      <Target className="h-4 w-4" /> {submittingMilestone ? 'Setting...' : 'Set Milestone'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Milestones Section */}
      <div className="card p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assigned Milestones</h3>
        {assignedMilestones.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4 border-dashed border-2 rounded-lg border-gray-300 dark:border-gray-700">
            No milestones assigned to this patient yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedMilestones.map(milestone => (
              <div key={milestone.id} className={`p-4 rounded-lg border ${milestone.status === 'completed' ? 'bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/20' : 'bg-white dark:bg-[#0f1117] border-gray-200 dark:border-gray-700'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${milestone.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'}`}>
                    {milestone.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Target: {new Date(milestone.target_date).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{milestone.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{milestone.description}</p>
                
                {milestone.status !== 'completed' && (
                  <button 
                    onClick={() => handleCompleteMilestone(milestone.id)}
                    className="w-full text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded py-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
                {milestone.status === 'completed' && milestone.completed_at && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 text-center">
                    Completed on {new Date(milestone.completed_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
