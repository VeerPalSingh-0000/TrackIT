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
      <div className="flex flex-col w-[90vw] h-[80vh] max-w-4xl bg-[var(--color-slate-950)] border border-[var(--color-slate-700)] rounded-2xl shadow-2xl overflow-hidden motion-safe-gpu transition-colors">
        
        {/* RESPONSIVE HEADER */}
        <div className="p-4 sm:p-6 border-b border-[var(--color-slate-700)]/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 flex-shrink-0 transition-colors">
          
          {/* ✨ RESPONSIVE TITLE: Smaller text on mobile */}
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-white)] text-center sm:text-left">
            Study History
          </h2>
          
          {/* ✨ RESPONSIVE BUTTONS: Takes full width on mobile for easier tapping */}
          <div className="bg-[var(--color-slate-800)] p-1 rounded-lg flex items-center w-full sm:w-auto border border-[var(--color-slate-700)]">
            <button onClick={() => setViewMode('summary')} className={`w-1/3 sm:w-auto px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${viewMode === 'summary' ? 'bg-[var(--color-emerald-500)] text-[var(--color-black)] shadow-lg' : 'text-[var(--color-slate-400)] hover:text-[var(--color-slate-200)] hover:bg-[var(--color-slate-700)]'}`}>Summary</button>
            <button onClick={() => setViewMode('daily')} className={`w-1/3 sm:w-auto px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${viewMode === 'daily' ? 'bg-[var(--color-emerald-500)] text-[var(--color-black)] shadow-lg' : 'text-[var(--color-slate-400)] hover:text-[var(--color-slate-200)] hover:bg-[var(--color-slate-700)]'}`}>Daily</button>
            <button onClick={() => setViewMode('sessions')} className={`w-1/3 sm:w-auto px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${viewMode === 'sessions' ? 'bg-[var(--color-emerald-500)] text-[var(--color-black)] shadow-lg' : 'text-[var(--color-slate-400)] hover:text-[var(--color-slate-200)] hover:bg-[var(--color-slate-700)]'}`}>Sessions</button>
          </div>
        </div>

        {/* Content: Takes up the remaining space and scrolls */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
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
                  {projects.length === 0 && <p className="text-center text-[var(--color-slate-500)] py-10 font-medium">No projects to summarize.</p>}
                </motion.div>
              )}
              
              {viewMode === 'daily' && (
                <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-4">
                  {sortedDates.map(date => {
                    const dailyTotal = groupedSessions[date].reduce((total, session) => total + session.duration, 0);
                    return (
                       <motion.div key={date} variants={itemVariants} className="bg-[var(--color-slate-900)] border border-[var(--color-slate-700)] p-4 rounded-xl flex justify-between items-center transition-colors">
                         <h3 className="flex items-center gap-3 font-semibold text-[var(--color-emerald-500)] transition-colors">
                           <FaCalendarDay className="hidden sm:inline" />
                           {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                         </h3>
                         <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--color-slate-400)] font-bold uppercase tracking-wider">Total</span>
                            <span className="font-mono text-lg sm:text-xl text-[var(--color-emerald-500)] font-bold">{formatTime(dailyTotal)}</span>
                         </div>
                       </motion.div>
                    );
                  })}
                  {sortedDates.length === 0 && <p className="text-center text-[var(--color-slate-500)] py-10 font-medium transition-colors">No daily totals to display.</p>}
                </motion.div>
              )}

              {viewMode === 'sessions' && (
                <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-6">
                   {sortedDates.map(date => (
                    <motion.div key={date} variants={itemVariants}>
                      <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-[var(--color-emerald-500)] mb-3 transition-colors"><FaCalendarDay /> {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                      <div className="space-y-2">
                        {groupedSessions[date].map(session => (
                           <div key={session.id} className="bg-[var(--color-slate-900)] border border-[var(--color-slate-700)] p-4 rounded-xl flex justify-between items-center transition-colors">
                             <div>
                               <p className="font-bold text-[var(--color-white)] text-sm sm:text-base">{session.projectName} {session.topicName && `> ${session.topicName}`}</p>
                               <p className="text-xs text-[var(--color-slate-400)] font-medium">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                             <p className="font-mono text-base sm:text-lg text-[var(--color-emerald-500)] font-bold">{formatTime(session.duration)}</p>
                           </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                  {sortedDates.length === 0 && <p className="text-center text-[var(--color-slate-500)] py-10 font-medium">No sessions recorded yet.</p>}
                </motion.div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer: Stays fixed at the bottom */}
        <div className="p-4 border-t border-[var(--color-slate-700)]/50 flex-shrink-0 bg-[var(--color-slate-950)]/50 transition-colors">
          <button onClick={onClose} className="w-full text-center py-3.5 bg-[var(--color-emerald-600)] text-btn rounded-xl font-bold hover:bg-[var(--color-emerald-500)] transition-all shadow-lg shadow-[var(--color-emerald-600)]/20 active:scale-[0.98]">Close History</button>
        </div>
        
      </div>
    </AnimatedModal>
  );
};

export default HistoryView;