import React from 'react';
import { Rss } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';
import DynamicFeed from '@/components/evyma/DynamicFeed';
import EvymaInsights from '@/components/evyma/EvymaInsights';

export default function Feed() {
  const { isDarkMode, theme } = useTheme();
  const accentColor = theme.accent;

  return (
    <div className="min-h-screen p-6 pb-32">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div 
            className="w-16 h-16 rounded-3xl flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Rss className="w-8 h-8" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              Feed
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
              Your personalized activity stream
            </p>
          </div>
        </div>

        {/* Insights */}
        <EvymaInsights accentColor={accentColor} />

        {/* Feed Content */}
        <DynamicFeed accentColor={accentColor} />
      </div>
    </div>
  );
}