import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import PainChart from '../../components/PainChart';
import MobilityChart from '../../components/MobilityChart';
import { User, Download, Send } from 'lucide-react';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Feedback Form State
  const [commentType, setCommentType] = useState('feedback');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, progressRes] = await Promise.all([
          api.get(`/doctor/patients/${id}`),
          api.get(`/doctor/patients/${id}/progress`)
        ]);
        setPatient(patientRes.data.data);
        // Transform paginated progress into array suitable for charts
        setProgress(progressRes.data.data.data.reverse()); // chronological order for charts
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

        {/* Feedback Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 sticky top-24">
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
        </div>
      </div>
    </div>
  );
}
