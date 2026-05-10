import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Stethoscope, UserCheck, UserX, RefreshCw,
  ChevronRight, Search, Check, LogOut, ShieldCheck, X
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="bg-white p-6 rounded-3xl border border-[#E7D9C9] shadow-sm flex items-center space-x-5"
  >
    <div className="p-3 rounded-2xl shrink-0" style={{ backgroundColor: `${color}15` }}>
      <Icon size={26} style={{ color }} />
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-[#A0AAB2] mb-1">{label}</p>
      <p className="text-3xl font-serif font-bold text-[#2A3B2C]">{value}</p>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Assignment modal
  const [assignModal, setAssignModal] = useState(null); // { patient }
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, docRes, patRes] = await Promise.all([
        axios.get('/api/admin/dashboard'),
        axios.get('/api/admin/doctors'),
        axios.get('/api/admin/patients'),
      ]);
      setStats(statsRes.data.data);
      setDoctors(docRes.data.data);
      setPatients(patRes.data.data.data || patRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDoctor || !assignModal) return;
    setAssigning(true);
    try {
      const isReassign = !!assignModal.patient.doctor_id;
      const endpoint = isReassign ? '/api/admin/reassign' : '/api/admin/assign';
      const payload = isReassign
        ? { patient_id: assignModal.patient.user_id, new_doctor_id: selectedDoctor }
        : { patient_id: assignModal.patient.user_id, doctor_id: selectedDoctor };
      await axios.post(endpoint, payload);
      showToast('Patient assigned successfully!');
      setAssignModal(null);
      setSelectedDoctor('');
      fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async (patientId) => {
    if (!window.confirm('Remove this patient from their current doctor?')) return;
    try {
      await axios.post('/api/admin/unassign', { patient_id: patientId });
      showToast('Patient unassigned.');
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filteredPatients = patients.filter(p =>
    p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2A3B2C] font-sans">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#2D6A4F] text-white px-6 py-3 rounded-full shadow-lg font-medium flex items-center gap-2"
          >
            <Check size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assignment Modal */}
      <AnimatePresence>
        {assignModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#2A3B2C]/30 backdrop-blur-sm" onClick={() => setAssignModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-[#E7D9C9]"
            >
              <button onClick={() => setAssignModal(null)} className="absolute top-5 right-5 text-[#A0AAB2] hover:text-[#5F6B63]">
                <X size={20} />
              </button>
              <h2 className="text-2xl font-serif font-bold text-[#2A3B2C] mb-1">
                {assignModal.patient.doctor_id ? 'Reassign Patient' : 'Assign Patient'}
              </h2>
              <p className="text-[#5F6B63] text-sm mb-6">
                Assigning <strong>{assignModal.patient.user?.name}</strong> to a therapist.
              </p>

              {assignModal.patient.doctor_id && (
                <div className="mb-4 p-3 bg-[#F5F1EA] rounded-xl text-sm text-[#5F6B63]">
                  Currently assigned to: <strong className="text-[#2D6A4F]">{assignModal.patient.doctor_name}</strong>
                </div>
              )}

              <label className="block text-xs font-bold uppercase tracking-wider text-[#8BA888] mb-2">Select Therapist</label>
              <select
                value={selectedDoctor}
                onChange={e => setSelectedDoctor(e.target.value)}
                className="w-full border border-[#E7D9C9] p-3 rounded-xl focus:ring-2 focus:ring-[#8BA888] outline-none mb-6 bg-white text-[#2A3B2C]"
              >
                <option value="">Choose a doctor...</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.patient_count} patients)</option>
                ))}
              </select>

              <button
                onClick={handleAssign}
                disabled={!selectedDoctor || assigning}
                className="w-full bg-[#2D6A4F] text-white py-3 rounded-xl font-bold hover:bg-[#1B4332] transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {assigning
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : assignModal.patient.doctor_id ? 'Reassign' : 'Assign'
                }
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-[#E7D9C9] px-8 py-6 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2D6A4F] rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <p className="text-xs text-[#8BA888] font-bold uppercase tracking-wider">RecoverIQ Admin</p>
            <h1 className="text-lg font-serif font-bold text-[#2A3B2C]">{user?.name}</h1>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm font-medium text-[#5F6B63] hover:text-[#C97A7E] transition-colors border border-[#E7D9C9] px-4 py-2 rounded-full"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white h-28 rounded-3xl border border-[#E7D9C9] animate-pulse" />
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard label="Total Therapists" value={stats.total_doctors} icon={Stethoscope} color="#2D6A4F" delay={0} />
            <StatCard label="Total Patients" value={stats.total_patients} icon={Users} color="#8BA888" delay={0.1} />
            <StatCard label="Unassigned Patients" value={stats.unassigned_patients} icon={UserX} color="#C97A7E" delay={0.2} />
          </div>
        )}

        {/* Doctors Overview */}
        {stats?.doctors_overview && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold text-[#2A3B2C] mb-6">Therapist Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.doctors_overview.map((doc, i) => (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="bg-white p-6 rounded-3xl border border-[#E7D9C9] shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#8BA888]/20 rounded-full flex items-center justify-center text-[#2D6A4F] font-bold text-xl">
                      {doc.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2A3B2C]">{doc.name}</h3>
                      <p className="text-xs text-[#5F6B63]">{doc.email}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#5F6B63]">Active Patients</span>
                    <span className="text-xl font-serif font-bold text-[#2D6A4F]">{doc.patients_as_doctor_count}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Patient Assignment Table */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-serif font-bold text-[#2A3B2C]">Patient Assignments</h2>
            <div className="relative w-full sm:w-auto">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AAB2]" />
              <input
                type="text" placeholder="Search patients..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-[#E7D9C9] rounded-full text-sm focus:ring-2 focus:ring-[#8BA888] outline-none w-full sm:w-64 bg-white"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E7D9C9] shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-[#A0AAB2]">Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-12 text-center">
                <Users size={40} className="mx-auto text-[#E7D9C9] mb-3" />
                <p className="text-[#5F6B63]">No patients found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E7D9C9] bg-[#F5F1EA]">
                      <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-[#8BA888]">Patient</th>
                      <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-[#8BA888]">Status</th>
                      <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-[#8BA888]">Assigned To</th>
                      <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-[#8BA888]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient, i) => (
                      <motion.tr key={patient.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-[#E7D9C9] last:border-0 hover:bg-[#FDFBF7] transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#8BA888]/20 rounded-full flex items-center justify-center text-[#2D6A4F] font-bold text-sm">
                              {patient.user?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-[#2A3B2C] text-sm">{patient.user?.name}</p>
                              <p className="text-xs text-[#A0AAB2]">{patient.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            patient.status === 'active'
                              ? 'bg-[#2D6A4F]/10 text-[#2D6A4F]'
                              : 'bg-[#E7D9C9] text-[#5F6B63]'
                          }`}>
                            {patient.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {patient.doctor_id ? (
                            <span className="flex items-center gap-1.5 text-sm font-medium text-[#2A3B2C]">
                              <UserCheck size={14} className="text-[#8BA888]" />
                              {patient.doctor_name}
                            </span>
                          ) : (
                            <span className="text-sm text-[#C97A7E] font-medium italic">Unassigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setAssignModal({ patient }); setSelectedDoctor(''); }}
                              className="text-xs font-bold text-[#2D6A4F] border border-[#2D6A4F]/30 px-3 py-1.5 rounded-full hover:bg-[#2D6A4F]/5 transition-colors flex items-center gap-1"
                            >
                              {patient.doctor_id ? <><RefreshCw size={12} /> Reassign</> : <><ChevronRight size={12} /> Assign</>}
                            </button>
                            {patient.doctor_id && (
                              <button
                                onClick={() => handleUnassign(patient.user_id)}
                                className="text-xs font-bold text-[#C97A7E] border border-[#C97A7E]/30 px-3 py-1.5 rounded-full hover:bg-[#C97A7E]/5 transition-colors"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
