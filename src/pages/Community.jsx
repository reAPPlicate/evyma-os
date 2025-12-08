import React from 'react';
import { Users } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';

export default function Community() {
  const { isDarkMode, theme } = useTheme();
  const accentColor = theme.accent;

  return (
    <div className="min-h-screen p-6 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div 
            className="w-16 h-16 rounded-3xl flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Users className="w-8 h-8" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              Community
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
              Connect with others on similar journeys
            </p>
          </div>
        </div>

        {/* Placeholder */}
        <GlassCard className="p-12 text-center">
          <Users className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-white/20' : 'text-zinc-300'}`} />
          <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
            Coming Soon
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
            Join a supportive community of people working towards their goals.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}