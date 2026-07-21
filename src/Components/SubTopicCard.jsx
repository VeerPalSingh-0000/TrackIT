import React from "react";
import { motion } from "framer-motion";
import { FaCheck, FaPlay } from "react-icons/fa";

const SubTopicCard = ({
  project,
  topic,
  subTopic,
  onSelect,
  formatTime,
  subTopicTimers,
}) => {
  const subTopicTime = subTopicTimers[subTopic.id]?.totalTime || 0;

  return (
    <div className="relative z-10 bg-white/[0.015] p-2.5 rounded-lg flex items-center justify-between gap-3 border border-white/[0.02] transition-all duration-300 hover:bg-white/[0.04] hover:border-emerald-500/15 group ml-3">
      
      {/* Horizontal connector line */}
      <div className="absolute -left-[20px] top-1/2 w-[20px] h-px bg-white/10" />

      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-7 h-7 rounded bg-slate-800/80 border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 transition-colors">
          <FaCheck className="text-[10px] text-slate-500 group-hover:text-emerald-400 transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-slate-200 block truncate text-[13px] font-medium group-hover:text-white transition-colors">
            {subTopic.name}
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5 group-hover:text-slate-400 transition-colors flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            {formatTime(subTopicTime)}
          </p>
        </div>
      </div>
      
      <motion.button
        onClick={() => onSelect(project, topic, subTopic)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-emerald-500 text-slate-400 hover:text-slate-950 rounded-md text-[11px] font-bold transition-colors focus:outline-none shrink-0"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaPlay className="text-[8px]" /> Select
      </motion.button>
    </div>
  );
};

export default SubTopicCard;
