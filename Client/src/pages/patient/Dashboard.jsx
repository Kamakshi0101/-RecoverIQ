import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import PainChart from '../../components/PainChart';
import MobilityChart from '../../components/MobilityChart';
import FeedbackBanner from '../../components/FeedbackBanner';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { Activity, Target, Zap, Flame } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here is a summary of your recovery progress.</p>
      </div>

      {feedback.map((item, index) => (
        <FeedbackBanner key={index} feedback={item} />
      ))}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Pain Level"
          value={`${data.stats.current_pain_level}/10`}
          subtitle="Lower is better"
          icon={<Activity className="h-6 w-6" />}
          color="red"
        />
        <StatCard
          title="Mobility Score"
          value={`${data.stats.mobility_score}/100`}
          subtitle="Higher is better"
          icon={<Target className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Current Streak"
          value={`${data.stats.streak_count} Days`}
          subtitle="Keep it up!"
          icon={<Flame className="h-6 w-6" />}
          color="orange"
        />
        <StatCard
          title="Exercises Today"
          value={data.stats.exercises_today}
          subtitle="Assigned active"
          icon={<Zap className="h-6 w-6" />}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Pain Trend (Last 14 Days)</h3>
          <PainChart data={data.pain_trend} />
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Mobility Progress</h3>
          <MobilityChart data={data.mobility_trend} />
        </div>
      </div>
    </div>
  );
}
