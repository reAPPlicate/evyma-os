import React from 'react';
import { useTheme } from './ThemeContext';

export default function GlassCard({ children, className = '', ...props }) {
  const { isDarkMode } = useTheme();

  return (
    <div 
      className={`
        rounded-xl backdrop-blur-xl
        ${isDarkMode 
          ? 'bg-white/[0.04] border border-white/[0.08]' 
          : 'bg-white/60 border border-white/40 shadow-lg'
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}