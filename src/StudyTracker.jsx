import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import audioService from './services/audioService';

// Firebase and Custom Hooks
import {
  addProjectToFirebase,
  updateProjectInFirebase,
  deleteProjectFromFirebase,
  subscribeToUserProjects,
} from "./firebase/services";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useStudyTimer } from "./hooks/useStudyTimer";
import { usePomodoroTimer } from "./hooks/usePomodoroTimer";

// Components
import Navbar from "./Components/Navbar";
import OnboardingFlow from "./Components/OnboardingFlow";
import SelectionModal from "./Components/SelectionModal";
import HistoryView from "./Components/HistoryView";
import TimerDisplay from "./Components/TimerDisplay";
import AnimatedButton from "./Components/ui/AnimatedButton";

// Icons
import { FaTasks, FaPlay, FaPause, FaRedo } from 'react-icons/fa';

// --- Constants ---
const POMODORO_DURATIONS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

// --- Helper & UI Components ---

/**
 * A visually appealing SVG-based loader.
 */
const Loader = () => (
  <div className="flex flex-col items-center justify-center gap-4">
    <svg className="w-16 h-16 animate-spin text-violet-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
    </svg>
    <p className="text-slate-400">Loading</p>
  </div>
);

/**
 * Toggles between Stopwatch and Pomodoro modes.
 */
