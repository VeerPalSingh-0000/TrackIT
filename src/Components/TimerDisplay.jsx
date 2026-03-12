import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TimerDisplay = ({ time, isRunning, formatTime }) => {
  return (
    <motion.div
      className="relative flex flex-col items-center justify-center motion-safe-gpu"
      animate={{ scale: isRunning ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Glow halo behind the ring — only visible when running */}
      <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
        isRunning 
          ? 'bg-[var(--color-emerald-500)]/5 shadow-[0_0_80px_30px_var(--color-emerald-500)]/10 timer-glow-active' 
          : 'bg-transparent shadow-none'
      }`} />

      <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90 relative z-10" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="timerGradient" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor={isRunning ? "var(--color-emerald-400)" : "var(--color-slate-400)"} />
            <stop offset="100%" stopColor={isRunning ? "var(--color-emerald-600)" : "var(--color-slate-500)"} />
          </linearGradient>
          <linearGradient id="timerTrack" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor="rgba(100,116,139,0.15)" />
            <stop offset="100%" stopColor="rgba(100,116,139,0.08)" />
          </linearGradient>
          {/* Glow filter for the active ring */}
          <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <circle 
          cx="60" cy="60" r="54" 
          fill="none" strokeWidth="6" 
          stroke="url(#timerTrack)" 
        />

        {/* Animated progress ring */}
        <motion.circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke="url(#timerGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          filter={isRunning ? "url(#ringGlow)" : "none"}
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

      {/* Timer digits */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <h2 className="font-timer text-5xl sm:text-6xl font-bold tracking-tight text-[var(--color-white)] drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-colors">
          {formatTime(time)}
        </h2>
        
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 mt-3"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--color-emerald-400)] animate-pulse" />
              <span className="text-[var(--color-emerald-500)]/80 text-xs font-bold uppercase tracking-widest transition-colors">
                Focusing
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TimerDisplay;
