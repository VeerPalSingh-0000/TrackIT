import { useState, useEffect, useRef, useCallback } from 'react';

// Configuration for Pomodoro durations in seconds
const POMODORO_DURATIONS = {
  work: 25 * 60,      // 25 minutes
  shortBreak: 5 * 60,   // 5 minutes
  longBreak: 15 * 60,  // 15 minutes
};

export const usePomodoroTimer = (config = {}) => {
  const [mode, setMode] = useState('work');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATIONS.work);

  // Refs for internal timer logic
  const intervalRef = useRef(null);
  const expectedEndTimeRef = useRef(null);
  
  // --- THE DEFINITIVE FIX for the stale closure problem ---
  // A ref to hold the current timeLeft value. This is always up-to-date
  // and can be accessed reliably inside callbacks like startTimer.
  const timeLeftRef = useRef(timeLeft);

  // Keep the ref synchronized with the timeLeft state whenever it changes.
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // The main "tick" function that runs on each interval
  const tick = useCallback(() => {
    const remaining = expectedEndTimeRef.current - Date.now();
    const remainingSeconds = Math.round(remaining / 1000);

    setTimeLeft(remainingSeconds);

    if (remainingSeconds <= 0) {
      setTimeLeft(0);
      setIsActive(false);
      clearInterval(intervalRef.current);
    }
  }, []);

  // Function to start or resume the timer
  const startTimer = useCallback(() => {
    // Use a direct check on the state to prevent multiple intervals.
    // We can do this because startTimer is only called from a user event
    // or after a state-setting chain in the useEffect.
    setIsActive(currentIsActive => {
        if (currentIsActive) return true; // Already running, do nothing.

        // Use the ref here to get the LATEST timeLeft value.
        // This avoids the stale closure issue when startTimer is called from a setTimeout.
        expectedEndTimeRef.current = Date.now() + timeLeftRef.current * 1000;

        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(tick, 1000);
        
        return true; // Return the new state
    });
  }, [tick]); // Now only depends on tick

  // Function to pause the timer
  const pauseTimer = useCallback(() => {
    setIsActive(false);
    clearInterval(intervalRef.current);
  }, []);

  // Function to reset the timer to a specific mode
  const resetTimer = useCallback((newMode = 'work') => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(POMODORO_DURATIONS[newMode]);
  }, []);
  
  // Cleanup effect: ensures the interval is cleared when the component unmounts
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // Return the state and controls for the component to use
  return {
    timeLeft,
    isActive,
    mode,
    startTimer,
    pauseTimer,
    resetTimer,
  };
};
