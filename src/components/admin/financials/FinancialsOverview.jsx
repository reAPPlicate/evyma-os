import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';

export default function FinancialsOverview() {
  const { isDarkMode, theme } = useTheme();

  const summaryCards = [
    { label: 'Total MRR', value: '$—', change: null, icon: DollarSign },
    { label: 'Net Revenue', value: '$—', change: null, icon: TrendingUp },
    { label: 'Total Customers', value: '—', change: null, icon: Users },
    { label: 'Avg Revenue/User', value: '$—', change: null, icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Financial Overview</h1>
        <p className={isDarkMode ? 'text-white/50' : 'text-zinc-500'}>High-level financial health snapshot</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>{card.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${theme.accent}20` }}>
                  <Icon className="w-4 h-4" style={{ color: theme.accent }} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{card.value}</div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Revenue Trend</h3>
          <div className={`h-48 flex items-center justify-center ${isDarkMode ? 'text-white/30' : 'text-zinc-400'}`}>
            Chart placeholder
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>MRR Movement</h3>
          <div className={`h-48 flex items-center justify-center ${isDarkMode ? 'text-white/30' : 'text-zinc-400'}`}>
            Chart placeholder
          </div>
        </GlassCard>
      </div>
    </div>
  );
}