import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  addProjectToFirebase,
  deleteProjectFromFirebase,
  subscribeToUserProjects,
} from "../firebase/services";

const StudyTracker = () => {
  const { currentUser, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- State Management ---
  // Permanent total time storage
  const [timers, setTimers] = useState({});
  const [topicTimers, setTopicTimers] = useState({});
  const [subTopicTimers, setSubTopicTimers] = useState({});

  // Current task selection
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);

  // UI and Session State
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Session Timer State
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [timeWhenPaused, setTimeWhenPaused] = useState(0);
  const [sessionDisplayTime, setSessionDisplayTime] = useState(0);

  // Animation State
  const [pulseTimer, setPulseTimer] = useState(false);

  // History state - CORRECTED VERSION
  const [studyHistory, setStudyHistory] = useState([]);
  const [historyInitialized, setHistoryInitialized] = useState(false);

  // Add initialization flags for timers
const [timersInitialized, setTimersInitialized] = useState(false);
const [topicTimersInitialized, setTopicTimersInitialized] = useState(false);
const [subTopicTimersInitialized, setSubTopicTimersInitialized] = useState(false);

  // --- Data Loading and Persistence ---
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToUserProjects(
        currentUser.uid,
        (fetchedProjects) => {
          setProjects(fetchedProjects);
          setLoading(false);
          if (fetchedProjects.length === 0) {
            setTimeout(() => setIsOnboarding(true), 500);
          }
        }
      );
      return unsubscribe;
    }
  }, [currentUser]);
  
useEffect(() => {
  const savedTimers = localStorage.getItem("studyTrackerTimers");
  const savedTopicTimers = localStorage.getItem("studyTrackerTopicTimers");
  const savedSubTopicTimers = localStorage.getItem("studyTrackerSubTopicTimers");
  
  if (savedTimers) {
    try {
      const parsedTimers = JSON.parse(savedTimers);
      setTimers(parsedTimers);
      console.log("Timers loaded:", Object.keys(parsedTimers).length, "projects");
    } catch (error) {
      console.error("Error parsing saved timers:", error);
      setTimers({});
    }
  }
  setTimersInitialized(true);

  if (savedTopicTimers) {
    try {
      const parsedTopicTimers = JSON.parse(savedTopicTimers);
      setTopicTimers(parsedTopicTimers);
      console.log("Topic timers loaded:", Object.keys(parsedTopicTimers).length, "topics");
    } catch (error) {
      console.error("Error parsing saved topic timers:", error);
      setTopicTimers({});
    }
  }
  setTopicTimersInitialized(true);

  if (savedSubTopicTimers) {
    try {
      const parsedSubTopicTimers = JSON.parse(savedSubTopicTimers);
      setSubTopicTimers(parsedSubTopicTimers);
      console.log("Subtopic timers loaded:", Object.keys(parsedSubTopicTimers).length, "subtopics");
    } catch (error) {
      console.error("Error parsing saved subtopic timers:", error);
      setSubTopicTimers({});
    }
  }
  setSubTopicTimersInitialized(true);
}, []);

// CORRECTED: Save timer data only after initialization
useEffect(() => {
  if (timersInitialized) {
    try {
      localStorage.setItem("studyTrackerTimers", JSON.stringify(timers));
      console.log("Timers saved:", Object.keys(timers).length, "projects");
    } catch (error) {
      console.error("Error saving timers:", error);
    }
  }
}, [timers, timersInitialized]);

useEffect(() => {
  if (topicTimersInitialized) {
    try {
      localStorage.setItem("studyTrackerTopicTimers", JSON.stringify(topicTimers));
      console.log("Topic timers saved:", Object.keys(topicTimers).length, "topics");
    } catch (error) {
      console.error("Error saving topic timers:", error);
    }
  }
}, [topicTimers, topicTimersInitialized]);

