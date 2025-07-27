import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFolder, FaBookmark, FaCheck, FaChevronRight } from 'react-icons/fa';

const ProjectSummaryCard = ({ project, formatTime, timers, topicTimers, subTopicTimers }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Memoized calculation to prevent re-computing on every render
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
            className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
        >
            <motion.div
                layout
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <FaFolder className="text-blue-400 text-xl" />
                    <p className="font-bold text-lg text-white">{project.name}</p>
                </div>
                <div className="flex items-center gap-4">
                    <p className="font-mono text-xl text-white">{formatTime(projectTime)}</p>
                    <FaChevronRight className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
            </motion.div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-700 bg-black/10"
                    >
                        <div className="p-4 pl-6 space-y-3">
                            {project.subProjects && project.subProjects.length > 0 ? (
                                project.subProjects.map(topic => (
                                    <div key={topic.id} className="pl-4 border-l-2 border-slate-700">
                                        <div className="flex justify-between items-center">
                                            <p className="flex items-center gap-2 text-purple-300 font-semibold"><FaBookmark /> {topic.name}</p>
                                            <p className="font-mono text-gray-300">{formatTime(getTopicTime(topic))}</p>
                                        </div>
                                        {topic.subTopics && topic.subTopics.length > 0 && (
                                            <div className="pl-6 mt-1 space-y-1">
                                                {topic.subTopics.map(subTopic => (
                                                    <div key={subTopic.id} className="flex justify-between items-center text-sm">
                                                        <p className="flex items-center gap-2 text-emerald-300"><FaCheck /> {subTopic.name}</p>
                                                        <p className="font-mono text-gray-400">{formatTime(subTopicTimers[subTopic.id]?.totalTime || 0)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 italic pl-4">No topics in this project.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProjectSummaryCard;
