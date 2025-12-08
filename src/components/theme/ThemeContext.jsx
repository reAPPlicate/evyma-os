import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme color definitions
export const THEME_COLORS = {
  blue: {
    accent: '#3B82F6',
    gradientFrom: 'from-blue-600/20',
    gradientVia: 'via-blue-900/10',
    gradientTo: 'to-transparent',
    lightGradientFrom: 'from-blue-100',
    lightGradientVia: 'via-blue-50/50',
  },
  indigo: {
    accent: '#6366F1',
    gradientFrom: 'from-indigo-600/20',
    gradientVia: 'via-indigo-900/10',
    gradientTo: 'to-transparent',
    lightGradientFrom: 'from-indigo-100',
    lightGradientVia: 'via-indigo-50/50',
  },
  cyan: {
    accent: '#06B6D4',
    gradientFrom: 'from-cyan-600/20',
    gradientVia: 'via-cyan-900/10',
    gradientTo: 'to-transparent',
    lightGradientFrom: 'from-cyan-100',
    lightGradientVia: 'via-cyan-50/50',
  },
  teal: {
    accent: '#14B8A6',
    gradientFrom: 'from-teal-600/20',
    gradientVia: 'via-teal-900/10',
    gradientTo: 'to-transparent',
    lightGradientFrom: 'from-teal-100',
    lightGradientVia: 'via-teal-50/50',
  },
  green: {
    accent: '#22C55E',
    gradientFrom: 'from-green-600/20',
    gradientVia: 'via-green-900/10',
    gradientTo: 'to-transparent',
    lightGradientFrom: 'from-green-100',
    lightGradientVia: 'via-green-50/50',
  },
  purple: {
    accent: '#8B5CF6',
    gradientFrom: 'from-purple-600/20',
    gradientVia: 'via-purple-900/10',
    gradientTo: 'to-transparent',
    lightGradientFrom: 'from-purple-100',
    lightGradientVia: 'via-purple-50/50',
  },
  amber: {
    accent: '#F59E0B',
    gradientFrom: 'from-amber-600/20',
    gradientVia: 'via-amber-900/10',
    gradientTo: 'to-transparent',
    lightGradientFrom: 'from-amber-100',
    lightGradientVia: 'via-amber-50/50',
  },
  orange: {
    accent: '#F97316',
    gradientFrom: 'from-orange-600/20',
    gradientVia: 'via-orange-900/10',
    gradientTo: 'to-transparent',
    lightGradientFrom: 'from-orange-100',
    lightGradientVia: 'via-orange-50/50',
  },
  red: {
    accent: '#EF4444',
    gradientFrom: 'from-red-600/20',
    gradientVia: 'via-red-900/10',
    gradientTo: 'to-transparent',
    lightGradientFrom: 'from-red-100',
    lightGradientVia: 'via-red-50/50',
  },
  rose: {
    accent: '#F43F5E',
    gradientFrom: 'from-rose-600/20',
    gradientVia: 'via-rose-900/10',
    gradientTo: 'to-transparent',
    lightGradientFrom: 'from-rose-100',
    lightGradientVia: 'via-rose-50/50',
  },
  pink: {
    accent: '#EC4899',
    gradientFrom: 'from-pink-600/20',
    gradientVia: 'via-pink-900/10',
    gradientTo: 'to-transparent',
    lightGradientFrom: 'from-pink-100',
    lightGradientVia: 'via-pink-50/50',
  },
  neutral: {
    accent: '#71717A',
    gradientFrom: 'from-zinc-600/20',
    gradientVia: 'via-zinc-900/10',
    gradientTo: 'to-transparent',
    lightGradientFrom: 'from-zinc-200',
    lightGradientVia: 'via-zinc-100/50',
  },
};

export const THEMES = [
  { id: 'blue', color: '#3B82F6' },
  { id: 'indigo', color: '#6366F1' },
  { id: 'cyan', color: '#06B6D4' },
  { id: 'teal', color: '#14B8A6' },
  { id: 'green', color: '#22C55E' },
  { id: 'purple', color: '#8B5CF6' },
  { id: 'amber', color: '#F59E0B' },
  { id: 'orange', color: '#F97316' },
  { id: 'red', color: '#EF4444' },
  { id: 'rose', color: '#F43F5E' },
  { id: 'pink', color: '#EC4899' },
  { id: 'neutral', color: '#71717A' },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('evyma-dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('evyma-theme') || 'blue';
  });

  const theme = THEME_COLORS[activeTheme] || THEME_COLORS.blue;

  useEffect(() => {
    localStorage.setItem('evyma-dark-mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('evyma-theme', activeTheme);
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      setIsDarkMode,
      activeTheme,
      setActiveTheme,
      theme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}