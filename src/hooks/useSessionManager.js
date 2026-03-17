import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import audioService from '../services/audioService';
import {
  addSessionToFirebase,
  subscribeToUserSessions,
  saveTimerDataToFirebase,
  loadTimerDataFromFirebase,
} from '../firebase/services';

export const useSessionManager = (
  currentUser, 
  selectedProject, 
  selectedTopic, 
  selectedSubTopic, 
  stopwatch, 
  pomodoro, 
  pomodoroCycle, 
  setPomodoroCycle, 
  POMODORO_DURATIONS
) => {
  const [timers, setTimers] = useState({});
  const [topicTimers, setTopicTimers] = useState({});
  const [subTopicTimers, setSubTopicTimers] = useState({});
  const [studyHistory, setStudyHistory] = useState([]);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const playedCuesRef = useRef(new Set());

  // Load initial data and subscribe to sessions
  useEffect(() => {
    if (!currentUser) return;
    
    loadTimerDataFromFirebase(currentUser.uid).then((data) => {
      if (data) { 
        setTimers(data.timers || {}); 
        setTopicTimers(data.topicTimers || {}); 
        setSubTopicTimers(data.subTopicTimers || {}); 
      }
    });

    const unsubSessions = subscribeToUserSessions(currentUser.uid, (sessions) => { 
      setStudyHistory(sessions); 
    });
    
    return () => unsubSessions();
  }, [currentUser]);

  const formatTime = useCallback((milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Handle saving a session to Firebase
  const saveSession = useCallback((durationInMs) => {
    if (!selectedProject || durationInMs < 1000) { 
      if (stopwatch.sessionStartTime) toast.error("Session too short to save."); 
      return; 
    }

    const id = selectedSubTopic?.id || selectedTopic?.id || selectedProject.id;
    const type = selectedSubTopic ? "subtopic" : selectedTopic ? "topic" : "project";
    
    const updateTimerState = (setter, key) => { 
      setter(prev => ({ ...prev, [key]: { totalTime: (prev[key]?.totalTime || 0) + durationInMs } })); 
    };

    if (type === "project") updateTimerState(setTimers, id); 
    else if (type === "topic") updateTimerState(setTopicTimers, id); 
    else if (type === "subtopic") updateTimerState(setSubTopicTimers, id);

    setTimeout(() => {
      saveTimerDataToFirebase(currentUser?.uid, {
        timers: type === "project" ? { ...timers, [id]: { totalTime: (timers[id]?.totalTime || 0) + durationInMs } } : timers,
        topicTimers: type === "topic" ? { ...topicTimers, [id]: { totalTime: (topicTimers[id]?.totalTime || 0) + durationInMs } } : topicTimers,
        subTopicTimers: type === "subtopic" ? { ...subTopicTimers, [id]: { totalTime: (subTopicTimers[id]?.totalTime || 0) + durationInMs } } : subTopicTimers,
      });
    }, 100);

    const sessionRecord = {
      id: `session_${Date.now()}`, 
      projectId: selectedProject.id, 
      projectName: selectedProject.name, 
      topicId: selectedTopic?.id || null, 
      topicName: selectedTopic?.name || null, 
      subTopicId: selectedSubTopic?.id || null, 
      subTopicName: selectedSubTopic?.name || null, 
      duration: durationInMs, 
      startTime: stopwatch.sessionStartTime || (Date.now() - durationInMs), 
      endTime: Date.now(), 
      date: new Date().toISOString().split("T")[0], 
      type: type,
    };
    
    addSessionToFirebase(sessionRecord, currentUser?.uid);
    toast.success(`Saved ${formatTime(durationInMs)} session!`);
  }, [selectedProject, selectedTopic, selectedSubTopic, timers, topicTimers, subTopicTimers, currentUser, stopwatch.sessionStartTime, formatTime]);

  // Handle Pomodoro audio cues and automatic transitions
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
  }, [pomodoro.timeLeft, pomodoro.isActive, pomodoro.mode, pomodoro, saveSession, pomodoroCycle, setPomodoroCycle, isCompletingSession, POMODORO_DURATIONS]);

  // Expose a clear function for cues
  const clearCues = useCallback(() => {
    playedCuesRef.current.clear();
  }, []);

  return {
    timers,
    topicTimers,
    subTopicTimers,
    studyHistory,
    setStudyHistory,
    saveSession,
    formatTime,
    clearCues
  };
};