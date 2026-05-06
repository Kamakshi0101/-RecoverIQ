import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { Users, Activity, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/doctor/dashboard');
        setData(response.data.data);
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
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your clinic's performance.</p>
        </div>
        <button 
          onClick={() => navigate('/doctor/patients')}
          className="btn-primary"
        >
          View All Patients
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={data.total_patients}
          icon={<Users className="h-6 w-6" />}
          color="indigo"
        />
        <StatCard
          title="Active Today"
          value={data.active_today}
          subtitle="Patients logged in"
          icon={<Zap className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Avg Pain Level"
          value={`${data.avg_pain}/10`}
          icon={<Activity className="h-6 w-6" />}
          color="red"
        />
        <StatCard
          title="Avg Mobility"
          value={`${data.avg_mobility}/100`}
          icon={<Target className="h-6 w-6" />}
          color="blue"
        />
      </div>

      <div className="mt-8 card p-8 text-center text-gray-500 dark:text-gray-400">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p>Select "View All Patients" or use the sidebar to manage individual patient records, assign exercises, and leave feedback.</p>
      </div>
    </div>
  );
}
