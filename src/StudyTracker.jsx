import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import * as Tone from 'tone';

// Firebase and Custom Hooks
import {
  addProjectToFirebase,
  deleteProjectFromFirebase,
  subscribeToUserProjects,
} from "./firebase/services";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useStudyTimer } from "./hooks/useStudyTimer";
import { usePomodoroTimer } from "./hooks/usePomodoroTimer";

// Components
import OnboardingFlow from "./Components/OnboardingFlow";
import SelectionModal from "./Components/SelectionModal";
import HistoryView from "./Components/HistoryView";
import TimerDisplay from "./Components/TimerDisplay";
import AnimatedButton from "./Components/ui/AnimatedButton";
import { FaPlus, FaHistory, FaSignOutAlt, FaTasks, FaPlay, FaPause, FaStop, FaRedo } from 'react-icons/fa';

// Timer Mode Toggle Component
const TimerModeToggle = ({ mode, setMode }) => (
  <div className="flex p-1 rounded-full bg-slate-800/80 border border-slate-700 mb-10">
    <button
      onClick={() => setMode('stopwatch')}
      className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${mode === 'stopwatch' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
    >
      Stopwatch
    </button>
    <button
      onClick={() => setMode('pomodoro')}
      className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${mode === 'pomodoro' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
    >
      Pomodoro
    </button>
  </div>
);


const StudyTracker = () => {
  const { currentUser, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // General State
  const [timers, setTimers] = useLocalStorage(`timers_${currentUser.uid}`, {});
  const [topicTimers, setTopicTimers] = useLocalStorage(`topicTimers_${currentUser.uid}`, {});
  const [subTopicTimers, setSubTopicTimers] = useLocalStorage(`subTopicTimers_${currentUser.uid}`, {});
  const [studyHistory, setStudyHistory] = useLocalStorage(`studyHistory_${currentUser.uid}`, []);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);

  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);

  // --- TIMER STATE MANAGEMENT ---
  const [timerMode, setTimerMode] = useLocalStorage('timerMode', 'stopwatch');
  const [pomodoroCycle, setPomodoroCycle] = useLocalStorage(`pomodoroCycle_${currentUser.uid}`, 0);
  const [isBreakPending, setIsBreakPending] = useState(false); // New state for manual break start

  // Sound Synthesizers
  const synthRef = useRef(null);
  useEffect(() => {
    synthRef.current = new Tone.Synth().toDestination();
  }, []);

  // Stopwatch Hook
  const stopwatch = useStudyTimer();

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const saveSession = useCallback((duration) => {
    if (!selectedProject || duration < 1000) {
      if (stopwatch.sessionStartTime) toast.error("Session too short to save.");
      return;
    }
    const id = selectedSubTopic?.id || selectedTopic?.id || selectedProject.id;
    const type = selectedSubTopic ? "subtopic" : selectedTopic ? "topic" : "project";
    const updateTimers = (setter) => {
      setter(prev => ({
        ...prev,
        [id]: { totalTime: (prev[id]?.totalTime || 0) + duration }
      }));
    };
    if (type === "project") updateTimers(setTimers);
    else if (type === "topic") updateTimers(setTopicTimers);
    else if (type === "subtopic") updateTimers(setSubTopicTimers);
    const sessionRecord = {
        id: `session_${Date.now()}`,
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        topicId: selectedTopic?.id || null,
        topicName: selectedTopic?.name || null,
        subTopicId: selectedSubTopic?.id || null,
        subTopicName: selectedSubTopic?.name || null,
        duration: duration,
        startTime: stopwatch.sessionStartTime || (Date.now() - duration),
        endTime: Date.now(),
        date: new Date().toISOString().split("T")[0],
        type: type,
    };
    setStudyHistory(prev => [sessionRecord, ...prev]);
    toast.success(`Saved ${formatTime(duration)} session!`);
  }, [selectedProject, selectedTopic, selectedSubTopic, setTimers, setTopicTimers, setSubTopicTimers, setStudyHistory, stopwatch.sessionStartTime, formatTime]);

  const handlePomodoroSessionEnd = useCallback((endedMode) => {
    if (endedMode === 'work') {
      toast.success("Work session complete! Time for a break.");
      synthRef.current?.triggerAttackRelease("C5", "8n");
      saveSession(25 * 60 * 1000); 
      const newCycle = pomodoroCycle + 1;
      setPomodoroCycle(newCycle);
      if (newCycle % 4 === 0) {
        pomodoro.resetTimer('longBreak');
      } else {
        pomodoro.resetTimer('shortBreak');
      }
      setIsBreakPending(true); // Set break as pending
    } else { 
      toast("Break's over! Let's get back to work.", { icon: '💪' });
      synthRef.current?.triggerAttackRelease("G5", "8n");
      pomodoro.resetTimer('work');
    }
  }, [pomodoroCycle, setPomodoroCycle, saveSession]);

  const pomodoro = usePomodoroTimer({ onSessionEnd: handlePomodoroSessionEnd });

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToUserProjects(
        currentUser.uid,
        (fetchedProjects) => {
          setProjects(fetchedProjects);
          setDataLoading(false);
          if (fetchedProjects.length > 0 && !selectedProject) {
            setSelectedProject(fetchedProjects[0]);
          }
          if (fetchedProjects.length === 0 && !localStorage.getItem(`onboarding_completed_${currentUser.uid}`)) {
            setTimeout(() => setIsOnboarding(true), 500);
          }
        }
      );
      return unsubscribe;
    }
  }, [currentUser, selectedProject]);

  const handleStartPause = async () => {
    if (isBreakPending) return; // Don't allow start/pause if a break is pending user action
    if (!selectedProject) {
      toast.error("Please select a project first!");
      setShowSelectionModal(true);
      return;
    }
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }

    if (timerMode === 'stopwatch') {
      stopwatch.isSessionRunning ? stopwatch.pauseTimer() : stopwatch.startTimer();
    } else { 
      pomodoro.isActive ? pomodoro.pauseTimer() : pomodoro.startTimer();
    }
  };
  
  const handleStartBreak = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    pomodoro.startTimer();
    setIsBreakPending(false);
  }

  const handleStop = () => {
    if (timerMode === 'stopwatch') {
      const duration = stopwatch.endSessionAndGetDuration();
      saveSession(duration);
      stopwatch.resetTimer();
    } else { 
      if (pomodoro.mode === 'work' && pomodoro.isActive) {
        if (window.confirm("Stop this session and save your progress?")) {
          const workDuration = 25 * 60;
          const elapsedTime = workDuration - pomodoro.timeLeft;
          saveSession(elapsedTime * 1000);
          pomodoro.resetTimer('work');
          setPomodoroCycle(0);
        }
      } else { 
        if (window.confirm("Reset the Pomodoro cycle?")) {
          pomodoro.resetTimer('work');
          setPomodoroCycle(0);
          setIsBreakPending(false);
        }
      }
    }
  };

  const handleSelection = (project, topic = null, subTopic = null) => {
    const isRunning = timerMode === 'stopwatch' ? stopwatch.isSessionRunning : pomodoro.isActive;
    if (isRunning) {
        if (window.confirm("A session is running. Do you want to end it and switch tasks?")) {
            handleStop();
        } else {
            return;
        }
    }
    setSelectedProject(project);
    setSelectedTopic(topic);
    setSelectedSubTopic(subTopic);
    stopwatch.resetTimer();
    pomodoro.resetTimer();
    setIsBreakPending(false);
    setShowSelectionModal(false);
  };
  
  const finishOnboarding = async (projectData) => {
      await addProjectToFirebase(projectData, currentUser.uid);
      setIsOnboarding(false);
      localStorage.setItem(`onboarding_completed_${currentUser.uid}`, 'true');
      toast.success("Project created successfully!");
  }

  const deleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project and all its data?")) return;
    await deleteProjectFromFirebase(projectId);
    setStudyHistory(prev => prev.filter(s => s.projectId !== projectId));
    if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        setSelectedTopic(null);
        setSelectedSubTopic(null);
        stopwatch.resetTimer();
        pomodoro.resetTimer();
    }
    toast.success("Project deleted successfully.");
  };

  if (dataLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center text-white text-xl">Loading your projects...</div>;
  }

  const isRunning = timerMode === 'stopwatch' ? stopwatch.isSessionRunning : pomodoro.isActive;
  const displayTime = timerMode === 'stopwatch' ? stopwatch.sessionDisplayTime : pomodoro.timeLeft * 1000;
  const hasStarted = timerMode === 'stopwatch' ? stopwatch.sessionStartTime !== null : pomodoro.timeLeft < (pomodoro.mode === 'work' ? 25*60 : pomodoro.mode === 'shortBreak' ? 5*60 : 15*60);

  const getPomodoroStatusText = () => {
    if (pomodoro.mode === 'work') return `Focus Session ${pomodoroCycle + 1} / 4`;
    if (pomodoro.mode === 'shortBreak') return "Short Break";
    if (pomodoro.mode === 'longBreak') return "Long Break";
    return "";
  }

  const renderTimerControls = () => {
    if (timerMode === 'pomodoro' && isBreakPending) {
      return (
        <motion.button 
          onClick={handleStartBreak} 
          className="w-24 h-24 rounded-full text-white font-bold text-lg flex items-center justify-center transition-all shadow-2xl bg-sky-500" 
          whileHover={{scale: 1.1}} whileTap={{scale:0.9}}
        >
          Start Break
        </motion.button>
      );
    }
    
    const stopIcon = (timerMode === 'pomodoro' && pomodoro.mode === 'work' && pomodoro.isActive) ? <FaStop /> : <FaRedo />;

    return (
      <div className="flex items-center gap-3">
        <motion.button onClick={handleStartPause} className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full text-white font-bold text-2xl flex items-center justify-center transition-all shadow-2xl ${isRunning ? "bg-amber-500" : "bg-green-500"}`} whileHover={{scale: 1.1}} whileTap={{scale:0.9}}>
            {isRunning ? <FaPause /> : <FaPlay />}
        </motion.button>
        <AnimatedButton 
            onClick={handleStop} 
            disabled={!hasStarted && !isBreakPending} 
            className="bg-slate-600 hover:bg-slate-500 text-white disabled:opacity-50 !px-4 sm:!px-6" 
            icon={stopIcon} 
        />
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{
        style: {
          background: '#1E293B',
          color: '#F1F5F9',
        },
      }} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-slate-100 font-sans flex flex-col">
        <header className="p-4 flex justify-between items-center border-b border-slate-700/50 sticky top-0 bg-slate-900/50 backdrop-blur-lg z-10">
            <h1 className="text-xl sm:text-2xl font-bold text-white">FocusFlow</h1>
            <div className="hidden sm:flex items-center gap-2">
                <AnimatedButton onClick={() => setIsOnboarding(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white" icon={<FaPlus />}>New Project</AnimatedButton>
                <AnimatedButton onClick={() => setShowHistory(true)} className="bg-slate-700 hover:bg-slate-600 text-white" icon={<FaHistory />}>History</AnimatedButton>
                <AnimatedButton onClick={logout} className="bg-rose-600 hover:bg-rose-500 text-white" icon={<FaSignOutAlt />}>Logout</AnimatedButton>
            </div>
             <div className="sm:hidden flex items-center gap-2">
                <AnimatedButton onClick={() => setIsOnboarding(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white !px-4" icon={<FaPlus />} />
                <AnimatedButton onClick={() => setShowHistory(true)} className="bg-slate-700 hover:bg-slate-600 text-white !px-4" icon={<FaHistory />} />
                <AnimatedButton onClick={logout} className="bg-rose-600 hover:bg-rose-500 text-white !px-4" icon={<FaSignOutAlt />} />
             </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 text-center">
            
            <TimerModeToggle mode={timerMode} setMode={setTimerMode} />

            <TimerDisplay time={displayTime} isRunning={isRunning} formatTime={formatTime} />
            
            {timerMode === 'pomodoro' && (
              <p className="text-amber-400 font-semibold mt-4 text-lg animate-pulse">
                {getPomodoroStatusText()}
              </p>
            )}
            
            <div className="mt-8 space-y-6 w-full max-w-lg">
                <div className="p-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Current Task</h3>
                    <p className="text-lg sm:text-xl font-bold text-white truncate h-7">
                        {selectedProject ? `${selectedProject.name} ${selectedTopic ? `> ${selectedTopic.name}` : ''} ${selectedSubTopic ? `> ${selectedSubTopic.name}` : ''}` : "No task selected"}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <AnimatedButton onClick={() => setShowSelectionModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white w-full sm:w-auto" icon={<FaTasks />}>Select Task</AnimatedButton>
                    {renderTimerControls()}
                </div>
            </div>
        </main>
        
        <AnimatePresence>
            {showSelectionModal && (
                <SelectionModal 
                    projects={projects}
                    onSelect={handleSelection}
                    onDeleteProject={deleteProject}
                    timers={timers}
                    topicTimers={topicTimers}
                    subTopicTimers={subTopicTimers}
                    formatTime={formatTime}
                    onClose={() => setShowSelectionModal(false)}
                />
            )}
            {showHistory && (
                <HistoryView 
                    projects={projects}
                    studyHistory={studyHistory}
                    formatTime={formatTime}
                    timers={timers}
                    topicTimers={topicTimers}
                    subTopicTimers={subTopicTimers}
                    onClose={() => setShowHistory(false)}
                />
            )}
            {isOnboarding && (
                <OnboardingFlow 
                    onFinish={finishOnboarding}
                    onCancel={() => setIsOnboarding(false)}
                />
            )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default StudyTracker;