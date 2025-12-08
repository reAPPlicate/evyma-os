import React from 'react';
import { Cpu, Server, Mic, Database } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';

export default function FinancialsCost() {
  const { isDarkMode, theme } = useTheme();

  const costBreakdown = [
    { label: 'AI/LLM Costs', value: '$—', icon: Cpu },
    { label: 'Infrastructure', value: '$—', icon: Server },
    { label: 'Voice Processing', value: '$—', icon: Mic },
    { label: 'Storage/Database', value: '$—', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Cost Analysis</h1>
        <p className={isDarkMode ? 'text-white/50' : 'text-zinc-500'}>COGS breakdown and cost per user metrics</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {costBreakdown.map((c) => {
          const Icon = c.icon;
          return (
            <GlassCard key={c.label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>{c.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${theme.accent}20` }}>
                  <Icon className="w-4 h-4" style={{ color: theme.accent }} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{c.value}</div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Cost per Active User Trend</h3>
          <div className={`h-48 flex items-center justify-center ${isDarkMode ? 'text-white/30' : 'text-zinc-400'}`}>
            Chart placeholder
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Cost Breakdown by Category</h3>
          <div className={`h-48 flex items-center justify-center ${isDarkMode ? 'text-white/30' : 'text-zinc-400'}`}>
            Pie chart placeholder
          </div>
        </GlassCard>
      </div>
    </div>
  );
}