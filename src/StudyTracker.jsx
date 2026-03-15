import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
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

// Components (Static Imports)
import Navbar from "./Components/Navbar";
import OnboardingFlow from "./Components/OnboardingFlow";
import TimerDisplay from "./Components/TimerDisplay";
import AnimatedButton from "./Components/ui/AnimatedButton";
import WelcomeScreen from "./Components/WelcomeScreen";

// Icons
import { FaTasks, FaPlay, FaPause, FaRedo } from 'react-icons/fa';
import TrackerLogo from '../public/clock.png';

// --- PHASE 1: LAZY LOADED COMPONENTS ---
const SelectionModal = lazy(() => import("./Components/SelectionModal"));
const HistoryView = lazy(() => import("./Components/HistoryView"));
const About = lazy(() => import("./Components/About"));
const Features = lazy(() => import("./Components/Features"));

const POMODORO_DURATIONS = { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };

const Loader = () => (
  <div className="flex flex-col items-center justify-center gap-6">
    <div className="relative">
      <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
      <img src={TrackerLogo} alt="FocusFlow" className="relative w-32 h-32 object-contain animate-pulse" />
    </div>
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

const TimerModeToggle = React.memo(({ mode, setMode }) => (
  <div className="relative flex p-1 rounded-full bg-slate-800/60 backdrop-blur-sm border border-white/[0.06] mb-10">
    <motion.div 
      className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-[var(--color-emerald-500)] to-[var(--color-emerald-600)] shadow-lg motion-safe-gpu"
      animate={{ x: mode === 'stopwatch' ? 0 : '100%', width: '50%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ width: 'calc(50% - 2px)', left: 2 }}
    />
    <button onClick={() => setMode('stopwatch')} className={`relative z-10 px-5 py-2 text-[13px] font-semibold rounded-full transition-colors duration-200 ${mode === 'stopwatch' ? 'text-btn' : 'text-[var(--color-slate-400)] hover:text-[var(--color-slate-300)]'}`}>Stopwatch</button>
    <button onClick={() => setMode('pomodoro')} className={`relative z-10 px-5 py-2 text-[13px] font-semibold rounded-full transition-colors duration-200 ${mode === 'pomodoro' ? 'text-btn' : 'text-[var(--color-slate-400)] hover:text-[var(--color-slate-300)]'}`}>Pomodoro</button>
  </div>
));

const CurrentTask = React.memo(({ project, topic, subTopic }) => {
    const parts = [];
    if (project) parts.push(project.name);
    if (topic) parts.push(topic.name);
    if (subTopic) parts.push(subTopic.name);
    const taskName = parts.length > 0 ? parts.join(' › ') : 'No Task Selected';

    return (
        <div className="p-4 rounded-2xl bg-[var(--color-slate-900)]/40 backdrop-blur-sm border border-[var(--color-slate-700)]/40 w-full transition-colors">
            <h3 className="text-[11px] font-semibold text-[var(--color-emerald-400)] uppercase tracking-[0.15em] mb-1.5 opacity-80">Current Task</h3>
            <p className="text-base sm:text-lg font-semibold text-[var(--color-white)] truncate" title={taskName}>{taskName}</p>
        </div>
    );
});

const TimerControls = React.memo(({ isRunning, hasStarted, onStartPause, onStopReset }) => {
    const handleStartPause = async () => {
      try { const { hapticMedium } = await import('./services/nativeBridge.js'); hapticMedium(); } catch(e) {}
      onStartPause();
    };
    const handleStopReset = async () => {
      try { const { hapticLight } = await import('./services/nativeBridge.js'); hapticLight(); } catch(e) {}
      onStopReset();
    };
    return (
    <div className="flex items-center gap-4">
        <motion.button onClick={handleStartPause} className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full text-btn font-bold text-2xl flex items-center justify-center transition-all duration-300 shadow-2xl focus:outline-none focus:ring-4 ${isRunning ? "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400/50" : "bg-[var(--color-emerald-500)] hover:bg-[var(--color-emerald-600)]"}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label={isRunning ? "Pause Timer" : "Start Timer"}>
            <AnimatePresence mode="wait">
                <motion.div key={isRunning ? "pause" : "play"} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }}>
                    {isRunning ? <FaPause /> : <FaPlay />}
                </motion.div>
            </AnimatePresence>
        </motion.button>
        <AnimatePresence>
            {hasStarted && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <AnimatedButton onClick={handleStopReset} className="bg-[var(--color-slate-700)] hover:bg-[var(--color-slate-600)] text-[var(--color-white)] !px-4 sm:!px-6 border border-[var(--color-slate-600)] shadow-lg" icon={<FaRedo className="text-sm" />} aria-label="Reset Timer" />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
    );
});


const StudyTracker = () => {
  const { currentUser, logout } = useAuth();
  
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [isProjectsLoaded, setIsProjectsLoaded] = useState(false);
  
  const [projects, setProjects] = useState([]);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const [timers, setTimers] = useState({});
  const [topicTimers, setTopicTimers] = useState({});
  const [subTopicTimers, setSubTopicTimers] = useState({});
  const [studyHistory, setStudyHistory] = useState([]);
  
  const [timerMode, setTimerMode] = useLocalStorage('timerMode', 'stopwatch');
  const [pomodoroCycle, setPomodoroCycle] = useLocalStorage(`pomodoroCycle_${currentUser?.uid}`, 0);
  const [selectedProject, setSelectedProject] = useLocalStorage(`selectedProj_${currentUser?.uid}`, null);
  const [selectedTopic, setSelectedTopic] = useLocalStorage(`selectedTopic_${currentUser?.uid}`, null);
  const [selectedSubTopic, setSelectedSubTopic] = useLocalStorage(`selectedSubTopic_${currentUser?.uid}`, null);
  
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  const stopwatch = useStudyTimer();
  const pomodoro = usePomodoroTimer(POMODORO_DURATIONS);
  const playedCuesRef = useRef(new Set());
  
  useEffect(() => {
    const initAudio = () => { audioService.init(); document.removeEventListener('click', initAudio); };
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    loadTimerDataFromFirebase(currentUser.uid).then((data) => {
      if (data) { setTimers(data.timers || {}); setTopicTimers(data.topicTimers || {}); setSubTopicTimers(data.subTopicTimers || {}); }
    });
    const unsubSessions = subscribeToUserSessions(currentUser.uid, (sessions) => { setStudyHistory(sessions); });
    
    getUserProfile(currentUser.uid).then((profile) => {
      if (!profile || !profile.onboardingCompleted) { setShowWelcome(true); }
      setIsProfileLoaded(true);
    });
    
    return () => unsubSessions();
  }, [currentUser]);

  const selectedStateRef = useRef({ selectedProject, selectedTopic, selectedSubTopic });
  useEffect(() => { selectedStateRef.current = { selectedProject, selectedTopic, selectedSubTopic }; }, [selectedProject, selectedTopic, selectedSubTopic]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToUserProjects(currentUser.uid, (fetchedProjects) => {
      setProjects(fetchedProjects);
      const { selectedProject: currProj, selectedTopic: currTopic, selectedSubTopic: currSubTopic } = selectedStateRef.current;
      if (fetchedProjects.length > 0) {
        let matchedProject = fetchedProjects.find(p => p.id === currProj?.id);
        if (!matchedProject) { matchedProject = fetchedProjects[0]; setSelectedTopic(null); setSelectedSubTopic(null); } 
        else if (currTopic) {
            const matchedTopic = matchedProject.topics?.find(t => t.id === currTopic.id);
            if (!matchedTopic) { setSelectedTopic(null); setSelectedSubTopic(null); } 
            else { setSelectedTopic(matchedTopic); if (currSubTopic) { const matchedSubTopic = matchedTopic.subTopics?.find(s => s.id === currSubTopic.id); if (!matchedSubTopic) setSelectedSubTopic(null); else setSelectedSubTopic(matchedSubTopic); } }
        }
        setSelectedProject(matchedProject);
      } else {
          setSelectedProject(null); setSelectedTopic(null); setSelectedSubTopic(null);
      }
      setIsProjectsLoaded(true);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const formatTime = useCallback((milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const saveSession = useCallback((durationInMs) => {
    if (!selectedProject || durationInMs < 1000) { if (stopwatch.sessionStartTime) toast.error("Session too short to save."); return; }
    const id = selectedSubTopic?.id || selectedTopic?.id || selectedProject.id;
    const type = selectedSubTopic ? "subtopic" : selectedTopic ? "topic" : "project";
    
    const updateTimerState = (setter, key) => { setter(prev => { return { ...prev, [key]: { totalTime: (prev[key]?.totalTime || 0) + durationInMs } }; }); };
    if (type === "project") updateTimerState(setTimers, id); else if (type === "topic") updateTimerState(setTopicTimers, id); else if (type === "subtopic") updateTimerState(setSubTopicTimers, id);

    setTimeout(() => {
      saveTimerDataToFirebase(currentUser?.uid, {
        timers: type === "project" ? { ...timers, [id]: { totalTime: (timers[id]?.totalTime || 0) + durationInMs } } : timers,
        topicTimers: type === "topic" ? { ...topicTimers, [id]: { totalTime: (topicTimers[id]?.totalTime || 0) + durationInMs } } : topicTimers,
        subTopicTimers: type === "subtopic" ? { ...subTopicTimers, [id]: { totalTime: (subTopicTimers[id]?.totalTime || 0) + durationInMs } } : subTopicTimers,
      });
    }, 100);

    const sessionRecord = {
      id: `session_${Date.now()}`, projectId: selectedProject.id, projectName: selectedProject.name, topicId: selectedTopic?.id || null, topicName: selectedTopic?.name || null, subTopicId: selectedSubTopic?.id || null, subTopicName: selectedSubTopic?.name || null, duration: durationInMs, startTime: stopwatch.sessionStartTime || (Date.now() - durationInMs), endTime: Date.now(), date: new Date().toISOString().split("T")[0], type: type,
    };
    addSessionToFirebase(sessionRecord, currentUser?.uid);
    toast.success(`Saved ${formatTime(durationInMs)} session!`);
  }, [selectedProject, selectedTopic, selectedSubTopic, timers, topicTimers, subTopicTimers, currentUser, stopwatch.sessionStartTime, formatTime]);

  useEffect(() => {
    if (isCompletingSession) return;
    if (pomodoro.isActive && pomodoro.mode === 'work' && pomodoro.timeLeft === 3 && !playedCuesRef.current.has('countdown')) { audioService.play('countdown'); playedCuesRef.current.add('countdown'); }
    if (!pomodoro.isActive && pomodoro.timeLeft === 0) {
        setIsCompletingSession(true);
        const endedMode = pomodoro.mode;
        if (endedMode === 'work') {
            toast.success("Work session complete! Time for a break."); audioService.play('end'); saveSession(POMODORO_DURATIONS.work * 1000);
            const newCycle = pomodoroCycle + 1; setPomodoroCycle(newCycle);
            const nextBreak = newCycle % 4 === 0 ? 'longBreak' : 'shortBreak';
            pomodoro.resetTimer(nextBreak); setTimeout(() => { pomodoro.startTimer(); setIsCompletingSession(false); }, 1000);
        } else {
            toast("Break's over! Let's get back to it.", { icon: '💪' }); audioService.play('start');
            pomodoro.resetTimer('work'); setTimeout(() => { pomodoro.startTimer(); setIsCompletingSession(false); }, 1000);
        }
    }
  }, [pomodoro.timeLeft, pomodoro.isActive, pomodoro.mode, pomodoro, saveSession, pomodoroCycle, setPomodoroCycle, isCompletingSession]);

  // --- PHASE 2: MEMOIZED HANDLERS ---
  const handleOpenCreateModal = useCallback(() => { 
    setEditingProject(null); 
    setIsProjectModalOpen(true); 
  }, []);

  const handleOpenEditModal = useCallback((project) => { 
    setEditingProject(project); 
    setIsProjectModalOpen(true); 
  }, []);

  const handleCloseProjectModal = useCallback(() => { 
    setIsProjectModalOpen(false); 
    setEditingProject(null); 
  }, []);

  const handleCreateOrUpdateProject = useCallback(async (projectData, projectId) => {
    try {
      if (projectId) { await updateProjectInFirebase(projectId, projectData); toast.success("Project updated!"); } 
      else { await addProjectToFirebase(projectData, currentUser.uid); toast.success("Project created!"); }
    } catch (error) { toast.error(`Error: ${error.message}`); } 
    finally { handleCloseProjectModal(); }
  }, [currentUser, handleCloseProjectModal]);

  const deleteProject = useCallback(async (projectId) => {
    if (!window.confirm("Are you sure? This will delete the project and all its data permanently.")) return;
    try {
        await deleteProjectFromFirebase(projectId);
        setStudyHistory(prev => prev.filter(s => s.projectId !== projectId));
        if (selectedProject?.id === projectId) {
            setSelectedProject(projects.length > 1 ? projects.find(p => p.id !== projectId) : null);
            setSelectedTopic(null); setSelectedSubTopic(null); stopwatch.resetTimer(); pomodoro.resetTimer('work'); playedCuesRef.current.clear();
        }
        toast.success("Project deleted.");
    } catch(error) { toast.error(`Failed to delete: ${error.message}`); }
  }, [projects, selectedProject, stopwatch, pomodoro, setSelectedProject, setSelectedTopic, setSelectedSubTopic]);

  const handleStartPause = useCallback(() => {
    if (!selectedProject) { toast.error("Please select a task first!"); setShowSelectionModal(true); return; }
    if (timerMode === 'stopwatch') { stopwatch.isSessionRunning ? stopwatch.pauseTimer() : stopwatch.startTimer(); } 
    else { if (pomodoro.isActive) { pomodoro.pauseTimer(); } else { pomodoro.startTimer(); if (pomodoro.mode === 'work') { playedCuesRef.current.clear(); audioService.play('start'); } } }
  }, [selectedProject, timerMode, stopwatch, pomodoro]);

  const handleStopOrReset = useCallback(() => {
    playedCuesRef.current.clear();
    if (timerMode === 'stopwatch') {
      const duration = stopwatch.endSessionAndGetDuration(); saveSession(duration); stopwatch.resetTimer();
    } else {
      const isWorkSession = pomodoro.mode === 'work' && pomodoro.isActive;
      const confirmPrompt = isWorkSession ? "Stop, save progress, and reset the cycle?" : "Reset the Pomodoro cycle?";
      if (window.confirm(confirmPrompt)) {
        if (isWorkSession) { const elapsed = POMODORO_DURATIONS.work - pomodoro.timeLeft; saveSession(elapsed * 1000); }
        pomodoro.resetTimer('work'); setPomodoroCycle(0);
      }
    }
  }, [timerMode, stopwatch, pomodoro, saveSession, setPomodoroCycle]);
  
  const handleSelection = useCallback((project, topic = null, subTopic = null) => {
    const isRunning = timerMode === 'stopwatch' ? stopwatch.isSessionRunning : pomodoro.isActive;
    if (isRunning) { if (window.confirm("A session is running. End it and switch tasks?")) { handleStopOrReset(); } else { return; } }
    setSelectedProject(project); setSelectedTopic(topic); setSelectedSubTopic(subTopic);
    stopwatch.resetTimer(); pomodoro.resetTimer('work'); playedCuesRef.current.clear(); setShowSelectionModal(false);
  }, [timerMode, stopwatch, pomodoro, handleStopOrReset, setSelectedProject, setSelectedTopic, setSelectedSubTopic]);

  const isLoading = !isProfileLoaded || !isProjectsLoaded;
  if (isLoading) { 
      return ( <div className="min-h-screen bg-[var(--color-slate-950)] text-[var(--color-slate-400)] flex items-center justify-center transition-colors duration-500"><Loader /></div> ); 
  }

  if (showWelcome) {
     return (
       <div className="min-h-screen bg-[var(--color-slate-950)] flex items-center justify-center relative overflow-hidden">
         <div className="fixed inset-0 -z-0 pointer-events-none">
            <div className="aura-orb-1 absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-[var(--color-emerald-500)]/5 blur-[100px]" />
            <div className="aura-orb-2 absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-[var(--color-slate-400)]/5 blur-[100px]" />
         </div>
         <WelcomeScreen onComplete={() => {
            markOnboardingComplete(currentUser.uid);
            setShowWelcome(false);
            setTimeout(() => setIsProjectModalOpen(true), 300);
         }} />
       </div>
     );
  }

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
      <Toaster position="bottom-center" toastOptions={{ style: { background: 'var(--color-slate-800)', color: 'var(--color-slate-100)', border: '1px solid var(--color-slate-700)' } }} />
      <div className="min-h-screen bg-[var(--color-slate-950)] text-[var(--color-slate-300)] flex flex-col relative overflow-hidden transition-colors duration-500">
        <div className="fixed inset-0 -z-0 pointer-events-none overflow-hidden">
          <div className="aura-orb-1 absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-[var(--color-emerald-500)]/5 blur-[100px]" />
          <div className="aura-orb-2 absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-[var(--color-slate-400)]/5 blur-[100px]" />
          <div className="aura-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[var(--color-emerald-300)]/5 blur-[80px]" />
        </div>
        
        <Navbar 
          onNewProjectClick={handleOpenCreateModal} 
          onHistoryClick={() => setShowHistory(true)} 
          onLogout={logout} 
          user={currentUser}
          onAboutClick={() => setShowAbout(true)}
          onFeaturesClick={() => setShowFeatures(true)}
        />

        <main className="flex-grow flex flex-col items-center justify-center p-6 sm:p-8 text-center relative z-10 native-app:pb-24">
          <TimerModeToggle mode={timerMode} setMode={setTimerMode} />
          <TimerDisplay time={displayTime} isRunning={isRunning} formatTime={formatTime} />
          
          {timerMode === 'pomodoro' ? (
             <p className="text-amber-400 font-semibold mt-4 text-lg animate-pulse h-7">{getPomodoroStatusText()}</p>
          ) : (
            <div className="h-7 mt-4" /> 
          )}

          <div className="mt-8 space-y-6 w-full max-w-md">
            <CurrentTask project={selectedProject} topic={selectedTopic} subTopic={selectedSubTopic} />
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
               <AnimatedButton
                  onClick={() => setShowSelectionModal(true)}
                  className="bg-[var(--color-emerald-600)] hover:bg-[var(--color-emerald-500)] text-btn w-full sm:w-auto shadow-lg shadow-[var(--color-emerald-600)]/20"
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

        <footer className="relative z-10 py-6 px-4 text-center border-t border-[var(--color-slate-700)]/30 safe-pb mt-auto">
          <p className="text-[11px] text-[var(--color-slate-500)] font-bold tracking-[0.2em] uppercase transition-colors">
            FocusFlow · Deep Work Companion © {new Date().getFullYear()}
          </p>
        </footer>
        
        {/* --- LAZY LOADED MODALS WRAPPED IN SUSPENSE --- */}
        <AnimatePresence>
          <Suspense fallback={
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-slate-950)]/80 backdrop-blur-sm">
               <Loader />
            </div>
          }>
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
          </Suspense>
        </AnimatePresence>
      </div>
    </>
  );
};

export default StudyTracker;