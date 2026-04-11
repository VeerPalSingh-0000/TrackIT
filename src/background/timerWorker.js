import { addSessionToFirebase, saveTimerDataToFirebase, loadTimerDataFromFirebase } from '../firebase/services';

// Function to update the browser icon badge
function updateBadge(timeLeft, mode) {
  if (typeof chrome === 'undefined' || !chrome.action) return;

  if (timeLeft <= 0) {
    chrome.action.setBadgeText({ text: "" });
    return;
  }

  const minutes = Math.ceil(timeLeft / 60);
  chrome.action.setBadgeText({ text: `${minutes}m` });
  
  // Color code: Emerald for Work, Amber for Breaks
  const color = mode === 'work' ? "#10b981" : "#f59e0b";
  chrome.action.setBadgeBackgroundColor({ color });
}

// Alarm listener
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    updateBadge(0); // Clear badge on end
    handleTimerEnd();
  }
});

// Helper for periodic badge updates
async function startBadgeInterval(durationMinutes, mode) {
  const startTime = Date.now();
  const totalSeconds = durationMinutes * 60;
  
  // Create an alarm for the regular tick if we want it to survive
  // But for simple badge updates, we can just use a local interval if the worker is awake.
  // Since workers can sleep, we'll rely on the storage and the fact that we can recalculate whenever we wake up.
}

async function handleTimerEnd() {
  const result = await chrome.storage.local.get(['currentUser', 'timerMode']);
  const currentUser = result.currentUser;
  const timerMode = result.timerMode;
  
  if (!currentUser) return;

  const cycleKey = `pomodoroCycle_${currentUser.uid}`;
  const projKey = `selectedProj_${currentUser.uid}`;
  const topicKey = `selectedTopic_${currentUser.uid}`;
  const subTopicKey = `selectedSubTopic_${currentUser.uid}`;

  const state = await chrome.storage.local.get([
    'pomodoroMode', 
    cycleKey,
    projKey,
    topicKey,
    subTopicKey,
    'timers',
    'topicTimers',
    'subTopicTimers'
  ]);
  
  const pomodoroMode = state.pomodoroMode;
  const pomodoroCycle = state[cycleKey] || 0;
  const selectedProject = state[projKey];
  const selectedTopic = state[topicKey];
  const selectedSubTopic = state[subTopicKey];
  
  if (timerMode === 'pomodoro' && pomodoroMode === 'work') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/clock.png',
      title: 'FocusFlow',
      message: 'Work session complete! Time for a break.',
      priority: 2
    });
    
    // Autonomously save session to Firebase
    if (selectedProject) {
      const durationInMs = 25 * 60 * 1000; // Standard work duration
      const id = selectedSubTopic?.id || selectedTopic?.id || selectedProject.id;
      const type = selectedSubTopic ? "subtopic" : selectedTopic ? "topic" : "project";
      
      const sessionRecord = {
        id: `session_${Date.now()}`, 
        projectId: selectedProject.id, 
        projectName: selectedProject.name, 
        topicId: selectedTopic?.id || null, 
        topicName: selectedTopic?.name || null, 
        subTopicId: selectedSubTopic?.id || null, 
        subTopicName: selectedSubTopic?.name || null, 
        duration: durationInMs, 
        startTime: Date.now() - durationInMs, 
        endTime: Date.now(), 
        date: new Date().toISOString().split("T")[0], 
        type: type,
      };

      try {
        await addSessionToFirebase(sessionRecord, currentUser.uid);
        
        // Also update the aggregated timers
        const updatedTimers = { ...state.timers };
        const updatedTopicTimers = { ...state.topicTimers };
        const updatedSubTopicTimers = { ...state.subTopicTimers };

        if (type === "project") updatedTimers[id] = { totalTime: (updatedTimers[id]?.totalTime || 0) + durationInMs };
        else if (type === "topic") updatedTopicTimers[id] = { totalTime: (updatedTopicTimers[id]?.totalTime || 0) + durationInMs };
        else if (type === "subtopic") updatedSubTopicTimers[id] = { totalTime: (updatedSubTopicTimers[id]?.totalTime || 0) + durationInMs };

        await saveTimerDataToFirebase(currentUser.uid, {
            timers: updatedTimers,
            topicTimers: updatedTopicTimers,
            subTopicTimers: updatedSubTopicTimers
        });

        // Sync local storage with updated timers
        await chrome.storage.local.set({
            timers: updatedTimers,
            topicTimers: updatedTopicTimers,
            subTopicTimers: updatedSubTopicTimers
        });
      } catch (err) {
        console.error("Background Session Save Failed:", err);
      }
    }
    
    const nextCycle = pomodoroCycle + 1;
    const nextMode = nextCycle % 4 === 0 ? 'longBreak' : 'shortBreak';
    
    await chrome.storage.local.set({ 
      pomodoroMode: nextMode,
      [cycleKey]: nextCycle,
      isRunning: false,
      needsFinalize: false // Already saved in background
    });

    updateBadge(0); // Transition
  } else if (timerMode === 'pomodoro' && (pomodoroMode === 'shortBreak' || pomodoroMode === 'longBreak')) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/clock.png',
      title: 'FocusFlow',
      message: "Break's over! Let's get back to it.",
      priority: 2
    });
    
    await chrome.storage.local.set({ 
      pomodoroMode: 'work',
      isRunning: false,
      needsFinalize: false
    });

    updateBadge(0);
  }
}

// Tick logic simulation for badge updates (since alarms are min. 1min)
// Chrome Extension service workers can use setInterval but it may be throttled or cleared.
// We primarily update on start/pause and rely on the UI if open.
// To handle background badge updates, we use a separate "tick" alarm if necessary, 
// but for now, we'll update it whenever storage changes or on start.

// Listen for messages from the Popup (UI)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_TIMER') {
    const duration = message.durationInMinutes;
    chrome.alarms.create(ALARM_NAME, { delayInMinutes: duration });
    chrome.storage.local.set({ 
      isRunning: true, 
      startTime: Date.now(),
      durationInMinutes: duration,
      timerMode: message.mode || 'pomodoro'
    });
    updateBadge(duration * 60, message.mode || 'pomodoro');
    sendResponse({ status: 'started' });
  } 
  else if (message.type === 'PAUSE_TIMER') {
    chrome.alarms.clear(ALARM_NAME);
    chrome.storage.local.set({ isRunning: false });
    updateBadge(0);
    sendResponse({ status: 'paused' });
  }
  return true; 
});

