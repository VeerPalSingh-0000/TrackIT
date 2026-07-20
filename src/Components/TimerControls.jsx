import React, { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaPause, FaRedo } from "react-icons/fa";
import AnimatedButton from "./ui/AnimatedButton";

const TimerControls = React.memo(
  ({ isRunning, hasStarted, onStartPause, onStopReset }) => {
    const hapticMediumRef = useRef(null);
    const hapticLightRef = useRef(null);
    const lastActionAtRef = useRef(0);

    useEffect(() => {
      let mounted = true;

      import("../services/nativeBridge.js")
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
      const now = performance.now();
      if (now - lastActionAtRef.current < 180) return;
      lastActionAtRef.current = now;

      hapticMediumRef.current?.();
      onStartPause();
    }, [onStartPause]);

    const handleStopReset = useCallback(() => {
      const now = performance.now();
      if (now - lastActionAtRef.current < 180) return;
      lastActionAtRef.current = now;

      hapticLightRef.current?.();
      onStopReset();
    }, [onStopReset]);

    const handleStartPausePointerDown = useCallback(() => {
      hapticMediumRef.current?.();
    }, []);

    const handleStopResetPointerDown = useCallback(() => {
      hapticLightRef.current?.();
    }, []);

    return (
      <div className="flex items-center gap-3 p-2 rounded-full glass-card border border-white/10 shadow-xl bg-[var(--color-slate-900)]/40 backdrop-blur-md transition-all duration-300">
        {/* Main Play/Pause Button */}
        <motion.button
          onPointerDown={handleStartPausePointerDown}
          onClick={handleStartPause}
          className={`w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] rounded-full text-btn font-bold text-xl sm:text-2xl flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 touch-manipulation ${
            isRunning
              ? "bg-amber-500/90 hover:bg-amber-500 focus:ring-amber-400/50"
              : "bg-[var(--color-emerald-500)]/90 hover:bg-[var(--color-emerald-500)] focus:ring-[var(--color-emerald-500)]/50"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          aria-label={isRunning ? "Pause Timer" : "Start Timer"}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isRunning ? "pause" : "play"}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
            >
              {isRunning ? <FaPause className="ml-[1px]" /> : <FaPlay className="ml-1" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Reset Button */}
        <AnimatePresence>
          {hasStarted && (
            <motion.div
              initial={{ opacity: 0, width: 0, scale: 0.8 }}
              animate={{ opacity: 1, width: "auto", scale: 1 }}
              exit={{ opacity: 0, width: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="overflow-hidden pr-2"
            >
              <motion.button
                onPointerDown={handleStopResetPointerDown}
                onClick={handleStopReset}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-slate-800)]/80 hover:bg-[var(--color-slate-700)] text-[var(--color-slate-300)] hover:text-white transition-colors"
                whileHover={{ rotate: 15, scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Reset Timer"
              >
                <FaRedo className="text-sm" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

export default TimerControls;
