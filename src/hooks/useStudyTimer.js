import { useState, useEffect, useCallback, useRef } from "react";
import { useChromeStorage } from "./useChromeStorage";

const UI_TICK_MS = 1000; // 1 second — timer only shows seconds, sub-second ticks are wasted cycles

/**
 * A robust study timer hook.
 * Performance-optimized: high-frequency state lives in refs (not storage),
 * storage is only written on start/pause/stop transitions.
 */
export const useStudyTimer = () => {
  // Persisted state — only read on mount, written on state transitions
  const [persistedIsRunning, setPersistedIsRunning] = useChromeStorage(
    "study_isRunning",
    false,
  );
  const [persistedAccumulatedTime, setPersistedAccumulatedTime] =
    useChromeStorage("study_accumulatedTime", 0);
  const [persistedSegmentStart, setPersistedSegmentStart] = useChromeStorage(
    "study_segmentStart",
    null,
  );
  const [sessionStartTime, setSessionStartTime] = useChromeStorage(
    "study_sessionStart",
    null,
  );
  const [maxSessionLengthHours] = useChromeStorage(
    "study_maxSessionLengthHours",
    2,
  );

  // High-frequency refs — these change every tick but never hit storage
  const isRunningRef = useRef(false);
  const accumulatedTimeRef = useRef(0);
  const segmentStartRef = useRef(null);
  const maxMsRef = useRef(2 * 60 * 60 * 1000);

  // UI state — only this triggers re-renders
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [sessionDisplayTime, setSessionDisplayTime] = useState(0);

  // Sync persisted values into refs on load
  useEffect(() => {
    isRunningRef.current = persistedIsRunning;
    setIsSessionRunning(persistedIsRunning);
  }, [persistedIsRunning]);

  useEffect(() => {
    accumulatedTimeRef.current = persistedAccumulatedTime;
  }, [persistedAccumulatedTime]);

  useEffect(() => {
    segmentStartRef.current = persistedSegmentStart;
  }, [persistedSegmentStart]);

  useEffect(() => {
    maxMsRef.current = maxSessionLengthHours * 60 * 60 * 1000;
  }, [maxSessionLengthHours]);

  // Timer actions — write to storage only on transitions
  const startTimer = useCallback(() => {
    if (isRunningRef.current) return;

    const now = Date.now();
    segmentStartRef.current = now;
    isRunningRef.current = true;

    // Persist the transition
    setPersistedSegmentStart(now);
    if (!sessionStartTime) {
      setSessionStartTime(now);
    }
    setPersistedIsRunning(true);
    setIsSessionRunning(true);
  }, [
    sessionStartTime,
    setPersistedIsRunning,
    setPersistedSegmentStart,
    setSessionStartTime,
  ]);

  const pauseTimer = useCallback(() => {
    if (!isRunningRef.current) return;

    const now = Date.now();
    const segmentDuration = now - (segmentStartRef.current || now);
    const finalElapsed = accumulatedTimeRef.current + segmentDuration;

    // Update refs immediately
    accumulatedTimeRef.current = finalElapsed;
    segmentStartRef.current = null;
    isRunningRef.current = false;

    // Persist the transition
    setPersistedAccumulatedTime(finalElapsed);
    setPersistedSegmentStart(null);
    setPersistedIsRunning(false);
    setIsSessionRunning(false);
    setSessionDisplayTime(finalElapsed);
  }, [setPersistedAccumulatedTime, setPersistedSegmentStart, setPersistedIsRunning]);

  const resetTimer = useCallback(() => {
    // Update refs
    isRunningRef.current = false;
    accumulatedTimeRef.current = 0;
    segmentStartRef.current = null;

    // Update UI
    setIsSessionRunning(false);
    setSessionDisplayTime(0);

    // Persist
    setPersistedIsRunning(false);
    setPersistedAccumulatedTime(0);
    setPersistedSegmentStart(null);
    setSessionStartTime(null);
  }, [
    setPersistedIsRunning,
    setPersistedAccumulatedTime,
    setPersistedSegmentStart,
    setSessionStartTime,
  ]);

  const endSessionAndGetDuration = useCallback(() => {
    let finalDuration = accumulatedTimeRef.current;

    if (isRunningRef.current && segmentStartRef.current) {
      finalDuration =
        Date.now() - segmentStartRef.current + accumulatedTimeRef.current;
    }

    const maxMs = maxMsRef.current;
    if (finalDuration > maxMs) {
      finalDuration = maxMs;
    }

    resetTimer();
    return finalDuration;
  }, [resetTimer]);

  // UI tick — only updates the display state, never touches storage
  useEffect(() => {
    if (!isRunningRef.current) {
      // Show accumulated time when paused
      setSessionDisplayTime(accumulatedTimeRef.current);
      return;
    }

    const tick = () => {
      if (!isRunningRef.current || !segmentStartRef.current) return;

      const elapsed =
        Date.now() - segmentStartRef.current + accumulatedTimeRef.current;
      const maxMs = maxMsRef.current;

      if (elapsed >= maxMs) {
        // Auto-pause at max
        accumulatedTimeRef.current = maxMs;
        segmentStartRef.current = null;
        isRunningRef.current = false;

        setSessionDisplayTime(maxMs);
        setIsSessionRunning(false);
        setPersistedAccumulatedTime(maxMs);
        setPersistedIsRunning(false);
        setPersistedSegmentStart(null);
      } else {
        setSessionDisplayTime(elapsed);
      }
    };

    tick(); // Immediate first tick
    const interval = setInterval(tick, UI_TICK_MS);
    return () => clearInterval(interval);
  }, [isSessionRunning, setPersistedAccumulatedTime, setPersistedIsRunning, setPersistedSegmentStart]);

  // Listen for storage changes from background (Chrome extension only)
  useEffect(() => {
    const handleStorageChange = (changes, area) => {
      if (area === "local") {
        if (changes.study_isRunning) {
          const val = changes.study_isRunning.newValue;
          isRunningRef.current = val;
          setPersistedIsRunning(val);
        }
        if (changes.study_accumulatedTime) {
          accumulatedTimeRef.current = changes.study_accumulatedTime.newValue;
          setPersistedAccumulatedTime(changes.study_accumulatedTime.newValue);
        }
        if (changes.study_segmentStart) {
          segmentStartRef.current = changes.study_segmentStart.newValue;
          setPersistedSegmentStart(changes.study_segmentStart.newValue);
        }
        if (changes.study_sessionStart) {
          setSessionStartTime(changes.study_sessionStart.newValue);
        }
      }
    };

    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }
  }, [
    setPersistedIsRunning,
    setPersistedAccumulatedTime,
    setPersistedSegmentStart,
    setSessionStartTime,
  ]);

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
