import React from "react";
import { motion } from "framer-motion";
import TrackerLogo from "/clock.png?url"; // Adjust path if necessary

const LoadingScreen = ({ message = "Loading...", overlay = false }) => {
  // If overlay is true, it covers existing content (for lazy-loaded modals).
  // If false, it acts as a solid full-screen background (for initial loads).
  const containerClasses = overlay
    ? "fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-slate-950)]/80 backdrop-blur-sm"
    : "min-h-screen bg-[var(--color-slate-950)] flex flex-col items-center justify-center gap-8 relative overflow-hidden transition-colors duration-500";

  return (
    <div className={containerClasses}>
      {/* Subtle glow - only on fullscreen */}
      {!overlay && (
        <div className="absolute inset-0 pointer-events-none motion-safe-gpu">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--color-emerald-500)]/5 blur-[120px]" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-6 motion-safe-gpu"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-400/15 rounded-3xl blur-2xl scale-150 animate-pulse" />
          <img
            src={TrackerLogo}
            alt="FocusFlow"
            className="relative w-32 h-32 object-contain drop-shadow-2xl animate-pulse"
          />
        </div>

        {message && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--color-white)] tracking-tight">
              FocusFlow
            </h1>
            <p className="text-sm text-slate-500 mt-1">{message}</p>
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[var(--color-emerald-400)]"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
