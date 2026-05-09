import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F7F5F1]">
      <Navbar />
      <Sidebar />
      <motion.main 
        className="flex-1 lg:ml-64 pt-28 lg:pt-20 px-6 lg:px-12 pb-20 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
