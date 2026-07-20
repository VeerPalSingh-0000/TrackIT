import React, { useMemo } from "react";
import { motion } from "framer-motion";

const StreakCalendar = ({ studyHistory = [] }) => {
  // Generate last 30 days
  const calendarData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    // Map dates to durations
    const durationMap = {};

    studyHistory.forEach((session) => {
      const d = new Date(session.date || session.createdAt);
      d.setHours(0, 0, 0, 0);
      const timeKey = d.getTime();
      if (!durationMap[timeKey]) durationMap[timeKey] = 0;
      durationMap[timeKey] += session.duration || 0;
    });

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const timeKey = d.getTime();
      days.push({
        date: d,
        duration: durationMap[timeKey] || 0,
      });
    }

    return days;
  }, [studyHistory]);

  const getIntensityClass = (duration) => {
    if (duration === 0) return "bg-white/[0.03] border-white/5";
    const minutes = duration / 60;
    if (minutes < 30) return "bg-[var(--color-emerald-500)]/20 border-[var(--color-emerald-500)]/30";
    if (minutes < 120) return "bg-[var(--color-emerald-500)]/40 border-[var(--color-emerald-500)]/50";
    if (minutes < 240) return "bg-[var(--color-emerald-500)]/70 border-[var(--color-emerald-500)]/80";
    return "bg-[var(--color-emerald-500)] border-[var(--color-emerald-400)] shadow-[0_0_10px_rgba(16,185,129,0.5)]";
  };

  return (
    <div className="glass-card-elevated border border-white/10 p-5 rounded-3xl w-full">
      <h3 className="text-white font-bold tracking-tight mb-4 text-[15px]">Last 30 Days</h3>
      
      <div className="flex flex-col gap-1 items-end">
        <div className="flex flex-wrap gap-1.5 justify-end">
          {calendarData.map((day, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.01 }}
              className={`w-3.5 h-3.5 rounded-[3px] border ${getIntensityClass(day.duration)}`}
              title={`${day.date.toDateString()}: ${Math.floor(day.duration / 60)} mins`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--color-slate-400)] font-medium">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.03] border border-white/5" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--color-emerald-500)]/20 border border-[var(--color-emerald-500)]/30" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--color-emerald-500)]/40 border border-[var(--color-emerald-500)]/50" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--color-emerald-500)]/70 border border-[var(--color-emerald-500)]/80" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--color-emerald-500)] border border-[var(--color-emerald-400)]" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;
