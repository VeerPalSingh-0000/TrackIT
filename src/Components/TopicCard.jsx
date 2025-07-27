import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBookmark, FaChevronRight, FaPlay } from 'react-icons/fa';
import SubTopicCard from './SubTopicCard';

const TopicCard = ({ project, topic, onSelect, formatTime, topicTimers, subTopicTimers }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubTopics = topic.subTopics && topic.subTopics.length > 0;

  // Memoized calculation for topic time
  const topicTime = useMemo(() => {
    let totalTopicTime = topicTimers[topic.id]?.totalTime || 0;
    if (topic.subTopics) {
        topic.subTopics.forEach(subTopic => {
            totalTopicTime += subTopicTimers[subTopic.id]?.totalTime || 0;
        });
    }
    return totalTopicTime;
  }, [topic, topicTimers, subTopicTimers]);

  return (
    <div className="bg-slate-800/60 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {hasSubTopics && (
            <motion.button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-full hover:bg-slate-700" whileTap={{ scale: 0.9 }}>
              <FaChevronRight className={`text-slate-400 transition-transform duration-300 text-xs ${isExpanded ? 'rotate-90' : ''}`} />
            </motion.button>
          )}
           {!hasSubTopics && <div className="w-8 h-8"></div> /* Spacer */}
          <FaBookmark className="text-xl text-purple-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white truncate">{topic.name}</h4>
            {/* Display the new aggregated time */}
            <p className="text-xs text-slate-400">{formatTime(topicTime)}</p>
          </div>
        </div>
        <motion.button onClick={() => onSelect(project, topic)} className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-md text-xs font-semibold" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><FaPlay /> Topic</motion.button>
      </div>

      <AnimatePresence>
        {isExpanded && hasSubTopics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-700"
          >
            <div className="p-3 space-y-2">
              {topic.subTopics.map(subTopic => (
                <SubTopicCard key={subTopic.id} project={project} topic={topic} subTopic={subTopic} onSelect={onSelect} formatTime={formatTime} subTopicTimers={subTopicTimers} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopicCard;
