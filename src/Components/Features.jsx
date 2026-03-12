import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaChartLine, FaTasks, FaMusic, FaClock, FaLayerGroup, FaHistory } from 'react-icons/fa';

const Features = ({ onClose }) => {
  const featuresList = [
    { 
      icon: <FaClock />, 
      title: "Dual Timer Modes", 
      desc: "Switch between a free-running Stopwatch or structured Pomodoro cycles (25/5 min) with automatic breaks.",
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20"
    },
    { 
      icon: <FaTasks />, 
      title: "Hierarchical Tasks", 
      desc: "Break work into Projects → Topics → Sub-Topics. Track time at every granularity level.",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20"
    },
    { 
      icon: <FaMusic />, 
      title: "Ambient Soundscapes", 
      desc: "Curated audio environments — Rain, Forest, Café, Lo-fi. Mix volumes to build your perfect focus zone.",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20"
    },
    { 
      icon: <FaChartLine />, 
      title: "Rich Analytics", 
      desc: "View detailed session history with per-project insights. Understand exactly where your hours go.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20"
    },
    { 
      icon: <FaLayerGroup />, 
      title: "Cloud Sync", 
      desc: "All data is securely stored with Firebase. Access your progress from any device, anytime.",
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20"
    },
    { 
      icon: <FaHistory />, 
      title: "Session Recording", 
      desc: "Every focus session is automatically recorded with timestamps, so you never lose track of your effort.",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-slate-950)]/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl bg-[var(--color-slate-900)] border border-[var(--color-slate-700)] rounded-3xl shadow-2xl relative mx-4 max-h-[90dvh] flex flex-col overflow-hidden transition-colors"
      >
        <div className="flex-shrink-0 p-6 sm:p-8 pb-4 sm:pb-6 relative border-b border-[var(--color-slate-700)]/30">
          <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 text-[var(--color-slate-400)] hover:text-[var(--color-emerald-500)] transition-colors bg-[var(--color-slate-800)]/50 rounded-full">
              <FaTimes />
            </button>
          </div>
          
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-[var(--color-emerald-500)]/10 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-emerald-500)] to-[var(--color-emerald-400)] mb-1 sm:mb-2 pr-10">
            What Does FocusFlow Do?
          </h2>
          <p className="text-[var(--color-slate-400)] text-sm sm:text-base md:text-lg font-medium">
            Everything you need to master your study & work sessions.
          </p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-6 sm:pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {featuresList.map((feature, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`${feature.bg} border p-4 sm:p-5 rounded-2xl transition-all duration-300 group hover:scale-[1.02]`}
              >
                <div className={`${feature.color} text-2xl sm:text-3xl mb-3 group-hover:scale-110 transition-transform inline-block`}>
                  {feature.icon}
                </div>
                 <h3 className="text-base sm:text-lg font-bold text-[var(--color-white)] mb-1.5 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[var(--color-slate-400)] text-sm leading-relaxed transition-colors">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Features;
