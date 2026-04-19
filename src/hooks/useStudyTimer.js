import { useState, useEffect, useCallback } from "react";
import { useChromeStorage } from "./useChromeStorage";
import timerService from "../services/timerService";

const UI_TICK_MS = 250;

/**
 * A robust study timer hook that syncs with chrome.storage.local.
 * Now acts as a view-only listener that updates the UI based on background state.
 */
export const useStudyTimer = () => {
  // Sync state with chrome.storage.local (or localStorage fallback)
  const [persistedIsRunning, setPersistedIsRunning] = useChromeStorage(
    "study_isRunning",
    false,
  );
  const [accumulatedTime, setAccumulatedTime] = useChromeStorage(
    "study_accumulatedTime",
    0,
  );
  const [startTimeOfSegment, setStartTimeOfSegment] = useChromeStorage(
    "study_segmentStart",
    null,
  );
  const [sessionStartTime, setSessionStartTime] = useChromeStorage(
    "study_sessionStart",
    null,
  );

  // Add the maximum session length setting (default 2 hours)
  const [maxSessionLengthHours] = useChromeStorage(
    "study_maxSessionLengthHours",
    2,
  );

  // Local UI State
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [sessionDisplayTime, setSessionDisplayTime] = useState(0);

  // Sync isSessionRunning with persisted state
  useEffect(() => {
    setIsSessionRunning(persistedIsRunning);
  }, [persistedIsRunning]);

  // Main tick logic to update the display
  const tick = useCallback(() => {
    if (persistedIsRunning && startTimeOfSegment) {
      let currentElapsed = Date.now() - startTimeOfSegment + accumulatedTime;
      const maxMs = maxSessionLengthHours * 60 * 60 * 1000;

      // If we go over the limit, force a pause and cap the time
      if (currentElapsed >= maxMs) {
        setSessionDisplayTime(maxMs);
        setAccumulatedTime(maxMs);
        setPersistedIsRunning(false);
        setStartTimeOfSegment(null);
      } else {
        setSessionDisplayTime(currentElapsed);
      }
    } else {
      setSessionDisplayTime(accumulatedTime);
    }
  }, [
    persistedIsRunning,
    startTimeOfSegment,
    accumulatedTime,
    maxSessionLengthHours,
    setAccumulatedTime,
    setPersistedIsRunning,
    setStartTimeOfSegment,
  ]);

  // Timer actions - now interacting with timerService if needed,
  // though for stopwatch mode we mostly just update storage directly since it doesn't need alarms as much.
  // But we use the service for consistency.

  const startTimer = useCallback(() => {
    if (persistedIsRunning) return;

    const now = Date.now();
    setStartTimeOfSegment(now);
    if (!sessionStartTime) {
      setSessionStartTime(now);
    }
    setPersistedIsRunning(true);

    // We could call timerService.start here if we want the service worker to track it with an alarm,
    // but for a stopwatch, calculating based on startTime is sufficient even if service worker dies.
    // We'll just update storage.
  }, [
    persistedIsRunning,
    sessionStartTime,
    accumulatedTime,
    setPersistedIsRunning,
    setStartTimeOfSegment,
    setSessionStartTime,
  ]);

  const pauseTimer = useCallback(() => {
    if (!persistedIsRunning) return;

    const now = Date.now();
    const segmentDuration = now - startTimeOfSegment;
    const finalElapsed = accumulatedTime + segmentDuration;

    setAccumulatedTime(finalElapsed);
    setStartTimeOfSegment(null);
    setPersistedIsRunning(false);
  }, [
    persistedIsRunning,
    startTimeOfSegment,
    accumulatedTime,
    setAccumulatedTime,
    setStartTimeOfSegment,
    setPersistedIsRunning,
  ]);

  const resetTimer = useCallback(() => {
    setPersistedIsRunning(false);
    setAccumulatedTime(0);
    setStartTimeOfSegment(null);
    setSessionStartTime(null);
    setSessionDisplayTime(0);
  }, [
    setPersistedIsRunning,
    setAccumulatedTime,
    setStartTimeOfSegment,
    setSessionStartTime,
  ]);

  const endSessionAndGetDuration = useCallback(() => {
    let finalDuration = accumulatedTime;

    if (persistedIsRunning && startTimeOfSegment) {
      finalDuration = Date.now() - startTimeOfSegment + accumulatedTime;
    }

    const maxMs = maxSessionLengthHours * 60 * 60 * 1000;
    if (finalDuration > maxMs) {
      finalDuration = maxMs;
    }

    resetTimer();
    return finalDuration;
  }, [
    persistedIsRunning,
    startTimeOfSegment,
    accumulatedTime,
    maxSessionLengthHours,
    resetTimer,
  ]);

  // Background Ticking Logic for UI
  useEffect(() => {
    let interval;
    if (persistedIsRunning) {
      tick(); // Initial sync
      interval = setInterval(tick, UI_TICK_MS);
    } else {
      tick(); // Final sync
    }
    return () => clearInterval(interval);
  }, [persistedIsRunning, tick]);

  // Listen for storage changes from background (if any)
  useEffect(() => {
    const handleStorageChange = (changes, area) => {
      if (area === "local") {
        if (changes.study_isRunning)
          setPersistedIsRunning(changes.study_isRunning.newValue);
        if (changes.study_accumulatedTime)
          setAccumulatedTime(changes.study_accumulatedTime.newValue);
        if (changes.study_segmentStart)
          setStartTimeOfSegment(changes.study_segmentStart.newValue);
        if (changes.study_sessionStart)
          setSessionStartTime(changes.study_sessionStart.newValue);
      }
    };

    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }
  }, [
    setPersistedIsRunning,
    setAccumulatedTime,
    setStartTimeOfSegment,
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
