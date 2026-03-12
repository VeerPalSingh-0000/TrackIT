import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaPlay } from 'react-icons/fa';

const SubTopicCard = ({ project, topic, subTopic, onSelect, formatTime, subTopicTimers }) => {
  const subTopicTime = subTopicTimers[subTopic.id]?.totalTime || 0;

  return (
    <div className="bg-[var(--color-slate-950)]/40 p-3 rounded-lg flex items-center justify-between gap-3 border border-[var(--color-slate-700)]/30 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <FaCheck className="text-sm text-[var(--color-emerald-400)] flex-shrink-0 transition-colors" />
        <div className="flex-1 min-w-0">
          <span className="text-[var(--color-white)] block truncate text-sm font-medium transition-colors">{subTopic.name}</span>
          <p className="text-xs text-[var(--color-slate-400)] transition-colors">{formatTime(subTopicTime)}</p>
        </div>
      </div>
      <motion.button onClick={() => onSelect(project, topic, subTopic)} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-emerald-600)] hover:bg-[var(--color-emerald-500)] text-btn rounded-md text-xs font-bold transition-all shadow-md shadow-[var(--color-emerald-600)]/20" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><FaPlay className="text-[10px]" /> Select</motion.button>
    </div>
  );
};

export default SubTopicCard;
