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
    <div className="bg-white/[0.02] p-3 pl-4 rounded-xl flex items-center justify-between gap-3 border border-white/[0.03] transition-all duration-300 hover:bg-white/[0.04] hover:border-[var(--color-emerald-500)]/10 motion-safe-gpu">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-6 h-6 rounded-md bg-[var(--color-slate-800)] flex items-center justify-center flex-shrink-0">
          <FaCheck className="text-[10px] text-[var(--color-slate-400)] transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-white block truncate text-[13px] font-medium transition-colors">
            {subTopic.name}
          </span>
          <p className="text-[11px] text-[var(--color-slate-400)] transition-colors mt-0.5">
            {formatTime(subTopicTime)}
          </p>
        </div>
      </div>
      <motion.button
        onClick={() => onSelect(project, topic, subTopic)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-[var(--color-emerald-500)]/20 text-[var(--color-emerald-400)] rounded-lg text-[12px] font-bold transition-all shadow-sm shadow-[var(--color-emerald-500)]/5 focus:outline-none"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <FaPlay className="text-[9px]" /> Select
      </motion.button>
    </div>
  );
};

export default SubTopicCard;
