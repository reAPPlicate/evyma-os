import React from 'react';
import { TrendingUp, Target, Calendar } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';

export default function FinancialsForecasting() {
  const { isDarkMode, theme } = useTheme();

  const forecasts = [
    { label: 'Projected MRR (30d)', value: '$—', icon: TrendingUp },
    { label: 'Projected Users (30d)', value: '—', icon: Target },
    { label: 'Break-even Date', value: '—', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Forecasting</h1>
        <p className={isDarkMode ? 'text-white/50' : 'text-zinc-500'}>Revenue and growth projections</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {forecasts.map((f) => {
          const Icon = f.icon;
          return (
            <GlassCard key={f.label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>{f.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${theme.accent}20` }}>
                  <Icon className="w-4 h-4" style={{ color: theme.accent }} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{f.value}</div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="p-5">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>12-Month Revenue Forecast</h3>
        <div className={`h-64 flex items-center justify-center ${isDarkMode ? 'text-white/30' : 'text-zinc-400'}`}>
          Line chart with confidence interval placeholder
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Scenario Modeling</h3>
        <div className={`h-48 flex items-center justify-center ${isDarkMode ? 'text-white/30' : 'text-zinc-400'}`}>
          Best/Base/Worst case scenarios placeholder
        </div>
      </GlassCard>
    </div>
  );
}