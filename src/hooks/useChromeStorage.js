import { useState, useEffect } from 'react';

/**
 * Custom hook to use chrome.storage.local. Fallback to localStorage for development.
 * @param {string} key - The key to store the data under.
 * @param {any} initialValue - The initial value if no data is found for the key.
 */
export const useChromeStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);

  // Load initial value
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([key], (result) => {
        if (result[key] !== undefined) {
          setStoredValue(result[key]);
        }
      });
    } else {
      // Fallback for development if not in extension environment
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        try {
          setStoredValue(JSON.parse(item));
        } catch (error) {
          console.error("Error parsing localStorage for key", key, error);
        }
      }
    }
  }, [key]);

  // Update value
  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [key]: valueToStore });
    } else {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    }
  };

  return [storedValue, setValue];
};
