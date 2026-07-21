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
    <div className="relative group rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-black/20 overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_8px_32px_rgba(52,211,153,0.15)] motion-safe-gpu backdrop-blur-xl">
      {/* Subtle top glow on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div 
        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${hasTopics ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (hasTopics) setIsExpanded(!isExpanded);
        }}
      >
        {/* Left Side: Icon & Title */}
        <div className="flex items-center flex-1 min-w-0">
          <div className="w-8 flex justify-center shrink-0">
            {hasTopics && (
              <motion.button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors"
                >
                  <FaChevronRight className="text-xs" />
                </motion.div>
              </motion.button>
            )}
          </div>

          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all duration-300">
            <FaFolder className="text-lg text-emerald-400" />
          </div>

          <div className="ml-4 flex-1 min-w-0">
            <h3 className="text-base font-bold text-white tracking-tight truncate group-hover:text-emerald-300 transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
              {formatTime(projectTime)}
            </p>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center ml-12 sm:ml-0">
          <motion.button
            onClick={(e) => { e.stopPropagation(); onSelect(project); }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 hover:bg-emerald-400 hover:text-slate-950 rounded-xl text-sm font-bold transition-colors shadow-lg focus:outline-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlay className="text-xs" /> Select
          </motion.button>

          <motion.button
            onClick={(e) => { e.stopPropagation(); onEditProject(project); }}
            className="w-9 h-9 flex items-center justify-center bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white rounded-xl transition-colors focus:outline-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaPencilAlt className="text-xs" />
          </motion.button>

          <motion.button
            onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
            className="w-9 h-9 flex items-center justify-center bg-white/5 text-rose-500/80 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition-colors focus:outline-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaTrash className="text-xs" />
          </motion.button>
        </div>
      </div>

      {/* Accordion */}
      <AnimatePresence>
        {isExpanded && hasTopics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="border-t border-white/[0.05] bg-black/30 overflow-hidden"
          >
            <div className="p-4 pl-12 space-y-3 relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[38px] top-0 bottom-6 w-px bg-gradient-to-b from-emerald-500/30 via-white/10 to-transparent" />
              
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
