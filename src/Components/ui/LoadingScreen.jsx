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
        <div className="absolute inset-0 pointer-events-none motion-safe-gpu overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-[var(--color-emerald-500)]/5 blur-[120px] animate-pulse" />
          <div
            className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-6 motion-safe-gpu"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-[40px] scale-150 animate-pulse" />
          <div className="w-32 h-32 glass-card-elevated rounded-[32px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-center p-4">
            <img
              src={TrackerLogo}
              alt="FocusFlow"
              className="relative w-24 h-24 object-contain drop-shadow-2xl animate-pulse"
            />
          </div>
        </div>

        {message && (
          <div className="text-center mt-4">
            <h1 className="text-[28px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-emerald-400)] to-[var(--color-emerald-600)] tracking-tight">
              FocusFlow
            </h1>
            <p className="text-[15px] font-medium text-[var(--color-slate-400)] mt-1.5 tracking-wide">
              {message}
            </p>
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
