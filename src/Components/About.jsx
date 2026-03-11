import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import TrackerLogo from '../../public/clock.png';

const About = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative mx-4 max-h-[90dvh] flex flex-col overflow-hidden"
      >
        {/* Header - fixed at top */}
        <div className="flex-shrink-0 p-6 sm:p-8 pb-4 sm:pb-6 relative border-b border-slate-800/50">
          <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-rose-500/20 rounded-full">
              <FaTimes />
            </button>
          </div>
          
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3">
             <div className="w-14 h-14 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center p-2">
                <img src={TrackerLogo} alt="Logo" className="w-full h-full object-contain" />
             </div>
             <div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-400">
                  About FocusFlow
                </h2>
                <p className="text-slate-400 text-sm">Version 2.0</p>
             </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-300 leading-relaxed text-sm sm:text-base relative">
          <div className="absolute top-1/2 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="bg-slate-800/30 border border-slate-700/50 p-5 rounded-2xl relative z-10">
            <p className="mb-0 text-slate-200 font-medium">
              Welcome to <strong>FocusFlow</strong>, your ultimate companion for deep work, study sessions, and mindful productivity.
            </p>
          </div>
          
           <div className="space-y-4 relative z-10">
              <p>
                Built with the modern learner and professional in mind, our goal is to help you minimize distractions and maximize your output. We strongly believe that structured time blocks (Pomodoro), combined with ambient environments, create the optimal conditions for the human brain to enter a state of flow.
              </p>
              <p>
                Whether you are preparing for exams, tackling complex coding sessions, reading a book, or simply trying to get through a heavy workday, FocusFlow provides you with a beautifully designed, distraction-free toolkit to track, analyze, and optimize your focus habits over time.
              </p>
          </div>

          <div className="pt-4 border-t border-slate-800/50 relative z-10">
            <h3 className="text-emerald-400 font-semibold mb-2">Our Core Philosophy</h3>
            <ul className="space-y-2 text-slate-400">
               <li className="flex gap-2 items-start"><span className="text-indigo-400 mt-0.5">•</span> <span><strong>Simplicity first:</strong> No cluttered menus or unnecessary configurations.</span></li>
               <li className="flex gap-2 items-start"><span className="text-indigo-400 mt-0.5">•</span> <span><strong>Data privacy:</strong> Your history is tied exclusively to your account.</span></li>
               <li className="flex gap-2 items-start"><span className="text-indigo-400 mt-0.5">•</span> <span><strong>Aesthetic matters:</strong> An environment that looks professional makes you feel professional.</span></li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
