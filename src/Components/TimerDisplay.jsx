import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TimerDisplay = ({ time, isRunning, formatTime }) => {
  // Premium 3D material gradients
  const petalGradients = [
    { start: '#a5f3fc', end: '#06b6d4' }, // Cyan
    { start: '#bae6fd', end: '#0ea5e9' }, // Light Blue
    { start: '#c7d2fe', end: '#6366f1' }, // Indigo
    { start: '#ddd6fe', end: '#8b5cf6' }, // Violet
    { start: '#f3e8ff', end: '#a855f7' }, // Purple
    { start: '#fae8ff', end: '#d946ef' }, // Fuchsia
    { start: '#fce7f3', end: '#ec4899' }, // Pink
    { start: '#ffe4e6', end: '#f43f5e' }, // Rose
    { start: '#fee2e2', end: '#ef4444' }, // Red
    { start: '#ffedd5', end: '#f97316' }, // Orange
    { start: '#fef3c7', end: '#f59e0b' }, // Amber
    { start: '#fef9c3', end: '#eab308' }, // Yellow
  ];

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center py-12 select-none"
      // Smooth vertical float for the whole UI
      animate={{ y: isRunning ? [-4, 4, -4] : 0 }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* OPTIMIZED AMBIENT GLOW 
        Using CSS radial-gradient + opacity is much smoother on Android than SVG filters.
      */}
      <div 
        className={`absolute inset-0 rounded-full transition-opacity duration-1000 ${isRunning ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0) 70%)',
          filter: 'blur(50px)',
          transform: 'scale(1.4)',
          willChange: 'opacity'
        }}
      />

      <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] flex items-center justify-center">
        
        {/* MAIN ROTATING PETAL GROUP
          'transform-gpu' and 'will-change' ensure the GPU handles the rotation.
        */}
        <motion.div 
          className="absolute inset-0 w-full h-full z-0 transform-gpu"
          style={{ willChange: 'transform' }}
          animate={{ rotate: isRunning ? 360 : 0 }}
          transition={{ duration: 60, ease: "linear", repeat: Infinity }}
        >
          <svg className="w-full h-full" viewBox="0 0 200 200">
            <defs>
              {petalGradients.map((grad, i) => (
                <linearGradient key={`grad-${i}`} id={`petalGrad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={grad.start} />
                  <stop offset="100%" stopColor={grad.end} />
                </linearGradient>
              ))}
            </defs>

            {/* Centralized Group for easier math */}
            <g transform="translate(100, 100)">
              {petalGradients.map((_, index) => (
                <motion.circle
                  key={index}
                  cx="0" cy="0" r="74"
                  fill="none"
                  stroke={`url(#petalGrad-${index})`}
                  strokeWidth="28"
                  strokeLinecap="round"
                  strokeDasharray="56 400" 
                  // CSS drop-shadow is more Android-compatible than SVG <filter>
                  className="drop-shadow-lg" 
                  style={{ 
                    transformOrigin: "center",
                    willChange: "transform, opacity"
                  }}
                  initial={{ rotate: index * 30 }}
                  animate={{ 
                    rotate: index * 30,
                    scale: isRunning ? [1, 1.04, 1] : 1,
                    opacity: isRunning ? [0.8, 1, 0.8] : 0.9
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.12, // Staggered ripple effect
                    ease: "easeInOut"
                  }}
                />
              ))}
            </g>
          </svg>
        </motion.div>

        {/* DECORATIVE OUTER DASHED RING 
          Counter-rotates to create a complex "mechanical" feel.
        */}
        <motion.div 
          className="absolute inset-[-24px] w-[calc(100%+48px)] h-[calc(100%+48px)] z-0 opacity-30 pointer-events-none transform-gpu" 
          animate={{ rotate: isRunning ? -360 : 0 }}
          transition={{ duration: 120, ease: "linear", repeat: Infinity }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="96" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 10" />
          </svg>
        </motion.div>

        {/* CENTRAL PREMIUM DIAL 
          Advanced Glassmorphism dial with internal markers.
        */}
        <div className="absolute inset-0 m-auto w-52 h-52 sm:w-60 sm:h-60 rounded-full z-10 flex flex-col items-center justify-center">
          
          {/* Frosted Glass Background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl border border-white/30 shadow-[inset_0_4px_20px_rgba(255,255,255,0.3),0_15px_35px_rgba(0,0,0,0.3)]" />

          {/* Clock face hour dots */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={`marker-${i}`} 
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{ transform: `rotate(${i * 30}deg) translateY(-92px)` }}
            />
          ))}

          {/* Timer Digits */}
          <h2 className="relative z-20 font-timer text-6xl sm:text-7xl font-extrabold tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] mt-3 tabular-nums">
            {formatTime(time)}
          </h2>
          
          {/* Status Badge */}
          <AnimatePresence>
            {isRunning && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="relative z-20 flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full bg-black/30 border border-white/10 backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-[0.25em] drop-shadow-md">
                  Focusing
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
};

export default TimerDisplay;