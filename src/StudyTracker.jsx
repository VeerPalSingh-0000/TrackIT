import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from "react";
import { useAuth } from "./contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import audioService from "./services/audioService";
import { preloadNativeFeedback } from "./services/nativeBridge";

// Firebase and Custom Hooks
import {
  addProjectToFirebase,
  updateProjectInFirebase,
  deleteProjectFromFirebase,
  subscribeToUserProjects,
  getUserProfile,
  markOnboardingComplete,
} from "./firebase/services";
import { useChromeStorage } from "./hooks/useChromeStorage";
import { useStudyTimer } from "./hooks/useStudyTimer";
import { usePomodoroTimer } from "./hooks/usePomodoroTimer";
import { useSessionManager } from "./hooks/useSessionManager";
import timerService from "./services/timerService";

// Components (Static Imports)
import Navbar from "./Components/Navbar";
import OnboardingFlow from "./Components/OnboardingFlow";
import TimerDisplay from "./Components/TimerDisplay";
import AnimatedButton from "./Components/ui/AnimatedButton";
import WelcomeScreen from "./Components/WelcomeScreen";
import LoadingScreen from "./Components/ui/LoadingScreen";
import TimerModeToggle from "./Components/TimerModeToggle";
import CurrentTask from "./Components/CurrentTask";
import TimerControls from "./Components/TimerControls";
import AmbientSounds from "./Components/AmbientSounds";

// Icons
import {
  FaTasks,
  FaHistory,
  FaInfoCircle,
  FaRocket,
  FaPlus,
  FaSignOutAlt,
  FaStar,
} from "react-icons/fa";

// Lazy Loaded Components
const SelectionModal = lazy(() => import("./Components/SelectionModal"));
const HistoryView = lazy(() => import("./Components/HistoryView"));
const About = lazy(() => import("./Components/About"));
const Features = lazy(() => import("./Components/Features"));

