import React from 'react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';

export default function AdminUsers() {
  const { isDarkMode } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>User Management</h1>
        <p className={isDarkMode ? 'text-white/50' : 'text-zinc-500'}>View, manage, and support users</p>
      </div>

      <GlassCard className="p-5">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
          Users
        </h3>
        <p className={`text-sm text-center py-16 ${isDarkMode ? 'text-white/40' : 'text-zinc-400'}`}>
          User list and management tools will appear here
        </p>
      </GlassCard>
    </div>
  );
}