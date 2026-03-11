import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * A robust study timer hook that persists state to LocalStorage.
 * This ensures the timer continues accurately even if the browser/app refreshes.
 */
export const useStudyTimer = () => {
  // --- Persisted State (Survives Refreshes) ---
  
  // Tracks if the timer is currently counting up
  const [persistedIsRunning, setPersistedIsRunning] = useLocalStorage('study_isRunning', false);
  
  // Tracks total milliseconds from previous "segments" (before the last pause)
  const [accumulatedTime, setAccumulatedTime] = useLocalStorage('study_accumulatedTime', 0);
  
  // The timestamp (Date.now()) when the current running segment started
  const [startTimeOfSegment, setStartTimeOfSegment] = useLocalStorage('study_segmentStart', null);
  
  // The timestamp when the study session FIRST started (used for history records)
  const [sessionStartTime, setSessionStartTime] = useLocalStorage('study_sessionStart', null);

  // --- Local UI State ---
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [sessionDisplayTime, setSessionDisplayTime] = useState(0);
  const intervalRef = useRef(null);

  // The main logic to calculate current elapsed time
  const tick = useCallback(() => {
    if (persistedIsRunning && startTimeOfSegment) {
      const currentElapsed = Date.now() - startTimeOfSegment + accumulatedTime;
      setSessionDisplayTime(currentElapsed);
    } else {
      setSessionDisplayTime(accumulatedTime);
    }
  }, [persistedIsRunning, startTimeOfSegment, accumulatedTime]);

  // Start or Resume
  const startTimer = useCallback(() => {
    if (persistedIsRunning) return;

    const now = Date.now();
    setStartTimeOfSegment(now);
    if (!sessionStartTime) {
      setSessionStartTime(now);
    }
    setPersistedIsRunning(true);
    setIsSessionRunning(true);
  }, [persistedIsRunning, sessionStartTime, setPersistedIsRunning, setStartTimeOfSegment, setSessionStartTime]);

  // Pause
  const pauseTimer = useCallback(() => {
    if (!persistedIsRunning) return;

    const now = Date.now();
    const segmentDuration = now - startTimeOfSegment;
    
    setAccumulatedTime(prev => prev + segmentDuration);
    setStartTimeOfSegment(null);
    setPersistedIsRunning(false);
    setIsSessionRunning(false);
    
    clearInterval(intervalRef.current);
  }, [persistedIsRunning, startTimeOfSegment, setAccumulatedTime, setStartTimeOfSegment, setPersistedIsRunning]);

  // Complete Reset
  const resetTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setPersistedIsRunning(false);
    setIsSessionRunning(false);
    setAccumulatedTime(0);
    setStartTimeOfSegment(null);
    setSessionStartTime(null);
    setSessionDisplayTime(0);
  }, [setPersistedIsRunning, setAccumulatedTime, setStartTimeOfSegment, setSessionStartTime]);

  // Stop and return final duration for saving
  const endSessionAndGetDuration = useCallback(() => {
    const finalDuration = persistedIsRunning && startTimeOfSegment
      ? Date.now() - startTimeOfSegment + accumulatedTime
      : accumulatedTime;
    
    resetTimer();
    return finalDuration;
  }, [persistedIsRunning, startTimeOfSegment, accumulatedTime, resetTimer]);

  // Background Ticking Logic
  useEffect(() => {
    if (persistedIsRunning) {
      setIsSessionRunning(true);
      tick(); // Sync immediately
      intervalRef.current = setInterval(tick, 100);
    } else {
      setIsSessionRunning(false);
      clearInterval(intervalRef.current);
      tick(); // Show the static accumulated time
    }
    return () => clearInterval(intervalRef.current);
  }, [persistedIsRunning, tick]);

  return {
    isSessionRunning,
    sessionDisplayTime,
    sessionStartTime,
    startTimer,
    pauseTimer,
    resetTimer,
    endSessionAndGetDuration,
  };
};