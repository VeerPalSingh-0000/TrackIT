import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from './ui/AnimatedButton';
import AmbientSounds from './AmbientSounds';
import { FaPlus, FaHistory, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import TrackerLogo from '../../public/clock.png';

/**
 * The main navigation bar for the application.
 * It uses a hamburger menu on mobile for a clean, responsive layout.
 * @param {object} props - The component's props.
 * @param {function} props.onNewProjectClick - Function to call when the "New Project" button is clicked.
 * @param {function} props.onHistoryClick - Function to call when the "History" button is clicked.
 * @param {function} props.onLogout - Function to call when the "Logout" button is clicked.
 */
const Navbar = ({ onNewProjectClick, onHistoryClick, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileLinkClick = (action) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="p-1  flex justify-between items-center border-b border-slate-700/50 sticky top-0 bg-slate-900/50 backdrop-blur-lg z-20">
      
      {/* ✨ Logo and Title Section */}
      <div className="flex items-center gap-0">
        {/* ✨ FIX: Increased logo size from h-8 to h-10 */}
        <img src={TrackerLogo} alt="FocusFlow Logo" className="h-20 w-auto" loading="eager" />
        {/* ✨ FIX: Re-added the title for better branding on larger screens */}
        <span className=" sm:block text-2xl font-bold text-white">FocusFlow</span>
      </div>
      
      <div className="flex items-center gap-2">
        <AmbientSounds />
        
        {/* Desktop Buttons: Visible on screens 'md' and larger */}
        <div className="hidden md:flex items-center gap-2">
          <AnimatedButton onClick={onNewProjectClick} className="bg-emerald-600 hover:bg-emerald-500 text-white" icon={<FaPlus />}>New Project</AnimatedButton>
          <AnimatedButton onClick={onHistoryClick} className="bg-slate-700 hover:bg-slate-600 text-white" icon={<FaHistory />}>History</AnimatedButton>
          <AnimatedButton onClick={onLogout} className="bg-rose-600 hover:bg-rose-500 text-white" icon={<FaSignOutAlt />}>Logout</AnimatedButton>
        </div>

        {/* Mobile Menu Button & Dropdown */}
        <div className="md:hidden">
          <AnimatedButton 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="bg-slate-700 hover:bg-slate-600 text-white"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </AnimatedButton>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute top-full right-4 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-2 flex flex-col gap-2"
              >
                <AnimatedButton onClick={() => handleMobileLinkClick(onNewProjectClick)} className="!w-full !justify-start bg-transparent hover:bg-emerald-500" icon={<FaPlus />}>New Project</AnimatedButton>
                <AnimatedButton onClick={() => handleMobileLinkClick(onHistoryClick)} className="!w-full !justify-start bg-transparent hover:bg-slate-600" icon={<FaHistory />}>History</AnimatedButton>
                <AnimatedButton onClick={() => handleMobileLinkClick(onLogout)} className="!w-full !justify-start bg-transparent hover:bg-rose-500" icon={<FaSignOutAlt />}>Logout</AnimatedButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
