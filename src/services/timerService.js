/**
 * Service to bridge the timer logic between components and the Chrome background worker.
 */
export const timerService = {
  /**
   * Starts the timer in the background using Chrome Alarms.
   * @param {string} mode - Timer mode: 'pomodoro' or 'stopwatch'
   * @param {number} durationInSeconds - Duration of the timer in seconds
   */
  start: (mode, durationInSeconds) => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ 
        type: 'START_TIMER', 
        mode, 
        durationInMinutes: durationInSeconds / 60 
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Chrome runtime error while sending start message. Falling back to local state update.', chrome.runtime.lastError);
        }
      });
    } else {
      // Fallback: Update isRunning in localStorage for dev environment
      window.localStorage.setItem('isRunning', 'true');
      window.localStorage.setItem('startTime', Date.now().toString());
    }
  },

  /**
   * Pauses the active timer in the background.
   */
  pause: () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' }, (response) => {
        if (chrome.runtime.lastError) {
           console.warn('Chrome runtime error while sending pause message. Falling back to local state update.', chrome.runtime.lastError);
        }
      });
    } else {
      // Fallback: Update isRunning in localStorage for dev environment
       window.localStorage.setItem('isRunning', 'false');
    }
  },

  /**
   * Clears the current timer.
   */
  clear: () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' });
    }
  },

  /**
   * Fetches the current state of the timer from storage.
   * @returns {Promise<Object>}
   */
  getState: async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get(null, (result) => {
          resolve(result);
        });
      });
    } else {
      // Fallback for dev environment
      const allKeys = Object.keys(window.localStorage);
      const result = {};
      allKeys.forEach(key => {
        try {
          result[key] = JSON.parse(window.localStorage.getItem(key));
        } catch (e) {
          result[key] = window.localStorage.getItem(key);
        }
      });
      return result;
    }
  }
};

export default timerService;
