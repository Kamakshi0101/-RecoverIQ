import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import PremiumStatCard from '../../components/PremiumStatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { Users, Activity, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    <motion.div
      className="space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl lg:text-6xl font-serif font-bold text-[#233127] mb-4 leading-tight">
            Clinical Dashboard
          </h1>
          <p className="text-lg text-[#5F6B63] max-w-2xl leading-relaxed">
            Overview of your patient cohort and clinic performance metrics.
          </p>
        </div>
        <motion.button
          onClick={() => navigate('/doctor/patients')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary px-8 py-4 flex items-center gap-2 whitespace-nowrap font-semibold"
        >
          Manage Patients
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <PremiumStatCard
          title="Total Patients"
          value={data.total_patients}
          icon={<Users className="h-8 w-8" />}
          color="primary"
        />
        <PremiumStatCard
          title="Active Today"
          value={data.active_today}
          subtitle="Logged in"
          icon={<Zap className="h-8 w-8" />}
          color="lavender"
        />
        <PremiumStatCard
          title="Avg Pain Level"
          value={`${data.avg_pain}/10`}
          icon={<Activity className="h-8 w-8" />}
          color="beige"
        />
        <PremiumStatCard
          title="Avg Mobility"
          value={`${data.avg_mobility}/100`}
          icon={<TrendingUp className="h-8 w-8" />}
          color="soft"
        />
      </motion.div>

      {/* Clinical Insights Section */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-[#E7D9C9]/40 p-12 shadow-md shadow-black/5">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#DCE6D8] text-[#2D6A4F] mb-6">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-serif font-semibold text-[#233127] mb-4">
            Patient Management
          </h3>
          <p className="text-[#5F6B63] leading-relaxed mb-8">
            Access your patient roster to review progress, assign exercises, set milestones, and provide clinical feedback. Each patient's journey is unique—let's support their recovery together.
          </p>
          <motion.button
            onClick={() => navigate('/doctor/patients')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary px-8 py-3.5 flex items-center gap-2 mx-auto font-semibold"
          >
            View Patient Roster
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Clinical Notes */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Monitor Progress",
            description: "Track patient metrics and identify concerning trends early",
            icon: <TrendingUp className="h-6 w-6" />
          },
          {
            title: "Personalize Care",
            description: "Adjust exercises and milestones based on individual recovery",
            icon: <Activity className="h-6 w-6" />
          },
          {
            title: "Real-time Communication",
            description: "Send encouragement and clinical feedback directly to patients",
            icon: <Users className="h-6 w-6" />
          }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + 0.1 * i }}
            className="bg-white rounded-2xl border border-[#E7D9C9]/40 p-6 hover:shadow-md hover:shadow-black/5 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-[#DCE6D8] text-[#2D6A4F] flex items-center justify-center mb-4">
              {item.icon}
            </div>
            <h4 className="font-serif font-semibold text-[#233127] mb-2">
              {item.title}
            </h4>
            <p className="text-sm text-[#5F6B63]">
              {item.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