const TimerModeToggle = React.memo(({ mode, setMode }) => (
  <div className="flex p-1 rounded-full bg-slate-800/80 border border-slate-700 mb-10">
    <button
      onClick={() => setMode('stopwatch')}
      className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${mode === 'stopwatch' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
    >
      Stopwatch
    </button>
    <button
      onClick={() => setMode('pomodoro')}
      className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${mode === 'pomodoro' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
    >
      Pomodoro
    </button>
  </div>
));

/**
 * Displays the currently selected task hierarchy.
 */
const CurrentTask = React.memo(({ project, topic, subTopic }) => {
    const taskName = project 
        ? `${project.name} ${topic ? `› ${topic.name}` : ''} ${subTopic ? `› ${subTopic.name}` : ''}`
        : "No Task Selected";

    return (
        <div className="p-4 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/80 w-full">
            <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-1">Current Task</h3>
            <p className="text-lg sm:text-xl font-bold text-slate-100 truncate h-7" title={taskName}>
                {taskName}
            </p>
        </div>
    );
});

/**
 * Renders the main timer control buttons.
 */
const TimerControls = ({ isRunning, hasStarted, onStartPause, onStopReset }) => (
    <div className="flex items-center gap-4">
        <motion.button
            onClick={onStartPause}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full text-white font-bold text-2xl flex items-center justify-center transition-all duration-300 shadow-2xl focus:outline-none focus:ring-4 ${isRunning ? "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400/50" : "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400/50"}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isRunning ? "Pause Timer" : "Start Timer"}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={isRunning ? "pause" : "play"}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                >
                    {isRunning ? <FaPause /> : <FaPlay />}
                </motion.div>
            </AnimatePresence>
        </motion.button>
        <AnimatePresence>
            {hasStarted && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <AnimatedButton
                        onClick={onStopReset}
                        className="bg-slate-600 hover:bg-slate-500 text-white !px-4 sm:!px-6"
                        icon={<FaRedo />}
                        aria-label="Reset Timer"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);


// --- Main StudyTracker Component ---

const StudyTracker = () => {
  // ... (All the state and logic from the previous answer remains unchanged)
  const { currentUser, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const [timers, setTimers] = useLocalStorage(`timers_${currentUser.uid}`, {});
  const [topicTimers, setTopicTimers] = useLocalStorage(`topicTimers_${currentUser.uid}`, {});
  const [subTopicTimers, setSubTopicTimers] = useLocalStorage(`subTopicTimers_${currentUser.uid}`, {});
  const [studyHistory, setStudyHistory] = useLocalStorage(`studyHistory_${currentUser.uid}`, []);
  const [timerMode, setTimerMode] = useLocalStorage('timerMode', 'stopwatch');
  const [pomodoroCycle, setPomodoroCycle] = useLocalStorage(`pomodoroCycle_${currentUser.uid}`, 0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const stopwatch = useStudyTimer();
  const pomodoro = usePomodoroTimer(POMODORO_DURATIONS);
  const playedCuesRef = useRef(new Set());
  
  useEffect(() => { audioService.init(); }, []);

  const formatTime = useCallback((milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const saveSession = useCallback((durationInMs) => {
    if (!selectedProject || durationInMs < 1000) {
      if (stopwatch.sessionStartTime) toast.error("Session too short to save.");
      return;
    }
    const id = selectedSubTopic?.id || selectedTopic?.id || selectedProject.id;
    const type = selectedSubTopic ? "subtopic" : selectedTopic ? "topic" : "project";
    const updateTimers = (setter) => { setter(prev => ({ ...prev, [id]: { totalTime: (prev[id]?.totalTime || 0) + durationInMs } })); };
    if (type === "project") updateTimers(setTimers);
    else if (type === "topic") updateTimers(setTopicTimers);
    else if (type === "subtopic") updateTimers(setSubTopicTimers);
    const sessionRecord = {
      id: `session_${Date.now()}`,
      projectId: selectedProject.id, projectName: selectedProject.name,
      topicId: selectedTopic?.id || null, topicName: selectedTopic?.name || null,
      subTopicId: selectedSubTopic?.id || null, subTopicName: selectedSubTopic?.name || null,
      duration: durationInMs,
      startTime: stopwatch.sessionStartTime || (Date.now() - durationInMs),
      endTime: Date.now(),
      date: new Date().toISOString().split("T")[0],
      type: type,
    };
    setStudyHistory(prev => [sessionRecord, ...prev]);
    toast.success(`Saved ${formatTime(durationInMs)} session!`);
  }, [selectedProject, selectedTopic, selectedSubTopic, setTimers, setTopicTimers, setSubTopicTimers, setStudyHistory, stopwatch.sessionStartTime, formatTime]);

  useEffect(() => {
    if (isCompletingSession) return;
    if (pomodoro.isActive && pomodoro.mode === 'work' && pomodoro.timeLeft === 3 && !playedCuesRef.current.has('countdown')) {
        audioService.play('countdown');
        playedCuesRef.current.add('countdown');
    }
    if (!pomodoro.isActive && pomodoro.timeLeft === 0) {
        setIsCompletingSession(true);
        const endedMode = pomodoro.mode;
        if (endedMode === 'work') {
            toast.success("Work session complete! Time for a break.");
            audioService.play('end');
            saveSession(POMODORO_DURATIONS.work * 1000);
            const newCycle = pomodoroCycle + 1;
            setPomodoroCycle(newCycle);
            const nextBreak = newCycle % 4 === 0 ? 'longBreak' : 'shortBreak';
            pomodoro.resetTimer(nextBreak);
            setTimeout(() => { pomodoro.startTimer(); setIsCompletingSession(false); }, 1000);
        } else {
            toast("Break's over! Let's get back to it.", { icon: '💪' });
            audioService.play('start');
            pomodoro.resetTimer('work');
            setTimeout(() => { pomodoro.startTimer(); setIsCompletingSession(false); }, 1000);
        }
    }
  }, [pomodoro.timeLeft, pomodoro.isActive, pomodoro.mode, pomodoro, saveSession, pomodoroCycle, setPomodoroCycle, isCompletingSession]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToUserProjects(currentUser.uid, (fetchedProjects) => {
      setProjects(fetchedProjects);
      setDataLoading(false);
      if (fetchedProjects.length > 0 && !selectedProject) {
        setSelectedProject(fetchedProjects[0]);
      }
      if (fetchedProjects.length === 0 && !localStorage.getItem(`onboarding_completed_${currentUser.uid}`)) {
        setTimeout(() => setIsProjectModalOpen(true), 500);
      }
    });
    return () => unsubscribe();
  }, [currentUser, selectedProject]);

  const handleOpenCreateModal = () => { setEditingProject(null); setIsProjectModalOpen(true); };
  const handleOpenEditModal = (project) => { setEditingProject(project); setIsProjectModalOpen(true); };
  const handleCloseProjectModal = () => { setIsProjectModalOpen(false); setEditingProject(null); };

  const handleCreateOrUpdateProject = async (projectData, projectId) => {
    try {
      if (projectId) { await updateProjectInFirebase(projectId, projectData); toast.success("Project updated!"); } 
      else { await addProjectToFirebase(projectData, currentUser.uid); localStorage.setItem(`onboarding_completed_${currentUser.uid}`, 'true'); toast.success("Project created!"); }
    } catch (error) { toast.error(`Error: ${error.message}`); } 
    finally { handleCloseProjectModal(); }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm("Are you sure? This will delete the project and all its data permanently.")) return;
    try {
        await deleteProjectFromFirebase(projectId);
        setStudyHistory(prev => prev.filter(s => s.projectId !== projectId));
        if (selectedProject?.id === projectId) {
            setSelectedProject(projects.length > 1 ? projects.find(p => p.id !== projectId) : null);
            setSelectedTopic(null); setSelectedSubTopic(null);
            stopwatch.resetTimer(); pomodoro.resetTimer('work');
            playedCuesRef.current.clear();
        }
        toast.success("Project deleted.");
    } catch(error) { toast.error(`Failed to delete: ${error.message}`); }
  };

  const handleStartPause = () => {
    if (!selectedProject) { toast.error("Please select a task first!"); setShowSelectionModal(true); return; }
    if (timerMode === 'stopwatch') { stopwatch.isSessionRunning ? stopwatch.pauseTimer() : stopwatch.startTimer(); } 
    else {
      if (pomodoro.isActive) { pomodoro.pauseTimer(); } 
      else { pomodoro.startTimer(); if (pomodoro.mode === 'work') { playedCuesRef.current.clear(); audioService.play('start'); } }
    }
  };

  const handleStopOrReset = () => {
    playedCuesRef.current.clear();
    if (timerMode === 'stopwatch') {
      const duration = stopwatch.endSessionAndGetDuration();
      saveSession(duration); stopwatch.resetTimer();
    } else {
      const isWorkSession = pomodoro.mode === 'work' && pomodoro.isActive;
      const confirmPrompt = isWorkSession ? "Stop, save progress, and reset the cycle?" : "Reset the Pomodoro cycle?";
      if (window.confirm(confirmPrompt)) {
        if (isWorkSession) { const elapsed = POMODORO_DURATIONS.work - pomodoro.timeLeft; saveSession(elapsed * 1000); }
        pomodoro.resetTimer('work'); setPomodoroCycle(0);
      }
    }
  };
  
  const handleSelection = (project, topic = null, subTopic = null) => {
    const isRunning = timerMode === 'stopwatch' ? stopwatch.isSessionRunning : pomodoro.isActive;
    if (isRunning) { if (window.confirm("A session is running. End it and switch tasks?")) { handleStopOrReset(); } else { return; } }
    setSelectedProject(project); setSelectedTopic(topic); setSelectedSubTopic(subTopic);
    stopwatch.resetTimer(); pomodoro.resetTimer('work');
    playedCuesRef.current.clear();
    setShowSelectionModal(false);
  };
  
  if (dataLoading) { return ( <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader /></div> ); }

  const isRunning = timerMode === 'stopwatch' ? stopwatch.isSessionRunning : pomodoro.isActive;
  const displayTime = timerMode === 'stopwatch' ? stopwatch.sessionDisplayTime : pomodoro.timeLeft * 1000;
  const hasStarted = timerMode === 'stopwatch' ? stopwatch.sessionStartTime !== null : pomodoro.timeLeft < POMODORO_DURATIONS[pomodoro.mode];
  const getPomodoroStatusText = () => {
    if (pomodoro.mode === 'work') return `Focus Session ${pomodoroCycle + 1} of 4`;
    if (pomodoro.mode === 'shortBreak') return "Short Break";
    return "Long Break";
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' } }} />
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-950 to-gray-900 -z-10"></div>
        
        <Navbar onNewProjectClick={handleOpenCreateModal} onHistoryClick={() => setShowHistory(true)} onLogout={logout} />

        <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 text-center">
          <TimerModeToggle mode={timerMode} setMode={setTimerMode} />
          <TimerDisplay time={displayTime} isRunning={isRunning} formatTime={formatTime} />
          
          {timerMode === 'pomodoro' ? (
             <p className="text-amber-400 font-semibold mt-4 text-lg animate-pulse h-7">{getPomodoroStatusText()}</p>
          ) : (
            <div className="h-7 mt-4" /> /* Placeholder to prevent layout shift */
          )}

          <div className="mt-8 space-y-6 w-full max-w-md">
            <CurrentTask project={selectedProject} topic={selectedTopic} subTopic={selectedSubTopic} />
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <AnimatedButton
                  onClick={() => setShowSelectionModal(true)}
                  className="bg-violet-600 hover:bg-violet-500 text-white w-full sm:w-auto"
                  icon={<FaTasks />}
              >
                  Select Task
              </AnimatedButton>
              <TimerControls
                  isRunning={isRunning}
                  hasStarted={hasStarted}
                  onStartPause={handleStartPause}
                  onStopReset={handleStopOrReset}
              />
            </div>
          </div>
        </main>

        <AnimatePresence>
          {showSelectionModal && (
            <SelectionModal
              projects={projects} onSelect={handleSelection} onDeleteProject={deleteProject} onEditProject={handleOpenEditModal}
              timers={timers} topicTimers={topicTimers} subTopicTimers={subTopicTimers}
              formatTime={formatTime} onClose={() => setShowSelectionModal(false)}
            />
          )}
          {showHistory && (
            <HistoryView
              projects={projects} studyHistory={studyHistory} formatTime={formatTime}
              timers={timers} topicTimers={topicTimers} subTopicTimers={subTopicTimers}
              onClose={() => setShowHistory(false)}
            />
          )}
          {isProjectModalOpen && (
            <OnboardingFlow
              onFinish={handleCreateOrUpdateProject} onCancel={handleCloseProjectModal}
              projectToEdit={editingProject}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default StudyTracker;