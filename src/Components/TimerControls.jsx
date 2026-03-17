import React, { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaRedo } from 'react-icons/fa';
import AnimatedButton from './ui/AnimatedButton';

const TimerControls = React.memo(({ isRunning, hasStarted, onStartPause, onStopReset }) => {
    const hapticMediumRef = useRef(null);
    const hapticLightRef = useRef(null);

    useEffect(() => {
      let mounted = true;

      import('../services/nativeBridge.js')
        .then(({ hapticMedium, hapticLight }) => {
          if (!mounted) return;
          hapticMediumRef.current = hapticMedium;
          hapticLightRef.current = hapticLight;
        })
        .catch(() => {});

      return () => {
        mounted = false;
      };
    }, []);

    const handleStartPause = useCallback(() => {
      hapticMediumRef.current?.();
      onStartPause();
    }, [onStartPause]);

    const handleStopReset = useCallback(() => {
      hapticLightRef.current?.();
      onStopReset();
    }, [onStopReset]);

    return (
    <div className="flex items-center gap-4">
        <motion.button 
          onClick={handleStartPause} 
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full text-btn font-bold text-2xl flex items-center justify-center transition-colors duration-150 shadow-2xl focus:outline-none focus:ring-4 touch-manipulation transform-gpu will-change-transform ${isRunning ? "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400/50" : "bg-[var(--color-emerald-500)] hover:bg-[var(--color-emerald-600)]"}`} 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.93 }} 
          transition={{ type: 'tween', duration: 0.12, ease: 'easeOut' }} 
          aria-label={isRunning ? "Pause Timer" : "Start Timer"}
        >
            <AnimatePresence mode="wait">
                <motion.div
                  key={isRunning ? 'pause' : 'play'}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                >
                    {isRunning ? <FaPause /> : <FaPlay />}
                </motion.div>
            </AnimatePresence>
        </motion.button>
        <AnimatePresence>
            {hasStarted && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <AnimatedButton onClick={handleStopReset} className="bg-[var(--color-slate-700)] hover:bg-[var(--color-slate-600)] text-[var(--color-white)] !px-4 sm:!px-6 border border-[var(--color-slate-600)] shadow-lg" icon={<FaRedo className="text-sm" />} aria-label="Reset Timer" />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
    );
});

export default TimerControls;