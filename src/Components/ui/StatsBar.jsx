import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { FaFire, FaTrophy, FaClock, FaCalendarCheck } from "react-icons/fa";

const StatsBar = ({ studyHistory = [], formatTime }) => {
  const stats = useMemo(() => {
    let totalSeconds = 0;
    let totalSessions = studyHistory.length;
    
    // Group by unique days
    const uniqueDays = new Set();

    studyHistory.forEach((session) => {
      totalSeconds += session.duration || 0;
      const d = new Date(session.date || session.createdAt);
      d.setHours(0, 0, 0, 0);
      uniqueDays.add(d.getTime());
    });

    const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayTime = yesterday.getTime();

    // Calculate streaks
    let expectedNextDay = todayTime;
    let hasTodayOrYesterday = false;

    if (sortedDays.includes(todayTime)) {
      hasTodayOrYesterday = true;
      expectedNextDay = todayTime;
    } else if (sortedDays.includes(yesterdayTime)) {
      hasTodayOrYesterday = true;
      expectedNextDay = yesterdayTime;
    }

    if (hasTodayOrYesterday) {
        for (let i = 0; i < sortedDays.length; i++) {
            const day = sortedDays[i];
            if (day === expectedNextDay) {
                currentStreak++;
                // 1 day = 86400000 ms
                expectedNextDay -= 86400000;
            } else {
                break;
            }
        }
    }

    // Best streak logic
    let currentTempStreak = 0;
    let expectedTempNextDay = null;
    
    for (let i = 0; i < sortedDays.length; i++) {
        const day = sortedDays[i];
        if (expectedTempNextDay === null || day === expectedTempNextDay) {
            currentTempStreak++;
        } else {
            if (currentTempStreak > bestStreak) bestStreak = currentTempStreak;
            currentTempStreak = 1;
        }
        expectedTempNextDay = day - 86400000;
    }
    if (currentTempStreak > bestStreak) bestStreak = currentTempStreak;

    return {
      totalTime: formatTime(totalSeconds),
      totalSessions,
      currentStreak,
      bestStreak,
    };
  }, [studyHistory, formatTime]);

  const cards = [
    {
      label: "Total Focus",
      value: stats.totalTime,
      icon: <FaClock />,
      color: "text-[var(--color-emerald-400)]",
      bg: "bg-[var(--color-emerald-500)]/10 border-[var(--color-emerald-500)]/20",
    },
    {
      label: "Sessions",
      value: stats.totalSessions,
      icon: <FaCalendarCheck />,
      color: "text-[var(--color-blue-400)]",
      bg: "bg-[var(--color-blue-500)]/10 border-[var(--color-blue-500)]/20",
    },
    {
      label: "Current Streak",
      value: `${stats.currentStreak} Days`,
      icon: <FaFire />,
      color: "text-[var(--color-amber-400)]",
      bg: "bg-[var(--color-amber-500)]/10 border-[var(--color-amber-500)]/20",
    },
    {
      label: "Best Streak",
      value: `${stats.bestStreak} Days`,
      icon: <FaTrophy />,
      color: "text-[var(--color-violet-400)]",
      bg: "bg-[var(--color-violet-500)]/10 border-[var(--color-violet-500)]/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card-elevated border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center border shadow-inner`}>
              <span className={card.color}>{card.icon}</span>
            </div>
            <span className="text-[12px] font-bold text-[var(--color-slate-400)] uppercase tracking-wider">{card.label}</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">{card.value}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsBar;
