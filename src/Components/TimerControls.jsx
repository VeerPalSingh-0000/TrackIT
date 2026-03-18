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
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Main Play/Pause Button */}
        <motion.button
          onPointerDown={handleStartPausePointerDown}
          onClick={handleStartPause}
          className={`w-[72px] h-[72px] sm:w-24 sm:h-24 rounded-full text-btn font-bold text-xl sm:text-2xl flex items-center justify-center shadow-lg focus:outline-none focus:ring-4 touch-manipulation ${
            isRunning
              ? "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400/50"
              : "bg-[var(--color-emerald-500)] hover:bg-[var(--color-emerald-600)]"
          }`}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92, y: 2 }}
          transition={{ type: "spring", stiffness: 800, damping: 35 }}
          aria-label={isRunning ? "Pause Timer" : "Start Timer"}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isRunning ? "pause" : "play"}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.1 }}
            >
              {isRunning ? <FaPause /> : <FaPlay />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Reset Button */}
        <AnimatePresence>
          {hasStarted && (
            <motion.div
              initial={{ opacity: 0, x: -15, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -15, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 700, damping: 32 }}
            >
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.93, y: 1 }}
                transition={{ type: "spring", stiffness: 800, damping: 35 }}
              >
                <AnimatedButton
                  onPointerDown={handleStopResetPointerDown}
                  onClick={handleStopReset}
                  className="bg-[var(--color-slate-700)] hover:bg-[var(--color-slate-600)] text-[var(--color-white)] !px-4 !py-2.5 sm:!px-6 border border-[var(--color-slate-600)] shadow-lg"
                  icon={<FaRedo className="text-sm" />}
                  aria-label="Reset Timer"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

export default TimerControls;
