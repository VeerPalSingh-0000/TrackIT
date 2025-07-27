import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaPlay } from 'react-icons/fa';

const SubTopicCard = ({ project, topic, subTopic, onSelect, formatTime, subTopicTimers }) => {
  const subTopicTime = subTopicTimers[subTopic.id]?.totalTime || 0;

  return (
    <div className="bg-slate-900/50 p-3 rounded-lg flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <FaCheck className="text-sm text-emerald-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-gray-200 block truncate text-sm">{subTopic.name}</span>
          <p className="text-xs text-slate-500">{formatTime(subTopicTime)}</p>
        </div>
      </div>
      <motion.button onClick={() => onSelect(project, topic, subTopic)} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-semibold" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><FaPlay /> Select</motion.button>
    </div>
  );
};

export default SubTopicCard;
