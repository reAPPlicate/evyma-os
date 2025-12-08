import React from 'react';
import { DollarSign, Users, TrendingDown, Clock } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';

export default function FinancialsCACManagement() {
  const { isDarkMode, theme } = useTheme();

  const cacMetrics = [
    { label: 'Blended CAC', value: '$—', icon: DollarSign },
    { label: 'CAC by Channel', value: '—', icon: Users },
    { label: 'LTV:CAC Ratio', value: '—', icon: TrendingDown },
    { label: 'Payback Period', value: '— mo', icon: Clock },
  ];

  const channels = [
    { name: 'Organic', cac: '$—', conversions: '—', ltv: '$—' },
    { name: 'Paid Social', cac: '$—', conversions: '—', ltv: '$—' },
    { name: 'Paid Search', cac: '$—', conversions: '—', ltv: '$—' },
    { name: 'Referral', cac: '$—', conversions: '—', ltv: '$—' },
    { name: 'Content/SEO', cac: '$—', conversions: '—', ltv: '$—' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>CAC Management</h1>
        <p className={isDarkMode ? 'text-white/50' : 'text-zinc-500'}>Customer acquisition cost analysis</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cacMetrics.map((m) => {
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

      <GlassCard className="p-5 overflow-x-auto">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>CAC by Channel</h3>
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className={`border-b ${isDarkMode ? 'border-white/10' : 'border-zinc-200'}`}>
              <th className={`text-left text-sm font-medium py-3 ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Channel</th>
              <th className={`text-right text-sm font-medium py-3 ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>CAC</th>
              <th className={`text-right text-sm font-medium py-3 ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Conversions</th>
              <th className={`text-right text-sm font-medium py-3 ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Avg LTV</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((ch) => (
              <tr key={ch.name} className={`border-b ${isDarkMode ? 'border-white/5' : 'border-zinc-100'}`}>
                <td className={`py-4 font-medium ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{ch.name}</td>
                <td className={`py-4 text-right ${isDarkMode ? 'text-white/70' : 'text-zinc-600'}`}>{ch.cac}</td>
                <td className={`py-4 text-right ${isDarkMode ? 'text-white/70' : 'text-zinc-600'}`}>{ch.conversions}</td>
                <td className={`py-4 text-right ${isDarkMode ? 'text-white/70' : 'text-zinc-600'}`}>{ch.ltv}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>CAC Payback Trend</h3>
        <div className={`h-48 flex items-center justify-center ${isDarkMode ? 'text-white/30' : 'text-zinc-400'}`}>
          Line chart placeholder
        </div>
      </GlassCard>
    </div>
  );
}