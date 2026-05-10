import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Floating Navbar */}
      <motion.header 
        className="fixed top-6 left-6 right-6 z-40 lg:top-8 lg:left-12 lg:right-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="backdrop-blur-md bg-white/80 rounded-full border border-[#E7D9C9]/40 px-6 py-4 flex items-center justify-between shadow-lg shadow-black/5">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/')}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#1F4D3A] text-white font-serif font-bold text-lg">
              R
            </div>
            <span className="hidden sm:inline text-xl font-serif font-semibold text-[#233127] tracking-wide">
              RecoverIQ
            </span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {user && (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-[#233127]">{user.name}</span>
                  <span className="text-xs text-[#5F6B63] capitalize font-serif">{user.role}</span>
                </div>
                <motion.button
                  onClick={handleLogout}
                  className="text-[#5F6B63] hover:text-[#2D6A4F] transition-colors p-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="h-5 w-5" />
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-[#233127]" />
            ) : (
              <Menu className="h-6 w-6 text-[#233127]" />
            )}
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {mobileMenuOpen && user && (
        <motion.div
          className="fixed top-24 right-6 z-30 bg-white rounded-2xl border border-[#E7D9C9]/40 p-6 shadow-xl md:hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#233127]">{user.name}</span>
              <span className="text-xs text-[#5F6B63] capitalize">{user.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
