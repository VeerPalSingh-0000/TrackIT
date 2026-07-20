import React from "react";
import { motion } from "framer-motion";

const TimerModeToggle = React.memo(({ mode, setMode }) => (
  <div className="home-mode-toggle relative flex p-1.5 rounded-full glass-card-subtle mb-8 sm:mb-10 w-64 max-w-full">
    <motion.div
      className="absolute top-1.5 bottom-1.5 rounded-full bg-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-white/10"
      animate={{ x: mode === "stopwatch" ? 0 : "100%", width: "50%" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{ width: "calc(50% - 6px)", left: 6 }}
    />
    <button
      onClick={() => setMode("stopwatch")}
      className={`relative z-10 flex-1 px-5 py-2.5 text-[13px] uppercase tracking-wider font-bold rounded-full transition-colors duration-300 ${
        mode === "stopwatch"
          ? "text-[var(--color-emerald-400)]"
          : "text-[var(--color-slate-500)] hover:text-[var(--color-slate-300)]"
      }`}
    >
      Stopwatch
    </button>
    <button
      onClick={() => setMode("pomodoro")}
      className={`relative z-10 flex-1 px-5 py-2.5 text-[13px] uppercase tracking-wider font-bold rounded-full transition-colors duration-300 ${
        mode === "pomodoro"
          ? "text-[var(--color-emerald-400)]"
          : "text-[var(--color-slate-500)] hover:text-[var(--color-slate-300)]"
      }`}
    >
      Pomodoro
    </button>
  </div>
));

export default TimerModeToggle;
