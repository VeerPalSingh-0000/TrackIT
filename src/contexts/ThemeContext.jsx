import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const themes = [
  {
    id: 'light-green',
    name: 'Light Green',
    type: 'light',
    colors: {
      '--color-emerald-300': '#059669', // Deep accents
      '--color-emerald-400': '#047857',
      '--color-emerald-500': '#10b981', // Buttons
      '--color-emerald-600': '#059669', // Hover
      '--color-slate-200': '#022c22',   // Extreme text
      '--color-slate-300': '#064e3b',   // Body text
      '--color-slate-400': '#065f46',   // Secondary text
      '--color-slate-500': '#0f766e',
      '--color-slate-600': '#34d399',
      '--color-slate-700': '#10b981',   // Sharp Borders (emerald-500)
      '--color-slate-800': '#6ee7b7',
      '--color-slate-900': '#a7f3d0',   // Cards (much lighter green)
      '--color-slate-950': '#d1fae5',   // Main Background (dominant green)
      '--color-white': '#022c22',       // Headings
      '--color-black': '#ffffff',
      '--color-btn-text': '#ffffff',
    }
  },
  {
    id: 'light-orange',
    name: 'Light Orange',
    type: 'light',
    colors: {
      '--color-emerald-300': '#ea580c',  // Deep accents
      '--color-emerald-400': '#c2410c',
      '--color-emerald-500': '#f97316',  // Buttons
      '--color-emerald-600': '#ea580c',  // Hover
      '--color-slate-200': '#431407',    
      '--color-slate-300': '#7c2d12',    // Body text
      '--color-slate-400': '#9a3412',    // Secondary text
      '--color-slate-500': '#c2410c',
      '--color-slate-600': '#fb923c',
      '--color-slate-700': '#f97316',    // Sharp Borders (orange-500)
      '--color-slate-800': '#fdba74',
      '--color-slate-900': '#fed7aa',    // Cards (much lighter orange)
      '--color-slate-950': '#ffedd5',    // Main Background (dominant orange)
      '--color-white': '#431407',        // Headings
      '--color-black': '#ffffff',
      '--color-btn-text': '#ffffff',
    }
  },
  {
    id: 'blue-theme',
    name: 'Blue Theme',
    type: 'dark',
    colors: {
      '--color-emerald-300': '#60a5fa', 
      '--color-emerald-400': '#3b82f6',
      '--color-emerald-500': '#2563eb', 
      '--color-emerald-600': '#1d4ed8',
      '--color-slate-200': '#eff6ff',
      '--color-slate-300': '#dbeafe',
      '--color-slate-400': '#bfdbfe',
      '--color-slate-500': '#60a5fa',
      '--color-slate-600': '#3b82f6',
      '--color-slate-700': '#1e3a8a', 
      '--color-slate-800': '#1e40af', 
      '--color-slate-900': '#172554', 
      '--color-slate-950': '#081438',
      '--color-white': '#ffffff',
      '--color-black': '#000000',
      '--color-btn-text': '#ffffff',
    }
  },
  {
    id: 'purple-theme',
    name: 'Purple Theme',
    type: 'dark',
    colors: {
      '--color-emerald-300': '#c084fc', 
      '--color-emerald-400': '#a855f7',
      '--color-emerald-500': '#9333ea', 
      '--color-emerald-600': '#7e22ce',
      '--color-slate-200': '#faf5ff',
      '--color-slate-300': '#f3e8ff',
      '--color-slate-400': '#e9d5ff',
      '--color-slate-500': '#c084fc',
      '--color-slate-600': '#a855f7',
      '--color-slate-700': '#581c87', 
      '--color-slate-800': '#6b21a8',
      '--color-slate-900': '#3b0764', 
      '--color-slate-950': '#2e054e',
      '--color-white': '#ffffff',
      '--color-black': '#000000',
      '--color-btn-text': '#ffffff',
    }
  },
  {
    id: 'white-theme',
    name: 'White Theme',
    type: 'light',
    colors: {
      '--color-emerald-300': '#3f3f46', 
      '--color-emerald-400': '#27272a',
      '--color-emerald-500': '#18181b', // Buttons (near black)
      '--color-emerald-600': '#09090b', 
      '--color-slate-200': '#09090b',
      '--color-slate-300': '#18181b',   // Body text
      '--color-slate-400': '#3f3f46',   // Secondary text
      '--color-slate-500': '#71717a',
      '--color-slate-600': '#a1a1aa',
      '--color-slate-700': '#d4d4d8',   // Borders
      '--color-slate-800': '#e4e4e7',
      '--color-slate-900': '#fafafa',   // Cards
      '--color-slate-950': '#ffffff',   // Pure White Background
      '--color-white': '#000000',       // Headings
      '--color-black': '#ffffff',
      '--color-btn-text': '#ffffff',
    }
  },
  {
    id: 'black-theme',
    name: 'Black Theme',
    type: 'dark',
    colors: {
      '--color-emerald-300': '#d4d4d8', 
      '--color-emerald-400': '#e4e4e7',
      '--color-emerald-500': '#fafafa', // Buttons (white)
      '--color-emerald-600': '#ffffff', 
      '--color-slate-200': '#ffffff',
      '--color-slate-300': '#f4f4f5',   // Body text
      '--color-slate-400': '#a1a1aa',   // Secondary text
      '--color-slate-500': '#71717a',
      '--color-slate-600': '#52525b',
      '--color-slate-700': '#3f3f46',   // Borders
      '--color-slate-800': '#18181b',
      '--color-slate-900': '#09090b',   // Cards
      '--color-slate-950': '#000000',   // Pure Black Background
      '--color-white': '#ffffff',       // Headings
      '--color-black': '#000000',
      '--color-btn-text': '#000000',
    }
  }
];

export const ThemeProvider = ({ children }) => {
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return localStorage.getItem('focusflow-theme') || 'black-theme';
  });

  useEffect(() => {
    const theme = themes.find(t => t.id === currentThemeId) || themes[0];
    const root = document.documentElement;
    
    // Smooth transition mapping
    document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
    
    // Map every specific color
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Special body background for consistency
    document.body.style.backgroundColor = theme.colors['--color-slate-950'];
    document.body.style.color = theme.colors['--color-slate-300'] || theme.colors['--color-slate-400'] || '#e2e8f0';

    localStorage.setItem('focusflow-theme', currentThemeId);
  }, [currentThemeId]);

  return (
    <ThemeContext.Provider value={{ currentThemeId, setCurrentThemeId, activeTheme: themes.find(t => t.id === currentThemeId) || themes[0] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
