import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Activity, ShieldCheck, TrendingUp, Users, ArrowRight, Sun, Moon } from 'lucide-react';

export default function Landing() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] text-gray-900 dark:text-gray-100 transition-colors duration-200 selection:bg-indigo-500/30">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between px-6 lg:px-12 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
            R
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            RecoverIQ
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <div className="hidden sm:flex items-center gap-4 border-l border-gray-200 dark:border-white/10 pl-4">
            <Link to="/login" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>
        
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 dark:bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-lighten"></div>
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[400px] bg-blue-500/20 dark:bg-blue-400/20 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-lighten"></div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 mb-8 animate-fade-in">
            <Activity className="h-4 w-4" />
            <span>Next-Generation Rehabilitation Tracking</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Your Journey to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">Full Recovery</span> Starts Here.
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            RecoverIQ bridges the gap between doctors and patients, providing intelligent insights, milestone tracking, and seamless exercise management for a faster, smarter recovery.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/register" className="flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95">
              Start Free Trial <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/login" className="flex items-center justify-center rounded-full bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-white/10 px-8 py-4 text-base font-semibold text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              Login to Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-[#13151c] border-y border-gray-200 dark:border-white/10 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why choose RecoverIQ?</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Everything you need to manage rehabilitation effectively.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Smart Progress Tracking</h3>
              <p className="text-gray-600 dark:text-gray-400">Log pain and mobility daily. Our algorithms detect trends and alert your doctor automatically.</p>
            </div>
            
            <div className="card p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Doctor-Patient Sync</h3>
              <p className="text-gray-600 dark:text-gray-400">Doctors can assign precise exercises, set clinical milestones, and leave direct feedback in real-time.</p>
            </div>

            <div className="card p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Secure & Compliant</h3>
              <p className="text-gray-600 dark:text-gray-400">Your health data is encrypted and securely stored, ensuring complete privacy during your recovery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 dark:bg-[#0f1117] text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-white font-bold text-xs">
            R
          </div>
          <span className="font-bold text-gray-900 dark:text-white">RecoverIQ</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} RecoverIQ Systems. All rights reserved.
        </p>
      </footer>
      
    </div>
  );
}
