import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// ✨ Import a new icon for editing
import { FaFolder, FaChevronRight, FaPlay, FaTrash, FaPencilAlt } from 'react-icons/fa';
import TopicCard from './TopicCard';

// ✨ Add the new onEditProject prop
const ProjectCard = ({ project, onSelect, onDeleteProject, onEditProject, formatTime, timers, topicTimers, subTopicTimers }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasTopics = project.subProjects && project.subProjects.length > 0;

  // Memoized calculation (no changes here)
  const projectTime = useMemo(() => {
    let totalProjectTime = timers[project.id]?.totalTime || 0;
    if (project.subProjects) {
        project.subProjects.forEach(topic => {
            let totalTopicTime = topicTimers[topic.id]?.totalTime || 0;
            if (topic.subTopics) {
                topic.subTopics.forEach(subTopic => {
                    totalTopicTime += subTopicTimers[subTopic.id]?.totalTime || 0;
                });
            }
            totalProjectTime += totalTopicTime;
        });
    }
    return totalProjectTime;
  }, [project, timers, topicTimers, subTopicTimers]);

  return (
    <div className="bg-slate-700/50 rounded-xl border border-slate-600 overflow-hidden transition-colors hover:border-indigo-500">
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {hasTopics && (
            <motion.button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-full hover:bg-slate-600" whileTap={{ scale: 0.9 }}>
              <FaChevronRight className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
            </motion.button>
          )}
          {!hasTopics && <div className="w-10 h-10"></div> /* Spacer */}
          <FaFolder className="text-3xl text-blue-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate">{project.name}</h3>
            <p className="text-sm text-slate-400">{formatTime(projectTime)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <motion.button onClick={() => onSelect(project)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><FaPlay /> Select</motion.button>
          
          {/* ✨ NEW EDIT BUTTON */}
          <motion.button 
            onClick={() => onEditProject(project)} 
            className="w-9 h-9 flex items-center justify-center bg-sky-600/80 text-white rounded-lg" 
            whileHover={{ scale: 1.1, backgroundColor: '#0284C7' }} 
            whileTap={{ scale: 0.9 }}
          >
            <FaPencilAlt />
          </motion.button>

          <motion.button onClick={() => onDeleteProject(project.id)} className="w-9 h-9 flex items-center justify-center bg-rose-600/80 text-white rounded-lg" whileHover={{ scale: 1.1, backgroundColor: '#E11D48' }} whileTap={{ scale: 0.9 }}><FaTrash /></motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && hasTopics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-600 bg-black/20"
          >
            <div className="p-4 space-y-3">
              {project.subProjects.map(topic => (
                <TopicCard key={topic.id} project={project} topic={topic} onSelect={onSelect} formatTime={formatTime} topicTimers={topicTimers} subTopicTimers={subTopicTimers} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectCard;
