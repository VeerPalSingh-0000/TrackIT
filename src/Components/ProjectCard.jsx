import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFolder,
  FaChevronRight,
  FaPlay,
  FaTrash,
  FaPencilAlt,
} from "react-icons/fa";
import TopicCard from "./TopicCard";

const ProjectCard = ({
  project,
  onSelect,
  onDeleteProject,
  onEditProject,
  formatTime,
  timers,
  topicTimers,
  subTopicTimers,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasTopics = project.subProjects && project.subProjects.length > 0;

  const projectTime = useMemo(() => {
    let totalProjectTime = timers[project.id]?.totalTime || 0;
    if (project.subProjects) {
      project.subProjects.forEach((topic) => {
        let totalTopicTime = topicTimers[topic.id]?.totalTime || 0;
        if (topic.subTopics) {
          topic.subTopics.forEach((subTopic) => {
            totalTopicTime += subTopicTimers[subTopic.id]?.totalTime || 0;
          });
        }
        totalProjectTime += totalTopicTime;
      });
    }
    return totalProjectTime;
  }, [project, timers, topicTimers, subTopicTimers]);

  return (
    <div className="bg-white/[0.02] rounded-2xl border border-white/[0.05] overflow-hidden transition-all duration-300 hover:bg-white/[0.04] hover:border-[var(--color-emerald-500)]/30 motion-safe-gpu">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Icon & Title */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {hasTopics && (
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-center justify-center"
              >
                <FaChevronRight className="text-[12px] text-[var(--color-slate-400)]" />
              </motion.div>
            </motion.button>
          )}
          {!hasTopics && <div className="w-6 h-6 -ml-1.5"></div>}

          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <FaFolder className="text-[18px] text-blue-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-semibold text-white tracking-tight truncate">
              {project.name}
            </h3>
            <p className="text-[13px] text-[var(--color-slate-400)] font-medium mt-0.5">
              {formatTime(projectTime)}
            </p>
          </div>
        </div>

        {/* Right Side: Actions (Glassmorphic Minimalist) */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <motion.button
            onClick={() => onSelect(project)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-emerald-500)]/10 text-[var(--color-emerald-400)] hover:bg-[var(--color-emerald-500)]/20 hover:text-[var(--color-emerald-300)] rounded-xl text-[13px] font-semibold transition-colors motion-safe-gpu shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] focus:outline-none"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <FaPlay className="text-[10px]" /> Select
          </motion.button>

          <motion.button
            onClick={() => onEditProject(project)}
            className="w-9 h-9 flex items-center justify-center bg-white/5 text-[var(--color-slate-300)] hover:bg-white/10 hover:text-white rounded-xl transition-colors motion-safe-gpu focus:outline-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <FaPencilAlt className="text-[12px]" />
          </motion.button>

          <motion.button
            onClick={() => onDeleteProject(project.id)}
            className="w-9 h-9 flex items-center justify-center bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 rounded-xl transition-colors motion-safe-gpu focus:outline-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <FaTrash className="text-[12px]" />
          </motion.button>
        </div>
      </div>

      {/* Accordion with Spring Physics */}
      <AnimatePresence>
        {isExpanded && hasTopics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 35, stiffness: 120 }}
            className="border-t border-white/[0.05] bg-black/20 motion-safe-gpu overflow-hidden"
          >
            <div className="p-4 sm:p-5 space-y-2.5">
              {project.subProjects.map((topic) => (
                <TopicCard
                  key={topic.id}
                  project={project}
                  topic={topic}
                  onSelect={onSelect}
                  formatTime={formatTime}
                  topicTimers={topicTimers}
                  subTopicTimers={subTopicTimers}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectCard;
