import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBookmark, FaChevronRight, FaPlay } from "react-icons/fa";
import SubTopicCard from "./SubTopicCard";

const TopicCard = ({
  project,
  topic,
  onSelect,
  formatTime,
  topicTimers,
  subTopicTimers,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubTopics = topic.subTopics && topic.subTopics.length > 0;

  const topicTime = useMemo(() => {
    let totalTopicTime = topicTimers[topic.id]?.totalTime || 0;
    if (topic.subTopics) {
      topic.subTopics.forEach((subTopic) => {
        totalTopicTime += subTopicTimers[subTopic.id]?.totalTime || 0;
      });
    }
    return totalTopicTime;
  }, [topic, topicTimers, subTopicTimers]);

  return (
    <div className="relative z-10 bg-white/[0.02] rounded-xl border border-white/[0.05] overflow-hidden transition-all duration-300 hover:bg-white/[0.04] hover:border-emerald-500/20 group shadow-sm">
      <div 
        className={`p-3 flex items-center justify-between gap-3 ${hasSubTopics ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (hasSubTopics) setIsExpanded(!isExpanded);
        }}
      >
        <div className="flex items-center flex-1 min-w-0">
          <div className="w-8 flex justify-center shrink-0">
            {hasSubTopics && (
              <motion.button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="flex items-center justify-center text-slate-500 group-hover:text-emerald-400 transition-colors"
                >
                  <FaChevronRight className="text-[10px]" />
                </motion.div>
              </motion.button>
            )}
          </div>
          
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 group-hover:bg-emerald-500/20">
            <FaBookmark className="text-[13px] text-emerald-400" />
          </div>
          
          <div className="ml-3 flex-1 min-w-0">
            <h4 className="font-semibold text-[14px] text-slate-100 tracking-tight truncate group-hover:text-white transition-colors">
              {topic.name}
            </h4>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              {formatTime(topicTime)}
            </p>
          </div>
        </div>
        
        <motion.button
          onClick={(e) => { e.stopPropagation(); onSelect(project, topic); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 rounded-lg text-xs font-bold transition-colors focus:outline-none shadow-sm ml-4 sm:ml-0 shrink-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlay className="text-[9px]" /> Select
        </motion.button>
      </div>

      <AnimatePresence>
        {isExpanded && hasSubTopics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="border-t border-white/[0.03] bg-black/20 overflow-hidden"
          >
            <div className="p-3 pl-11 space-y-2 relative">
               {/* Vertical connecting line for subtopics */}
               <div className="absolute left-[36px] top-0 bottom-5 w-px bg-gradient-to-b from-emerald-500/20 via-white/10 to-transparent rounded-full" />

              {topic.subTopics.map((subTopic) => (
                <SubTopicCard
                  key={subTopic.id}
                  project={project}
                  topic={topic}
                  subTopic={subTopic}
                  onSelect={onSelect}
                  formatTime={formatTime}
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

export default TopicCard;