const POMODORO_DURATIONS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const StudyTracker = () => {
  const { currentUser, logout } = useAuth();

  // Loading & Data States
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [isProjectsLoaded, setIsProjectsLoaded] = useState(false);
  const [projects, setProjects] = useState([]);

  // Modals & UI States
  const [activeModal, setActiveModal] = useState(null); // 'selection', 'history', 'about', 'features', 'project', 'welcome'
  const [editingProject, setEditingProject] = useState(null);

  // Local Storage States (now Chrome Storage)
  const [timerMode, setTimerMode] = useChromeStorage("timerMode", "stopwatch");
  const [pomodoroCycle, setPomodoroCycle] = useChromeStorage(
    `pomodoroCycle_${currentUser?.uid}`,
    0,
  );
  const [selectedProject, setSelectedProject] = useChromeStorage(
    `selectedProj_${currentUser?.uid}`,
    null,
  );
  const [selectedTopic, setSelectedTopic] = useChromeStorage(
    `selectedTopic_${currentUser?.uid}`,
    null,
  );
  const [selectedSubTopic, setSelectedSubTopic] = useChromeStorage(
    `selectedSubTopic_${currentUser?.uid}`,
    null,
  );

  // Timers & Hooks
  const isExtensionPopup =
    typeof chrome !== "undefined" && chrome.runtime && !!chrome.runtime.id;
  const stopwatch = useStudyTimer();
  const pomodoro = usePomodoroTimer(POMODORO_DURATIONS);

  // Apply extension-mode class to body/html/root for global layout constraints
  useEffect(() => {
    if (isExtensionPopup) {
      document.body.classList.add("extension-mode");
      document.documentElement.classList.add("extension-mode");
      const extRoot = document.getElementById("extension-root");
      if (extRoot) extRoot.classList.add("extension-mode");
    } else {
      document.body.classList.remove("extension-mode");
      document.documentElement.classList.remove("extension-mode");
      const extRoot = document.getElementById("extension-root");
      if (extRoot) extRoot.classList.remove("extension-mode");
    }
  }, [isExtensionPopup]);

  // Extracted Session Manager Hook
  const {
    timers,
    topicTimers,
    subTopicTimers,
    studyHistory,
    setStudyHistory,
    saveSession,
    formatTime,
    clearCues,
  } = useSessionManager(
    currentUser,
    selectedProject,
    selectedTopic,
    selectedSubTopic,
    stopwatch,
    pomodoro,
    pomodoroCycle,
    setPomodoroCycle,
    POMODORO_DURATIONS,
  );

  // Audio Initialization
  useEffect(() => {
    const initAudio = () => {
      audioService.init();
      document.removeEventListener("click", initAudio);
    };
    document.addEventListener("click", initAudio, { once: true });

    // Warm native haptics ahead of time so first tap feels immediate on Android.
    preloadNativeFeedback().catch(() => {});

    return () => document.removeEventListener("click", initAudio);
  }, []);

  // Load User Profile and Sync Background State
  useEffect(() => {
    if (!currentUser) return;
    getUserProfile(currentUser.uid).then((profile) => {
      if (!profile || !profile.onboardingCompleted) setActiveModal("welcome");
      setIsProfileLoaded(true);
    });

    // Check if a session was completed in the background
    const syncBackgroundState = async () => {
      const state = await timerService.getState();
      if (state.needsFinalize) {
        // Pomodoro work session completed in background
        saveSession(POMODORO_DURATIONS.work * 1000);
        // Clear the flag
        if (typeof chrome !== "undefined" && chrome.storage) {
          chrome.storage.local.set({ needsFinalize: false });
        }
      }
    };
    syncBackgroundState();
  }, [currentUser, saveSession]);

  // Synchronize Projects State
  const selectedStateRef = useRef({
    selectedProject,
    selectedTopic,
    selectedSubTopic,
  });
  useEffect(() => {
    selectedStateRef.current = {
      selectedProject,
      selectedTopic,
      selectedSubTopic,
    };
  }, [selectedProject, selectedTopic, selectedSubTopic]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToUserProjects(
      currentUser.uid,
      (fetchedProjects) => {
        setProjects(fetchedProjects);
        const {
          selectedProject: currProj,
          selectedTopic: currTopic,
          selectedSubTopic: currSubTopic,
        } = selectedStateRef.current;
        if (fetchedProjects.length > 0) {
          let matchedProject = fetchedProjects.find(
            (p) => p.id === currProj?.id,
          );
          if (!matchedProject) {
            matchedProject = fetchedProjects[0];
            setSelectedTopic(null);
            setSelectedSubTopic(null);
          } else if (currTopic) {
            const matchedTopic = matchedProject.topics?.find(
              (t) => t.id === currTopic.id,
            );
            if (!matchedTopic) {
              setSelectedTopic(null);
              setSelectedSubTopic(null);
            } else {
              setSelectedTopic(matchedTopic);
              if (currSubTopic) {
                const matchedSubTopic = matchedTopic.subTopics?.find(
                  (s) => s.id === currSubTopic.id,
                );
                setSelectedSubTopic(matchedSubTopic || null);
              }
            }
          }
          setSelectedProject(matchedProject);
        } else {
          setSelectedProject(null);
          setSelectedTopic(null);
          setSelectedSubTopic(null);
        }
        setIsProjectsLoaded(true);
      },
    );
    return () => unsubscribe();
  }, [currentUser, setSelectedProject, setSelectedTopic, setSelectedSubTopic]);

  // Handlers
  const handleCreateOrUpdateProject = useCallback(
    async (projectData, projectId) => {
      try {
        if (projectId) {
          await updateProjectInFirebase(projectId, projectData);
          toast.success("Project updated!");
        } else {
          await addProjectToFirebase(projectData, currentUser.uid);
          toast.success("Project created!");
        }
      } catch (error) {
        toast.error(`Error: ${error.message}`);
      } finally {
        setActiveModal(null);
        setEditingProject(null);
      }
    },
    [currentUser],
  );

  const deleteProject = useCallback(
    async (projectId) => {
      if (
        !window.confirm(
          "Are you sure? This will delete the project permanently.",
        )
      )
        return;
      try {
        await deleteProjectFromFirebase(projectId);
        setStudyHistory((prev) =>
          prev.filter((s) => s.projectId !== projectId),
        );
        if (selectedProject?.id === projectId) {
          setSelectedProject(
            projects.length > 1
              ? projects.find((p) => p.id !== projectId)
              : null,
          );
          setSelectedTopic(null);
          setSelectedSubTopic(null);
          stopwatch.resetTimer();
          pomodoro.resetTimer("work");
          clearCues();
        }
        toast.success("Project deleted.");
      } catch (error) {
        toast.error(`Failed to delete: ${error.message}`);
      }
    },
    [
      projects,
      selectedProject,
      stopwatch,
      pomodoro,
      setSelectedProject,
      setSelectedTopic,
      setSelectedSubTopic,
      setStudyHistory,
      clearCues,
    ],
  );

  const handleStartPause = useCallback(() => {
    if (!selectedProject) {
      toast.error("Please select a task first!");
      setActiveModal("selection");
      return;
    }
    if (timerMode === "stopwatch") {
      stopwatch.isSessionRunning
        ? stopwatch.pauseTimer()
        : stopwatch.startTimer();
    } else {
      if (pomodoro.isActive) {
        pomodoro.pauseTimer();
      } else {
        pomodoro.startTimer();
        if (pomodoro.mode === "work") {
          clearCues();
          audioService.play("start");
        }
      }
    }
  }, [selectedProject, timerMode, stopwatch, pomodoro, clearCues]);

  const handleStopOrReset = useCallback(() => {
    clearCues();
    if (timerMode === "stopwatch") {
      const duration = stopwatch.endSessionAndGetDuration();
      saveSession(duration);
      stopwatch.resetTimer();
    } else {
      const isWorkSession = pomodoro.mode === "work" && pomodoro.isActive;
      const confirmPrompt = isWorkSession
        ? "Stop, save progress, and reset the cycle?"
        : "Reset the Pomodoro cycle?";
      if (window.confirm(confirmPrompt)) {
        if (isWorkSession) {
          const elapsed = POMODORO_DURATIONS.work - pomodoro.timeLeft;
          saveSession(elapsed * 1000);
        }
        pomodoro.resetTimer("work");
        setPomodoroCycle(0);
      }
    }
  }, [
    timerMode,
    stopwatch,
    pomodoro,
    saveSession,
    setPomodoroCycle,
    clearCues,
  ]);

  const handleSelection = useCallback(
    (project, topic = null, subTopic = null) => {
      console.log("🎯 handleSelection called with:", {
        project: project?.name,
        topic: topic?.name,
        subTopic: subTopic?.name,
      });
      const isRunning =
        timerMode === "stopwatch"
          ? stopwatch.isSessionRunning
          : pomodoro.isActive;
      if (isRunning) {
        if (window.confirm("A session is running. End it and switch tasks?")) {
          handleStopOrReset();
        } else {
          return;
        }
      }
      setSelectedProject(project);
      setSelectedTopic(topic);
      setSelectedSubTopic(subTopic);
      stopwatch.resetTimer();
      pomodoro.resetTimer("work");
      clearCues();
      setActiveModal(null);
    },
    [
      timerMode,
      stopwatch,
      pomodoro,
      handleStopOrReset,
      setSelectedProject,
      setSelectedTopic,
      setSelectedSubTopic,
      clearCues,
    ],
  );

  const isLoading = !isProfileLoaded || !isProjectsLoaded;
  if (isLoading) return <LoadingScreen message="Loading your data..." />;

  if (activeModal === "welcome") {
    return (
      <div className="h-[100dvh] bg-[var(--color-slate-950)] flex items-center justify-center relative overflow-hidden">
        <WelcomeScreen
          onComplete={() => {
            markOnboardingComplete(currentUser.uid);
            setActiveModal(null);
            setTimeout(() => setActiveModal("project"), 300);
          }}
        />
      </div>
    );
  }

  const isRunning =
    timerMode === "stopwatch" ? stopwatch.isSessionRunning : pomodoro.isActive;
  const displayTime =
    timerMode === "stopwatch"
      ? stopwatch.sessionDisplayTime
      : pomodoro.timeLeft * 1000;
  const hasStarted =
    timerMode === "stopwatch"
      ? stopwatch.sessionStartTime !== null
      : pomodoro.timeLeft < POMODORO_DURATIONS[pomodoro.mode];

  const getPomodoroStatusText = () => {
    if (pomodoro.mode === "work")
      return `Focus Session ${pomodoroCycle + 1} of 4`;
    if (pomodoro.mode === "shortBreak") return "Short Break";
    return "Long Break";
  };

  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--color-slate-800)",
            color: "var(--color-slate-100)",
            border: "1px solid var(--color-slate-700)",
          },
        }}
      />
      <div
        className={`home-shell ${
          isExtensionPopup ? "extension-mode" : ""
        } h-[100dvh] max-h-[100dvh] bg-[var(--color-slate-950)] text-[var(--color-slate-300)] flex flex-col relative overflow-hidden transition-colors duration-500`}
      >
        {!isExtensionPopup ? (
          <Navbar
            onNewProjectClick={() => {
              setEditingProject(null);
              setActiveModal("project");
            }}
            onHistoryClick={() => setActiveModal("history")}
            onLogout={logout}
            user={currentUser}
            onAboutClick={() => setActiveModal("about")}
            onFeaturesClick={() => setActiveModal("features")}
          />
        ) : (
          <header className="extension-header flex justify-between items-center px-4 z-50 shadow-[0_2px_10px_rgba(0,0,0,0.2)] bg-slate-900/90 backdrop-blur-md">
            <div className="flex items-center gap-2 pr-3 shrink-0">
              <img
                src="/clock.png"
                className="h-6 w-6 lg:h-7 lg:w-7 drop-shadow-md"
                alt="Logo"
              />
              <span className="text-[14px] font-extrabold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent hidden sm:inline tracking-tight">
                FocusFlow
              </span>
            </div>
            <div className="flex items-center gap-x-[2px] justify-end flex-wrap flex-1">
              <AmbientSounds />
              <div className="w-[1px] h-4 bg-slate-700/60 mx-1"></div>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setActiveModal("project");
                }}
                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-md transition-all active:scale-95"
                title="New Task/Project"
              >
                <FaPlus size={14} />
              </button>
              <button
                onClick={() => setActiveModal("selection")}
                className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-md transition-all active:scale-95"
                title="Change Task"
              >
                <FaTasks size={14} />
              </button>
              <button
                onClick={() => setActiveModal("history")}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-md transition-all active:scale-95"
                title="History"
              >
                <FaHistory size={14} />
              </button>
              <button
                onClick={() => setActiveModal("features")}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-md transition-all active:scale-95"
                title="Features"
              >
                <FaStar size={14} />
              </button>
              <button
                onClick={() => setActiveModal("about")}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-md transition-all active:scale-95"
                title="About"
              >
                <FaInfoCircle size={14} />
              </button>
              <div className="w-[1px] h-4 bg-slate-700/60 mx-1"></div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-all active:scale-95"
                title="Log Out"
              >
                <FaSignOutAlt size={14} />
              </button>
            </div>
          </header>
        )}

        <main
          className={`home-main flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-3 sm:p-6 text-center relative z-10 native-app:pb-24 overflow-hidden ${
            isExtensionPopup ? "pt-2" : ""
          }`}
        >
          <TimerModeToggle mode={timerMode} setMode={setTimerMode} />
          <TimerDisplay
            time={displayTime}
            isRunning={isRunning}
            formatTime={formatTime}
          />

          {timerMode === "pomodoro" ? (
            <p className="text-amber-400 font-semibold mt-4 text-lg animate-pulse h-7">
              {getPomodoroStatusText()}
            </p>
          ) : (
            <div className="h-7 mt-4" />
          )}

          <div className="home-task-block mt-6 sm:mt-8 space-y-4 sm:space-y-6 w-full max-w-md">
            <CurrentTask
              project={selectedProject}
              topic={selectedTopic}
              subTopic={selectedSubTopic}
            />

            <div className="home-actions-row flex flex-col sm:flex-row justify-center items-center gap-4">
              <AnimatedButton
                onClick={() => setActiveModal("selection")}
                className="home-select-task-btn bg-[var(--color-emerald-600)] hover:bg-[var(--color-emerald-500)] text-btn w-full sm:w-auto !py-2.5 shadow-lg shadow-[var(--color-emerald-600)]/20"
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
          <Suspense fallback={<LoadingScreen message="" overlay={true} />}>
            {activeModal === "selection" && (
              <SelectionModal
                projects={projects}
                onSelect={handleSelection}
                onDeleteProject={deleteProject}
                onEditProject={(p) => {
                  setEditingProject(p);
                  setActiveModal("project");
                }}
                timers={timers}
                topicTimers={topicTimers}
                subTopicTimers={subTopicTimers}
                formatTime={formatTime}
                onClose={() => setActiveModal(null)}
              />
            )}
            {activeModal === "history" && (
              <HistoryView
                projects={projects}
                studyHistory={studyHistory}
                formatTime={formatTime}
                timers={timers}
                topicTimers={topicTimers}
                subTopicTimers={subTopicTimers}
                onClose={() => setActiveModal(null)}
              />
            )}
            {activeModal === "project" && (
              <OnboardingFlow
                onFinish={handleCreateOrUpdateProject}
                onCancel={() => {
                  setActiveModal(null);
                  setEditingProject(null);
                }}
                projectToEdit={editingProject}
              />
            )}
            {activeModal === "about" && (
              <About onClose={() => setActiveModal(null)} />
            )}
            {activeModal === "features" && (
              <Features onClose={() => setActiveModal(null)} />
            )}
          </Suspense>
        </AnimatePresence>
      </div>
    </>
  );
};

export default StudyTracker;
