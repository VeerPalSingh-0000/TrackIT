import { useState, useEffect, useRef, useCallback } from 'react';

// Configuration for Pomodoro durations in seconds
const POMODORO_DURATIONS = {
  work: 25 * 60,       // 25 minutes
  shortBreak: 5 * 60,  // 5 minutes
  longBreak: 15 * 60,  // 15 minutes
};

export const usePomodoroTimer = (config = {}) => {
  const [mode, setMode] = useState('work');
  const [isActive, setIsActive] = useState(false);
  
  // timeLeft is now the source of truth, stored in seconds
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATIONS.work);

  // Refs are used to store values that persist across renders without causing re-renders
  const intervalRef = useRef(null);
  const expectedEndTimeRef = useRef(null); // This is the key to our solution!

  // The main "tick" function that runs on each interval
  const tick = useCallback(() => {
    // Calculate the difference between when the timer SHOULD end and the current time
    const remaining = expectedEndTimeRef.current - Date.now();
    
    // Round to the nearest second
    const remainingSeconds = Math.round(remaining / 1000);

    setTimeLeft(remainingSeconds);

    // When the timer reaches zero
    if (remainingSeconds <= 0) {
      setTimeLeft(0);
      setIsActive(false);
      clearInterval(intervalRef.current);
    }
  }, []);

  // Function to start or resume the timer
  const startTimer = useCallback(() => {
    if (isActive) return; // Don't start if already active

    setIsActive(true);
    
    // Set the expected end time based on the current time and timeLeft
    // This is the CRUCIAL step.
    expectedEndTimeRef.current = Date.now() + timeLeft * 1000;

    // Clear any existing interval before starting a new one
    clearInterval(intervalRef.current);
    
    // Start a new interval
    intervalRef.current = setInterval(tick, 1000);
  }, [isActive, timeLeft, tick]);

  // Function to pause the timer
  const pauseTimer = useCallback(() => {
    if (!isActive) return; // Don't pause if not active
    
    setIsActive(false);
    clearInterval(intervalRef.current);
    // The `timeLeft` state is already up-to-date from the last `tick`
  }, [isActive]);

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
    timeLeft,   // The remaining time in seconds
    isActive,   // boolean: is the timer currently running?
    mode,       // 'work', 'shortBreak', or 'longBreak'
    startTimer,
    pauseTimer,
    resetTimer,
  };
};
