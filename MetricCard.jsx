import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';

export default function MetricCard({ 
  metricName, 
  metricId, 
  valueToday = '—', 
  deltaVs7dAvg = null,
  icon: Icon,
  alert = false 
}) {
  const { isDarkMode, theme } = useTheme();

  const getDeltaDisplay = () => {
    if (deltaVs7dAvg === null) return null;
    const isPositive = deltaVs7dAvg > 0;
    const isNegative = deltaVs7dAvg < 0;
    const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
    const color = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-zinc-400';
    
    return (
      <div className={`flex items-center gap-1 text-xs ${color}`}>
        <TrendIcon className="w-3 h-3" />
        <span>{isPositive ? '+' : ''}{deltaVs7dAvg}%</span>
      </div>
    );
  };

  return (
    <GlassCard className={`p-4 ${alert ? 'ring-2 ring-red-500/50' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs font-medium ${isDarkMode ? 'text-white/50' : 'text-zinc-500'}`}>
          {metricName}
        </span>
        {Icon && (
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${theme.accent}20` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: theme.accent }} />
          </div>
        )}
      </div>
      <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
        {valueToday}
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className={`text-[10px] ${isDarkMode ? 'text-white/30' : 'text-zinc-400'}`}>
          {metricId}
        </span>
        {getDeltaDisplay()}
      </div>
      {/* Sparkline placeholder */}
      <div className={`mt-2 h-6 rounded flex items-end gap-0.5 ${isDarkMode ? 'bg-white/5' : 'bg-zinc-100'}`}>
        {[...Array(14)].map((_, i) => (
          <div 
            key={i} 
            className="flex-1 rounded-t opacity-30"
            style={{ 
              height: `${20 + Math.random() * 80}%`,
              backgroundColor: theme.accent 
            }}
          />
        ))}
      </div>
    </GlassCard>
  );
}