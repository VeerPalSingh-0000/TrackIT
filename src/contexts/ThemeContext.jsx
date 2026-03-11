import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const themes = [
  {
    id: 'obsidian-echo',
    name: 'Obsidian Echo',
    type: 'dark',
    colors: {
      '--color-emerald-300': '#6ee7b7',
      '--color-emerald-400': '#34d399',
      '--color-emerald-500': '#10b981',
      '--color-emerald-600': '#059669',
      '--color-slate-200': '#e2e8f0',
      '--color-slate-300': '#cbd5e1',
      '--color-slate-400': '#94a3b8',
      '--color-slate-500': '#64748b',
      '--color-slate-600': '#475569',
      '--color-slate-700': '#334155',
      '--color-slate-800': '#1e293b',
      '--color-slate-900': '#0f172a',
      '--color-slate-950': '#020617',
      '--color-white': '#ffffff',
      '--color-black': '#000000',
    }
  },
  {
    id: 'midnight-sapphire',
    name: 'Midnight Sapphire',
    type: 'dark',
    colors: {
      '--color-emerald-300': '#93c5fd', // blue-300
      '--color-emerald-400': '#60a5fa', // blue-400
      '--color-emerald-500': '#3b82f6', // blue-500
      '--color-emerald-600': '#2563eb', // blue-600
      '--color-slate-200': '#e0e7ff',   // indigo-100
      '--color-slate-300': '#c7d2fe',   // indigo-200
      '--color-slate-400': '#a5b4fc',   // indigo-300
      '--color-slate-500': '#818cf8',   // indigo-400
      '--color-slate-600': '#6366f1',
      '--color-slate-700': '#4f46e5',
      '--color-slate-800': '#1e1b4b',   // indigo-950 (cards)
      '--color-slate-900': '#121035',   // deep navy (panels)
      '--color-slate-950': '#070617',   // extreme navy (bg)
      '--color-white': '#ffffff',
      '--color-black': '#000000',
    }
  },
  {
    id: 'royal-amethyst',
    name: 'Royal Amethyst',
    type: 'dark',
    colors: {
      '--color-emerald-300': '#d8b4fe', // purple-300
      '--color-emerald-400': '#c084fc', // purple-400
      '--color-emerald-500': '#a855f7', // purple-500
      '--color-emerald-600': '#9333ea', // purple-600
      '--color-slate-200': '#f3e8ff',
      '--color-slate-300': '#e9d5ff',
      '--color-slate-400': '#d8b4fe', 
      '--color-slate-500': '#c084fc',
      '--color-slate-600': '#a855f7',
      '--color-slate-700': '#9333ea',
      '--color-slate-800': '#3b0764', // purple-950
      '--color-slate-900': '#24043b', // deep purple
      '--color-slate-950': '#140221', // pure midnight purple
      '--color-white': '#ffffff',
      '--color-black': '#000000',
    }
  },
  {
    id: 'crimson-velvet',
    name: 'Crimson Velvet',
    type: 'dark',
    colors: {
      '--color-emerald-300': '#fda4af', // rose-300
      '--color-emerald-400': '#fb7185', // rose-400
      '--color-emerald-500': '#f43f5e', // rose-500
      '--color-emerald-600': '#e11d48', // rose-600
      '--color-slate-200': '#ffe4e6',
      '--color-slate-300': '#fecdd3',
      '--color-slate-400': '#fda4af', 
      '--color-slate-500': '#fb7185',
      '--color-slate-600': '#f43f5e',
      '--color-slate-700': '#e11d48',
      '--color-slate-800': '#4c0519', // rose-950
      '--color-slate-900': '#2b020e', // dark burgundy
      '--color-slate-950': '#150106', // blood night
      '--color-white': '#ffffff',
      '--color-black': '#000000',
    }
  },
  {
    id: 'arctic-dawn',
    name: 'Arctic Dawn',
    type: 'light',
    colors: {
      // Light mode uses darker accents for text legibility, and very light accents for button backgrounds (so dark text shows up)
      '--color-emerald-300': '#0891b2', // cyan-600
      '--color-emerald-400': '#0e7490', // cyan-700
      '--color-emerald-500': '#a5f3fc', // cyan-200 (Button background)
      '--color-emerald-600': '#67e8f9', // cyan-300 (Button hover)
      
      // Fully invert slate scale
      '--color-slate-200': '#94a3b8',   // slate-400
      '--color-slate-300': '#475569',   // text-slate-300 -> slate-600
      '--color-slate-400': '#334155',   // text-slate-400 -> slate-700
      '--color-slate-500': '#1e293b',   // slate-800
      '--color-slate-600': '#cbd5e1',   // slate-300
      '--color-slate-700': '#e2e8f0',   // slate-200
      '--color-slate-800': '#f1f5f9',   // bg-slate-800 -> slate-100 (cards)
      '--color-slate-900': '#f8fafc',   // bg-slate-900 -> slate-50 (panels)
      '--color-slate-950': '#ffffff',   // bg-slate-950 -> white (body bg)
      
      // Invert high-contrast text
      '--color-white': '#0f172a',       // text-white -> slate-900 (headings & button text)
      '--color-black': '#ffffff',
    }
  },
  {
    id: 'lumina-minimal',
    name: 'Lumina Minimal',
    type: 'light',
    colors: {
      '--color-emerald-300': '#52525b', // zinc-600
      '--color-emerald-400': '#3f3f46', // zinc-700
      '--color-emerald-500': '#e4e4e7', // zinc-200 (Button background)
      '--color-emerald-600': '#d4d4d8', // zinc-300 (Button hover)
      
      // Fully invert slate scale to strict grayscale
      '--color-slate-200': '#a1a1aa',   // zinc-400
      '--color-slate-300': '#52525b',   // zinc-600
      '--color-slate-400': '#3f3f46',   // zinc-700
      '--color-slate-500': '#27272a',   // zinc-800
      '--color-slate-600': '#d4d4d8',   // zinc-300
      '--color-slate-700': '#e4e4e7',   // zinc-200
      '--color-slate-800': '#f4f4f5',   // zinc-100 (cards)
      '--color-slate-900': '#fafafa',   // zinc-50 (panels)
      '--color-slate-950': '#ffffff',   // white
      
      // Invert high-contrast text
      '--color-white': '#18181b',       // zinc-900
      '--color-black': '#ffffff',
    }
  }
];

export const ThemeProvider = ({ children }) => {
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return localStorage.getItem('focusflow-theme') || 'obsidian-echo';
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
