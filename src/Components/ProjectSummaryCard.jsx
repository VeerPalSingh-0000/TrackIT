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
            className="bg-white/[0.02] rounded-xl border border-white/[0.05] overflow-hidden motion-safe-gpu transition-colors shadow-inner"
        >
            <motion.div
                layout
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/[0.04] transition-all duration-300"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-emerald-500)]/10 flex items-center justify-center">
                        <FaFolder className="text-[var(--color-emerald-400)] text-lg transition-colors" />
                    </div>
                    <p className="font-bold text-[16px] text-white tracking-tight">{project.name}</p>
                </div>
                <div className="flex items-center gap-4">
                    <p className="font-mono text-[18px] text-white font-bold">{formatTime(projectTime)}</p>
                    <div className={`p-1.5 rounded-md transition-colors ${isExpanded ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                        <FaChevronRight className={`text-[var(--color-slate-400)] transition-transform duration-300 ${isExpanded ? 'rotate-90 text-white' : ''}`} />
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/[0.05] bg-black/20"
                    >
                        <div className="p-4 pl-6 space-y-4">
                            {project.subProjects && project.subProjects.length > 0 ? (
                                project.subProjects.map(topic => (
                                    <div key={topic.id} className="pl-4 border-l-2 border-white/10">
                                        <div className="flex justify-between items-center px-1 mb-2">
                                            <p className="flex items-center gap-2 text-[var(--color-emerald-400)] font-bold text-[14px] selection-theme-text transition-colors tracking-wide">
                                                <FaBookmark className="text-[12px] opacity-80" /> {topic.name}
                                            </p>
                                            <p className="font-mono text-white text-[15px] font-bold">{formatTime(getTopicTime(topic))}</p>
                                        </div>
                                        {topic.subTopics && topic.subTopics.length > 0 && (
                                            <div className="pl-5 space-y-2">
                                                {topic.subTopics.map(subTopic => (
                                                    <div key={subTopic.id} className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg text-sm border border-white/[0.02]">
                                                        <p className="flex items-center gap-2 text-[var(--color-slate-300)] font-semibold transition-colors text-[13px]">
                                                            <div className="w-5 h-5 rounded flex items-center justify-center bg-[var(--color-emerald-500)]/10">
                                                                <FaCheck className="text-[var(--color-emerald-400)] text-[10px]" />
                                                            </div>
                                                            {subTopic.name}
                                                        </p>
                                                        <p className="font-mono text-[var(--color-slate-400)] font-medium text-[13px]">{formatTime(subTopicTimers[subTopic.id]?.totalTime || 0)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-[var(--color-slate-500)] italic pl-4 font-medium text-[13px]">No topics in this project.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProjectSummaryCard;