useEffect(() => {
  if (subTopicTimersInitialized) {
    try {
      localStorage.setItem("studyTrackerSubTopicTimers", JSON.stringify(subTopicTimers));
      console.log("Subtopic timers saved:", Object.keys(subTopicTimers).length, "subtopics");
    } catch (error) {
      console.error("Error saving subtopic timers:", error);
    }
  }
}, [subTopicTimers, subTopicTimersInitialized]);

  // CORRECTED: Load history from localStorage on component mount - ONLY ONCE
  useEffect(() => {
    const savedHistory = localStorage.getItem("studyTrackerHistory");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setStudyHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
        console.log("History loaded:", parsedHistory.length, "sessions");
      } catch (error) {
        console.error("Error parsing saved history:", error);
        setStudyHistory([]);
      }
    }
    setHistoryInitialized(true); // Mark as initialized
  }, []);

  // CORRECTED: Save history to localStorage only after initialization
  useEffect(() => {
    if (historyInitialized) {
      try {
        localStorage.setItem("studyTrackerHistory", JSON.stringify(studyHistory));
        console.log("History saved:", studyHistory.length, "sessions");
      } catch (error) {
        console.error("Error saving history:", error);
      }
    }
  }, [studyHistory, historyInitialized]);

  // Debug useEffect to track history changes
  useEffect(() => {
    console.log("Study history state changed:", studyHistory.length, "sessions");
  }, [studyHistory]);

  // --- Timer Logic ---
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

  useEffect(() => {
    let interval;
    if (isSessionRunning) {
      interval = setInterval(() => {
        setSessionDisplayTime(Date.now() - sessionStartTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionRunning, sessionStartTime]);

  const startTimer = () => {
    if (!selectedProject) {
      alert("Please select a project to study first!");
      setShowSelectionModal(true);
      return;
    }
    setSessionStartTime(Date.now() - timeWhenPaused);
    setIsSessionRunning(true);
    setPulseTimer(true);
    setTimeout(() => setPulseTimer(false), 500);
  };

  const pauseTimer = () => {
    setIsSessionRunning(false);
    setTimeWhenPaused(Date.now() - sessionStartTime);
  };

  // CORRECTED: Enhanced endTimer function with better validation
  const endTimer = () => {
    if (!sessionStartTime) return;

    const sessionDuration = isSessionRunning ? Date.now() - sessionStartTime : timeWhenPaused;
    setIsSessionRunning(false);

    const id = selectedSubTopic?.id || selectedTopic?.id || selectedProject?.id;
    const type = selectedSubTopic ? "subtopic" : selectedTopic ? "topic" : "project";

    const updateState = (setter, state) => {
      const totalTime = (state[id]?.totalTime || 0) + sessionDuration;
      setter((prev) => ({ ...prev, [id]: { ...prev[id], totalTime } }));
    };

    if (type === "project") updateState(setTimers, timers);
    else if (type === "topic") updateState(setTopicTimers, topicTimers);
    else if (type === "subtopic") updateState(setSubTopicTimers, subTopicTimers);

    // CORRECTED: Save session record with better validation
    if (selectedProject && sessionDuration > 1000) { // Only save sessions longer than 1 second
      const sessionRecord = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId: selectedProject?.id,
        projectName: selectedProject?.name,
        topicId: selectedTopic?.id || null,
        topicName: selectedTopic?.name || null,
        subTopicId: selectedSubTopic?.id || null,
        subTopicName: selectedSubTopic?.name || null,
        duration: sessionDuration,
        startTime: sessionStartTime,
        endTime: Date.now(),
        date: new Date().toISOString().split('T')[0],
        type: type
      };

      console.log("Adding session to history:", sessionRecord);
      
      setStudyHistory(prev => {
        const newHistory = [sessionRecord, ...prev];
        console.log("New history length:", newHistory.length);
        return newHistory;
      });
    }

    // Reset session
    setSessionStartTime(null);
    setTimeWhenPaused(0);
    setSessionDisplayTime(0);
  };

  const handleSelection = (project, topic = null, subTopic = null) => {
    // Check if switching to a different task
    const currentId = selectedSubTopic?.id || selectedTopic?.id || selectedProject?.id;
    const newId = subTopic?.id || topic?.id || project?.id;

    if (isSessionRunning) {
      if (currentId !== newId) {
        // Different task - end current session and reset
        if (!window.confirm("A session is running. Do you want to end it and switch tasks?")) {
          return;
        }
        endTimer();
      }
    }

    setSelectedProject(project);
    setSelectedTopic(topic);
    setSelectedSubTopic(subTopic);

    // Only reset session if switching tasks or no session running
    if (currentId !== newId || !isSessionRunning) {
      setSessionStartTime(null);
      setTimeWhenPaused(0);
      setSessionDisplayTime(0);
    }

    setShowSelectionModal(false);
  };

  // --- Project and User Management ---
  const finishOnboarding = async (projectData) => {
    if (!currentUser) {
      alert("User not authenticated.");
      return;
    }
    try {
      setLoading(true);
      const projectId = await addProjectToFirebase(projectData, currentUser.uid);
      setTimers((prev) => ({ ...prev, [projectId]: { totalTime: 0 } }));
      
      if (projectData.subProjects) {
        projectData.subProjects.forEach((topic) => {
          setTopicTimers((prev) => ({ ...prev, [topic.id]: { totalTime: 0 } }));
          if (topic.subTopics) {
            topic.subTopics.forEach((subTopic) => {
              setSubTopicTimers((prev) => ({ ...prev, [subTopic.id]: { totalTime: 0 } }));
            });
          }
        });
      }
      
      setIsOnboarding(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project and all its history?")) {
      return;
    }
    
    try {
      await deleteProjectFromFirebase(projectId);
      
      // Find the project to clean up related timer data
      const projectToDelete = projects.find(p => p.id === projectId);
      
      // Clean up timers
      setTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[projectId];
        return newTimers;
      });
      
      // Clean up topic and subtopic timers
      if (projectToDelete?.subProjects) {
        projectToDelete.subProjects.forEach(topic => {
          setTopicTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[topic.id];
            return newTimers;
          });
          
          if (topic.subTopics) {
            topic.subTopics.forEach(subtopic => {
              setSubTopicTimers(prev => {
                const newTimers = { ...prev };
                delete newTimers[subtopic.id];
                return newTimers;
              });
            });
          }
        });
      }
      
      // Clean up history for this project
      setStudyHistory(prev => prev.filter(session => session.projectId !== projectId));
      
      // Reset selection if the deleted project was selected
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        setSelectedTopic(null);
        setSelectedSubTopic(null);
        if (isSessionRunning) {
          endTimer();
        }
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  // CORRECTED: Add utility functions for debugging and management
  const clearStudyHistory = () => {
    if (window.confirm("Are you sure you want to clear all study history? This cannot be undone.")) {
      setStudyHistory([]);
      localStorage.removeItem("studyTrackerHistory");
      console.log("Study history cleared");
    }
  };

  const debugHistory = () => {
    console.log("Current studyHistory state:", studyHistory);
    console.log("localStorage studyTrackerHistory:", localStorage.getItem("studyTrackerHistory"));
    console.log("History initialized:", historyInitialized);
  };

  const saveHistoryManually = () => {
    try {
      localStorage.setItem("studyTrackerHistory", JSON.stringify(studyHistory));
      console.log("History saved manually:", studyHistory.length, "sessions");
    } catch (error) {
      console.error("Error saving history:", error);
    }
  };

  // Make debug functions available in console
  window.debugHistory = debugHistory;
  window.saveHistoryManually = saveHistoryManually;
  window.clearStudyHistory = clearStudyHistory;

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
            <div className="absolute inset-2 border-4 border-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 border-4 border-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-8 bg-blue-600 rounded-full flex items-center justify-center">
              <i className="fas fa-book text-white text-2xl"></i>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 animate-pulse">
            Loading Your Study Universe...
          </h2>
        </div>
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <OnboardingFlow
        onFinish={finishOnboarding}
        onCancel={() => setIsOnboarding(false)}
      />
    );
  }

