import { useState, useEffect, useRef, useCallback } from 'react';

export const usePomodoroTimer = ({
  onSessionEnd,
  workDuration = 25 * 60, // 25 minutes
  shortBreakDuration = 5 * 60, // 5 minutes
  longBreakDuration = 15 * 60, // 15 minutes
}) => {
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isActive, setIsActive] = useState(false);

  const intervalRef = useRef(null);

  const startTimer = useCallback(() => {
    if (!isActive) {
      setIsActive(true);
    }
  }, [isActive]);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetTimer = useCallback((newMode = 'work') => {
    setIsActive(false);
    setMode(newMode);
    switch (newMode) {
      case 'work':
        setTimeLeft(workDuration);
        break;
      case 'shortBreak':
        setTimeLeft(shortBreakDuration);
        break;
      case 'longBreak':
        setTimeLeft(longBreakDuration);
        break;
      default:
        setTimeLeft(workDuration);
    }
  }, [workDuration, shortBreakDuration, longBreakDuration]);
  
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          }
          
          // Time's up
          clearInterval(intervalRef.current);
          setIsActive(false);
          if (onSessionEnd) {
            onSessionEnd(mode);
          }
          return 0;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, mode, onSessionEnd]);

  return {
    timeLeft,
    isActive,
    mode,
    startTimer,
    pauseTimer,
    resetTimer,
  };
};