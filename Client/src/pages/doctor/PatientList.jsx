import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { Search, Users, ArrowRight, Filter } from 'lucide-react';
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

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get(`/doctor/patients?search=${search}`);
        setPatients(response.data.data.data);
      } catch (err) {
        setError('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchPatients();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [search]);

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
          Patient Roster
        </h1>
        <p className="text-lg text-[#5F6B63] max-w-2xl">
          Manage your patient caseload. Review progress, assign exercises, and provide care.
        </p>
      </motion.div>

      {/* Search Section */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-[#E7D9C9]/40 p-6 shadow-md shadow-black/5">
        <div className="flex items-center gap-3 bg-[#F7F5F1] rounded-full px-6 py-4">
          <Search className="h-5 w-5 text-[#5F6B63]" />
          <input
            type="text"
            className="bg-transparent flex-1 text-[#233127] placeholder-[#5F6B63] outline-none"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : patients.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl border-2 border-dashed border-[#E7D9C9] p-16 text-center"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#DCE6D8] text-[#2D6A4F] mb-6">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-serif font-semibold text-[#233127] mb-2">
            No patients found
          </h3>
          <p className="text-[#5F6B63]">
            {search ? 'Try adjusting your search criteria.' : 'Your patient roster will appear here.'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
        >
          {patients.map((patient, index) => (
            <motion.div
              key={patient.id}
              variants={itemVariants}
              whileHover={{ x: 4 }}
              onClick={() => navigate(`/doctor/patients/${patient.user_id}`)}
              className="bg-white rounded-2xl border border-[#E7D9C9]/40 p-6 hover:shadow-md hover:shadow-black/5 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {/* Patient Info */}
                  <h3 className="text-xl font-serif font-semibold text-[#233127] mb-2">
                    {patient.user?.name}
                  </h3>
                  <p className="text-sm text-[#5F6B63] mb-3">
                    {patient.user?.email}
                  </p>

                  {/* Status & Metrics */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-semibold uppercase tracking-wide ${
                      patient.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {patient.status}
                    </span>
                    <div className="flex items-center gap-4 text-sm">
                      {patient.current_pain_level !== null && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-[#5F6B63]">
                            Pain: <span className="font-semibold text-[#233127]">{patient.current_pain_level}/10</span>
                          </span>
                        </div>
                      )}
                      {patient.mobility_score !== null && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-[#5F6B63]">
                            Mobility: <span className="font-semibold text-[#233127]">{patient.mobility_score}/100</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="w-10 h-10 rounded-full bg-[#DCE6D8] text-[#2D6A4F] flex items-center justify-center group-hover:bg-[#2D6A4F] group-hover:text-white transition-all flex-shrink-0 ml-4">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