return (
  <div className="min-h-screen transition-all duration-1000 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex flex-col font-sans">
    {/* Mobile-Responsive Header */}
    <header className="z-20 sticky top-0 backdrop-blur-xl border-b border-gray-700/20 bg-gray-900/70 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Left Side - Logo and Title */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-xl">
            <i className="fas fa-brain text-white text-lg sm:text-2xl"></i>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FocusFlow
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 truncate max-w-48">
              Welcome, {currentUser?.displayName || currentUser?.email} ✨
            </p>
          </div>
          {/* Mobile Title */}
          <div className="sm:hidden">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FocusFlow
            </h1>
          </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-4">
          {/* Desktop Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            <button
              onClick={() => setIsOnboarding(true)}
              className="px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            >
              <i className="fas fa-plus mr-2"></i> Add Project
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg bg-gray-700 text-white"
            >
              <i className="fas fa-history mr-2"></i> History
            </button>
            <button
              onClick={handleLogout}
              className="relative px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold hover:scale-105 transition-all"
            >
              <i className="fas fa-sign-out-alt mr-2"></i> Logout
            </button>
          </div>

          {/* Mobile Buttons */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              onClick={() => setIsOnboarding(true)}
              className="p-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
              title="Add Project"
            >
              <i className="fas fa-plus text-sm"></i>
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="p-2.5 rounded-xl bg-gray-700 text-white shadow-lg"
              title="History"
            >
              <i className="fas fa-history text-sm"></i>
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl shadow-lg"
              title="Logout"
            >
              <i className="fas fa-sign-out-alt text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile-Responsive Main Content */}
    <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 text-center">
      {/* Timer Circle - Responsive */}
      <div className={`relative transform transition-transform duration-500 ${pulseTimer ? "scale-110" : "scale-100"}`}>
        <svg className="w-48 h-48 sm:w-64 md:w-72 sm:h-64 md:h-72 transform -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-800" />
          <circle cx="60" cy="60" r="54" stroke="url(#timerGradient)" strokeWidth="8" fill="none" strokeDasharray="339.292" strokeLinecap="round" className="transition-all" />
          <defs>
            <linearGradient id="timerGradient">
              <stop offset="0%" stopColor={isSessionRunning ? "#10B981" : "#60A5FA"} />
              <stop offset="100%" stopColor={isSessionRunning ? "#34D399" : "#818CF8"} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-3xl sm:text-5xl md:text-6xl font-mono font-bold mb-2 transition-colors ${isSessionRunning ? "text-green-400" : "text-gray-300"}`}>
            {formatTime(sessionDisplayTime)}
          </div>
          <div className={`text-xs sm:text-sm h-5 font-medium mt-1 ${isSessionRunning ? "text-green-500 animate-pulse" : ""}`}>
            {isSessionRunning && "Session in progress..."}
          </div>
        </div>
      </div>

      {/* Task Selection and Controls - Mobile Responsive */}
      <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 w-full max-w-sm sm:max-w-lg">
        {/* Current Task Display */}
        <div
          className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 cursor-pointer hover:border-white/20 transition"
          onClick={() => setShowSelectionModal(true)}
        >
          <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider">
            Focusing On
          </h3>
          <div className="text-base sm:text-xl font-bold text-white truncate flex items-center justify-center gap-1 sm:gap-2">
            {selectedProject ? (
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 w-full">
                <span className="text-blue-300 truncate">{selectedProject.name}</span>
                {selectedTopic && (
                  <>
                    <span className="text-gray-400 hidden sm:inline">&gt;</span>
                    <span className="text-purple-300 truncate text-sm sm:text-base">{selectedTopic.name}</span>
                  </>
                )}
                {selectedSubTopic && (
                  <>
                    <span className="text-gray-400 hidden sm:inline">&gt;</span>
                    <span className="text-green-300 truncate text-sm sm:text-base">{selectedSubTopic.name}</span>
                  </>
                )}
              </div>
            ) : (
              "Click to Select a Task"
            )}
          </div>
        </div>

        {/* Control Buttons - Mobile Layout */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
          {/* Mobile: Stack buttons vertically, Desktop: Horizontal */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Select Task Button */}
            <button
              onClick={() => setShowSelectionModal(true)}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl sm:rounded-2xl font-bold hover:scale-105 transition-all shadow-lg"
            >
              <i className="fas fa-list-check mr-2"></i> Select Task
            </button>

            {/* Control Buttons Container */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              {/* Play/Pause Button */}
              <button
                onClick={isSessionRunning ? pauseTimer : startTimer}
                className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full text-white font-bold text-lg sm:text-xl flex items-center justify-center transition-all hover:scale-105 shadow-2xl ${
                  isSessionRunning
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                    : "bg-gradient-to-r from-green-500 to-emerald-500"
                }`}
              >
                <i className={`fas fa-${isSessionRunning ? "pause" : "play"} text-xl sm:text-2xl md:text-3xl ${!isSessionRunning ? 'pl-1' : ''}`}></i>
              </button>

              {/* End Session Button */}
              <button
                onClick={endTimer}
                disabled={!sessionStartTime}
                className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl sm:rounded-2xl font-bold hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <i className="fas fa-stop mr-1 sm:mr-2"></i> 
                <span className="hidden sm:inline">End Session</span>
                <span className="sm:hidden">End</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    {/* Modals remain the same but need mobile responsiveness */}
    {showSelectionModal && (
      <SelectionModal
        projects={projects}
        onSelect={handleSelection}
        onClose={() => setShowSelectionModal(false)}
        onDeleteProject={deleteProject}
        timers={timers}
        topicTimers={topicTimers}
        subTopicTimers={subTopicTimers}
        formatTime={formatTime}
      />
    )}

    {showHistory && (
      <HistoryView
        projects={projects}
        timers={timers}
        topicTimers={topicTimers}
        subTopicTimers={subTopicTimers}
        studyHistory={studyHistory}
        onClose={() => setShowHistory(false)}
        formatTime={formatTime}
      />
    )}
  </div>
);

};

