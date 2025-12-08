import React from 'react';
import { DollarSign, TrendingUp, CreditCard, Repeat } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';

export default function FinancialsRevenue() {
  const { isDarkMode, theme } = useTheme();

  const revenueMetrics = [
    { label: 'Monthly Recurring Revenue', value: '$—', icon: Repeat },
    { label: 'New MRR', value: '$—', icon: TrendingUp },
    { label: 'Expansion MRR', value: '$—', icon: DollarSign },
    { label: 'Churned MRR', value: '$—', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Revenue</h1>
        <p className={isDarkMode ? 'text-white/50' : 'text-zinc-500'}>MRR breakdown and revenue streams</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueMetrics.map((m) => {
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
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>MRR Over Time</h3>
        <div className={`h-64 flex items-center justify-center ${isDarkMode ? 'text-white/30' : 'text-zinc-400'}`}>
          Area chart placeholder
        </div>
      </GlassCard>
    </div>
  );
}