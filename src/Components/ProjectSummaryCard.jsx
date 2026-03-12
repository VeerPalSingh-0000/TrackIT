import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFolder, FaBookmark, FaCheck, FaChevronRight } from 'react-icons/fa';

const ProjectSummaryCard = ({ project, formatTime, timers, topicTimers, subTopicTimers }) => {
    const [isExpanded, setIsExpanded] = useState(false);

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

    const getTopicTime = (topic) => {
        let totalTopicTime = topicTimers[topic.id]?.totalTime || 0;
        if (topic.subTopics) {
            topic.subTopics.forEach(subTopic => {
                totalTopicTime += subTopicTimers[subTopic.id]?.totalTime || 0;
            });
        }
        return totalTopicTime;
    };

    return (
        <motion.div
            layout
            className="bg-[var(--color-slate-900)] rounded-xl border border-[var(--color-slate-700)] overflow-hidden motion-safe-gpu transition-colors"
        >
            <motion.div
                layout
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-[var(--color-slate-700)] transition-all duration-300"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <FaFolder className="text-[var(--color-emerald-500)] text-xl transition-colors" />
                    <p className="font-bold text-lg text-[var(--color-white)]">{project.name}</p>
                </div>
                <div className="flex items-center gap-4">
                    <p className="font-mono text-xl text-[var(--color-white)]">{formatTime(projectTime)}</p>
                    <FaChevronRight className={`text-[var(--color-slate-400)] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
            </motion.div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-[var(--color-slate-700)] bg-[var(--color-slate-900)]/10"
                    >
                        <div className="p-4 pl-6 space-y-3">
                            {project.subProjects && project.subProjects.length > 0 ? (
                                project.subProjects.map(topic => (
                                    <div key={topic.id} className="pl-4 border-l-2 border-[var(--color-slate-700)]">
                                        <div className="flex justify-between items-center px-1">
                                            <p className="flex items-center gap-2 text-[var(--color-emerald-400)] font-bold text-sm sm:text-base selection-theme-text transition-colors"><FaBookmark /> {topic.name}</p>
                                            <p className="font-mono text-[var(--color-white)] font-bold">{formatTime(getTopicTime(topic))}</p>
                                        </div>
                                        {topic.subTopics && topic.subTopics.length > 0 && (
                                            <div className="pl-6 mt-1 space-y-1">
                                                {topic.subTopics.map(subTopic => (
                                                    <div key={subTopic.id} className="flex justify-between items-center text-sm px-1 py-0.5">
                                                        <p className="flex items-center gap-2 text-[var(--color-slate-300)] font-semibold transition-colors"><FaCheck className="text-[var(--color-emerald-500)] text-xs" /> {subTopic.name}</p>
                                                        <p className="font-mono text-[var(--color-slate-400)]">{formatTime(subTopicTimers[subTopic.id]?.totalTime || 0)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-[var(--color-slate-500)] italic pl-4">No topics in this project.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProjectSummaryCard;
