import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedModal from "./ui/AnimatedModal";
import ProjectSummaryCard from "./ProjectSummaryCard";
import { FaCalendarDay } from "react-icons/fa";

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 28, stiffness: 250 },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { type: "spring", damping: 28, stiffness: 250 },
  },
};

const HistoryView = ({
  projects,
  studyHistory,
  formatTime,
  onClose,
  timers,
  topicTimers,
  subTopicTimers,
}) => {
  const [viewMode, setViewMode] = useState("summary");

  const groupedSessions = studyHistory.reduce((acc, session) => {
    const date = session.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSessions).sort(
    (a, b) => new Date(b) - new Date(a),
  );

  return (
    <AnimatedModal onClose={onClose}>
      <div className="flex flex-col w-[90vw] h-[85vh] max-w-4xl bg-[var(--color-slate-950)]/80 backdrop-blur-3xl border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden motion-safe-gpu">
        {/* Sleek Header & Segmented Control */}
        <div className="p-5 sm:p-6 border-b border-white/[0.05] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5 flex-shrink-0 bg-white/[0.01]">
          <h2 className="text-[20px] sm:text-[22px] font-semibold text-white text-center sm:text-left tracking-tight">
            Session History
          </h2>

          {/* iOS-Style Segmented Control */}
          <div className="bg-black/30 p-1 rounded-xl flex items-center w-full sm:w-auto border border-white/[0.05] shadow-inner">
            {["summary", "daily", "sessions"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 sm:flex-none relative px-5 py-2 text-[13px] font-semibold rounded-lg transition-all duration-300 focus:outline-none capitalize select-none ${
                  viewMode === mode
                    ? "text-white shadow-sm"
                    : "text-[var(--color-slate-400)] hover:text-white hover:bg-white/5"
                }`}
              >
                {viewMode === mode && (
                  <motion.div
                    layoutId="activeTabHistory"
                    className="absolute inset-0 bg-white/10 border border-white/10 rounded-lg"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10">{mode}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrolling Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", damping: 28, stiffness: 250 }}
            >
              {/* SUMMARY VIEW */}
              {viewMode === "summary" && (
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {projects.map((p) => (
                    <motion.div key={p.id} variants={itemVariants}>
                      <ProjectSummaryCard
                        {...{
                          project: p,
                          formatTime,
                          timers,
                          topicTimers,
                          subTopicTimers,
                        }}
                      />
                    </motion.div>
                  ))}
                  {projects.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-[15px] font-medium text-[var(--color-slate-400)]">
                        No projects to summarize.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* DAILY VIEW */}
              {viewMode === "daily" && (
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {sortedDates.map((date) => {
                    const dailyTotal = groupedSessions[date].reduce(
                      (total, session) => total + session.duration,
                      0,
                    );
                    return (
                      <motion.div
                        key={date}
                        variants={itemVariants}
                        className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl flex justify-between items-center hover:bg-white/[0.04] transition-colors"
                      >
                        <h3 className="flex items-center gap-3 text-[15px] font-semibold text-white">
                          <FaCalendarDay className="text-[var(--color-emerald-500)] opacity-80" />
                          {new Date(date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </h3>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-[var(--color-slate-400)] font-bold uppercase tracking-widest mb-0.5">
                            Total Focus
                          </span>
                          <span className="font-mono text-[18px] text-[var(--color-emerald-400)] font-bold">
                            {formatTime(dailyTotal)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                  {sortedDates.length === 0 && (
                    <p className="text-center text-[var(--color-slate-400)] py-12 font-medium">
                      No daily totals recorded.
                    </p>
                  )}
                </motion.div>
              )}

              {/* SESSIONS VIEW */}
              {viewMode === "sessions" && (
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  {sortedDates.map((date) => (
                    <motion.div key={date} variants={itemVariants}>
                      <h3 className="flex items-center gap-2 text-[14px] font-bold text-[var(--color-emerald-500)] mb-3 tracking-wide uppercase">
                        <FaCalendarDay className="text-[12px]" />
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      <div className="space-y-2.5">
                        {groupedSessions[date].map((session) => (
                          <div
                            key={session.id}
                            className="bg-white/[0.02] border border-white/[0.05] p-4 sm:p-5 rounded-2xl flex justify-between items-center hover:bg-white/[0.04] transition-colors"
                          >
                            <div className="pr-4">
                              <p className="font-semibold text-white text-[14px] sm:text-[15px] leading-snug">
                                {session.projectName}
                                {session.topicName && (
                                  <span className="text-[var(--color-slate-400)] font-medium ml-1.5">
                                    › {session.topicName}
                                  </span>
                                )}
                                {session.subTopicName && (
                                  <span className="text-[var(--color-slate-500)] font-medium ml-1.5">
                                    › {session.subTopicName}
                                  </span>
                                )}
                              </p>
                              <p className="text-[12px] text-[var(--color-slate-400)] font-medium mt-1">
                                {new Date(session.startTime).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                            <p className="font-mono text-[16px] sm:text-[18px] text-[var(--color-emerald-400)] font-bold">
                              {formatTime(session.duration)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                  {sortedDates.length === 0 && (
                    <p className="text-center text-[var(--color-slate-400)] py-12 font-medium">
                      No sessions recorded yet.
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Minimalist Button */}
        <div className="p-5 border-t border-white/[0.05] flex-shrink-0 bg-black/20">
          <button
            onClick={onClose}
            className="w-full text-center py-3.5 bg-[var(--color-emerald-500)]/10 text-[var(--color-emerald-400)] rounded-xl text-[14px] font-semibold hover:bg-[var(--color-emerald-500)]/20 hover:text-[var(--color-emerald-300)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.98]"
          >
            Close History
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
};

export default HistoryView;
