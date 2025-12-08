import React from 'react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';

export default function FinancialsTierProfitability() {
  const { isDarkMode, theme } = useTheme();

  const tiers = [
    { name: 'Free', users: '—', revenue: '$0', cost: '$—', margin: '—' },
    { name: 'Starter', users: '—', revenue: '$—', cost: '$—', margin: '—' },
    { name: 'Pro', users: '—', revenue: '$—', cost: '$—', margin: '—' },
    { name: 'Enterprise', users: '—', revenue: '$—', cost: '$—', margin: '—' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Tier Profitability</h1>
        <p className={isDarkMode ? 'text-white/50' : 'text-zinc-500'}>Margin analysis by subscription tier</p>
      </div>

      <GlassCard className="p-5 overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className={`border-b ${isDarkMode ? 'border-white/10' : 'border-zinc-200'}`}>
              <th className={`text-left text-sm font-medium py-3 ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Tier</th>
              <th className={`text-right text-sm font-medium py-3 ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Users</th>
              <th className={`text-right text-sm font-medium py-3 ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Revenue</th>
              <th className={`text-right text-sm font-medium py-3 ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Cost</th>
              <th className={`text-right text-sm font-medium py-3 ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Margin</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => (
              <tr key={tier.name} className={`border-b ${isDarkMode ? 'border-white/5' : 'border-zinc-100'}`}>
                <td className={`py-4 font-medium ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{tier.name}</td>
                <td className={`py-4 text-right ${isDarkMode ? 'text-white/70' : 'text-zinc-600'}`}>{tier.users}</td>
                <td className={`py-4 text-right ${isDarkMode ? 'text-white/70' : 'text-zinc-600'}`}>{tier.revenue}</td>
                <td className={`py-4 text-right ${isDarkMode ? 'text-white/70' : 'text-zinc-600'}`}>{tier.cost}</td>
                <td className={`py-4 text-right font-medium ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{tier.margin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Margin by Tier</h3>
        <div className={`h-48 flex items-center justify-center ${isDarkMode ? 'text-white/30' : 'text-zinc-400'}`}>
          Bar chart placeholder
        </div>
      </GlassCard>
    </div>
  );
}