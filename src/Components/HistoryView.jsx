import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedModal from './ui/AnimatedModal';
import ProjectSummaryCard from './ProjectSummaryCard';
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
  const [viewMode, setViewMode] = useState('summary');

  const groupedSessions = studyHistory.reduce((acc, session) => {
    const date = session.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSessions).sort((a, b) => new Date(b) - new Date(a));

  return (
    <AnimatedModal onClose={onClose}>
      <div className="flex flex-col w-[95vw] h-[90vh] max-w-4xl bg-slate-900 rounded-xl shadow-2xl overflow-hidden">
        
        {/* ✨ RESPONSIVE HEADER: Stacks vertically on mobile, horizontally on larger screens */}
        <div className="p-4 sm:p-6 border-b border-slate-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 flex-shrink-0">
          
          {/* ✨ RESPONSIVE TITLE: Smaller text on mobile */}
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center sm:text-left">
            Study History
          </h2>
          
          {/* ✨ RESPONSIVE BUTTONS: Takes full width on mobile for easier tapping */}
          <div className="bg-slate-700 p-1 rounded-lg flex items-center w-full sm:w-auto">
            <button onClick={() => setViewMode('summary')} className={`w-1/3 sm:w-auto px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'summary' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Summary</button>
            <button onClick={() => setViewMode('daily')} className={`w-1/3 sm:w-auto px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'daily' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Daily</button>
            <button onClick={() => setViewMode('sessions')} className={`w-1/3 sm:w-auto px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'sessions' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Sessions</button>
          </div>
        </div>

        {/* Content: Takes up the remaining space and scrolls */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* All the view modes remain here... */}
              {viewMode === 'summary' && (
                <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-4">
                  {projects.map(p => (
                    <motion.div key={p.id} variants={itemVariants}>
                      <ProjectSummaryCard {...{project: p, formatTime, timers, topicTimers, subTopicTimers}} />
                    </motion.div>
                  ))}
                  {projects.length === 0 && <p className="text-center text-slate-500 py-10">No projects to summarize.</p>}
                </motion.div>
              )}
              
              {viewMode === 'daily' && (
                <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-4">
                  {sortedDates.map(date => {
                    const dailyTotal = groupedSessions[date].reduce((total, session) => total + session.duration, 0);
                    return (
                       <motion.div key={date} variants={itemVariants} className="bg-slate-800/70 p-4 rounded-lg flex justify-between items-center">
                         <h3 className="flex items-center gap-3 font-semibold text-indigo-300">
                           <FaCalendarDay className="hidden sm:inline" />
                           {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                         </h3>
                         <div>
                            <span className="text-sm text-slate-400 mr-2">Total:</span>
                            <span className="font-mono text-lg sm:text-xl text-emerald-400">{formatTime(dailyTotal)}</span>
                         </div>
                       </motion.div>
                    );
                  })}
                  {sortedDates.length === 0 && <p className="text-center text-slate-500 py-10">No daily totals to display.</p>}
                </motion.div>
              )}

              {viewMode === 'sessions' && (
                <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-6">
                  {sortedDates.map(date => (
                    <motion.div key={date} variants={itemVariants}>
                      <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-indigo-300 mb-3"><FaCalendarDay /> {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                      <div className="space-y-2">
                        {groupedSessions[date].map(session => (
                           <div key={session.id} className="bg-slate-800/70 p-4 rounded-lg flex justify-between items-center">
                             <div>
                               <p className="font-semibold text-white text-sm sm:text-base">{session.projectName} {session.topicName && `> ${session.topicName}`}</p>
                               <p className="text-xs text-slate-400">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                             <p className="font-mono text-base sm:text-lg text-emerald-400">{formatTime(session.duration)}</p>
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

        {/* Footer: Stays fixed at the bottom */}
        <div className="p-4 border-t border-slate-700 flex-shrink-0">
          <button onClick={onClose} className="w-full text-center py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition-colors">Close</button>
        </div>
        
      </div>
    </AnimatedModal>
  );
};

export default HistoryView;