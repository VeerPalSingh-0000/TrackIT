import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A robust and accurate hook for a "count-up" stopwatch timer.
 * This version is corrected to be fully reliable by removing stale closures.
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
    // This calculation is always correct because it uses refs.
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

    // --- THE KEY FIX ---
    // Instead of using the potentially stale `sessionDisplayTime` state,
    // we calculate the exact elapsed time at the moment of pausing.
    const elapsed = Date.now() - startTimeRef.current + timeWhenPausedRef.current;
    
    // We then store this perfectly accurate value in our ref for when we resume.
    timeWhenPausedRef.current = elapsed;

  }, []); // This function no longer depends on any state, removing the stale closure.

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
    // We use the ref here too for maximum accuracy.
    const finalDuration = timeWhenPausedRef.current;
    resetTimer();
    return finalDuration;
  }, [resetTimer]);

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
