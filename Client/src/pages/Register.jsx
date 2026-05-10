import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'patient'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const data = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role
      });
      
      if (data.success) {
        navigate(data.data.user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1EA] grid lg:grid-cols-2">
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 inline-flex items-center gap-2 rounded-full border border-[#E7D9C9]/60 bg-white/80 px-4 py-2 text-sm font-medium text-[#5F6B63] shadow-lg shadow-black/5 backdrop-blur transition hover:text-[#2D6A4F]"
        aria-label="Back to landing"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      {/* Left Story Panel */}
      <motion.div
        className="relative hidden lg:flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#F7F5F1_0%,_#DCE6D8_45%,_#CFE0D6_100%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:repeating-linear-gradient(120deg,rgba(31,77,58,0.08)_0,rgba(31,77,58,0.08)_1px,transparent_1px,transparent_9px)]" />
        <div className="absolute inset-0">
          <motion.div
            className="absolute -top-24 left-6 h-72 w-72 rounded-full bg-[#E7D9C9]/70 blur-3xl"
            animate={{ y: [0, 18, 0], x: [0, 8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-4 -right-12 h-72 w-72 rounded-full bg-[#D8D1F0]/50 blur-3xl"
            animate={{ y: [0, -16, 0], x: [0, -10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 left-1/2 h-48 w-48 rounded-full bg-white/50 blur-2xl"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <motion.div
          className="relative z-10 max-w-md px-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#1F4D3A]/90 text-[#F5F1EA] font-serif text-2xl shadow-lg shadow-[#1F4D3A]/25">
              R
            </div>
          </motion.div>
          <motion.h2 variants={itemVariants} className="text-5xl font-serif font-semibold text-[#1F4D3A] leading-[1.05]">
            Begin your
            <span className="block text-[#233127]">healing journey.</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-5 text-[15px] text-[#5F6B63] leading-relaxed">
            A restorative space for intentional care, clear progress, and trusted support.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-10 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#1F4D3A]" />
            <span className="h-2 w-2 rounded-full bg-[#1F4D3A]/50" />
            <span className="h-2 w-2 rounded-full bg-[#1F4D3A]/25" />
          </motion.div>
        </motion.div>
        <motion.div
          className="absolute right-[-30px] top-1/3 h-56 w-56 rounded-[48%] border border-white/50 bg-white/30 backdrop-blur"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-12 bottom-16 h-24 w-24 rounded-[40%] bg-white/40 shadow-lg shadow-[#1F4D3A]/10"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Right Form Panel */}
      <motion.div
        className="relative flex items-center justify-center px-6 py-14"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#FFFFFF_0%,_#F5F1EA_45%,_#F3EEE6_100%)]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:repeating-linear-gradient(0deg,rgba(35,49,39,0.1)_0,rgba(35,49,39,0.1)_1px,transparent_1px,transparent_10px)]" />
        <motion.div
          className="relative w-full max-w-md rounded-[32px] border border-white/60 bg-white/70 p-10 shadow-2xl shadow-[#1F4D3A]/10 backdrop-blur"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div variants={itemVariants} className="mb-10">
            <p className="text-xs uppercase tracking-[0.35em] text-[#5F6B63]">RecoverIQ</p>
            <h1 className="mt-5 text-[42px] font-serif font-semibold text-[#233127] leading-[1.1]">Begin Your Journey</h1>
            <p className="mt-3 text-sm text-[#5F6B63]">Create a calm, personal space for recovery.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div variants={itemVariants} className="rounded-2xl bg-red-50 border border-red-100 p-4">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <label className="block text-[11px] uppercase tracking-[0.25em] text-[#5F6B63] mb-3">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-full border border-[#E7D9C9] bg-[#F7F5F1] px-5 py-3 text-[#233127] placeholder-[#5F6B63] shadow-inner shadow-[#1F4D3A]/10 transition-all focus:border-[#1F4D3A] focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]/10"
                placeholder="Your full name"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-[11px] uppercase tracking-[0.25em] text-[#5F6B63] mb-3">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-full border border-[#E7D9C9] bg-[#F7F5F1] px-5 py-3 text-[#233127] placeholder-[#5F6B63] shadow-inner shadow-[#1F4D3A]/10 transition-all focus:border-[#1F4D3A] focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]/10"
                placeholder="you@example.com"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-[11px] uppercase tracking-[0.25em] text-[#5F6B63] mb-3">Account Type</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-full border border-[#E7D9C9] bg-[#F7F5F1] px-5 py-3 text-[#233127] shadow-inner shadow-[#1F4D3A]/10 transition-all focus:border-[#1F4D3A] focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]/10"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Healthcare Provider</option>
              </select>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-[11px] uppercase tracking-[0.25em] text-[#5F6B63] mb-3">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-full border border-[#E7D9C9] bg-[#F7F5F1] px-5 py-3 text-[#233127] placeholder-[#5F6B63] shadow-inner shadow-[#1F4D3A]/10 transition-all focus:border-[#1F4D3A] focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]/10"
                placeholder="Create a secure password"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-[11px] uppercase tracking-[0.25em] text-[#5F6B63] mb-3">Confirm Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                className="w-full rounded-full border border-[#E7D9C9] bg-[#F7F5F1] px-5 py-3 text-[#233127] placeholder-[#5F6B63] shadow-inner shadow-[#1F4D3A]/10 transition-all focus:border-[#1F4D3A] focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]/10"
                placeholder="Confirm your password"
              />
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              className="w-full rounded-full bg-[#1F4D3A] text-[#F5F1EA] py-3.5 font-semibold tracking-wide shadow-lg shadow-[#1F4D3A]/25 transition-all disabled:opacity-70"
            >
              {loading ? 'Creating Account...' : (
                <span className="inline-flex items-center gap-2">
                  Create Account
                  <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="mt-10 text-sm text-[#5F6B63]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#1F4D3A] hover:text-[#2D6A4F] transition-colors">
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
