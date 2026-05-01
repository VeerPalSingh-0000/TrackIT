import { useState, useEffect, useCallback, useRef } from "react";

const DEBOUNCE_MS = 500;

/**
 * Custom hook to use chrome.storage.local. Fallback to localStorage for development.
 * Performance-optimized: debounces writes, stable setter via useCallback, zero console noise.
 * @param {string} key - The key to store the data under.
 * @param {any} initialValue - The initial value if no data is found for the key.
 */
export const useChromeStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const debounceRef = useRef(null);
  const latestValueRef = useRef(storedValue);

  // Keep ref in sync so debounced flush always writes the latest value
  latestValueRef.current = storedValue;

  // Load initial value once
  useEffect(() => {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      chrome.storage.local.get([key], (result) => {
        if (result[key] !== undefined) {
          setStoredValue(result[key]);
        }
      });
    } else {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        try {
          setStoredValue(JSON.parse(item));
        } catch (_) {
          // Ignore parse errors for corrupt data
        }
      }
    }
  }, [key]);

  // Flush pending writes on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        // Synchronous flush of latest value
        const val = latestValueRef.current;
        if (
          typeof chrome !== "undefined" &&
          chrome.storage &&
          chrome.storage.local
        ) {
          chrome.storage.local.set({ [key]: val });
        } else {
          window.localStorage.setItem(key, JSON.stringify(val));
        }
      }
    };
  }, [key]);

  // Stable setter — debounces the actual storage write
  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;

        // Debounce the persistent storage write
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          debounceRef.current = null;
          if (
            typeof chrome !== "undefined" &&
            chrome.storage &&
            chrome.storage.local
          ) {
            chrome.storage.local.set({ [key]: valueToStore });
          } else {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
        }, DEBOUNCE_MS);

        return valueToStore;
      });
    },
    [key],
  );

  return [storedValue, setValue];
};
