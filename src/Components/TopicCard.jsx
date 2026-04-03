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

  // Memoized calculation for topic time
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
    <div className="bg-[var(--color-slate-900)]/40 rounded-lg border border-[var(--color-slate-700)] overflow-hidden transition-colors">
      <div className="p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {hasSubTopics && (
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-full hover:bg-[var(--color-slate-700)] transition-colors"
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-center justify-center"
              >
                <FaChevronRight className="text-[var(--color-slate-400)] text-xs" />
              </motion.div>
            </motion.button>
          )}
          {!hasSubTopics && <div className="p-2 w-8 h-8"></div> /* Spacer */}
          <FaBookmark className="text-xl text-[var(--color-emerald-500)] flex-shrink-0 transition-colors" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[var(--color-white)] truncate">
              {topic.name}
            </h4>
            {/* Display the new aggregated time */}
            <p className="text-xs text-[var(--color-slate-400)]">
              {formatTime(topicTime)}
            </p>
          </div>
        </div>
        <motion.button
          onClick={() => onSelect(project, topic)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-emerald-600)] hover:bg-[var(--color-emerald-500)] text-btn rounded-md text-xs font-bold transition-all shadow-md shadow-[var(--color-emerald-600)]/20"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <FaPlay className="text-[10px]" /> Topic
        </motion.button>
      </div>

      <AnimatePresence>
        {isExpanded && hasSubTopics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 150 }}
            className="border-t border-[var(--color-slate-700)]"
          >
            <div className="p-3 space-y-2">
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
