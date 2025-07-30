import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A robust and accurate hook for a "count-up" stopwatch timer.
 * This version is corrected to be fully reliable.
 */
export const useStudyTimer = () => {
  // State is used to trigger re-renders for the UI (e.g., Play/Pause button).
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [sessionDisplayTime, setSessionDisplayTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // --- Refs for synchronous, reliable timer logic ---
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const timeWhenPausedRef = useRef(0);
  const isRunningRef = useRef(false);

  // The main "tick" function that runs on each interval.
  const tick = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current + timeWhenPausedRef.current;
    setSessionDisplayTime(elapsed);
  }, []);

  // Function to start or resume the timer.
  const startTimer = useCallback(() => {
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    setIsSessionRunning(true);
    
    const now = Date.now();
    startTimeRef.current = now;
    setSessionStartTime(now);

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, 100);
  }, [tick]);

  // Function to pause the timer.
  const pauseTimer = useCallback(() => {
    if (!isRunningRef.current) return;

    isRunningRef.current = false;
    setIsSessionRunning(false);

    clearInterval(intervalRef.current);
    const elapsed = Date.now() - startTimeRef.current + timeWhenPausedRef.current;
    timeWhenPausedRef.current = elapsed;
  }, []);

  // Function to completely reset the timer.
  const resetTimer = useCallback(() => {
    isRunningRef.current = false;
    setIsSessionRunning(false);
    clearInterval(intervalRef.current);
    setSessionDisplayTime(0);
    setSessionStartTime(null);
    startTimeRef.current = 0;
    timeWhenPausedRef.current = 0;
  }, []);

  // Function to stop the timer and get the final duration.
  const endSessionAndGetDuration = useCallback(() => {
    // --- THE KEY FIX IS HERE ---
    // We must calculate the final duration based on the timer's state at this exact moment.
    const finalDuration = isRunningRef.current
      ? Date.now() - startTimeRef.current + timeWhenPausedRef.current
      : sessionDisplayTime; // If paused, the display time is already correct.
    
    resetTimer();
    return finalDuration;
  }, [resetTimer, sessionDisplayTime]); // Dependency added for when paused.

  // Cleanup effect: ensures the interval is cleared when the component unmounts.
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

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
