import { useState, useEffect, useRef, useCallback } from 'react';
import { useChromeStorage } from './useChromeStorage';
import timerService from '../services/timerService';

// Configuration for Pomodoro durations in seconds
const POMODORO_DURATIONS = {
  work: 25 * 60,      // 25 minutes
  shortBreak: 5 * 60,   // 5 minutes
  longBreak: 15 * 60,  // 15 minutes
};

/**
 * A Pomodoro timer hook that syncs with chrome.storage.local and background alarms.
 * Now acts as a view-only listener that updates the UI based on background state.
 */
export const usePomodoroTimer = () => {
    // Sync state with chrome.storage.local
    const [mode, setMode] = useChromeStorage('pomodoroMode', 'work');
    const [isRunning, setIsRunning] = useChromeStorage('isRunning', false);
    const [startTime, setStartTime] = useChromeStorage('startTime', null);
    const [durationInMinutes, setDurationInMinutes] = useChromeStorage('durationInMinutes', 25);
    
    // Local UI State for smoothing and display
    const [timeLeft, setTimeLeft] = useState(POMODORO_DURATIONS[mode]);
    const intervalRef = useRef(null);

    // Update timeLeft based on background state
    const updateTimeLeft = useCallback(() => {
        if (isRunning && startTime) {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            const totalDurationSeconds = durationInMinutes * 60;
            const remaining = Math.max(0, totalDurationSeconds - elapsedSeconds);
            setTimeLeft(remaining);
            
            if (remaining <= 0) {
                setIsRunning(false);
            }
        } else {
            // When paused, we show the full duration or wherever it was left (if we stored it)
            // For now, let's just reset to the mode duration if not running.
            setTimeLeft(POMODORO_DURATIONS[mode]);
        }
    }, [isRunning, startTime, durationInMinutes, mode, setIsRunning]);

    // Timer actions - now using timerService
    const startTimer = useCallback(() => {
        const durationSeconds = POMODORO_DURATIONS[mode];
        timerService.start('pomodoro', durationSeconds);
        // Local state updates for immediate UI feedback
        setStartTime(Date.now());
        setIsRunning(true);
        setDurationInMinutes(durationSeconds / 60);
    }, [mode, setStartTime, setIsRunning, setDurationInMinutes]);

    const pauseTimer = useCallback(() => {
        timerService.pause();
        setIsRunning(false);
    }, [setIsRunning]);

    const resetTimer = useCallback((newMode = 'work') => {
        timerService.pause();
        setMode(newMode);
        setIsRunning(false);
        setStartTime(null);
        setTimeLeft(POMODORO_DURATIONS[newMode]);
    }, [setMode, setIsRunning, setStartTime]);

    // UI Tick Effect
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

    // Listen for storage changes to keep UI in sync
    useEffect(() => {
        const handleStorageChange = (changes, area) => {
            if (area === 'local') {
                if (changes.pomodoroMode) setMode(changes.pomodoroMode.newValue);
                if (changes.isRunning) setIsRunning(changes.isRunning.newValue);
                if (changes.startTime) setStartTime(changes.startTime.newValue);
                if (changes.durationInMinutes) setDurationInMinutes(changes.durationInMinutes.newValue);
            }
        };

        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.onChanged.addListener(handleStorageChange);
            return () => chrome.storage.onChanged.removeListener(handleStorageChange);
        }
    }, [setMode, setIsRunning, setStartTime, setDurationInMinutes]);

    return {
        timeLeft,
        isActive: isRunning,
        mode,
        startTimer,
        pauseTimer,
        resetTimer,
    };
};
