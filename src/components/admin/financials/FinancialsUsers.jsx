import React from 'react';
import { Users, UserPlus, UserMinus, TrendingUp } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';

export default function FinancialsUsers() {
  const { isDarkMode, theme } = useTheme();

  const metrics = [
    { label: 'Total Paying Users', value: '—', icon: Users },
    { label: 'New This Month', value: '—', icon: UserPlus },
    { label: 'Churned This Month', value: '—', icon: UserMinus },
    { label: 'Net Growth', value: '—', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>User Financials</h1>
        <p className={isDarkMode ? 'text-white/50' : 'text-zinc-500'}>Paying user metrics and trends</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <GlassCard key={m.label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>{m.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${theme.accent}20` }}>
                  <Icon className="w-4 h-4" style={{ color: theme.accent }} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{m.value}</div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="p-5">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>User Growth Over Time</h3>
        <div className={`h-64 flex items-center justify-center ${isDarkMode ? 'text-white/30' : 'text-zinc-400'}`}>
          Chart placeholder
        </div>
      </GlassCard>
    </div>
  );
}