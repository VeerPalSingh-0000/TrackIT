import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedModal from './ui/AnimatedModal';
import ProjectSummaryCard from './ProjectSummaryCard'; // Import the new component
import { FaCalendarDay } from "react-icons/fa";

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HistoryView = ({ projects, studyHistory, formatTime, onClose, timers, topicTimers, subTopicTimers }) => {
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'sessions'

  const groupedSessions = studyHistory.reduce((acc, session) => {
    const date = session.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSessions).sort((a, b) => new Date(b) - new Date(a));

  return (
    <AnimatedModal onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Header with View Toggle */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Study History</h2>
            <div className="bg-slate-700 p-1 rounded-lg flex items-center">
              <button onClick={() => setViewMode('summary')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'summary' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Summary</button>
              <button onClick={() => setViewMode('sessions')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'sessions' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Sessions</button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {viewMode === 'summary' && (
                <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-4">
                  {projects.map(p => (
                    <motion.div key={p.id} variants={itemVariants}>
                        {/* This now renders the actual summary card with all required props */}
                        <ProjectSummaryCard 
                            project={p}
                            formatTime={formatTime}
                            timers={timers}
                            topicTimers={topicTimers}
                            subTopicTimers={subTopicTimers}
                        />
                    </motion.div>
                  ))}
                   {projects.length === 0 && <p className="text-center text-slate-500 py-10">No projects to summarize.</p>}
                </motion.div>
              )}
              {viewMode === 'sessions' && (
                <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-6">
                  {sortedDates.map(date => (
                    <motion.div key={date} variants={itemVariants}>
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-indigo-300 mb-3"><FaCalendarDay /> {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                      <div className="space-y-2">
                        {groupedSessions[date].map(session => (
                           <div key={session.id} className="bg-slate-800/70 p-4 rounded-lg flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-white">{session.projectName} {session.topicName && `> ${session.topicName}`}</p>
                                <p className="text-xs text-slate-400">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                              <p className="font-mono text-lg text-emerald-400">{formatTime(session.duration)}</p>
                           </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                  {sortedDates.length === 0 && <p className="text-center text-slate-500 py-10">No sessions recorded yet.</p>}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button onClick={onClose} className="w-full text-center py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition-colors">Close</button>
        </div>
      </div>
    </AnimatedModal>
  );
};

export default HistoryView;
