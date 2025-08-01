import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TimerDisplay = ({ time, isRunning, formatTime }) => {
  // This 'progress' variable is not used in the final JSX, so it can be removed for cleanup.

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center"
      animate={{ scale: isRunning ? 1.05 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="timerGradient" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor={isRunning ? "#34D399" : "#60A5FA"} />
            <stop offset="100%" stopColor={isRunning ? "#10B981" : "#818CF8"} />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="54" fill="none" strokeWidth="12" className="text-slate-700/50" />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="url(#timerGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          // --- FIX IS HERE ---
          // The 'initial' prop defines the starting state for the animation.
          initial={{ strokeDashoffset: 1 }}
          animate={{ strokeDashoffset: isRunning ? [1, 0, 1] : 1 }}
          transition={{ 
            duration: 60, 
            ease: "linear",
            repeat: Infinity,
            repeatDelay: 0
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h2 className="font-mono text-6xl font-bold tracking-tighter text-white">
          {formatTime(time)}
        </h2>
        
        <AnimatePresence>
          {isRunning && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-emerald-400 font-semibold animate-pulse mt-2"
            >
              Session in progress
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TimerDisplay;
