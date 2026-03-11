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
  addSessionToFirebase,
  subscribeToUserSessions,
  saveTimerDataToFirebase,
  loadTimerDataFromFirebase,
  getUserProfile,
  markOnboardingComplete,
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
import About from "./Components/About";
import Features from "./Components/Features";
import WelcomeScreen from "./Components/WelcomeScreen";

// Icons
import { FaTasks, FaPlay, FaPause, FaRedo } from 'react-icons/fa';
import TrackerLogo from '../public/clock.png';

// --- Constants ---
const POMODORO_DURATIONS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

// --- Helper & UI Components ---

/**
 * Premium splash loader with logo.
 */
const Loader = () => (
  <div className="flex flex-col items-center justify-center gap-6">
    <div className="relative">
      <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
      <img src={TrackerLogo} alt="FocusFlow" className="relative w-20 h-20 object-contain animate-pulse" />
    </div>
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

/**
 * Toggles between Stopwatch and Pomodoro modes — refined pill toggle.
 */
const TimerModeToggle = React.memo(({ mode, setMode }) => (
  <div className="relative flex p-1 rounded-full bg-slate-800/60 backdrop-blur-sm border border-white/[0.06] mb-10">
    {/* Sliding indicator */}
    <motion.div 
      className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20"
      animate={{ x: mode === 'stopwatch' ? 0 : '100%', width: '50%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ width: 'calc(50% - 2px)', left: 2 }}
    />
    <button
      onClick={() => setMode('stopwatch')}
      className={`relative z-10 px-5 py-2 text-[13px] font-semibold rounded-full transition-colors duration-200 ${mode === 'stopwatch' ? 'text-white' : 'text-slate-400 hover:text-slate-300'}`}
    >
      Stopwatch
    </button>
    <button
      onClick={() => setMode('pomodoro')}
      className={`relative z-10 px-5 py-2 text-[13px] font-semibold rounded-full transition-colors duration-200 ${mode === 'pomodoro' ? 'text-white' : 'text-slate-400 hover:text-slate-300'}`}
    >
      Pomodoro
    </button>
  </div>
));

/**
 * Displays the currently selected task hierarchy — cleaner card.
 */
const CurrentTask = React.memo(({ project, topic, subTopic }) => {
    const parts = [];
    if (project) parts.push(project.name);
    if (topic) parts.push(topic.name);
    if (subTopic) parts.push(subTopic.name);
    const taskName = parts.length > 0 ? parts.join(' › ') : 'No Task Selected';

    return (
        <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] w-full">
            <h3 className="text-[11px] font-semibold text-violet-400/80 uppercase tracking-[0.15em] mb-1.5">Current Task</h3>
            <p className="text-base sm:text-lg font-semibold text-slate-100 truncate" title={taskName}>
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
  const [timers, setTimers] = useState({});
  const [topicTimers, setTopicTimers] = useState({});
  const [subTopicTimers, setSubTopicTimers] = useState({});
  const [studyHistory, setStudyHistory] = useState([]);
  const [timerMode, setTimerMode] = useLocalStorage('timerMode', 'stopwatch');
  const [pomodoroCycle, setPomodoroCycle] = useLocalStorage(`pomodoroCycle_${currentUser.uid}`, 0);
  const [selectedProject, setSelectedProject] = useLocalStorage(`selectedProj_${currentUser.uid}`, null);
  const [selectedTopic, setSelectedTopic] = useLocalStorage(`selectedTopic_${currentUser.uid}`, null);
  const [selectedSubTopic, setSelectedSubTopic] = useLocalStorage(`selectedSubTopic_${currentUser.uid}`, null);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const stopwatch = useStudyTimer();
  const pomodoro = usePomodoroTimer(POMODORO_DURATIONS);
  const playedCuesRef = useRef(new Set());
  
  // Initialize audio context only on first user interaction to satisfy browser autoplay policies
  useEffect(() => {
    const initAudio = () => {
      audioService.init();
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, []);

  // Load timer data and session history from Firestore on mount
  useEffect(() => {
    if (!currentUser) return;
    // Load timer data
    loadTimerDataFromFirebase(currentUser.uid).then((data) => {
      if (data) {
        setTimers(data.timers || {});
        setTopicTimers(data.topicTimers || {});
        setSubTopicTimers(data.subTopicTimers || {});
      }
    });
    // Subscribe to session history in real-time
    const unsubSessions = subscribeToUserSessions(currentUser.uid, (sessions) => {
      setStudyHistory(sessions);
    });
    // Check onboarding status from Firestore
    getUserProfile(currentUser.uid).then((profile) => {
      if (!profile || !profile.onboardingCompleted) {
        // New user or hasn't completed onboarding
        setOnboardingChecked(true); // flag: we need to check project count
      }
    });
    return () => unsubSessions();
  }, [currentUser]);

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
    
    // Update timer accumulations in state
    const updateTimerState = (setter, key) => {
      setter(prev => {
        const updated = { ...prev, [key]: { totalTime: (prev[key]?.totalTime || 0) + durationInMs } };
        return updated;
      });
    };
    if (type === "project") updateTimerState(setTimers, id);
    else if (type === "topic") updateTimerState(setTopicTimers, id);
    else if (type === "subtopic") updateTimerState(setSubTopicTimers, id);

    // Save timer data to Firestore (debounced save after state update)
    setTimeout(() => {
      saveTimerDataToFirebase(currentUser.uid, {
        timers: type === "project" ? { ...timers, [id]: { totalTime: (timers[id]?.totalTime || 0) + durationInMs } } : timers,
        topicTimers: type === "topic" ? { ...topicTimers, [id]: { totalTime: (topicTimers[id]?.totalTime || 0) + durationInMs } } : topicTimers,
        subTopicTimers: type === "subtopic" ? { ...subTopicTimers, [id]: { totalTime: (subTopicTimers[id]?.totalTime || 0) + durationInMs } } : subTopicTimers,
      });
    }, 100);

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
    // Save session to Firestore (permanent, cross-device)
    addSessionToFirebase(sessionRecord, currentUser.uid);
    toast.success(`Saved ${formatTime(durationInMs)} session!`);
  }, [selectedProject, selectedTopic, selectedSubTopic, timers, topicTimers, subTopicTimers, currentUser, stopwatch.sessionStartTime, formatTime]);

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

  // Keeping refs to the current selections so the Firebase callback doesn't need them in its dependency array
  // This prevents unnecessary re-subscriptions to Firestore when selections change.
  const selectedStateRef = useRef({ selectedProject, selectedTopic, selectedSubTopic });
  useEffect(() => {
      selectedStateRef.current = { selectedProject, selectedTopic, selectedSubTopic };
  }, [selectedProject, selectedTopic, selectedSubTopic]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToUserProjects(currentUser.uid, (fetchedProjects) => {
      setProjects(fetchedProjects);
      setDataLoading(false);
      
      const { selectedProject: currProj, selectedTopic: currTopic, selectedSubTopic: currSubTopic } = selectedStateRef.current;

      if (fetchedProjects.length > 0) {
        // Try to keep the currently selected project, or default to the first one
        let matchedProject = fetchedProjects.find(p => p.id === currProj?.id);
        
        if (!matchedProject) {
            matchedProject = fetchedProjects[0];
            setSelectedTopic(null);
            setSelectedSubTopic(null);
        } else if (currTopic) {
            // Re-sync topic & subtopic to get latest names/data from Firebase
            const matchedTopic = matchedProject.topics?.find(t => t.id === currTopic.id);
            if (!matchedTopic) {
                setSelectedTopic(null);
                setSelectedSubTopic(null);
            } else {
                setSelectedTopic(matchedTopic);
                if (currSubTopic) {
                    const matchedSubTopic = matchedTopic.subTopics?.find(s => s.id === currSubTopic.id);
                    if (!matchedSubTopic) setSelectedSubTopic(null);
                    else setSelectedSubTopic(matchedSubTopic);
                }
            }
        }
        
        setSelectedProject(matchedProject);
      } else {
          setSelectedProject(null);
          setSelectedTopic(null);
          setSelectedSubTopic(null);
      }

      // Show welcome tour if this is a new user (no projects + not onboarded)
      if (fetchedProjects.length === 0 && onboardingChecked) {
        setTimeout(() => setShowWelcome(true), 500);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, onboardingChecked]);

  const handleOpenCreateModal = () => { setEditingProject(null); setIsProjectModalOpen(true); };
  const handleOpenEditModal = (project) => { setEditingProject(project); setIsProjectModalOpen(true); };
  const handleCloseProjectModal = () => { setIsProjectModalOpen(false); setEditingProject(null); };

  const handleCreateOrUpdateProject = async (projectData, projectId) => {
    try {
      if (projectId) { await updateProjectInFirebase(projectId, projectData); toast.success("Project updated!"); } 
      else { await addProjectToFirebase(projectData, currentUser.uid); toast.success("Project created!"); }
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
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col relative overflow-hidden">
        {/* Living aura background */}
        <div className="fixed inset-0 -z-0 pointer-events-none overflow-hidden">
          <div className="aura-orb-1 absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.04] blur-[100px]" />
          <div className="aura-orb-2 absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.05] blur-[100px]" />
          <div className="aura-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-500/[0.03] blur-[80px]" />
        </div>
        
        <Navbar 
          onNewProjectClick={handleOpenCreateModal} 
          onHistoryClick={() => setShowHistory(true)} 
          onLogout={logout} 
          user={currentUser}
          onAboutClick={() => setShowAbout(true)}
          onFeaturesClick={() => setShowFeatures(true)}
        />

        <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 text-center relative z-10">
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

        {/* Footer */}
        <footer className="relative z-10 py-6 px-4 text-center border-t border-white/[0.04]">
          <p className="text-[11px] text-slate-600 tracking-wide">
            Built with focus · FocusFlow © {new Date().getFullYear()}
          </p>
        </footer>

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
          {showAbout && <About onClose={() => setShowAbout(false)} />}
          {showFeatures && <Features onClose={() => setShowFeatures(false)} />}
          {showWelcome && <WelcomeScreen onComplete={() => {
            markOnboardingComplete(currentUser.uid);
            setShowWelcome(false);
            setOnboardingChecked(false);
            setTimeout(() => setIsProjectModalOpen(true), 300);
          }} />}
        </AnimatePresence>
      </div>
    </>
  );
};

export default StudyTracker;