// Keep all your existing sub-components (SelectionModal, ProjectCard, TopicCard, SubTopicCard, OnboardingFlow, HistoryView) as they are...


// --- Corrected Sub-Components ---

const SelectionModal = ({
  projects,
  onSelect,
  onClose,
  onDeleteProject,
  timers,
  topicTimers,
  subTopicTimers,
  formatTime,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
      <div className="max-w-4xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col rounded-xl sm:rounded-2xl shadow-2xl bg-gray-800 border border-gray-600">
        {/* Mobile-Responsive Header */}
        <div className="p-3 sm:p-6 border-b border-gray-600 flex justify-between items-center bg-gray-700 rounded-t-xl sm:rounded-t-2xl">
          <h2 className="text-lg sm:text-2xl font-bold text-white">
            <i className="fas fa-tasks mr-2 sm:mr-3 text-blue-400"></i>
            <span className="hidden sm:inline">Select a Task to Study</span>
            <span className="sm:hidden">Select Task</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-600 rounded-full transition-all text-gray-300 hover:text-white"
          >
            <i className="fas fa-times text-lg sm:text-xl"></i>
          </button>
        </div>

        {/* Mobile-Responsive Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {projects.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <i className="fas fa-folder-open text-4xl sm:text-6xl text-gray-500 mb-4"></i>
              <p className="text-gray-400 text-base sm:text-lg mb-4">No projects found.</p>
              <button
                onClick={onClose}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                Create your first project!
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={onSelect}
                  onDeleteProject={onDeleteProject}
                  timers={timers}
                  topicTimers={topicTimers}
                  subTopicTimers={subTopicTimers}
                  formatTime={formatTime}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const ProjectCard = ({
  project,
  onSelect,
  onDeleteProject,
  timers,
  topicTimers,
  subTopicTimers,
  formatTime,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const projectTime = timers[project.id]?.totalTime || 0;
  const hasTopics = project.subProjects && project.subProjects.length > 0;

  return (
    <div className="bg-gray-700 rounded-lg sm:rounded-xl border border-gray-600 overflow-hidden">
      {/* Mobile-Responsive Project Header */}
      <div className="p-3 sm:p-4 bg-gray-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Top Row - Mobile: Project info, Desktop: Left side */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Expand Button */}
            {hasTopics && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-500 hover:bg-gray-400 transition-all flex items-center justify-center"
                title={isExpanded ? "Collapse topics" : "Expand topics"}
              >
                <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-white text-xs sm:text-sm`}></i>
              </button>
            )}
            
            {/* Project Info */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-folder text-white text-sm sm:text-base"></i>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">{project.name}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-300">
                  <span><i className="fas fa-clock mr-1"></i>{formatTime(projectTime)}</span>
                  <span><i className="fas fa-list mr-1"></i>{hasTopics ? project.subProjects.length : 0} topics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row - Mobile: Action buttons, Desktop: Right side */}
          <div className="flex items-center justify-end sm:justify-start gap-2 sm:gap-3 flex-shrink-0">
            {/* Select Project Button */}
            <button
              onClick={() => onSelect(project)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all font-medium shadow-lg text-sm sm:text-base whitespace-nowrap"
            >
              <i className="fas fa-play mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">Select Project</span>
              <span className="sm:hidden">Select</span>
            </button>
            
            {/* Delete Button */}
            <button
              onClick={() => onDeleteProject(project.id)}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all shadow-lg flex items-center justify-center group"
              title="Delete Project"
            >
              <i className="fas fa-trash text-sm sm:text-base text-white group-hover:scale-110 transition-transform"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Topics Section - Keep existing logic but add mobile spacing */}
      {isExpanded && hasTopics && (
        <div className="border-t border-gray-600 bg-gray-800">
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            {project.subProjects.map((topic) => (
              <TopicCard
                key={topic.id}
                project={project}
                topic={topic}
                onSelect={onSelect}
                topicTimers={topicTimers}
                subTopicTimers={subTopicTimers}
                formatTime={formatTime}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};



const TopicCard = ({
  project,
  topic,
  onSelect,
  topicTimers,
  subTopicTimers,
  formatTime,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const topicTime = topicTimers[topic.id]?.totalTime || 0;
  const hasSubTopics = topic.subTopics && topic.subTopics.length > 0;

  return (
    <div className="bg-gray-600 rounded-lg border border-gray-500">
      {/* Topic Header */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          {/* Left Side - Topic Info with Expand Button */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Expand Button - Completely Separate */}
            {hasSubTopics && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-shrink-0 w-6 h-6 rounded bg-gray-500 hover:bg-gray-400 transition-all flex items-center justify-center"
                title={isExpanded ? "Collapse subtopics" : "Expand subtopics"}
              >
                <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-white text-xs`}></i>
              </button>
            )}
            
            {/* Topic Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-bookmark text-white text-sm"></i>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-white truncate">{topic.name}</h4>
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <span><i className="fas fa-clock mr-1"></i>{formatTime(topicTime)}</span>
                  <span><i className="fas fa-list mr-1"></i>{hasSubTopics ? topic.subTopics.length : 0} subtopics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Select Button */}
          <div className="flex-shrink-0">
            <button
              onClick={() => {
                console.log('Topic selected:', topic.name); // Debug log
                onSelect(project, topic);
              }}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all font-medium text-sm shadow-md whitespace-nowrap"
            >
              <i className="fas fa-play mr-1"></i>
              Select Topic
            </button>
          </div>
        </div>
      </div>

      {/* Subtopics Section */}
      {isExpanded && hasSubTopics && (
        <div className="border-t border-gray-500 bg-gray-700">
          <div className="p-3 space-y-2">
            {topic.subTopics.map((subTopic) => (
              <SubTopicCard
                key={subTopic.id}
                project={project}
                topic={topic}
                subTopic={subTopic}
                onSelect={onSelect}
                subTopicTimers={subTopicTimers}
                formatTime={formatTime}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SubTopicCard = ({
  project,
  topic,
  subTopic,
  onSelect,
  subTopicTimers,
  formatTime,
}) => {
  const subTopicTime = subTopicTimers[subTopic.id]?.totalTime || 0;

  return (
    <div className="bg-gray-600 rounded-lg border border-gray-500 p-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left Side - Subtopic Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center flex-shrink-0">
            <i className="fas fa-check text-white text-xs"></i>
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-gray-100 font-medium block truncate">{subTopic.name}</span>
            <p className="text-xs text-gray-300">
              <i className="fas fa-clock mr-1"></i>
              {formatTime(subTopicTime)}
            </p>
          </div>
        </div>
        
        {/* Right Side - Select Button */}
        <div className="flex-shrink-0">
          <button
            onClick={() => {
              console.log('Subtopic selected:', subTopic.name); // Debug log
              onSelect(project, topic, subTopic);
            }}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all font-medium text-sm shadow-md whitespace-nowrap"
          >
            <i className="fas fa-play mr-1"></i>
            Select
          </button>
        </div>
      </div>
    </div>
  );
};


// Keep your existing OnboardingFlow and HistoryView components as they are working correctly

const OnboardingFlow = ({ onFinish, onCancel }) => {
  const [step, setStep] = useState(1);
  const [projectSetup, setProjectSetup] = useState({
    name: "",
    description: "",
    topics: [],
  });
  const [currentTopic, setCurrentTopic] = useState({ name: "", subTopics: [] });
  const [currentSubTopicName, setCurrentSubTopicName] = useState("");

  const addSubTopic = () => {
    if (!currentSubTopicName.trim()) return;
    setCurrentTopic((prev) => ({
      ...prev,
      subTopics: [
        ...prev.subTopics,
        { id: `subtopic_${Date.now()}`, name: currentSubTopicName.trim() },
      ],
    }));
    setCurrentSubTopicName("");
  };

  const removeSubTopic = (subtopicId) => {
    setCurrentTopic((prev) => ({
      ...prev,
      subTopics: prev.subTopics.filter((st) => st.id !== subtopicId),
    }));
  };

  const addTopic = () => {
    if (!currentTopic.name.trim()) return;
    setProjectSetup((prev) => ({
      ...prev,
      topics: [
        ...prev.topics,
        {
          id: `topic_${Date.now()}`,
          name: currentTopic.name.trim(),
          subTopics: currentTopic.subTopics,
        },
      ],
    }));
    setCurrentTopic({ name: "", subTopics: [] });
  };

  const removeTopic = (topicId) => {
    setProjectSetup((prev) => ({
      ...prev,
      topics: prev.topics.filter((t) => t.id !== topicId),
    }));
  };

  const handleFinish = () => {
    const finalProjectData = {
      name: projectSetup.name.trim(),
      description: projectSetup.description.trim(),
      subProjects: projectSetup.topics.map((t) => ({
        ...t,
        subTopics: t.subTopics.map((st) => ({ ...st, completed: false })),
      })),
    };
    onFinish(finalProjectData);
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm z-50">
      <div className="max-w-5xl w-full max-h-[90vh] overflow-y-auto bg-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-4xl p-8 shadow-2xl">
        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold text-white text-center mb-6">
              Create New Project
            </h2>
            <div className="space-y-6">
              <input
                type="text"
                placeholder="Project Name (e.g., Learn React Development)"
                value={projectSetup.name}
                onChange={(e) =>
                  setProjectSetup({ ...projectSetup, name: e.target.value })
                }
                className="w-full p-4 rounded-xl text-lg bg-gray-700 border-2 border-gray-600 text-white focus:border-blue-500 outline-none"
              />
              <textarea
                placeholder="Project Description (Optional)"
                value={projectSetup.description}
                onChange={(e) =>
                  setProjectSetup({
                    ...projectSetup,
                    description: e.target.value,
                  })
                }
                className="w-full p-4 rounded-xl text-lg bg-gray-700 border-2 border-gray-600 text-white h-24 resize-none focus:border-purple-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!projectSetup.name.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-blue-500 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div>
            <h2 className="text-3xl font-bold text-white text-center mb-6">
              Add Topics & Sub-Topics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side: Input */}
              <div className="bg-gray-700/50 p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-xl text-white">Add New Topic</h3>
                <input
                  type="text"
                  placeholder="Topic Name (e.g., Components, Hooks, State Management)"
                  value={currentTopic.name}
                  onChange={(e) =>
                    setCurrentTopic({ ...currentTopic, name: e.target.value })
                  }
                  onKeyPress={(e) => handleKeyPress(e, () => {})}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-purple-500 outline-none"
                />
                
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-gray-300 mb-3">
                    Add Sub-Topics (Optional)
                  </h4>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Sub-Topic Name"
                      value={currentSubTopicName}
                      onChange={(e) => setCurrentSubTopicName(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, addSubTopic)}
                      className="flex-1 p-2 rounded bg-gray-900 border border-gray-700 text-white focus:border-green-500 outline-none"
                    />
                    <button
                      onClick={addSubTopic}
                      disabled={!currentSubTopicName.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  
                  {currentTopic.subTopics.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {currentTopic.subTopics.map((st) => (
                        <div key={st.id} className="flex items-center justify-between bg-gray-900/50 p-2 rounded">
                          <span className="text-sm text-gray-300">• {st.name}</span>
                          <button
                            onClick={() => removeSubTopic(st.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={addTopic}
                  disabled={!currentTopic.name.trim()}
                  className="w-full p-3 bg-purple-600 text-white rounded-lg font-bold disabled:opacity-50 hover:bg-purple-500 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>Add Topic
                </button>
              </div>
              
              {/* Right Side: Preview */}
              <div className="bg-gray-700/50 p-6 rounded-2xl">
                <h3 className="font-bold text-xl text-white mb-4">
                  Project Structure Preview
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {projectSetup.topics.map((t) => (
                    <div key={t.id} className="bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-purple-300 flex items-center">
                          <i className="fas fa-bookmark mr-2"></i>
                          {t.name}
                        </p>
                        <button
                          onClick={() => removeTopic(t.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                      {t.subTopics.length > 0 && (
                        <div className="pl-4 space-y-1">
                          {t.subTopics.map((st) => (
                            <p key={st.id} className="text-xs text-gray-400 flex items-center">
                              <i className="fas fa-chevron-right mr-2 text-green-400"></i>
                              {st.name}
                            </p>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {t.subTopics.length} sub-topics
                      </p>
                    </div>
                  ))}
                  {projectSetup.topics.length === 0 && (
                    <div className="text-center py-8">
                      <i className="fas fa-folder-open text-4xl text-gray-600 mb-2"></i>
                      <p className="text-gray-500">No topics added yet.</p>
                      <p className="text-xs text-gray-600 mt-1">Add your first topic to get started!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-500 transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Skip topics and create project with just the name
                    if (projectSetup.name.trim()) {
                      const finalProjectData = {
                        name: projectSetup.name.trim(),
                        description: projectSetup.description.trim(),
                        subProjects: [],
                      };
                      onFinish(finalProjectData);
                    }
                  }}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-xl font-bold hover:bg-yellow-500 transition-colors"
                >
                  Skip & Create
                </button>
                <button
                  onClick={handleFinish}
                  disabled={projectSetup.topics.length === 0}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-green-500 transition-colors"
                >
                  <i className="fas fa-check mr-2"></i>Finish & Create Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HistoryView = ({
  projects,
  timers,
  topicTimers,
  subTopicTimers,
  onClose,
  formatTime,
  studyHistory = [] // Add this prop
}) => {
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'sessions'
  const [expandedProjects, setExpandedProjects] = useState({});

  const toggleProject = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Group sessions by date
  const groupSessionsByDate = () => {
    const grouped = {};
    studyHistory.forEach(session => {
      const date = session.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });
    return grouped;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const formatTime12Hour = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="max-w-5xl w-full max-h-[85vh] flex flex-col rounded-2xl shadow-2xl bg-gray-800/95 border border-gray-600/50">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-all"
              title="Back to Timer"
            >
              <i className="fas fa-arrow-left text-xl text-gray-400"></i>
            </button>
            <h2 className="text-2xl font-bold text-white">
              <i className="fas fa-history mr-3 text-blue-400"></i>Study History
            </h2>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('summary')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'summary' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setViewMode('sessions')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'sessions' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Sessions
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-all"
              title="Close"
            >
              <i className="fas fa-times text-xl text-gray-400"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6">
          {viewMode === 'summary' ? (
            // Summary View (your existing code)
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.id} className="bg-gray-900/50 rounded-xl transition-all">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-900/70 transition-colors"
                    onClick={() => toggleProject(p.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <i className={`fas fa-chevron-${expandedProjects[p.id] ? 'down' : 'right'} text-gray-400`}></i>
                        <div>
                          <p className="font-bold text-lg text-blue-300">{p.name}</p>
                          <p className="text-sm text-gray-400">
                            {p.subProjects?.length || 0} topics
                          </p>
                        </div>
                      </div>
                      <p className="font-mono text-xl text-white">
                        {formatTime(timers[p.id]?.totalTime || 0)}
                      </p>
                    </div>
                  </div>
                  
                  {expandedProjects[p.id] && (
                    <div className="px-4 pb-4">
                      <div className="pl-6 space-y-2 border-l-2 border-gray-700 ml-2">
                        {p.subProjects?.map((t) => (
                          <div key={t.id} className="bg-gray-800/50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-purple-300 font-semibold flex items-center">
                                <i className="fas fa-bookmark mr-2"></i>
                                {t.name}
                              </p>
                              <p className="font-mono text-gray-300">
                                {formatTime(topicTimers[t.id]?.totalTime || 0)}
                              </p>
                            </div>
                            {t.subTopics && t.subTopics.length > 0 && (
                              <div className="pl-4 space-y-1">
                                {t.subTopics.map((st) => (
                                  <div key={st.id} className="flex justify-between items-center text-sm">
                                    <p className="text-green-300 flex items-center">
                                      <i className="fas fa-chevron-right mr-2 text-xs"></i>
                                      {st.name}
                                    </p>
                                    <p className="font-mono text-gray-400 text-xs">
                                      {formatTime(subTopicTimers[st.id]?.totalTime || 0)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        {(!p.subProjects || p.subProjects.length === 0) && (
                          <p className="text-gray-500 text-sm italic">No topics in this project</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-center py-12">
                  <i className="fas fa-clock text-4xl text-gray-600 mb-4"></i>
                  <p className="text-gray-400 text-lg">Your study summary is empty.</p>
                  <p className="text-gray-500 text-sm mt-2">Start studying to see your progress here!</p>
                </div>
              )}
            </div>
          ) : (
            // Sessions View (NEW)
            <div className="space-y-4">
              {Object.keys(groupSessionsByDate()).length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-calendar-alt text-4xl text-gray-600 mb-4"></i>
                  <p className="text-gray-400 text-lg">No study sessions recorded yet.</p>
                  <p className="text-gray-500 text-sm mt-2">Complete a study session to see it here!</p>
                </div>
              ) : (
                Object.entries(groupSessionsByDate())
                  .sort(([a], [b]) => new Date(b) - new Date(a)) // Sort by date descending
                  .map(([date, sessions]) => (
                    <div key={date} className="bg-gray-900/50 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                        <i className="fas fa-calendar-day mr-2 text-blue-400"></i>
                        {formatDate(date)}
                        <span className="ml-auto text-sm text-gray-400">
                          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                        </span>
                      </h3>
                      
                      <div className="space-y-2">
                        {sessions.map((session) => (
                          <div key={session.id} className="bg-gray-800/50 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-blue-300 font-medium">{session.projectName}</span>
                                  {session.topicName && (
                                    <>
                                      <i className="fas fa-chevron-right text-gray-500 text-xs"></i>
                                      <span className="text-purple-300">{session.topicName}</span>
                                    </>
                                  )}
                                  {session.subTopicName && (
                                    <>
                                      <i className="fas fa-chevron-right text-gray-500 text-xs"></i>
                                      <span className="text-green-300">{session.subTopicName}</span>
                                    </>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {formatTime12Hour(session.startTime)} - {formatTime12Hour(session.endTime)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono text-white font-bold">
                                  {formatTime(session.duration)}
                                </div>
                                <div className="text-xs text-gray-400 capitalize">
                                  {session.type}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-700/20">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Timer
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
const clearStudyHistory = () => {
  if (window.confirm("Are you sure you want to clear all study history? This cannot be undone.")) {
    setStudyHistory([]);
    localStorage.removeItem("studyTrackerHistory");
    console.log("Study history cleared");
  }
};
const saveHistoryManually = () => {
  try {
    localStorage.setItem("studyTrackerHistory", JSON.stringify(studyHistory));
    console.log("History saved manually:", studyHistory.length, "sessions");
  } catch (error) {
    console.error("Error saving history:", error);
  }
};

// Enhanced debug functions
const debugHistory = () => {
  console.log("=== HISTORY DEBUG ===");
  console.log("Current studyHistory state:", studyHistory);
  console.log("localStorage studyTrackerHistory:", localStorage.getItem("studyTrackerHistory"));
  console.log("History initialized:", historyInitialized);
  console.log("=== TIMER DEBUG ===");
  console.log("Current timers state:", timers);
  console.log("localStorage studyTrackerTimers:", localStorage.getItem("studyTrackerTimers"));
  console.log("Timers initialized:", timersInitialized);
  console.log("Current topicTimers state:", topicTimers);
  console.log("localStorage studyTrackerTopicTimers:", localStorage.getItem("studyTrackerTopicTimers"));
  console.log("Topic timers initialized:", topicTimersInitialized);
  console.log("Current subTopicTimers state:", subTopicTimers);
  console.log("localStorage studyTrackerSubTopicTimers:", localStorage.getItem("studyTrackerSubTopicTimers"));
  console.log("Subtopic timers initialized:", subTopicTimersInitialized);
};

const clearAllData = () => {
  if (window.confirm("Are you sure you want to clear ALL data including history and timer summaries? This cannot be undone.")) {
    // Clear history
    setStudyHistory([]);
    localStorage.removeItem("studyTrackerHistory");
    
    // Clear timers
    setTimers({});
    setTopicTimers({});
    setSubTopicTimers({});
    localStorage.removeItem("studyTrackerTimers");
    localStorage.removeItem("studyTrackerTopicTimers");
    localStorage.removeItem("studyTrackerSubTopicTimers");
    
    console.log("All data cleared");
  }
};

// Make debug functions available globally
window.debugHistory = debugHistory;
window.clearAllData = clearAllData;
window.saveHistoryManually = saveHistoryManually;
window.clearStudyHistory = clearStudyHistory;



export default StudyTracker;
