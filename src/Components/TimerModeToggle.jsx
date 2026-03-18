import React from "react";
import { motion } from "framer-motion";

const TimerModeToggle = React.memo(({ mode, setMode }) => (
  <div className="relative flex p-1 rounded-full bg-slate-800/60 backdrop-blur-sm border border-white/[0.06] mb-10 max-[700px]:mb-3 max-[700px]:scale-95 max-[700px]:origin-top">
    <motion.div
      className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-[var(--color-emerald-500)] to-[var(--color-emerald-600)] shadow-lg motion-safe-gpu"
      animate={{ x: mode === "stopwatch" ? 0 : "100%", width: "50%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ width: "calc(50% - 2px)", left: 2 }}
    />
    <button
      onClick={() => setMode("stopwatch")}
      className={`relative z-10 px-5 max-[700px]:px-4 py-2 max-[700px]:py-1.5 text-[13px] max-[700px]:text-[12px] font-semibold rounded-full transition-colors duration-200 ${
        mode === "stopwatch"
          ? "text-btn"
          : "text-[var(--color-slate-400)] hover:text-[var(--color-slate-300)]"
      }`}
    >
      Stopwatch
    </button>
    <button
      onClick={() => setMode("pomodoro")}
      className={`relative z-10 px-5 max-[700px]:px-4 py-2 max-[700px]:py-1.5 text-[13px] max-[700px]:text-[12px] font-semibold rounded-full transition-colors duration-200 ${
        mode === "pomodoro"
          ? "text-btn"
          : "text-[var(--color-slate-400)] hover:text-[var(--color-slate-300)]"
      }`}
    >
      Pomodoro
    </button>
  </div>
));

export default TimerModeToggle;
