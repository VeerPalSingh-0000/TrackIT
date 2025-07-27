import { useState, useEffect, useCallback } from 'react';

export const useStudyTimer = () => {
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [timeWhenPaused, setTimeWhenPaused] = useState(0);
  const [sessionDisplayTime, setSessionDisplayTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isSessionRunning) {
      interval = setInterval(() => {
        setSessionDisplayTime(Date.now() - sessionStartTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionRunning, sessionStartTime]);

  const startTimer = useCallback(() => {
    setSessionStartTime(Date.now() - timeWhenPaused);
    setIsSessionRunning(true);
  }, [timeWhenPaused]);

  const pauseTimer = useCallback(() => {
    setIsSessionRunning(false);
    setTimeWhenPaused(Date.now() - sessionStartTime);
  }, [sessionStartTime]);
  
  const resetTimer = useCallback(() => {
    setIsSessionRunning(false);
    setSessionStartTime(null);
    setTimeWhenPaused(0);
    setSessionDisplayTime(0);
  }, []);

  const endSessionAndGetDuration = useCallback(() => {
    if (!sessionStartTime) return 0;
    
    const sessionDuration = isSessionRunning
      ? Date.now() - sessionStartTime
      : timeWhenPaused;
      
    resetTimer();
    return sessionDuration;
  }, [isSessionRunning, sessionStartTime, timeWhenPaused, resetTimer]);

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