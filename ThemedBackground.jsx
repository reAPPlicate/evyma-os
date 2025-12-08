import React from 'react';
import { useTheme } from './ThemeContext';

export default function ThemedBackground() {
  const { isDarkMode, theme } = useTheme();

  return (
    <div 
      className={`
        fixed inset-0 pointer-events-none z-0
        transition-opacity duration-700 ease-out
        ${isDarkMode 
          ? `bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientVia} ${theme.gradientTo}` 
          : `bg-gradient-to-br ${theme.lightGradientFrom} ${theme.lightGradientVia} to-white`
        }
      `} 
      aria-hidden="true"
    />
  );
}