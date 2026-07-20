import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import AnimatedModal from "./ui/AnimatedModal";
import ProjectCard from "./ProjectCard";

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15, duration: 0.3 },
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

const SelectionModal = ({
  projects,
  onSelect,
  onClose,
  onDeleteProject,
  onEditProject,
  timers,
  topicTimers,
  subTopicTimers,
  formatTime,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects;
    return projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projects, searchTerm]);

  return (
    <AnimatedModal onClose={onClose}>
      {/* Sleek Glass Container */}
      <div className="flex flex-col w-[90vw] h-[85vh] max-h-[800px] max-w-4xl glass-card-elevated rounded-3xl overflow-hidden motion-safe-gpu border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Header & Search */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex justify-between items-center mb-4 sm:mb-5">
            <h2 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-emerald-400)] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Select a Task
            </h2>
            <motion.button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-[var(--color-slate-400)] hover:text-white hover:bg-white/10 transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-[var(--color-slate-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-slate-900)]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[14px] text-white placeholder-[var(--color-slate-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-emerald-500)]/50 focus:border-transparent transition-all backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-[var(--color-slate-900)]/20">
          {filteredProjects.length > 0 ? (
            <motion.div
              className="space-y-4"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredProjects.map((project) => (
                <motion.div key={project.id} variants={itemVariants}>
                  <ProjectCard
                    project={project}
                    onSelect={onSelect}
                    onDeleteProject={onDeleteProject}
                    onEditProject={onEditProject}
                    timers={timers}
                    topicTimers={topicTimers}
                    subTopicTimers={subTopicTimers}
                    formatTime={formatTime}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--color-slate-400)] py-10">
              <div className="w-20 h-20 mb-6 rounded-full glass-card border border-white/5 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl" />
                <svg
                  className="w-10 h-10 opacity-60 text-emerald-400 relative z-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-[16px] font-semibold text-white mb-2">
                {searchTerm ? "No projects found" : "No projects yet"}
              </p>
              <p className="text-[14px] text-slate-400/80 max-w-xs text-center">
                {searchTerm
                  ? `We couldn't find anything matching "${searchTerm}".`
                  : "Create your first project from the menu to start tracking your focus sessions."}
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimatedModal>
  );
};

export default SelectionModal;
