import React from 'react';
import { motion } from 'framer-motion';
import AnimatedModal from './ui/AnimatedModal';
import ProjectCard from './ProjectCard'; // Assuming ProjectCard is in the same folder

const listVariants = {
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// All the props from StudyTracker arrive here
const SelectionModal = ({
  projects,
  onSelect,
  onClose,
  onDeleteProject,
  timers,
  topicTimers,
  subTopicTimers,
  formatTime,
}) => {
  return (
    <AnimatedModal onClose={onClose}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Select a Task</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {projects.length > 0 ? (
            <motion.div
                className="space-y-4"
                variants={listVariants}
                initial="hidden"
                animate="visible"
            >
                {projects.map(project => (
                    <motion.div key={project.id} variants={itemVariants}>
                        {/* THE FIX: Pass all the necessary props down to ProjectCard */}
                        <ProjectCard
                            project={project}
                            onSelect={onSelect}
                            onDeleteProject={onDeleteProject}
                            timers={timers}
                            topicTimers={topicTimers}
                            subTopicTimers={subTopicTimers}
                            formatTime={formatTime}
                        />
                    </motion.div>
                ))}
            </motion.div>
        ) : (
            <div className="text-center py-12 text-slate-500">
                <p className="text-lg">No projects found.</p>
                <p>Click "New Project" to get started.</p>
            </div>
        )}
      </div>
    </AnimatedModal>
  );
};

export default SelectionModal;
