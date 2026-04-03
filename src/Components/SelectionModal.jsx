import React from "react";
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
  return (
    <AnimatedModal onClose={onClose}>
      {/* Sleek Glass Container */}
      <div className="flex flex-col w-[90vw] h-[80vh] max-w-3xl bg-[var(--color-slate-950)]/80 backdrop-blur-3xl border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden motion-safe-gpu">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01]">
          <h2 className="text-[20px] font-semibold text-white tracking-tight">
            Select a Task
          </h2>
          <motion.button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-[var(--color-slate-400)] hover:text-white hover:bg-white/10 transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {projects.length > 0 ? (
            <motion.div
              className="space-y-3"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {projects.map((project) => (
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
            <div className="flex flex-col items-center justify-center h-full text-[var(--color-slate-400)]">
              <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <svg
                  className="w-8 h-8 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-[15px] font-medium text-white mb-1">
                No projects found
              </p>
              <p className="text-[13px] opacity-70">
                Click "New Project" in the menu to begin.
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimatedModal>
  );
};

export default SelectionModal;
