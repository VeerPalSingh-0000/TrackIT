import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

// Firebase and Custom Hooks
import {
  addProjectToFirebase,
  deleteProjectFromFirebase,
  subscribeToUserProjects,
} from "./firebase/services";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useStudyTimer } from "./hooks/useStudyTimer";

// Components
import OnboardingFlow from "./Components/OnboardingFlow";
import SelectionModal from "./Components/SelectionModal";
import HistoryView from "./Components/HistoryView";
import TimerDisplay from "./Components/TimerDisplay";
import AnimatedButton from "./Components/ui/AnimatedButton";
import { FaPlus, FaHistory, FaSignOutAlt, FaTasks, FaPlay, FaPause, FaStop } from 'react-icons/fa';


const StudyTracker = () => {
  const { currentUser, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

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

  const {
    isSessionRunning,
    sessionDisplayTime,
    sessionStartTime,
    startTimer,
    pauseTimer,
    resetTimer,
    endSessionAndGetDuration,
  } = useStudyTimer();
  
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
  }, [currentUser]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!selectedProject) {
      toast.error("Please select a project first!");
      setShowSelectionModal(true);
      return;
    }
    startTimer();
    toast.success(`Session for ${selectedProject.name} started!`);
  };

  const endTimer = useCallback(() => {
    const sessionDuration = endSessionAndGetDuration();
    if (!selectedProject || sessionDuration < 1000) {
      if (sessionStartTime) toast.error("Session too short to save.");
      resetTimer();
      return;
    }
    const id = selectedSubTopic?.id || selectedTopic?.id || selectedProject.id;
    const type = selectedSubTopic ? "subtopic" : selectedTopic ? "topic" : "project";
    const updateTimers = (setter) => {
      setter(prev => ({
        ...prev,
        [id]: { totalTime: (prev[id]?.totalTime || 0) + sessionDuration }
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
        duration: sessionDuration,
        startTime: sessionStartTime,
        endTime: Date.now(),
        date: new Date().toISOString().split("T")[0],
        type: type,
    };
    setStudyHistory(prev => [sessionRecord, ...prev]);
    toast.success(`Saved ${formatTime(sessionDuration)} session!`);
  }, [ selectedProject, selectedTopic, selectedSubTopic, endSessionAndGetDuration, setTimers, setTopicTimers, setSubTopicTimers, setStudyHistory, formatTime, sessionStartTime, resetTimer ]);
  
  const handleSelection = (project, topic = null, subTopic = null) => {
    const currentId = selectedSubTopic?.id || selectedTopic?.id || selectedProject?.id;
    const newId = subTopic?.id || topic?.id || project?.id;
    if (isSessionRunning && currentId !== newId) {
        if (window.confirm("A session is running. Do you want to end it and switch tasks?")) {
            endTimer();
        } else {
            return;
        }
    }
    setSelectedProject(project);
    setSelectedTopic(topic);
    setSelectedSubTopic(subTopic);
    if (currentId !== newId || !isSessionRunning) {
        resetTimer();
    }
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
        resetTimer();
    }
    toast.success("Project deleted successfully.");
  };

  if (dataLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center text-white text-xl">Loading your projects...</div>;
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
        {/* Responsive Header */}
        <header className="p-4 flex justify-between items-center border-b border-slate-700/50 sticky top-0 bg-slate-900/50 backdrop-blur-lg z-10">
            <h1 className="text-xl sm:text-2xl font-bold text-white">FocusFlow</h1>
            {/* Desktop Buttons */}
            <div className="hidden sm:flex items-center gap-2">
                <AnimatedButton onClick={() => setIsOnboarding(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white" icon={<FaPlus />}>New Project</AnimatedButton>
                <AnimatedButton onClick={() => setShowHistory(true)} className="bg-slate-700 hover:bg-slate-600 text-white" icon={<FaHistory />}>History</AnimatedButton>
                <AnimatedButton onClick={logout} className="bg-rose-600 hover:bg-rose-500 text-white" icon={<FaSignOutAlt />}>Logout</AnimatedButton>
            </div>
             {/* Mobile Buttons (Icons only) */}
             <div className="sm:hidden flex items-center gap-2">
                <AnimatedButton onClick={() => setIsOnboarding(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white !px-4" icon={<FaPlus />} />
                <AnimatedButton onClick={() => setShowHistory(true)} className="bg-slate-700 hover:bg-slate-600 text-white !px-4" icon={<FaHistory />} />
                <AnimatedButton onClick={logout} className="bg-rose-600 hover:bg-rose-500 text-white !px-4" icon={<FaSignOutAlt />} />
             </div>
        </header>

        {/* Responsive Main Content */}
        <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 text-center">
            <TimerDisplay time={sessionDisplayTime} isRunning={isSessionRunning} formatTime={formatTime} />
            
            <div className="mt-8 space-y-6 w-full max-w-lg">
                <div className="p-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Current Task</h3>
                    <p className="text-lg sm:text-xl font-bold text-white truncate h-7">
                        {selectedProject ? `${selectedProject.name} ${selectedTopic ? `> ${selectedTopic.name}` : ''} ${selectedSubTopic ? `> ${selectedSubTopic.name}` : ''}` : "No task selected"}
                    </p>
                </div>
                {/* Responsive Controls */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <AnimatedButton onClick={() => setShowSelectionModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white w-full sm:w-auto" icon={<FaTasks />}>Select Task</AnimatedButton>
                    <div className="flex items-center gap-3">
                        <motion.button onClick={isSessionRunning ? pauseTimer : handleStart} className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full text-white font-bold text-2xl flex items-center justify-center transition-all shadow-2xl ${isSessionRunning ? "bg-amber-500" : "bg-green-500"}`} whileHover={{scale: 1.1}} whileTap={{scale:0.9}}>
                            {isSessionRunning ? <FaPause /> : <FaPlay />}
                        </motion.button>
                        <AnimatedButton onClick={endTimer} disabled={!sessionStartTime} className="bg-slate-600 hover:bg-slate-500 text-white disabled:opacity-50 !px-4 sm:!px-6" icon={<FaStop />} />
                    </div>
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
