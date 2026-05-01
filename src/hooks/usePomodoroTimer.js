import { useState, useEffect, useRef, useCallback } from "react";
import { useChromeStorage } from "./useChromeStorage";
import timerService from "../services/timerService";

// Configuration for Pomodoro durations in seconds
const POMODORO_DURATIONS = {
  work: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

/**
 * A Pomodoro timer hook that syncs with chrome.storage.local and background alarms.
 * Performance-optimized: startTime lives in a ref during active countdown,
 * storage is only written on start/pause/stop transitions.
 */
export const usePomodoroTimer = () => {
  // Persisted state — read on mount, written on transitions
  const [mode, setMode] = useChromeStorage("pomodoroMode", "work");
  const [isRunning, setIsRunning] = useChromeStorage("isRunning", false);
  const [persistedStartTime, setPersistedStartTime] = useChromeStorage(
    "startTime",
    null,
  );
  const [durationInMinutes, setDurationInMinutes] = useChromeStorage(
    "durationInMinutes",
    25,
  );

  // High-frequency refs
  const startTimeRef = useRef(null);
  const isRunningRef = useRef(false);
  const durationRef = useRef(25);
  const modeRef = useRef("work");

  // UI state
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATIONS[mode]);
  const intervalRef = useRef(null);

  // Sync persisted → refs on load
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    startTimeRef.current = persistedStartTime;
  }, [persistedStartTime]);

  useEffect(() => {
    durationRef.current = durationInMinutes;
  }, [durationInMinutes]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Tick — updates UI only, never writes to storage
  const updateTimeLeft = useCallback(() => {
    if (isRunningRef.current && startTimeRef.current) {
      const elapsedSeconds = Math.floor(
        (Date.now() - startTimeRef.current) / 1000,
      );
      const totalDurationSeconds = durationRef.current * 60;
      const remaining = Math.max(0, totalDurationSeconds - elapsedSeconds);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        isRunningRef.current = false;
        setIsRunning(false);
      }
    } else if (!isRunningRef.current) {
      setTimeLeft(POMODORO_DURATIONS[modeRef.current]);
    }
  }, [setIsRunning]);

  // Timer actions
  const startTimer = useCallback(() => {
    const durationSeconds = POMODORO_DURATIONS[modeRef.current];
    timerService.start("pomodoro", durationSeconds);

    const now = Date.now();
    startTimeRef.current = now;
    isRunningRef.current = true;

    // Persist the transition
    setPersistedStartTime(now);
    setIsRunning(true);
    setDurationInMinutes(durationSeconds / 60);
  }, [setPersistedStartTime, setIsRunning, setDurationInMinutes]);

  const pauseTimer = useCallback(() => {
    timerService.pause();
    isRunningRef.current = false;
    setIsRunning(false);
  }, [setIsRunning]);

  const resetTimer = useCallback(
    (newMode = "work") => {
      timerService.pause();
      isRunningRef.current = false;
      startTimeRef.current = null;
      modeRef.current = newMode;

      setMode(newMode);
      setIsRunning(false);
      setPersistedStartTime(null);
      setTimeLeft(POMODORO_DURATIONS[newMode]);
    },
    [setMode, setIsRunning, setPersistedStartTime],
  );

  // UI tick effect
  useEffect(() => {
    if (isRunning) {
      updateTimeLeft();
      intervalRef.current = setInterval(updateTimeLeft, 1000);
    } else {
      updateTimeLeft();
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, updateTimeLeft]);

  // Listen for storage changes (Chrome extension sync)
  useEffect(() => {
    const handleStorageChange = (changes, area) => {
      if (area === "local") {
        if (changes.pomodoroMode) {
          modeRef.current = changes.pomodoroMode.newValue;
          setMode(changes.pomodoroMode.newValue);
        }
        if (changes.isRunning) {
          isRunningRef.current = changes.isRunning.newValue;
          setIsRunning(changes.isRunning.newValue);
        }
        if (changes.startTime) {
          startTimeRef.current = changes.startTime.newValue;
          setPersistedStartTime(changes.startTime.newValue);
        }
        if (changes.durationInMinutes) {
          durationRef.current = changes.durationInMinutes.newValue;
          setDurationInMinutes(changes.durationInMinutes.newValue);
        }
      }
    };

    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () =>
        chrome.storage.onChanged.removeListener(handleStorageChange);
    }
  }, [setMode, setIsRunning, setPersistedStartTime, setDurationInMinutes]);

  return {
    timeLeft,
    isActive: isRunning,
    mode,
    startTimer,
    pauseTimer,
    resetTimer,
  };
};
